/**
 * Limits sign-in attempts with the shared demo code. Every attempt is counted atomically in D1
 * *before* the code is checked, so parallel requests cannot slip past the limit. Two windows:
 * per client (hashed IP) and across all clients, which also slows down guessing from many
 * addresses. A lockout blocks new sign-ins only; existing access cookies keep working.
 */
export interface LimitStatement {
  bind(...values: unknown[]): LimitStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}
export interface LimitDatabase { prepare(sql: string): LimitStatement }

export const CLIENT_LIMIT = { attempts: 10, windowMs: 15 * 60_000 };
export const GLOBAL_LIMIT = { attempts: 100, windowMs: 60 * 60_000 };

const CREATE = "CREATE TABLE IF NOT EXISTS access_attempts (key TEXT PRIMARY KEY NOT NULL, count INTEGER NOT NULL, window_start INTEGER NOT NULL)";
// In SQLite's UPDATE every right-hand side reads the old row, so both CASEs see the old window.
const COUNT = `INSERT INTO access_attempts (key, count, window_start) VALUES (?, 1, ?)
  ON CONFLICT(key) DO UPDATE SET
    count = CASE WHEN window_start <= ? THEN 1 ELSE count + 1 END,
    window_start = CASE WHEN window_start <= ? THEN ? ELSE window_start END
  RETURNING count, window_start`;

async function count(db: LimitDatabase, key: string, nowMs: number, windowMs: number) {
  const cutoff = nowMs - windowMs;
  const row = await db.prepare(COUNT).bind(key, nowMs, cutoff, cutoff, nowMs).first<{ count: number; window_start: number }>();
  return { count: Number(row?.count ?? 1), windowStart: Number(row?.window_start ?? nowMs) };
}

/** A short, non-reversible key so raw IP addresses are never stored. */
export async function clientKey(ip: string | null): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`waterlink-access|${ip || "unknown"}`));
  return `client:${Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** Counts this attempt. When not allowed, the code must not be checked at all. */
export async function registerAttempt(db: LimitDatabase, client: string, nowMs: number): Promise<{ allowed: boolean; retryAfterS: number }> {
  await db.prepare(CREATE).run();
  await db.prepare("DELETE FROM access_attempts WHERE window_start <= ?").bind(nowMs - GLOBAL_LIMIT.windowMs).run();
  const own = await count(db, client, nowMs, CLIENT_LIMIT.windowMs);
  const all = await count(db, "global", nowMs, GLOBAL_LIMIT.windowMs);
  const waits = [
    own.count > CLIENT_LIMIT.attempts ? own.windowStart + CLIENT_LIMIT.windowMs - nowMs : 0,
    all.count > GLOBAL_LIMIT.attempts ? all.windowStart + GLOBAL_LIMIT.windowMs - nowMs : 0,
  ];
  const wait = Math.max(...waits);
  return { allowed: wait <= 0, retryAfterS: Math.max(1, Math.ceil(wait / 1000)) };
}

/** After a correct code the client starts fresh; the global window keeps counting. */
export async function clearClientAttempts(db: LimitDatabase, client: string): Promise<void> {
  await db.prepare("DELETE FROM access_attempts WHERE key = ?").bind(client).run();
}
