import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACCESS_TTL_MS, STATUS_TTL_MS, DomainError, applyCommand, createSeedState,
  findAlternative, getAlternatives, getPointDisplay, isPointOpen,
} from "../lib/domain.ts";
import type { Actor, Command, State, WaterPoint } from "../lib/domain.ts";

const NOW = Date.parse("2026-10-10T09:00:00Z"); // Noon in the example region.
const operator: Actor = { id: "op", name: "Demo-Betreiberin", role: "operator" };
const technician: Actor = { id: "tech", name: "Demo-Techniker", role: "technician" };
const coordinator: Actor = { id: "coord", name: "Demo-Koordination", role: "coordinator" };
const report: Command = { type: "report", pointId: "a", status: "down", note: "Bei der Prüfung kommt kein Wasser." };
const working: Command = { type: "confirm", pointId: "a", status: "working", note: "Wasserentnahme vor Ort erfolgreich geprüft.", tested: true };

function transition(state: State, command: Command, actor = operator, time = NOW) {
  return applyCommand(state, command, actor, time);
}
function reported() { return transition(createSeedState(NOW), report); }
function started() {
  const state = reported();
  const claimed = transition(state, { type: "claim", jobId: state.jobs[0].id }, technician);
  return transition(claimed, { type: "start", jobId: state.jobs[0].id }, technician);
}
function repaired() {
  const state = started();
  return transition(state, { type: "repair", jobId: state.jobs[0].id, note: "Dichtung ausgetauscht." }, technician);
}
function rejects(action: () => unknown, status: number) {
  assert.throws(action, (error: unknown) => error instanceof DomainError && error.status === status);
}
function point(changes: Partial<WaterPoint> = {}): WaterPoint {
  return { ...createSeedState(NOW).points[1], ...changes };
}

test("seed is explicitly fictitious, fresh A/B and unconfirmed C", () => {
  const state = createSeedState(NOW);
  assert.deepEqual(state.points.map((item) => item.id), ["a", "b", "c"]);
  assert.equal(getPointDisplay(state.points[0], NOW).status, "working");
  assert.equal(getPointDisplay(state.points[2], NOW).certainty, "unknown");
  assert.match(state.events[0].message, /Fictional demo/);
  assert.equal(state.jobs.length, 0);
});

test("outage atomically updates operating status, creates one job and audit event", () => {
  const previous = createSeedState(NOW);
  const original = JSON.stringify(previous);
  const state = transition(previous, report);
  assert.equal(state.points[0].status, "down");
  assert.equal(state.points[0].confirmedAt, new Date(NOW).toISOString());
  assert.equal(state.jobs.length, 1);
  assert.equal(state.jobs[0].status, "open");
  assert.equal(state.jobs[0].pointId, "a");
  assert.equal(state.events.at(-1)?.jobId, state.jobs[0].id);
  assert.equal(state.revision, previous.revision + 1);
  assert.equal(JSON.stringify(previous), original);
});

test("repeat outage retains one active job and its identity", () => {
  const first = reported();
  const second = transition(first, report, operator, NOW + 1000);
  assert.equal(second.jobs.length, 1);
  assert.equal(second.jobs[0].id, first.jobs[0].id);
  assert.equal(second.events.length, first.events.length + 1);
});

test("complete lifecycle preserves outage until explicit successful operator check", () => {
  const state = repaired();
  assert.equal(state.jobs[0].status, "awaiting_confirmation");
  assert.equal(state.points[0].status, "down");
  assert.equal(state.jobs[0].closedAt, null);
  const confirmed = transition(state, working, operator, NOW + 60_000);
  assert.equal(confirmed.points[0].status, "working");
  assert.equal(confirmed.points[0].confirmedBy, operator.name);
  assert.equal(confirmed.jobs[0].status, "closed");
  assert.equal(confirmed.jobs[0].closedAt, new Date(NOW + 60_000).toISOString());
  assert.equal(state.points[0].status, "down");
});

test("successful confirmation cannot skip the repair workflow", () => {
  rejects(() => transition(reported(), working), 409);
  rejects(() => transition(started(), working), 409);
});

test("confirmation requires an explicit physical test and correct role", () => {
  rejects(() => transition(repaired(), { ...working, tested: false } as unknown as Command), 400);
  rejects(() => transition(repaired(), working, technician), 403);
  rejects(() => transition(repaired(), working, coordinator), 403);
});

test("unsuccessful repair verification reopens work while preserving assignee", () => {
  const state = transition(repaired(), { type: "confirm", pointId: "a", status: "down", note: "Die Prüfung ist fehlgeschlagen.", tested: true });
  assert.equal(state.points[0].status, "down");
  assert.equal(state.jobs[0].status, "in_progress");
  assert.equal(state.jobs[0].assignedTo, technician.id);
  assert.equal(state.jobs[0].repairedAt, null);
  assert.equal(state.jobs[0].closedAt, null);
});

test("repeated failure during pending verification invalidates repair declaration", () => {
  const state = transition(repaired(), report);
  assert.equal(state.jobs.length, 1);
  assert.equal(state.jobs[0].status, "in_progress");
  assert.equal(state.jobs[0].repairedAt, null);
  rejects(() => transition(state, working), 409);
});

test("an incident after confirmed restoration creates a new job and retains history", () => {
  const closed = transition(repaired(), working);
  const newIncident = transition(closed, report, operator, NOW + 5000);
  assert.equal(newIncident.jobs.length, 2);
  assert.equal(newIncident.jobs[0].status, "closed");
  assert.equal(newIncident.jobs[1].status, "open");
  assert.notEqual(newIncident.jobs[0].id, newIncident.jobs[1].id);
});

test("operator can recheck a healthy point without a fictitious repair job", () => {
  const state = transition(createSeedState(NOW), working);
  assert.equal(state.jobs.length, 0);
  assert.equal(state.points[0].confirmedAt, new Date(NOW).toISOString());
});

test("a limited check creates work and does not close an awaiting job", () => {
  const limited: Command = { type: "confirm", pointId: "a", status: "limited", note: "Es kommt nur wenig Wasser.", tested: true };
  assert.equal(transition(createSeedState(NOW), limited).jobs[0].status, "open");
  const state = transition(repaired(), limited);
  assert.equal(state.points[0].status, "limited");
  assert.equal(state.jobs[0].status, "in_progress");
});

test("claim, ownership, role and transition checks reject unauthorized edits", () => {
  const state = reported();
  const claim: Command = { type: "claim", jobId: state.jobs[0].id };
  rejects(() => transition(state, claim, operator), 403);
  rejects(() => transition(state, report, technician), 403);
  const claimed = transition(state, claim, technician);
  rejects(() => transition(claimed, claim, technician), 409);
  rejects(() => transition(claimed, { type: "start", jobId: state.jobs[0].id }, { ...technician, id: "other" }), 403);
  rejects(() => transition(claimed, { type: "repair", jobId: state.jobs[0].id, note: "Fertig repariert." }, technician), 409);
  rejects(() => transition(claimed, { type: "progress", jobId: state.jobs[0].id, note: "In Arbeit.", blocker: null }, operator), 403);
});

test("funding, parts and staff blockers remain visible without changing operational status", () => {
  let state = started();
  for (const blocker of ["parts", "funding", "staff"] as const) {
    state = transition(state, { type: "progress", jobId: state.jobs[0].id, note: `Wartet auf ${blocker}.`, blocker }, technician);
    assert.equal(state.jobs[0].blocker, blocker);
    assert.equal(state.points[0].status, "down");
  }
  rejects(() => transition(state, { type: "progress", jobId: state.jobs[0].id, note: "Unbekannt.", blocker: "invalid" } as unknown as Command, technician), 400);
});

test("stale, missing, malformed and future timestamps cannot display fresh green", () => {
  assert.equal(getPointDisplay(point({ confirmedAt: new Date(NOW - STATUS_TTL_MS + 1).toISOString() }), NOW).status, "working");
  assert.equal(getPointDisplay(point({ confirmedAt: new Date(NOW - STATUS_TTL_MS).toISOString() }), NOW).certainty, "stale");
  for (const confirmedAt of [null, "invalid", new Date(NOW + 1).toISOString()]) {
    assert.equal(getPointDisplay(point({ confirmedAt }), NOW).status, "unknown");
  }
});

test("conflict persists through another report and only explicit check resolves it", () => {
  const conflict = transition(createSeedState(NOW), { type: "scenario", scenario: "conflict" }, coordinator);
  assert.equal(getPointDisplay(conflict.points[0], NOW).certainty, "conflict");
  const anotherReport = transition(conflict, report);
  assert.equal(anotherReport.points[0].conflict, true);
  const checked = transition(anotherReport, { type: "confirm", pointId: "a", status: "down", note: "Vor Ort geprüft: kein Wasser.", tested: true });
  assert.equal(checked.points[0].conflict, false);
  assert.equal(getPointDisplay(checked.points[0], NOW).status, "down");
});

test("offline display cannot imply a live confirmation or recommend an alternative", () => {
  const points = createSeedState(NOW).points;
  assert.equal(getPointDisplay(points[0], NOW, true).status, "unknown");
  assert.deepEqual(getAlternatives(points, "a", NOW, true), []);
  assert.equal(points[0].status, "working");
});

test("alternatives exclude the source, unconfirmed, limited, inaccessible and unverified routes", () => {
  assert.equal(findAlternative(createSeedState(NOW).points, "a", NOW)?.id, "b");
  const invalid: Partial<WaterPoint>[] = [
    { id: "a" }, { status: "limited" }, { status: "down" }, { status: "unknown" },
    { conflict: true }, { confirmedAt: null }, { accessVerified: false }, { routeVerified: false },
    { accessConfirmedAt: null }, { accessConfirmedAt: new Date(NOW - ACCESS_TTL_MS).toISOString() },
    { walkingMinutes: -2 }, { walkingMinutes: NaN },
  ];
  for (const changes of invalid) assert.equal(findAlternative([point(changes)], "a", NOW), null, JSON.stringify(changes));
});

test("candidate must remain fresh until expected arrival", () => {
  const candidate = point({ confirmedAt: new Date(NOW - STATUS_TTL_MS + 10 * 60_000).toISOString(), walkingMinutes: 22 });
  assert.equal(getPointDisplay(candidate, NOW).status, "working");
  assert.equal(findAlternative([candidate], "a", NOW), null);
});

test("opening hours use Nairobi and exclude points closing before expected arrival", () => {
  const candidate = point({ allDay: false, opensAt: "08:00", closesAt: "12:15", walkingMinutes: 22 });
  assert.equal(isPointOpen(candidate, NOW), true); // 12:00 Nairobi, 09:00 UTC.
  assert.equal(findAlternative([candidate], "a", NOW), null);
  assert.equal(findAlternative([point({ ...candidate, closesAt: "13:00" })], "a", NOW)?.id, "b");
  assert.equal(isPointOpen(point({ ...candidate, closesAt: "12:00" }), NOW), false);
  assert.equal(isPointOpen(point({ ...candidate, opensAt: "13:00", closesAt: "15:00" }), NOW), false);
});

test("overnight opening intervals and malformed schedules are handled conservatively", () => {
  const overnight = point({ allDay: false, opensAt: "22:00", closesAt: "05:00" });
  assert.equal(isPointOpen(overnight, "2026-10-10T20:00:00Z"), true); // 23:00 Nairobi.
  assert.equal(isPointOpen(overnight, "2026-10-11T00:00:00Z"), true); // 03:00 Nairobi.
  assert.equal(isPointOpen(overnight, NOW), false);
  assert.equal(isPointOpen({ ...overnight, opensAt: "garbage" }, NOW), false);
  assert.equal(isPointOpen({ ...overnight, opensAt: "05:00" }, NOW), false);
});

test("demo scenarios are restricted and no-alternative is explicit", () => {
  const initial = createSeedState(NOW);
  rejects(() => transition(initial, { type: "scenario", scenario: "stale" }, operator), 403);
  const stale = transition(initial, { type: "scenario", scenario: "stale" }, coordinator);
  assert.equal(getPointDisplay(stale.points[0], NOW).certainty, "stale");
  const unavailable = transition(initial, { type: "scenario", scenario: "no-alternative" }, coordinator);
  assert.equal(findAlternative(unavailable.points, "a", NOW), null);
});

test("invalid commands fail atomically and do not mutate the prior audit history", () => {
  const state = repaired();
  const before = JSON.stringify(state);
  rejects(() => transition(state, { ...working, note: "" }), 400);
  rejects(() => transition(state, { ...working, pointId: "missing" }), 404);
  rejects(() => transition(state, { type: "unknown" } as unknown as Command), 400);
  rejects(() => transition(state, null as unknown as Command), 400);
  rejects(() => transition(state, working, operator, NOW - 1), 409);
  assert.equal(JSON.stringify(state), before);
});
