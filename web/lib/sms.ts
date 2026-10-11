/**
 * Simulated SMS channel for basic phones. Nothing is sent: the demo shows how short text
 * commands map onto the same rules as the app. Replies stay close to one SMS (160 characters).
 */
import { findAlternative, getPointDisplay, PILOT_TIME_ZONE, type Command, type State, type WaterPoint } from "./domain.ts";

export type SmsIntent =
  | { kind: "help" }
  | { kind: "status"; ref: string | null }
  | { kind: "report"; ref: string; status: "down" | "limited"; note: string }
  | { kind: "confirm"; ref: string; status: "working" | "limited" | "down"; note: string }
  | { kind: "unknown" };

const STATUS_WORDS = new Set(["STATUS", "HALI", "INFO"]);
const HELP_WORDS = new Set(["HELP", "MSAADA", "?"]);
const REPORT: Record<string, "down" | "limited"> = { DOWN: "down", BROKEN: "down", LIMITED: "limited", SLOW: "limited" };
const CONFIRM: Record<string, "working" | "limited" | "down"> = { OK: "working", WORKS: "working", WORKING: "working", FAIL: "down", FAILED: "down", PARTLY: "limited" };

/** Reads one incoming text. Keywords are case-insensitive; a lone letter asks for that point. */
export function parseSms(text: string): SmsIntent {
  const words = text.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (!words.length) return { kind: "unknown" };
  const head = words[0].toUpperCase().replace(/[.!,:]+$/, "");
  const ref = words[1]?.replace(/[.!,:]+$/, "").toLowerCase() ?? null;
  const note = words.slice(2).join(" ").trim();
  if (HELP_WORDS.has(head)) return { kind: "help" };
  if (STATUS_WORDS.has(head)) return { kind: "status", ref };
  if (/^[A-Z]$/.test(head) && words.length === 1) return { kind: "status", ref: head.toLowerCase() };
  if (head in REPORT && ref) return { kind: "report", ref, status: REPORT[head], note };
  if (head in CONFIRM && ref) return { kind: "confirm", ref, status: CONFIRM[head], note };
  return { kind: "unknown" };
}

/** Only the programme's lettered points can be addressed by SMS. */
export function pointByRef(state: State, ref: string | null): WaterPoint | null {
  if (!ref || !/^[a-z]$/.test(ref)) return null;
  return state.points.find((p) => p.id === ref && (p.tracked ?? true)) ?? null;
}

/** Turns an operator intent into the app's command; the server applies the usual rules. */
export function smsCommand(state: State, intent: SmsIntent, tested = false): Command | { error: string } {
  if (intent.kind !== "report" && intent.kind !== "confirm") return { error: "Not an operator command." };
  const point = pointByRef(state, intent.ref);
  if (!point) return { error: `No water point "${intent.ref.toUpperCase()}". Text STATUS for the list.` };
  const note = intent.note.trim();
  if (note.length < 3) return { error: intent.kind === "confirm" ? "Describe what you tested on site. Nothing has been saved." : "Describe what you observed. Nothing has been saved." };
  if (intent.kind === "confirm" && !tested) return { error: "Explicitly confirm the on-site test before sending. Nothing has been saved." };
  return intent.kind === "report"
    ? { type: "report", pointId: point.id, status: intent.status, note: `${note} (via SMS)` }
    : { type: "confirm", pointId: point.id, status: intent.status, note: `${note} (via SMS)`, tested: true };
}

const WORD = { working: "WORKING", limited: "LIMITED", down: "NOT WORKING", unknown: "UNCLEAR" } as const;
const clock = (at: string | number) => new Intl.DateTimeFormat("en-GB", { timeZone: PILOT_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(at));

function shortState(point: WaterPoint, state: State, now: number): string {
  const d = getPointDisplay(point, now);
  return d.certainty === "fresh" ? WORD[d.status] : "UNCLEAR";
}

export const HELP_TEXT = "WaterLink: text STATUS for all water points, or A, B, C for one. Operators: DOWN A what you saw, OK A what you tested. Working = water can be drawn, not a quality test.";

/** The reply a household or operator would receive for a read-only intent. */
export function smsReply(state: State, intent: SmsIntent, now: number, offline = false): string {
  const tracked = state.points.filter((p) => (p.tracked ?? true) && /^[a-z]$/.test(p.id));
  if (intent.kind === "help") return HELP_TEXT;
  if (intent.kind === "unknown") return "Sorry, WaterLink did not understand. Text HELP for the commands.";
  if (intent.kind !== "status") return "";
  if (offline) return "WaterLink: no live connection. Current status is UNCLEAR. No confirmed alternative can be given. Check with the local operator before walking.";
  if (!intent.ref) {
    const list = tracked.map((p) => `${p.id.toUpperCase()} ${shortState(p, state, now)}`).join(", ");
    return `WaterLink ${clock(now)}: ${list}. Reply with a letter for details.`;
  }
  const point = pointByRef(state, intent.ref);
  if (!point) return `No water point "${intent.ref.toUpperCase()}". Text STATUS for the list.`;
  const d = getPointDisplay(point, now);
  const head = `${point.id.toUpperCase()} ${point.name}: ${shortState(point, state, now)}`;
  if (d.certainty !== "fresh") return `${head}. ${point.confirmedAt ? `Last check ${clock(point.confirmedAt)}.` : "Never checked."} Ask on site before you go.`;
  const since = `${d.status === "working" ? "checked" : "since"} ${clock(point.confirmedAt!)}`;
  if (d.status === "working") return `${head}, ${since}. About ${point.walkingMinutes} min walk.`;
  const alt = findAlternative(state.points, point.id, now);
  const job = state.jobs.find((j) => j.pointId === point.id && j.status !== "closed");
  const repair = job ? (job.status === "open" ? " Repair reported." : job.status === "awaiting_confirmation" ? " Repaired, waiting for the test." : " Technician on it.") : "";
  return `${head} ${since}. ${alt ? `Go to ${alt.id.toUpperCase()} ${alt.name}, about ${alt.walkingMinutes} min.` : "No confirmed alternative, ask on site."}${repair}`;
}

/** Number of SMS a text needs: 160 characters, or 153 per part when split. */
export function smsParts(text: string): number {
  return text.length <= 160 ? 1 : Math.ceil(text.length / 153);
}
