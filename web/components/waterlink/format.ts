import { STATUS_TTL_MS, type OperatingStatus, type PointDisplay, type Survey, type WaterPoint } from "@/lib/domain";
import { TEXT, type Lang } from "@/lib/i18n";

const TZ = "Africa/Nairobi";
const valid = (at: string | null | undefined): at is string => Boolean(at && Number.isFinite(Date.parse(at)));

/** "10:38" in Kenya time. */
export function clock(at: string | number | null | undefined): string {
  if (at === null || at === undefined || (typeof at === "string" && !valid(at))) return "–";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(at));
}
/** "11 Oct, 10:38" in Kenya time. */
export function stamp(at: string | null | undefined): string {
  if (!valid(at)) return "–";
  const d = new Date(at);
  return `${new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short" }).format(d)}, ${clock(at)}`;
}
export function ago(at: string | null | undefined, now: number, lang: Lang = "en"): string {
  const t = TEXT[lang];
  if (!valid(at)) return t.never;
  const minutes = Math.max(0, Math.floor((now - Date.parse(at)) / 60_000));
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minAgo(minutes);
  if (minutes < 1440) return t.hourAgo(Math.floor(minutes / 60));
  return t.dayAgo(Math.floor(minutes / 1440));
}
export function month(at: string): string {
  return valid(at) ? new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short", year: "numeric" }).format(new Date(at)) : "unknown date";
}
export function km(value: number | null): string {
  if (value === null) return "";
  return value < 1 ? `${Math.round(value * 100) * 10} m` : `${value.toFixed(1)} km`;
}
export const letter = (p: WaterPoint) => (p.id.length <= 2 ? p.id.toUpperCase() : "");
export const isTracked = (p: WaterPoint) => p.tracked ?? true;
export function osmLink(p: WaterPoint): string | null {
  return typeof p.lat === "number" && typeof p.lon === "number"
    ? `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}` : null;
}

/** Share of the 12-hour validity still left on a fresh confirmation; 0 when expired or uncertain. */
export function validityLeft(point: WaterPoint, display: PointDisplay, now: number): number {
  if (display.certainty !== "fresh" || !valid(point.confirmedAt)) return 0;
  const left = Date.parse(point.confirmedAt) + STATUS_TTL_MS - now;
  return Math.max(0, Math.min(1, left / STATUS_TTL_MS));
}
export function validityText(point: WaterPoint, display: PointDisplay, now: number, lang: Lang = "en"): string {
  const t = TEXT[lang];
  if (!valid(point.confirmedAt)) return t.noConfirmation;
  if (display.certainty === "stale") return t.expired;
  if (display.certainty === "conflict") return t.conflict;
  if (display.certainty === "sensor") return t.sensor;
  if (display.certainty === "unknown") return display.label === "No connection" ? t.offline : t.notConfirmed;
  const hours = (Date.parse(point.confirmedAt) + STATUS_TTL_MS - now) / 3_600_000;
  if (hours < 1) return t.lessThanHour;
  return t.validHours(Math.floor(hours));
}

export const STATUS_WORD: Record<OperatingStatus, string> = { working: "Working", limited: "Limited", down: "Not working", unknown: "Unclear" };
export type Tone = "ok" | "limit" | "down" | "unk";
export const toneOf = (d: PointDisplay): Tone => (d.status === "working" ? "ok" : d.status === "down" ? "down" : d.status === "limited" ? "limit" : "unk");

/** One plain instruction per state; shared by rows, board and stage. */
export function advice(d: PointDisplay, lang: Lang = "en"): { word: string; line: string } {
  const t = TEXT[lang];
  if (d.certainty !== "fresh") return { word: t.word.unclear, line: d.certainty === "sensor" ? t.line.sensor : t.line.unclear };
  if (d.status === "working") return { word: t.word.working, line: t.line.working };
  if (d.status === "down") return { word: t.word.down, line: t.line.down };
  return { word: t.word.limited, line: t.line.limited };
}

export const JOB_STEP: Record<string, string> = {
  open: "Waiting for a technician", claimed: "Technician assigned", in_progress: "Repair in progress",
  awaiting_confirmation: "Repaired, waiting for the on-site test", closed: "Tested and closed",
};
export const BLOCKER: Record<"parts" | "funding" | "staff", string> = { parts: "Spare parts missing", funding: "No funding", staff: "No staff available" };
export const SURVEY_TEXT: Record<Survey["status"], string> = { functional: "working then", non_functional: "not working then", unknown: "state not recorded" };
