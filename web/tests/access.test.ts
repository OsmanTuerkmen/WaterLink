import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  ACCESS_COOKIE, ACCESS_MAX_AGE_S, ACCESS_USER, issueAccessToken, redeemCode, resolveUserId, usableCode, verifyAccessToken,
} from "../lib/access-token.ts";
import { CLIENT_LIMIT, GLOBAL_LIMIT, clearClientAttempts, clientKey, registerAttempt, type LimitDatabase, type LimitStatement } from "../lib/access-limit.ts";

// Example values for the tests only; not the deployed code.
const CODE = "test-only-code-0000";
const NOW = Date.parse("2026-10-11T09:00:00Z");
const DAY = 24 * 60 * 60_000;
const cookieOf = (setCookie: string) => setCookie.split(";", 1)[0];
const signedIn = (cookieHeader: string | null, at = NOW, code: string | null = CODE) =>
  resolveUserId({ mode: "code", platformUserId: null, cookieHeader, code, nowMs: at });

test("a redeemed code gives a cookie the server accepts until it expires", async () => {
  const setCookie = await redeemCode(CODE, "  TEST-only-CODE-0000 ", NOW);
  assert.ok(setCookie);
  assert.match(setCookie, new RegExp(`Max-Age=${ACCESS_MAX_AGE_S}`));
  assert.match(setCookie, /HttpOnly; Secure; SameSite=Strict/);
  assert.equal(await signedIn(cookieOf(setCookie)), ACCESS_USER);
  assert.equal(await signedIn(cookieOf(setCookie), NOW + 29 * DAY), ACCESS_USER);
  assert.equal(await signedIn(cookieOf(setCookie), NOW + 30 * DAY + 1000), null, "expiry is checked on the server, not only by the browser");
});

test("manipulated, foreign or old-format cookies are rejected", async () => {
  const token = await issueAccessToken(CODE, NOW);
  const [, expires, mac] = token.split(".");
  const later = `v2.${Number(expires) + DAY / 1000}.${mac}`;
  assert.equal(await verifyAccessToken(CODE, later, NOW), false, "extending the expiry breaks the signature");
  const flipped = `v2.${expires}.${mac.slice(0, -1)}${mac.endsWith("0") ? "1" : "0"}`;
  assert.equal(await verifyAccessToken(CODE, flipped, NOW), false);
  assert.equal(await verifyAccessToken(CODE, "f".repeat(64), NOW), false, "the former static cookie no longer works");
  assert.equal(await verifyAccessToken(CODE, `v2.${Math.floor(NOW / 1000) + 400 * 86400}.${mac}`, NOW), false, "far-future expiry is refused");
  assert.equal(await signedIn(`other=1; ${ACCESS_COOKIE}=garbage`), null);
});

test("changing the access code signs everybody out", async () => {
  const token = await issueAccessToken(CODE, NOW);
  assert.equal(await signedIn(`${ACCESS_COOKIE}=${token}`, NOW, "another-test-code-1111"), null);
});

test("without a cookie or without a configured code nobody is signed in", async () => {
  assert.equal(await signedIn(null), null);
  assert.equal(await signedIn("theme=dark"), null);
  const token = await issueAccessToken(CODE, NOW);
  assert.equal(await signedIn(`${ACCESS_COOKIE}=${token}`, NOW, null), null);
  assert.equal(usableCode(undefined), null);
  assert.equal(usableCode(" short "), null);
  assert.equal(await redeemCode(null, CODE, NOW), null);
  assert.equal(await redeemCode(CODE, "test-only-code-0001", NOW), null);
  assert.equal(await redeemCode(CODE, 4821, NOW), null);
});

test("in code mode forged platform headers are ignored; on Sites they count", async () => {
  const forged = await resolveUserId({ mode: "code", platformUserId: "someone-else", cookieHeader: null, code: CODE, nowMs: NOW });
  assert.equal(forged, null);
  const sites = await resolveUserId({ mode: "sites", platformUserId: "platform-user", cookieHeader: null, code: null, nowMs: NOW });
  assert.equal(sites, "platform-user");
});

/** Minimal D1-shaped adapter over real SQLite, so the actual SQL is tested. */
function sqlite(): LimitDatabase {
  const db = new DatabaseSync(":memory:");
  const statement = (sql: string, values: unknown[] = []): LimitStatement => ({
    bind: (...next) => statement(sql, next),
    first: async <T,>() => (db.prepare(sql).get(...(values as never[])) as T) ?? null,
    run: async () => db.prepare(sql).run(...(values as never[])),
  });
  return { prepare: (sql) => statement(sql) };
}

test("each client gets a limited number of attempts per window, counted before the check", async () => {
  const db = sqlite(), client = await clientKey("203.0.113.7");
  const results = await Promise.all(Array.from({ length: CLIENT_LIMIT.attempts + 3 }, () => registerAttempt(db, client, NOW)));
  assert.equal(results.filter((r) => r.allowed).length, CLIENT_LIMIT.attempts, "parallel attempts cannot exceed the limit");
  const blocked = await registerAttempt(db, client, NOW + 60_000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterS > 0 && blocked.retryAfterS <= CLIENT_LIMIT.windowMs / 1000);
  assert.equal((await registerAttempt(db, await clientKey("198.51.100.4"), NOW)).allowed, true, "other clients are not affected");
  assert.equal((await registerAttempt(db, client, NOW + CLIENT_LIMIT.windowMs + 1)).allowed, true, "a new window starts fresh");
});

test("a correct code clears the client's count; the global window still limits many addresses", async () => {
  const db = sqlite(), client = await clientKey("203.0.113.7");
  for (let i = 0; i < CLIENT_LIMIT.attempts; i++) await registerAttempt(db, client, NOW);
  await clearClientAttempts(db, client);
  assert.equal((await registerAttempt(db, client, NOW)).allowed, true);

  const spread = sqlite();
  let allowed = 0;
  for (let i = 0; i < GLOBAL_LIMIT.attempts + 5; i++) {
    if ((await registerAttempt(spread, await clientKey(`10.0.${Math.floor(i / 5)}.${i % 5}`), NOW)).allowed) allowed++;
  }
  assert.equal(allowed, GLOBAL_LIMIT.attempts);
});

test("raw IP addresses are not stored", async () => {
  const key = await clientKey("203.0.113.7");
  assert.ok(!key.includes("203.0.113.7"));
  assert.equal(key, await clientKey("203.0.113.7"));
});
