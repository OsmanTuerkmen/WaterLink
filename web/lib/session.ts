import type { Actor, Role } from "./domain";
import { HttpError } from "./http";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// These are invented people, shared by the private demo. This is role
// simulation behind platform authentication, not production staff management.
const DEMO_ACTORS: Record<Role, Actor> = {
  operator: { id: "demo-operator", name: "Amina · Demo-Betreiberin", role: "operator" },
  technician: { id: "demo-technician", name: "Daniel · Demo-Techniker", role: "technician" },
  coordinator: { id: "demo-coordinator", name: "WaterLink · Demo-Koordination", role: "coordinator" },
};

interface SessionRow {
  token_hash: string;
  user_id: string;
  role: Role;
  actor_id: string;
  actor_name: string;
  expires_at: string;
}

export interface DemoSession {
  actor: Actor;
  /** Server-side receipt scope. Never returned in a public state response. */
  sessionKey: string;
  expiresAt: string;
}

export function parseRole(value: unknown): Role {
  if (value !== "operator" && value !== "technician" && value !== "coordinator") {
    throw new HttpError(400, "Bitte eine gültige Demo-Rolle auswählen.", "invalid_role");
  }
  return value;
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createDemoSession(db: D1Database, userId: string, role: Role, now = new Date()) {
  if (!userId) throw new HttpError(401, "Bitte zuerst mit ChatGPT anmelden.", "sign_in_required");
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const tokenHash = await sha256(token);
  const actor = DEMO_ACTORS[role];
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  await db.batch([
    db.prepare("DELETE FROM demo_sessions WHERE expires_at <= ?").bind(now.toISOString()),
    db.prepare("INSERT INTO demo_sessions (token_hash, user_id, role, actor_id, actor_name, expires_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(tokenHash, userId, actor.role, actor.id, actor.name, expiresAt),
  ]);
  return { token, actor: { ...actor }, expiresAt };
}

export async function requireDemoSession(
  db: D1Database,
  request: Request,
  userId: string | null,
  now = new Date(),
): Promise<DemoSession> {
  if (!userId) throw new HttpError(401, "Bitte zuerst mit ChatGPT anmelden.", "sign_in_required");
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer ([a-f0-9]{64})$/.exec(authorization);
  if (!match) throw new HttpError(401, "Bitte zuerst eine Demo-Rolle auswählen.", "session_required");
  const sessionKey = await sha256(match[1]);
  const row = await db.prepare(
    "SELECT token_hash, user_id, role, actor_id, actor_name, expires_at FROM demo_sessions WHERE token_hash = ?",
  ).bind(sessionKey).first<SessionRow>();
  if (!row || row.user_id !== userId || Date.parse(row.expires_at) <= now.getTime() || !Number.isFinite(Date.parse(row.expires_at))) {
    throw new HttpError(401, "Die Demo-Sitzung ist abgelaufen. Bitte die Rolle erneut auswählen.", "session_expired");
  }
  const role = parseRole(row.role);
  return { actor: { id: row.actor_id, name: row.actor_name, role }, sessionKey, expiresAt: row.expires_at };
}
