import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import type { Actor } from "../lib/domain.ts";
import { HttpError, readJsonBody } from "../lib/http.ts";
import { createDemoSession, parseRole, requireDemoSession } from "../lib/session.ts";
import { getState, IDLE_RESEED_MS, mutateState, parseCommand } from "../lib/store.ts";

const T0 = new Date("2026-10-21T08:00:00Z");
const HOUR = 3_600_000;
const operator: Actor = { id: "demo-operator", name: "Amina · operator (demo)", role: "operator" };
const coordinator: Actor = { id: "demo-coordinator", name: "WaterLink coordination (demo)", role: "coordinator" };
const report = { type: "report", pointId: "a", status: "down", note: "No water at the spout" } as const;

/** D1-shaped adapter over real SQLite with the production tables, so the actual SQL runs. */
function d1(): D1Database {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE demo_state (id text PRIMARY KEY NOT NULL, revision integer NOT NULL, payload text NOT NULL)");
  db.exec("CREATE TABLE demo_sessions (token_hash text PRIMARY KEY NOT NULL, user_id text NOT NULL, role text NOT NULL, actor_id text NOT NULL, actor_name text NOT NULL, expires_at text NOT NULL)");
  const statement = (sql: string, values: unknown[] = []) => ({
    bind: (...next: unknown[]) => statement(sql, next),
    first: async () => db.prepare(sql).get(...(values as never[])) ?? null,
    run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...(values as never[])).changes) } }),
    sql, values,
  });
  return {
    prepare: (sql: string) => statement(sql),
    batch: async (list: ReturnType<typeof statement>[]) => list.map((s) => db.prepare(s.sql).run(...(s.values as never[]))),
  } as unknown as D1Database;
}

const fails = async (promise: Promise<unknown>, status: number, code?: string) => {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof HttpError, `expected an HttpError, got ${String(error)}`);
    assert.equal(error.status, status);
    if (code) assert.equal(error.code, code);
    return true;
  });
};

test("parseCommand keeps only the known fields and rejects malformed input", () => {
  const parsed = parseCommand({ ...report, actorId: "someone-else", revision: 99 });
  assert.deepEqual(parsed, report, "identity and revision never come from the client");
  assert.throws(() => parseCommand(null), HttpError);
  assert.throws(() => parseCommand({ type: "launch-missiles" }), HttpError);
  assert.throws(() => parseCommand({ ...report, status: "working" }), HttpError, "a report can only say down or limited");
  assert.throws(() => parseCommand({ ...report, note: "" }), HttpError);
  assert.throws(() => parseCommand({ ...report, note: "x".repeat(1001) }), HttpError);
  assert.throws(() => parseCommand({ ...report, pointId: 7 }), HttpError);
  assert.throws(() => parseCommand({ type: "confirm", pointId: "a", status: "working", note: "ok", tested: false }), HttpError, "on-site test must be explicit");
  assert.throws(() => parseCommand({ type: "progress", jobId: "job-1", note: "wait", blocker: "weather" }), HttpError);
  assert.deepEqual(parseCommand({ type: "reset", extra: true }), { type: "reset" });
});

test("the first read seeds the demo and later reads do not change it", async () => {
  const db = d1();
  const first = await getState(db, T0);
  assert.equal(first.revision, 0);
  assert.equal(first.points.find((p) => p.id === "a")?.status, "working");
  assert.equal((await getState(db, new Date(T0.getTime() + HOUR))).revision, 0);
});

test("a repeated request ID replays the answer; a reused ID with another action is refused", async () => {
  const db = d1();
  await getState(db, T0);
  const first = await mutateState(db, { command: report, expectedRevision: 0, requestId: "request-0001" }, operator, "session-1", T0);
  assert.equal(first.revision, 1);
  const again = await mutateState(db, { command: report, expectedRevision: 0, requestId: "request-0001" }, operator, "session-1", T0);
  assert.equal(again.revision, 1, "a retry after a lost answer does not apply twice");
  assert.equal(again.jobs.length, 1);
  await fails(mutateState(db, { command: { ...report, note: "A different text" }, expectedRevision: 1, requestId: "request-0001" }, operator, "session-1", T0), 409, "request_id_reused");
});

test("a stale revision is refused and two writers at the same revision cannot both win", async () => {
  const db = d1();
  await getState(db, T0);
  await mutateState(db, { command: report, expectedRevision: 0, requestId: "request-0001" }, operator, "session-1", T0);
  await fails(mutateState(db, { command: report, expectedRevision: 0, requestId: "request-0002" }, operator, "session-2", T0), 409, "revision_conflict");
  const results = await Promise.allSettled([
    mutateState(db, { command: { ...report, status: "limited" }, expectedRevision: 1, requestId: "request-0003" }, operator, "session-1", T0),
    mutateState(db, { command: { ...report, note: "Slow flow now" }, expectedRevision: 1, requestId: "request-0004" }, operator, "session-2", T0),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await getState(db, T0)).revision, 2);
});

test("only coordination may reset the demo", async () => {
  const db = d1();
  await getState(db, T0);
  await fails(mutateState(db, { command: { type: "reset" }, expectedRevision: 0, requestId: "request-0001" }, operator, "session-1", T0), 403, "forbidden");
  const reset = await mutateState(db, { command: { type: "reset" }, expectedRevision: 0, requestId: "request-0002" }, coordinator, "session-3", T0);
  assert.equal(reset.revision, 1);
  assert.equal(reset.events.length, 1);
});

test("after 4 quiet hours the demo starts over with fresh confirmations; activity keeps it as it is", async () => {
  const db = d1();
  await getState(db, T0);
  // The seed event is dated 35 minutes back, so the idle time counts from there.
  const quiet = await getState(db, new Date(T0.getTime() + IDLE_RESEED_MS - 40 * 60_000));
  assert.equal(quiet.revision, 0, "not before the idle time has passed");

  const refreshedAt = new Date(T0.getTime() + 20 * HOUR);
  const refreshed = await getState(db, refreshedAt);
  assert.equal(refreshed.revision, 1, "the revision goes up so open screens accept it");
  const a = refreshed.points.find((p) => p.id === "a")!;
  assert.ok(refreshedAt.getTime() - Date.parse(a.confirmedAt!) < HOUR, "A is confirmed minutes ago, not 20 hours ago");
  assert.match(refreshed.events[0].message, /simulated/);
  assert.equal((await getState(db, new Date(refreshedAt.getTime() + HOUR))).revision, 1, "refreshing happens once");

  const t = new Date(refreshedAt.getTime() + HOUR);
  await mutateState(db, { command: report, expectedRevision: 1, requestId: "request-0009" }, operator, "session-1", t);
  const later = await getState(db, new Date(t.getTime() + IDLE_RESEED_MS - 60_000));
  assert.equal(later.revision, 2, "recent activity prevents a refresh");
  assert.equal(later.jobs.length, 1);
});

test("a demo session is tied to the user, expires, and needs a well-formed bearer token", async () => {
  const db = d1();
  const { token } = await createDemoSession(db, "user-1", parseRole("operator"), T0);
  const request = (value?: string) => new Request("https://example.test/api/waterlink", { method: "POST", headers: value ? { authorization: value } : {} });
  const session = await requireDemoSession(db, request(`Bearer ${token}`), "user-1", T0);
  assert.equal(session.actor.role, "operator");
  await fails(requireDemoSession(db, request(`Bearer ${token}`), "user-2", T0), 401, "session_expired");
  await fails(requireDemoSession(db, request(`Bearer ${token}`), "user-1", new Date(T0.getTime() + 9 * HOUR)), 401, "session_expired");
  await fails(requireDemoSession(db, request("Bearer not-a-token"), "user-1", T0), 401, "session_required");
  await fails(requireDemoSession(db, request(), "user-1", T0), 401, "session_required");
  await fails(requireDemoSession(db, request(`Bearer ${token}`), null, T0), 401, "sign_in_required");
  assert.throws(() => parseRole("admin"), HttpError);
});

test("request bodies must be small JSON objects", async () => {
  const post = (body: string, type = "application/json") => new Request("https://example.test/x", { method: "POST", headers: { "content-type": type }, body });
  assert.deepEqual(await readJsonBody(post('{"a":1}')), { a: 1 });
  await fails(readJsonBody(post("{}", "text/plain")), 415, "invalid_content_type");
  await fails(readJsonBody(post("[1]")), 400, "invalid_body");
  await fails(readJsonBody(post("{nope")), 400, "invalid_json");
  await fails(readJsonBody(post(JSON.stringify({ note: "x".repeat(17_000) }))), 413, "body_too_large");
});
