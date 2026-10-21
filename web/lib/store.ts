import { applyCommand, createSeedState, type Actor, type Command, type State } from "./domain.ts";
import { HttpError, isRecord } from "./http.ts";
import { REGION } from "./region.ts";
import { sha256 } from "./session.ts";

export type MutationCommand = Command | { type: "reset" };

interface Receipt { requestId: string; sessionKey: string; commandHash: string }
interface StoredEnvelope { state: State; receipts: Receipt[] }
interface StateRow { revision: number; payload: string }
const RECEIPT_LIMIT = 100;

/** Whitelist wire fields; identity, clock, and revision never come from a command. */
export function parseCommand(value: unknown): MutationCommand {
  if (!isRecord(value) || typeof value.type !== "string") {
    throw new HttpError(400, "The action is invalid.", "invalid_command");
  }
  const text = (key: string, max: number): string => {
    const field = value[key];
    if (typeof field !== "string" || field.length === 0 || field.length > max) {
      throw new HttpError(400, `The field "${key}" is invalid.`, "invalid_command");
    }
    return field;
  };
  // JSON syntax, field types, enum values and business transitions are all
  // validated before the compare-and-swap commits anything.
  switch (value.type) {
    case "report": {
      const pointId = text("pointId", 80);
      const note = text("note", 1000);
      if (value.status !== "down" && value.status !== "limited") throw new HttpError(400, "Invalid problem status.");
      return { type: "report", pointId, note, status: value.status };
    }
    case "claim": case "start":
      return { type: value.type, jobId: text("jobId", 80) };
    case "progress": {
      const jobId = text("jobId", 80);
      const note = text("note", 1000);
      if (value.blocker !== null && value.blocker !== "parts" && value.blocker !== "funding" && value.blocker !== "staff") {
        throw new HttpError(400, "Invalid blocker.");
      }
      return { type: "progress", jobId, note, blocker: value.blocker };
    }
    case "repair":
      return { type: "repair", jobId: text("jobId", 80), note: text("note", 1000) };
    case "confirm": {
      const pointId = text("pointId", 80);
      const note = text("note", 1000);
      if (value.tested !== true) throw new HttpError(400, "Please confirm explicitly that you tested it on site.");
      if (value.status !== "working" && value.status !== "limited" && value.status !== "down") {
        throw new HttpError(400, "Invalid confirmed status.");
      }
      return { type: "confirm", pointId, note, status: value.status, tested: true };
    }
    case "scenario": {
      if (value.scenario !== "stale" && value.scenario !== "conflict" && value.scenario !== "no-alternative" && value.scenario !== "sensor") {
        throw new HttpError(400, "Unknown demo scenario.");
      }
      return { type: "scenario", scenario: value.scenario };
    }
    case "reset": return { type: "reset" };
    default: throw new HttpError(400, "Unknown action.", "invalid_command");
  }
}

function decodeRow(row: StateRow): StoredEnvelope {
  const value = JSON.parse(row.payload) as StoredEnvelope;
  if (!value.state || value.state.revision !== row.revision || !Array.isArray(value.receipts)) {
    throw new Error("Stored demo state is inconsistent.");
  }
  return value;
}

/**
 * The shared demo has no staff to confirm anything. After this long without activity every
 * simulated confirmation would read "expired" (they last 12 hours), so the demo starts over.
 */
export const IDLE_RESEED_MS = 4 * 60 * 60 * 1000;

function lastActivityMs(state: State): number {
  return state.events.reduce((latest, event) => Math.max(latest, Date.parse(event.at) || 0), 0);
}

async function loadEnvelope(db: D1Database, now: Date): Promise<StoredEnvelope> {
  let row = await db.prepare("SELECT revision, payload FROM demo_state WHERE id = ?").bind("demo").first<StateRow>();
  if (!row) {
    const seed: StoredEnvelope = { state: createSeedState(now, REGION), receipts: [] };
    await db.prepare("INSERT OR IGNORE INTO demo_state (id, revision, payload) VALUES (?, ?, ?)")
      .bind("demo", seed.state.revision, JSON.stringify(seed)).run();
    // A second initializer may have won. Always read the committed aggregate.
    row = await db.prepare("SELECT revision, payload FROM demo_state WHERE id = ?").bind("demo").first<StateRow>();
  }
  if (!row) throw new Error("Demo state initialization failed.");
  const envelope = decodeRow(row);
  if (now.getTime() - lastActivityMs(envelope.state) <= IDLE_RESEED_MS) return envelope;

  const state = createSeedState(now, REGION);
  state.revision = envelope.state.revision + 1; // clients ignore a lower revision
  state.events = [{
    id: `event-refresh-${state.revision}`, pointId: null, jobId: null, type: "reset",
    message: "Demo refreshed after 4 hours without activity. Confirmations, routes, people and reports are simulated.",
    actorId: "demo", actorName: "WaterLink Demo", at: now.toISOString(),
  }];
  const refreshed: StoredEnvelope = { state, receipts: [] };
  const result = await db.prepare("UPDATE demo_state SET revision = ?, payload = ? WHERE id = ? AND revision = ?")
    .bind(state.revision, JSON.stringify(refreshed), "demo", envelope.state.revision).run();
  if (result.meta.changes === 1) return refreshed;
  // Another request refreshed or changed it first: read what was committed.
  const latest = await db.prepare("SELECT revision, payload FROM demo_state WHERE id = ?").bind("demo").first<StateRow>();
  if (!latest) throw new Error("Demo state disappeared.");
  return decodeRow(latest);
}

export async function getState(db: D1Database, now = new Date()): Promise<State> {
  return (await loadEnvelope(db, now)).state;
}

function replay(envelope: StoredEnvelope, requestId: string, sessionKey: string, commandHash: string): State | null {
  const receipt = envelope.receipts.find((item) => item.requestId === requestId && item.sessionKey === sessionKey);
  if (!receipt) return null;
  if (receipt.commandHash !== commandHash) {
    throw new HttpError(409, "This request ID was already used for another action.", "request_id_reused");
  }
  return envelope.state;
}

export async function mutateState(
  db: D1Database,
  input: { command: MutationCommand; expectedRevision: number; requestId: string },
  actor: Actor,
  sessionKey: string,
  now = new Date(),
): Promise<State> {
  const { command, expectedRevision, requestId } = input;
  // parseCommand constructs keys in a stable order and removes unused fields.
  const commandHash = await sha256(JSON.stringify(command));
  const envelope = await loadEnvelope(db, now);
  const duplicate = replay(envelope, requestId, sessionKey, commandHash);
  if (duplicate) return duplicate;
  if (envelope.state.revision !== expectedRevision) {
    throw new HttpError(409, "Someone else saved a change first. The latest state is loaded; please check and try again.", "revision_conflict");
  }

  let next: State;
  if (command.type === "reset") {
    if (actor.role !== "coordinator") throw new HttpError(403, "Only demo coordination can reset the demo.", "forbidden");
    next = createSeedState(now, REGION);
    next.revision = envelope.state.revision + 1;
    next.events = [{
      id: `event-reset-${next.revision}`, pointId: null, jobId: null, type: "reset",
      message: "Demo reset. Confirmations, routes, people and reports are simulated.",
      actorId: actor.id, actorName: actor.name, at: now.toISOString(),
    }];
  } else {
    next = applyCommand(envelope.state, command, actor, now);
  }

  const update: StoredEnvelope = {
    state: next,
    receipts: [...envelope.receipts, { requestId, sessionKey, commandHash }].slice(-RECEIPT_LIMIT),
  };
  const result = await db.prepare("UPDATE demo_state SET revision = ?, payload = ? WHERE id = ? AND revision = ?")
    .bind(next.revision, JSON.stringify(update), "demo", expectedRevision).run();
  if (result.meta.changes !== 1) {
    // A concurrent copy of this exact request may have completed successfully.
    const current = await loadEnvelope(db, now);
    const completed = replay(current, requestId, sessionKey, commandHash);
    if (completed) return completed;
    throw new HttpError(409, "Another change was saved at the same moment. The latest state is loaded; please check and try again.", "revision_conflict");
  }
  return next;
}
