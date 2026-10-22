/** Pure WaterLink rules. Times and thresholds are explicit demo assumptions. */
export const STATUS_TTL_MS = 12 * 60 * 60 * 1000;
export const ACCESS_TTL_MS = STATUS_TTL_MS;
/** The state is one stored row that every screen downloads, so the history keeps only the latest events. */
export const MAX_EVENTS = 200;
export const PILOT_TIME_ZONE = "Africa/Nairobi";

export type Time = Date | string | number;
export type Role = "operator" | "technician" | "coordinator";
export type OperatingStatus = "working" | "limited" | "down" | "unknown";
export type JobStatus = "open" | "claimed" | "in_progress" | "awaiting_confirmation" | "closed";
export type Blocker = "parts" | "funding" | "staff" | null;

export interface Actor { id: string; name: string; role: Role }
/** Historical survey record from the Water Point Data Exchange. Never a current confirmation. */
export interface Survey {
  source: "WPdx";
  rowId: string;
  dataset: string;
  reportDate: string;
  status: "functional" | "non_functional" | "unknown";
  statusText: string;
  waterSource: string;
  technology: string;
  adm1: string;
  adm2: string;
  adm3: string;
  /** Other surveys of the same place by other programmes, merged by the import (within 50 m). */
  alsoSurveyed?: { dataset: string; reportDate: string; statusText: string; meters: number }[];
}
export interface RegionMeta {
  label: string;
  county: string;
  fetchedAt: string;
  attribution: string;
  pointCount: number;
  meetingPoint: { lat: number; lon: number; label: string };
}
/** Output of scripts/import-wpdx.mjs; validated again before use. */
export interface RegionData {
  meta: Omit<RegionMeta, "pointCount">;
  demo: { a: string; b: string; c: string };
  points: (Survey & { lat: number; lon: number })[];
}
export interface WaterPoint {
  id: string;
  name: string;
  status: OperatingStatus;
  confirmedAt: string | null;
  confirmedBy: string | null;
  conflict: boolean;
  /** Unconfirmed hint from usage monitoring; never a status by itself, cleared by an on-site report or check. */
  sensorAlert?: string | null;
  note: string;
  location: string;
  landmark: string;
  walkingMinutes: number;
  accessVerified: boolean;
  routeVerified: boolean;
  accessConfirmedAt: string | null;
  opensAt: string;
  closesAt: string;
  allDay: boolean;
  /** Part of the WaterLink programme: shown as a card and kept up to date by operators. */
  tracked?: boolean;
  lat?: number | null;
  lon?: number | null;
  survey?: Survey | null;
  /** Who last checked route and access on site; null or missing for the simulated checks of the seed data. */
  accessCheckedBy?: string | null;
  /** Added through the app (not part of the seed data), so it may be removed again. */
  custom?: boolean;
}
export interface Job {
  id: string;
  pointId: string;
  status: JobStatus;
  note: string;
  blocker: Blocker;
  assignedTo: string | null;
  assignedName: string | null;
  createdAt: string;
  updatedAt: string;
  repairedAt: string | null;
  closedAt: string | null;
}
export interface Event {
  id: string;
  pointId: string | null;
  jobId: string | null;
  type: string;
  message: string;
  actorId: string;
  actorName: string;
  at: string;
}
export interface State { points: WaterPoint[]; jobs: Job[]; events: Event[]; revision: number; region?: RegionMeta | null }
export type WaterLinkState = State;
export type Command =
  | { type: "report"; pointId: string; status: "down" | "limited"; note: string }
  | { type: "claim"; jobId: string }
  | { type: "start"; jobId: string }
  | { type: "progress"; jobId: string; note: string; blocker: Blocker }
  | { type: "repair"; jobId: string; note: string }
  | { type: "confirm"; pointId: string; status: "working" | "limited" | "down"; note: string; tested: true }
  | { type: "scenario"; scenario: "stale" | "conflict" | "no-alternative" | "sensor" }
  /** Someone walked the route from the meeting point and checked that the public can use the water point. */
  | { type: "verify_access"; pointId: string; walkingMinutes: number; landmark: string; allDay: boolean; opensAt: string; closesAt: string; checked: true }
  | { type: "close_access"; pointId: string; note: string }
  | { type: "add_point"; name: string; location: string; source: string; walkingMinutes: number; lat?: number | null; lon?: number | null }
  | { type: "remove_point"; pointId: string };

/** The demo looks after at most this many water points: one letter each (SMS) and a board that still fits a screen. */
export const MAX_TRACKED = 8;
/** An added water point must lie this close to the meeting point: the demo covers one area, and the map frames it. */
export const MAX_POINT_RADIUS_KM = 15;
export const NEW_POINT_SOURCES = ["Borehole", "Protected well", "Protected spring", "Tap stand", "Water kiosk", "Rainwater tank", "Other"] as const;

export class DomainError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}

export interface PointDisplay {
  certainty: "fresh" | "stale" | "conflict" | "sensor" | "unknown";
  status: OperatingStatus;
  label: string;
  symbol: string;
  reason: string;
  ageMinutes: number | null;
}

const STATUS_TEXT: Record<OperatingStatus, string> = {
  working: "Working", limited: "Limited", down: "Not working", unknown: "Unknown",
};
const STATUS_SYMBOL: Record<OperatingStatus, string> = {
  working: "✓", limited: "!", down: "×", unknown: "?",
};

function toMs(time: Time): number {
  const value = time instanceof Date ? time.getTime() : typeof time === "number" ? time : Date.parse(time);
  if (!Number.isFinite(value)) throw new DomainError("Invalid time.");
  return value;
}

function isFresh(at: string | null, nowMs: number, ttl: number): boolean {
  if (!at) return false;
  const timestamp = Date.parse(at);
  return Number.isFinite(timestamp) && timestamp <= nowMs && nowMs - timestamp < ttl;
}

/** A last-known green value is never represented as a current confirmation offline. */
export function getPointDisplay(point: WaterPoint, now: Time = Date.now(), offline = false): PointDisplay {
  const nowMs = toMs(now);
  const at = point.confirmedAt ? Date.parse(point.confirmedAt) : NaN;
  const ageMinutes = Number.isFinite(at) && at <= nowMs ? Math.floor((nowMs - at) / 60_000) : null;
  const uncertain = (certainty: PointDisplay["certainty"], label: string, reason: string): PointDisplay => ({
    certainty, status: "unknown", label, symbol: "?", reason, ageMinutes,
  });
  if (offline) return uncertain("unknown", "No connection", "Saved copy; the current state is not confirmed.");
  if (point.conflict) return uncertain("conflict", "Reports disagree", "An operator has to check on site again.");
  if (point.sensorAlert) return uncertain("sensor", "Sensor hint", point.sensorAlert);
  if (point.status === "unknown" || !Number.isFinite(at) || at > nowMs) {
    return uncertain("unknown", "Not confirmed", "No valid confirmation yet.");
  }
  if (!isFresh(point.confirmedAt, nowMs, STATUS_TTL_MS)) {
    return uncertain("stale", "Confirmation expired", "Not confirmed today. A confirmation is valid for 12 hours in this demo.");
  }
  return {
    certainty: "fresh", status: point.status, label: STATUS_TEXT[point.status],
    symbol: STATUS_SYMBOL[point.status], reason: "Confirmed on site by the operator.", ageMinutes,
  };
}

function clockMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Opening times refer to the example region, independent of the viewer's timezone. */
export function isPointOpen(point: WaterPoint, when: Time = Date.now()): boolean {
  if (point.allDay) return true;
  const opening = clockMinutes(point.opensAt);
  const closing = clockMinutes(point.closesAt);
  if (opening === null || closing === null || opening === closing) return false;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PILOT_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(toMs(when)));
  const minutes = Number(parts.find((part) => part.type === "hour")?.value) * 60
    + Number(parts.find((part) => part.type === "minute")?.value);
  return opening < closing
    ? minutes >= opening && minutes < closing
    : minutes >= opening || minutes < closing;
}

/** Candidates are conservative: fresh working, verified access/route, open on arrival. */
export function getAlternatives(points: WaterPoint[], sourceId: string, now: Time = Date.now(), offline = false): WaterPoint[] {
  if (offline) return [];
  const nowMs = toMs(now);
  return points.filter((point) => {
    if (point.id === sourceId || !point.accessVerified || !point.routeVerified
      || !Number.isFinite(point.walkingMinutes) || point.walkingMinutes < 0) return false;
    const arrival = nowMs + point.walkingMinutes * 60_000;
    // A confirmation expiring during the walk is not a reliable recommendation.
    return getPointDisplay(point, nowMs).status === "working"
      && getPointDisplay(point, arrival).status === "working"
      && isFresh(point.accessConfirmedAt, arrival, ACCESS_TTL_MS)
      && isPointOpen(point, nowMs) && isPointOpen(point, arrival);
  }).sort((a, b) => a.walkingMinutes - b.walkingMinutes);
}

export function findAlternative(points: WaterPoint[], sourceId: string, now: Time = Date.now(), offline = false): WaterPoint | null {
  return getAlternatives(points, sourceId, now, offline)[0] ?? null;
}

const EARTH_KM = 6371;
export function distanceKm(a: { lat?: number | null; lon?: number | null }, b: { lat?: number | null; lon?: number | null }): number | null {
  if (![a.lat, a.lon, b.lat, b.lon].every((v) => typeof v === "number" && Number.isFinite(v))) return null;
  const rad = (v: number) => (v * Math.PI) / 180;
  const dLat = rad(b.lat! - a.lat!), dLon = rad(b.lon! - a.lon!);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat!)) * Math.cos(rad(b.lat!)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Nearest recorded points by straight-line distance. Not a recommendation: route and status are unverified. */
export function getNearby(points: WaterPoint[], sourceId: string, limit = 2): { point: WaterPoint; km: number }[] {
  const source = points.find((point) => point.id === sourceId);
  if (!source) return [];
  return points.flatMap((point) => {
    if (point.id === sourceId) return [];
    const km = distanceKm(source, point);
    return km === null ? [] : [{ point, km }];
  }).sort((a, b) => a.km - b.km).slice(0, limit);
}

/**
 * A survey record of another dataset within `withinMeters`: often the same physical water point surveyed in another year,
 * not a second one. Only a hint for people; nothing is merged or hidden.
 */
export function getPossibleDuplicate(points: WaterPoint[], point: WaterPoint, withinMeters = 50): { point: WaterPoint; meters: number } | null {
  if (!point.survey) return null;
  let best: { point: WaterPoint; meters: number } | null = null;
  for (const other of points) {
    if (other.id === point.id || !other.survey || other.survey.dataset === point.survey.dataset) continue;
    const km = distanceKm(point, other);
    if (km === null) continue;
    const meters = Math.round(km * 1000);
    if (meters <= withinMeters && (!best || meters < best.meters)) best = { point: other, meters };
  }
  return best;
}

/** Reads "0.4601, 34.1115" (what Google Maps copies) or "0.4601 34.1115"; null when it is not a latitude and longitude. */
export function parseCoordinates(input: string): { lat: number; lon: number } | null {
  const match = input.trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = Number(match[1]), lon = Number(match[2]);
  return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : null;
}

/**
 * The recorded water point closest to a position, if it is within `withinMeters`: a hint that a new entry may be a second
 * record of the same place. Only a hint for people; nothing is blocked or merged.
 */
export function findNearbyPoint(points: WaterPoint[], position: { lat: number; lon: number }, withinMeters = 50): { point: WaterPoint; meters: number } | null {
  let best: { point: WaterPoint; meters: number } | null = null;
  for (const other of points) {
    const km = distanceKm(position, other);
    if (km === null) continue;
    const meters = Math.round(km * 1000);
    if (meters <= withinMeters && (!best || meters < best.meters)) best = { point: other, meters };
  }
  return best;
}

/** Rough walking estimate: straight line × 1.3 detour at 4.5 km/h. Labelled as an estimate in the UI. */
export function estimateWalkingMinutes(km: number): number {
  return Math.max(1, Math.round((km * 1.3 / 4.5) * 60));
}

const text = (value: unknown, max: number): string => (typeof value === "string" ? value.trim().slice(0, max) : "");
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const WATER_SOURCE_LABEL: Record<string, string> = {
  "Tube Well or Borehole": "Borehole", "Borehole/Tubewell": "Borehole", "Protected Well": "Protected well", "Protected Dug Well": "Protected well", "Protected Shallow Well": "Protected well",
  "Unprotected Well": "Unprotected well", "Unprotected Shallow Well": "Unprotected well", "Unprotected Dug Well": "Unprotected well",
  "Protected Spring": "Protected spring", "Unprotected Spring": "Unprotected spring", "Rainwater Harvesting": "Rainwater tank",
  "Piped Water": "Tap stand", "Public Tapstand": "Tap stand", "Public tapstand": "Tap stand", "Piped Water Point": "Tap stand",
  "Undefined Well": "Well", "Undefined Shallow Well": "Well", "Surface Water (River/Stream/Lake/Pond/Dam)": "Surface water", "Kiosk": "Water kiosk",
  "Sand or Sub-surface Dam": "Sand dam", "Delivered Water": "Water delivery", "Packaged water": "Packaged water",
};
export function waterSourceLabel(value: string): string {
  return WATER_SOURCE_LABEL[value] ?? (value || "Water point");
}

/** Validates imported data; malformed entries are dropped rather than trusted. */
const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

export function parseRegion(value: unknown): RegionData | null {
  const raw = record(value), meta = record(raw?.meta), demo = record(raw?.demo);
  if (!raw || !meta || !demo || !Array.isArray(raw.points)) return null;
  const meeting = record(meta.meetingPoint);
  if (!meeting || !finite(meeting.lat) || !finite(meeting.lon)) return null;
  const seen = new Set<string>();
  const points = (raw.points as unknown[]).flatMap((entry) => {
    const item = record(entry);
    if (!item) return [];
    const rowId = text(item.rowId, 40);
    if (!/^[0-9A-Za-z_-]{1,40}$/.test(rowId) || seen.has(rowId) || !finite(item.lat) || !finite(item.lon)
      || Math.abs(item.lat) > 90 || Math.abs(item.lon) > 180) return [];
    const status = (["functional", "non_functional", "unknown"] as const).find((s) => s === item.status) ?? "unknown";
    const reportDate = Number.isFinite(Date.parse(String(item.reportDate))) ? new Date(String(item.reportDate)).toISOString() : "";
    seen.add(rowId);
    const also = (Array.isArray(item.alsoSurveyed) ? item.alsoSurveyed : []).flatMap((entry: unknown) => {
      const other = record(entry);
      return other && finite(other.meters) ? [{
        dataset: text(other.dataset, 120), statusText: text(other.statusText, 80), meters: Math.round(other.meters),
        reportDate: Number.isFinite(Date.parse(String(other.reportDate))) ? new Date(String(other.reportDate)).toISOString() : "",
      }] : [];
    }).slice(0, 5);
    return [{
      ...(also.length ? { alsoSurveyed: also } : {}),
      source: "WPdx" as const, rowId, dataset: text(item.dataset, 120), reportDate, status, statusText: text(item.statusText, 80),
      waterSource: text(item.waterSource, 80), technology: text(item.technology, 80),
      adm1: text(item.adm1, 80), adm2: text(item.adm2, 80), adm3: text(item.adm3, 80), lat: item.lat, lon: item.lon,
    }];
  }).slice(0, 400);
  const ids = [text(demo.a, 40), text(demo.b, 40), text(demo.c, 40)];
  if (new Set(ids).size !== 3 || !ids.every((id) => seen.has(id))) return null;
  return {
    meta: {
      label: text(meta.label, 120) || "Region in Kenya", county: text(meta.county, 80), fetchedAt: text(meta.fetchedAt, 40),
      attribution: text(meta.attribution, 400) || "Water Point Data Exchange (WPdx), CC BY 4.0",
      meetingPoint: { lat: meeting.lat, lon: meeting.lon, label: text(meeting.label, 120) || "demo meeting point" },
    },
    demo: { a: ids[0], b: ids[1], c: ids[2] },
    points,
  };
}

/**
 * Real recorded water points. WaterLink confirmations on the three demo points are simulated
 * and labelled as such; every other point starts unconfirmed with only its historical survey.
 */
function createRegionSeed(region: RegionData, time: number): State {
  const ago = (minutes: number) => new Date(time - minutes * 60_000).toISOString();
  const { a, b, c } = region.demo;
  const role = new Map([[a, "a"], [b, "b"], [c, "c"]]);
  const names = new Map<string, number>();
  const points: WaterPoint[] = region.points.map((record) => {
    const { lat, lon, ...survey } = record;
    const base = waterSourceLabel(survey.waterSource);
    const id = role.get(record.rowId) ?? `wpdx-${record.rowId}`;
    // Demo points carry their letter; other recorded points are numbered per source type.
    const count = id.length === 1 ? 0 : (names.get(base) ?? 0) + 1;
    if (count) names.set(base, count);
    const km = distanceKm({ lat, lon }, region.meta.meetingPoint) ?? 0;
    const demoConfirmed = id === "a" || id === "b";
    return {
      id, name: count ? `${base} ${count}` : `${base} ${id.toUpperCase()}`,
      status: demoConfirmed ? "working" : "unknown",
      confirmedAt: id === "a" ? ago(18) : id === "b" ? ago(32) : null,
      confirmedBy: demoConfirmed ? "Demo operator (simulated)" : null,
      conflict: false,
      note: demoConfirmed ? "Simulated demo confirmation; not checked on site." : "No WaterLink confirmation. Historical survey data only.",
      location: [survey.adm3, survey.adm2].filter(Boolean).join(", ") || survey.adm1,
      landmark: `Location from the survey: ${survey.adm3 || survey.adm2 || survey.adm1}. No checked directions.`,
      walkingMinutes: estimateWalkingMinutes(km),
      accessVerified: id === "b", routeVerified: id === "b", accessConfirmedAt: id === "b" ? ago(35) : null,
      opensAt: "", closesAt: "", allDay: id === "b",
      tracked: role.has(record.rowId), lat, lon, survey,
    };
  });
  const order = (p: WaterPoint) => (p.tracked ? p.id.charCodeAt(0) : 1000);
  points.sort((x, y) => order(x) - order(y) || x.walkingMinutes - y.walkingMinutes);
  return {
    revision: 0,
    region: { ...region.meta, pointCount: points.length },
    points,
    jobs: [],
    events: [{ id: "event-seed", pointId: null, jobId: null, type: "seed",
      message: `Demo started with ${points.length} recorded water points (${region.meta.label}, source WPdx). Confirmations, routes and people are simulated.`,
      actorId: "demo", actorName: "WaterLink Demo", at: ago(35) }],
  };
}

/** The start state again, one revision further, with a single history entry that says who reset it. */
export function resetState(previous: State, actor: Actor, now: Time, region: RegionData | null): State {
  const next = createSeedState(now, region);
  next.revision = previous.revision + 1;
  next.events = [{
    id: `event-reset-${next.revision}`, pointId: null, jobId: null, type: "reset",
    message: "Demo reset. Confirmations, routes, people and reports are simulated.",
    actorId: actor.id, actorName: actor.name, at: new Date(toMs(now)).toISOString(),
  }];
  return next;
}

export function createSeedState(now: Time = Date.now(), region: RegionData | null = null): State {
  if (region) return createRegionSeed(region, toMs(now));
  return createFictionalSeed(now);
}

function createFictionalSeed(now: Time = Date.now()): State {
  const time = toMs(now);
  const ago = (minutes: number) => new Date(time - minutes * 60_000).toISOString();
  const shared = {
    conflict: false, accessVerified: true, routeVerified: true, accessConfirmedAt: ago(35),
    opensAt: "06:00", closesAt: "20:00", allDay: true, tracked: true,
  };
  return {
    revision: 0,
    points: [
      { ...shared, id: "a", name: "Market well", status: "working", confirmedAt: ago(18),
        confirmedBy: "Demo operator", note: "Water flow checked in this example.",
        location: "At the market", landmark: "Next to the big market stall, opposite the meeting point.", walkingMinutes: 12 },
      { ...shared, id: "b", name: "School tap", status: "working", confirmedAt: ago(32),
        confirmedBy: "Demo operator", note: "Operation and public access confirmed in this example.",
        location: "At the school", landmark: "Follow the main path to the school; access next to the blue gate.", walkingMinutes: 22 },
      { ...shared, id: "c", name: "Acacia Lane pump", status: "unknown", confirmedAt: null,
        confirmedBy: null, note: "No confirmation in this example.",
        location: "Acacia Lane", landmark: "Behind the fork by the big acacia tree.", walkingMinutes: 31,
        accessVerified: false, routeVerified: false, accessConfirmedAt: null, allDay: false },
    ],
    jobs: [],
    events: [{ id: "event-seed", pointId: null, jobId: null, type: "seed",
      message: "Fictional demo started. All places, routes and reports are example data.",
      actorId: "demo", actorName: "WaterLink Demo", at: ago(35) }],
  };
}

function requireRole(actor: Actor, role: Role): void {
  if (!actor || actor.role !== role || !actor.id || !actor.name) {
    throw new DomainError("Your role cannot do this.", 403);
  }
}

function cleanText(value: unknown, min: number, max: number, message: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < min || text.length > max) throw new DomainError(message);
  return text;
}

function cleanMinutes(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 180) {
    throw new DomainError("The walking time must be a whole number of minutes between 1 and 180.");
  }
  return value;
}

function cleanNote(note: string): string {
  if (typeof note !== "string" || note.trim().length < 3 || note.trim().length > 1000) {
    throw new DomainError("Please write a description of 3 to 1,000 characters.");
  }
  return note.trim();
}

/** Atomic, immutable business transition. Storage must additionally compare revision. */
export function applyCommand(state: State, command: Command, actor: Actor, now: Time = Date.now()): State {
  const nowMs = toMs(now);
  const at = new Date(nowMs).toISOString();
  const next: State = {
    points: state.points.map((point) => ({ ...point })), jobs: state.jobs.map((job) => ({ ...job })),
    events: state.events.map((event) => ({ ...event })), revision: state.revision + 1,
    ...(state.region !== undefined ? { region: state.region } : {}),
  };
  const pointById = (id: string) => {
    const point = next.points.find((item) => item.id === id);
    if (!point) throw new DomainError("Water point not found.", 404);
    return point;
  };
  const jobById = (id: string) => {
    const job = next.jobs.find((item) => item.id === id);
    if (!job) throw new DomainError("Repair job not found.", 404);
    return job;
  };
  const activeJob = (pointId: string) => next.jobs.find((job) => job.pointId === pointId && job.status !== "closed");
  const newJob = (pointId: string, note: string): Job => {
    const job: Job = {
      id: `job-${next.revision}`, pointId, status: "open", note, blocker: null, assignedTo: null,
      assignedName: null, createdAt: at, updatedAt: at, repairedAt: null, closedAt: null,
    };
    next.jobs.push(job);
    return job;
  };
  const event = (type: string, message: string, pointId: string | null, jobId: string | null) => {
    next.events.push({ id: `event-${next.revision}`, type, message, pointId, jobId, actorId: actor.id, actorName: actor.name, at });
  };
  const technicianJob = (jobId: string) => {
    requireRole(actor, "technician");
    const job = jobById(jobId);
    if (job.assignedTo !== actor.id) throw new DomainError("Only the assigned technician can work on this job.", 403);
    return job;
  };
  if (!command || typeof command !== "object") throw new DomainError("Invalid action.");
  switch (command.type) {
    case "report": {
      requireRole(actor, "operator");
      if (command.status !== "down" && command.status !== "limited") throw new DomainError("Invalid problem status.");
      const note = cleanNote(command.note);
      const point = pointById(command.pointId);
      // This is an explicit operator observation, not an unverified crowdsourced vote.
      point.status = command.status;
      point.confirmedAt = at;
      point.confirmedBy = actor.name;
      point.tracked = true;
      point.sensorAlert = null;
      // An additional report cannot resolve an existing contradiction; confirm does.
      point.note = note;
      const existing = activeJob(point.id);
      const job = existing ?? newJob(point.id, note);
      job.updatedAt = at;
      job.note = note;
      if (job.status === "awaiting_confirmation") {
        job.status = job.assignedTo ? "in_progress" : "open";
        job.repairedAt = null;
      }
      event("report", `${point.name}: ${STATUS_TEXT[point.status]}. ${existing ? "Existing repair job updated" : "Repair job created"}. ${note}`, point.id, job.id);
      break;
    }
    case "claim": {
      requireRole(actor, "technician");
      const job = jobById(command.jobId);
      if (job.status !== "open" || job.assignedTo) throw new DomainError("This job can no longer be claimed.", 409);
      job.status = "claimed";
      job.assignedTo = actor.id;
      job.assignedName = actor.name;
      job.updatedAt = at;
      event("claim", `${actor.name} claimed the job.`, job.pointId, job.id);
      break;
    }
    case "start": {
      const job = technicianJob(command.jobId);
      if (job.status !== "claimed") throw new DomainError("Only a claimed job can be started.", 409);
      job.status = "in_progress";
      job.updatedAt = at;
      event("start", "Work on site started.", job.pointId, job.id);
      break;
    }
    case "progress": {
      const job = technicianJob(command.jobId);
      if (job.status !== "claimed" && job.status !== "in_progress") throw new DomainError("This job is not in progress.", 409);
      if (![null, "parts", "funding", "staff"].includes(command.blocker)) throw new DomainError("Invalid blocker.");
      job.note = cleanNote(command.note);
      job.blocker = command.blocker;
      job.status = "in_progress";
      job.updatedAt = at;
      event("progress", `Progress noted: ${job.note}`, job.pointId, job.id);
      break;
    }
    case "repair": {
      const job = technicianJob(command.jobId);
      if (job.status !== "in_progress") throw new DomainError("Start the work before reporting a repair.", 409);
      job.note = cleanNote(command.note);
      job.status = "awaiting_confirmation";
      job.blocker = null;
      job.repairedAt = at;
      job.updatedAt = at;
      // The point is intentionally untouched: repair completion is no operating confirmation.
      event("repair", `Repair reported; waiting for the operator to test it. ${job.note}`, job.pointId, job.id);
      break;
    }
    case "confirm": {
      requireRole(actor, "operator");
      if (command.tested !== true) throw new DomainError("Please confirm explicitly that you tested it on site.");
      if (!["working", "limited", "down"].includes(command.status)) throw new DomainError("Invalid confirmed status.");
      const point = pointById(command.pointId);
      const note = cleanNote(command.note);
      let job = activeJob(point.id);
      if (command.status === "working" && job && job.status !== "awaiting_confirmation") {
        throw new DomainError("The technician has to report the repair first.", 409);
      }
      if (job?.repairedAt && nowMs < Date.parse(job.repairedAt)) throw new DomainError("The test cannot be earlier than the repair.", 409);
      point.status = command.status;
      point.confirmedAt = at;
      point.confirmedBy = actor.name;
      point.conflict = false;
      point.sensorAlert = null;
      point.tracked = true;
      point.note = note;
      if (command.status === "working" && job) {
        job.status = "closed";
        job.closedAt = at;
        job.blocker = null;
        job.updatedAt = at;
      } else if (command.status !== "working") {
        job = job ?? newJob(point.id, note);
        if (job.status === "awaiting_confirmation") job.status = job.assignedTo ? "in_progress" : "open";
        job.repairedAt = null;
        job.updatedAt = at;
        job.note = note;
      }
      event("confirm", `Tested on site: ${STATUS_TEXT[point.status]}. ${note}`, point.id, job?.id ?? null);
      break;
    }
    case "scenario": {
      requireRole(actor, "coordinator");
      const point = pointById("a");
      if (command.scenario === "stale") {
        point.confirmedAt = new Date(nowMs - STATUS_TTL_MS - 60_000).toISOString();
        point.conflict = false;
        event("scenario", "Demo scenario: the confirmation of water point A has expired.", point.id, null);
      } else if (command.scenario === "conflict") {
        point.conflict = true;
        point.note = "Simulated conflicting reports: an on-site check is needed.";
        event("scenario", "Demo scenario: conflicting reports about water point A.", point.id, null);
      } else if (command.scenario === "no-alternative") {
        for (const candidate of next.points) {
          if (candidate.id !== "a") candidate.accessVerified = false;
        }
        event("scenario", "Demo scenario: no reliably confirmed alternative for water point A.", point.id, null);
      } else if (command.scenario === "sensor") {
        point.sensorAlert = "The sensor has shown almost no pumping for 2 weeks. Please check on site.";
        event("scenario", "Demo scenario: sensor hint for water point A (pattern from real Kwale data, 2014). The status stays unconfirmed until someone checks on site.", point.id, null);
      } else throw new DomainError("Unknown demo scenario.");
      break;
    }
    case "verify_access": {
      requireRole(actor, "coordinator");
      if (command.checked !== true) throw new DomainError("Please confirm that you walked the route and checked the access on site.");
      const point = pointById(command.pointId);
      const minutes = cleanMinutes(command.walkingMinutes);
      const landmark = cleanText(command.landmark, 3, 200, "Please describe the way in 3 to 200 characters.");
      if (typeof command.allDay !== "boolean") throw new DomainError("Please say whether the water point is open all day.");
      if (!command.allDay && (clockMinutes(command.opensAt) === null || clockMinutes(command.closesAt) === null || command.opensAt === command.closesAt)) {
        throw new DomainError("Please give different opening and closing times as HH:MM, or choose open all day.");
      }
      point.walkingMinutes = minutes;
      point.landmark = landmark;
      point.allDay = command.allDay;
      point.opensAt = command.allDay ? "" : command.opensAt;
      point.closesAt = command.allDay ? "" : command.closesAt;
      point.accessVerified = true;
      point.routeVerified = true;
      point.accessConfirmedAt = at;
      point.accessCheckedBy = actor.name;
      point.tracked = true;
      const hours = command.allDay ? "open all day" : `open ${command.opensAt}–${command.closesAt}`;
      event("verify", `${point.name}: route and access checked on site (about ${minutes} min, ${hours}). ${landmark}`, point.id, null);
      break;
    }
    case "close_access": {
      requireRole(actor, "coordinator");
      const point = pointById(command.pointId);
      const note = cleanNote(command.note);
      // A closed gate or a blocked path must never leave a point looking like a safe alternative.
      point.accessVerified = false;
      point.routeVerified = false;
      point.accessCheckedBy = actor.name;
      event("access", `${point.name}: access closed or route blocked, so no alternative will point here. ${note}`, point.id, null);
      break;
    }
    case "add_point": {
      requireRole(actor, "coordinator");
      const name = cleanText(command.name, 3, 60, "Please name the water point in 3 to 60 characters.");
      const location = cleanText(command.location, 2, 80, "Please say where it is in 2 to 80 characters.");
      if (!(NEW_POINT_SOURCES as readonly string[]).includes(command.source)) throw new DomainError("Please choose the type of water point.");
      const minutes = cleanMinutes(command.walkingMinutes);
      let lat: number | null = null, lon: number | null = null;
      if (command.lat != null || command.lon != null) {
        if (!finite(command.lat) || !finite(command.lon) || Math.abs(command.lat) > 90 || Math.abs(command.lon) > 180) {
          throw new DomainError("Please give the position as latitude and longitude, for example 0.4601, 34.1115.");
        }
        const meeting = next.region?.meetingPoint;
        const km = meeting ? distanceKm(command, meeting) : null;
        if (km !== null && km > MAX_POINT_RADIUS_KM) {
          throw new DomainError(`That position is ${Math.round(km)} km from the meeting point. The demo covers ${MAX_POINT_RADIUS_KM} km around it.`);
        }
        lat = Math.round(command.lat * 1e5) / 1e5; lon = Math.round(command.lon * 1e5) / 1e5;
      }
      const near = lat === null || lon === null ? null : findNearbyPoint(next.points, { lat, lon });
      const inProgramme = (p: WaterPoint) => p.tracked ?? true;
      if (next.points.filter(inProgramme).length >= MAX_TRACKED) {
        throw new DomainError(`The demo looks after at most ${MAX_TRACKED} water points. Remove one first.`, 409);
      }
      const id = [..."abcdefghijklmnopqrstuvwxyz"].find((letter) => !next.points.some((p) => p.id === letter));
      if (!id) throw new DomainError("No letter is free for another water point.", 409);
      const added: WaterPoint = {
        id, name, status: "unknown", confirmedAt: null, confirmedBy: null, conflict: false,
        note: "Added by coordination in this demo. No confirmation yet.",
        location, landmark: "No checked directions yet.", walkingMinutes: minutes,
        accessVerified: false, routeVerified: false, accessConfirmedAt: null,
        opensAt: "", closesAt: "", allDay: false, tracked: true, custom: true, lat, lon, survey: null,
      };
      const lastInProgramme = next.points.map(inProgramme).lastIndexOf(true);
      next.points.splice(lastInProgramme + 1, 0, added);
      event("add", `Water point ${id.toUpperCase()} · ${name} (${command.source}, ${location}) added to the programme, about ${minutes} min from the meeting point${lat === null ? "" : ", marked on the map"}. Not confirmed yet; route and access are not checked yet.${near ? ` A recorded water point (${near.point.name}) lies about ${near.meters} m away: please check that this is not the same one.` : ""}`, id, null);
      break;
    }
    case "remove_point": {
      requireRole(actor, "coordinator");
      const point = pointById(command.pointId);
      if (!point.custom) throw new DomainError("Only water points added in this demo can be removed.", 409);
      if (next.jobs.some((job) => job.pointId === point.id && job.status !== "closed")) throw new DomainError("Close the repair job of this water point first.", 409);
      next.points = next.points.filter((p) => p.id !== point.id);
      event("remove", `Water point ${point.id.toUpperCase()} · ${point.name} removed from the programme.`, point.id, null);
      break;
    }
    default: throw new DomainError("Unknown action.");
  }
  if (next.events.length > MAX_EVENTS) next.events = next.events.slice(-MAX_EVENTS);
  return next;
}
