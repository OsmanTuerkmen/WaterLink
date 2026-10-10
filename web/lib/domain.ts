/** Pure WaterLink rules. Times and thresholds are explicit demo assumptions. */
export const STATUS_TTL_MS = 12 * 60 * 60 * 1000;
export const ACCESS_TTL_MS = STATUS_TTL_MS;
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
  | { type: "scenario"; scenario: "stale" | "conflict" | "no-alternative" };

export class DomainError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}

export interface PointDisplay {
  certainty: "fresh" | "stale" | "conflict" | "unknown";
  status: OperatingStatus;
  label: string;
  symbol: string;
  reason: string;
  ageMinutes: number | null;
}

const STATUS_TEXT: Record<OperatingStatus, string> = {
  working: "Funktioniert", limited: "Eingeschränkt", down: "Ausgefallen", unknown: "Unbekannt",
};
const STATUS_SYMBOL: Record<OperatingStatus, string> = {
  working: "✓", limited: "!", down: "×", unknown: "?",
};

function toMs(time: Time): number {
  const value = time instanceof Date ? time.getTime() : typeof time === "number" ? time : Date.parse(time);
  if (!Number.isFinite(value)) throw new DomainError("Ungültiger Zeitpunkt.");
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
  if (offline) return uncertain("unknown", "Verbindung fehlt", "Gespeicherter Stand; der aktuelle Zustand ist nicht bestätigt.");
  if (point.conflict) return uncertain("conflict", "Meldungen widersprüchlich", "Eine Betreiberperson muss den Zustand vor Ort erneut prüfen.");
  if (point.status === "unknown" || !Number.isFinite(at) || at > nowMs) {
    return uncertain("unknown", "Zustand unbekannt", "Keine gültige Bestätigung vorhanden.");
  }
  if (!isFresh(point.confirmedAt, nowMs, STATUS_TTL_MS)) {
    return uncertain("stale", "Bestätigung veraltet", "Aktueller Zustand nicht bestätigt. Die Demo-Frist beträgt 12 Stunden.");
  }
  return {
    certainty: "fresh", status: point.status, label: STATUS_TEXT[point.status],
    symbol: STATUS_SYMBOL[point.status], reason: "Betriebszustand zuletzt ausdrücklich bestätigt.", ageMinutes,
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

/** Rough walking estimate: straight line × 1.3 detour at 4.5 km/h. Labelled as an estimate in the UI. */
export function estimateWalkingMinutes(km: number): number {
  return Math.max(1, Math.round((km * 1.3 / 4.5) * 60));
}

const text = (value: unknown, max: number): string => (typeof value === "string" ? value.trim().slice(0, max) : "");
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const WATER_SOURCE_DE: Record<string, string> = {
  "Borehole": "Bohrloch", "Tube Well or Borehole": "Bohrloch", "Borehole/Tubewell": "Bohrloch", "Protected Well": "Geschützter Brunnen", "Protected Dug Well": "Geschützter Brunnen", "Unprotected Well": "Ungeschützter Brunnen", "Protected Shallow Well": "Geschützter Brunnen",
  "Unprotected Shallow Well": "Ungeschützter Brunnen", "Protected Spring": "Gefasste Quelle", "Unprotected Spring": "Ungefasste Quelle",
  "Rainwater Harvesting": "Regenwassertank", "Piped Water": "Leitungswasser", "Public Tapstand": "Zapfstelle", "Public tapstand": "Zapfstelle",
  "Undefined Well": "Brunnen", "Undefined Shallow Well": "Brunnen", "Surface Water (River/Stream/Lake/Pond/Dam)": "Oberflächenwasser", "Piped Water Point": "Zapfstelle", "Kiosk": "Wasserkiosk", "Unprotected Dug Well": "Ungeschützter Brunnen",
  "Sand or Sub-surface Dam": "Sanddamm", "Delivered Water": "Wasserlieferung", "Packaged water": "Abgefülltes Wasser",
};
export function waterSourceLabel(value: string): string {
  return WATER_SOURCE_DE[value] ?? (value || "Wasserstelle");
}

/** Validates imported data; malformed entries are dropped rather than trusted. */
export function parseRegion(value: unknown): RegionData | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, any>;
  const meta = raw.meta, demo = raw.demo;
  if (!meta || !demo || !Array.isArray(raw.points)) return null;
  const meeting = meta.meetingPoint;
  if (!meeting || !finite(meeting.lat) || !finite(meeting.lon)) return null;
  const seen = new Set<string>();
  const points = (raw.points as any[]).flatMap((item) => {
    const rowId = text(item?.rowId, 40);
    if (!/^[0-9A-Za-z_-]{1,40}$/.test(rowId) || seen.has(rowId) || !finite(item.lat) || !finite(item.lon)
      || Math.abs(item.lat) > 90 || Math.abs(item.lon) > 180) return [];
    const status = ["functional", "non_functional", "unknown"].includes(item.status) ? item.status : "unknown";
    const reportDate = Number.isFinite(Date.parse(item.reportDate)) ? new Date(item.reportDate).toISOString() : "";
    seen.add(rowId);
    return [{
      source: "WPdx" as const, rowId, dataset: text(item.dataset, 120), reportDate, status, statusText: text(item.statusText, 80),
      waterSource: text(item.waterSource, 80), technology: text(item.technology, 80),
      adm1: text(item.adm1, 80), adm2: text(item.adm2, 80), adm3: text(item.adm3, 80), lat: item.lat, lon: item.lon,
    }];
  }).slice(0, 400);
  const ids = [text(demo.a, 40), text(demo.b, 40), text(demo.c, 40)];
  if (new Set(ids).size !== 3 || !ids.every((id) => seen.has(id))) return null;
  return {
    meta: {
      label: text(meta.label, 120) || "Region in Kenia", county: text(meta.county, 80), fetchedAt: text(meta.fetchedAt, 40),
      attribution: text(meta.attribution, 400) || "Water Point Data Exchange (WPdx), CC BY 4.0",
      meetingPoint: { lat: meeting.lat, lon: meeting.lon, label: text(meeting.label, 120) || "Demo-Treffpunkt" },
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
    const base = `${waterSourceLabel(survey.waterSource)} ${survey.adm3 || survey.adm2}`.trim();
    const count = (names.get(base) ?? 0) + 1;
    names.set(base, count);
    const id = role.get(record.rowId) ?? `wpdx-${record.rowId}`;
    const km = distanceKm({ lat, lon }, region.meta.meetingPoint) ?? 0;
    const demoConfirmed = id === "a" || id === "b";
    return {
      id, name: count > 1 ? `${base} (${count})` : base,
      status: demoConfirmed ? "working" : "unknown",
      confirmedAt: id === "a" ? ago(18) : id === "b" ? ago(32) : null,
      confirmedBy: demoConfirmed ? "Demo-Betreiberin (simuliert)" : null,
      conflict: false,
      note: demoConfirmed ? "Simulierte Demo-Bestätigung; nicht vor Ort geprüft." : "Keine WaterLink-Bestätigung. Nur historische Erhebungsdaten.",
      location: [survey.adm3, survey.adm2].filter(Boolean).join(", ") || survey.adm1,
      landmark: `Lage laut Erhebung: ${survey.adm3 || survey.adm2 || survey.adm1}. Keine geprüfte Wegbeschreibung; Koordinaten in den Details.`,
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
      message: `Demo gestartet mit ${points.length} erfassten Wasserstellen (${region.meta.label}, Quelle WPdx). Bestätigungen, Wege und Personen sind simuliert.`,
      actorId: "demo", actorName: "WaterLink Demo", at: ago(35) }],
  };
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
      { ...shared, id: "a", name: "Brunnen am Markt", status: "working", confirmedAt: ago(18),
        confirmedBy: "Demo-Betreiberin", note: "Wasserentnahme im Beispiel geprüft.",
        location: "Am Markt", landmark: "Neben dem großen Marktstand, gegenüber dem Treffpunkt.", walkingMinutes: 12 },
      { ...shared, id: "b", name: "Wasserstelle an der Schule", status: "working", confirmedAt: ago(32),
        confirmedBy: "Demo-Betreiberin", note: "Betrieb und öffentlicher Zugang im Beispiel bestätigt.",
        location: "An der Schule", landmark: "Dem Hauptweg zur Schule folgen; Zugang neben dem blauen Tor.", walkingMinutes: 22 },
      { ...shared, id: "c", name: "Pumpe am Akazienweg", status: "unknown", confirmedAt: null,
        confirmedBy: null, note: "Für dieses Beispiel liegt keine Bestätigung vor.",
        location: "Am Akazienweg", landmark: "Hinter der Weggabelung bei der großen Akazie.", walkingMinutes: 31,
        accessVerified: false, routeVerified: false, accessConfirmedAt: null, allDay: false },
    ],
    jobs: [],
    events: [{ id: "event-seed", pointId: null, jobId: null, type: "seed",
      message: "Fiktive Demo gestartet. Alle Orte, Wege und Meldungen sind Beispieldaten.",
      actorId: "demo", actorName: "WaterLink Demo", at: ago(35) }],
  };
}

function requireRole(actor: Actor, role: Role): void {
  if (!actor || actor.role !== role || !actor.id || !actor.name) {
    throw new DomainError("Diese Aktion ist für deine Rolle nicht erlaubt.", 403);
  }
}

function cleanNote(note: string): string {
  if (typeof note !== "string" || note.trim().length < 3 || note.trim().length > 1000) {
    throw new DomainError("Bitte eine Beschreibung mit 3 bis 1.000 Zeichen eingeben.");
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
    if (!point) throw new DomainError("Wasserstelle nicht gefunden.", 404);
    return point;
  };
  const jobById = (id: string) => {
    const job = next.jobs.find((item) => item.id === id);
    if (!job) throw new DomainError("Auftrag nicht gefunden.", 404);
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
    if (job.assignedTo !== actor.id) throw new DomainError("Nur die zuständige Fachkraft darf diesen Auftrag bearbeiten.", 403);
    return job;
  };
  if (!command || typeof command !== "object") throw new DomainError("Ungültige Aktion.");
  switch (command.type) {
    case "report": {
      requireRole(actor, "operator");
      if (command.status !== "down" && command.status !== "limited") throw new DomainError("Ungültiger Störungszustand.");
      const note = cleanNote(command.note);
      const point = pointById(command.pointId);
      // This is an explicit operator observation, not an unverified crowdsourced vote.
      point.status = command.status;
      point.confirmedAt = at;
      point.confirmedBy = actor.name;
      point.tracked = true;
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
      event("report", `${point.name}: ${STATUS_TEXT[point.status]}. ${existing ? "Bestehender Auftrag aktualisiert" : "Reparaturauftrag erstellt"}. ${note}`, point.id, job.id);
      break;
    }
    case "claim": {
      requireRole(actor, "technician");
      const job = jobById(command.jobId);
      if (job.status !== "open" || job.assignedTo) throw new DomainError("Dieser Auftrag kann nicht mehr übernommen werden.", 409);
      job.status = "claimed";
      job.assignedTo = actor.id;
      job.assignedName = actor.name;
      job.updatedAt = at;
      event("claim", `${actor.name} hat den Auftrag übernommen.`, job.pointId, job.id);
      break;
    }
    case "start": {
      const job = technicianJob(command.jobId);
      if (job.status !== "claimed") throw new DomainError("Nur ein übernommener Auftrag kann gestartet werden.", 409);
      job.status = "in_progress";
      job.updatedAt = at;
      event("start", "Arbeit an der Wasserstelle begonnen.", job.pointId, job.id);
      break;
    }
    case "progress": {
      const job = technicianJob(command.jobId);
      if (job.status !== "claimed" && job.status !== "in_progress") throw new DomainError("Dieser Auftrag ist nicht in Bearbeitung.", 409);
      if (![null, "parts", "funding", "staff"].includes(command.blocker)) throw new DomainError("Ungültiger Hinderungsgrund.");
      job.note = cleanNote(command.note);
      job.blocker = command.blocker;
      job.status = "in_progress";
      job.updatedAt = at;
      event("progress", `Fortschritt dokumentiert: ${job.note}`, job.pointId, job.id);
      break;
    }
    case "repair": {
      const job = technicianJob(command.jobId);
      if (job.status !== "in_progress") throw new DomainError("Die Arbeit muss vor der Reparaturmeldung gestartet werden.", 409);
      job.note = cleanNote(command.note);
      job.status = "awaiting_confirmation";
      job.blocker = null;
      job.repairedAt = at;
      job.updatedAt = at;
      // The point is intentionally untouched: repair completion is no operating confirmation.
      event("repair", `Reparatur gemeldet; unabhängige Betriebsbestätigung ausstehend. ${job.note}`, job.pointId, job.id);
      break;
    }
    case "confirm": {
      requireRole(actor, "operator");
      if (command.tested !== true) throw new DomainError("Die Funktionsprüfung vor Ort muss ausdrücklich bestätigt werden.");
      if (!["working", "limited", "down"].includes(command.status)) throw new DomainError("Ungültiger bestätigter Betriebszustand.");
      const point = pointById(command.pointId);
      const note = cleanNote(command.note);
      let job = activeJob(point.id);
      if (command.status === "working" && job && job.status !== "awaiting_confirmation") {
        throw new DomainError("Zuerst muss die zuständige Fachkraft die Reparatur melden.", 409);
      }
      if (job?.repairedAt && nowMs < Date.parse(job.repairedAt)) throw new DomainError("Die Prüfung kann nicht vor der Reparatur liegen.", 409);
      point.status = command.status;
      point.confirmedAt = at;
      point.confirmedBy = actor.name;
      point.conflict = false;
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
      event("confirm", `Funktionsprüfung bestätigt: ${STATUS_TEXT[point.status]}. ${note}`, point.id, job?.id ?? null);
      break;
    }
    case "scenario": {
      requireRole(actor, "coordinator");
      const point = pointById("a");
      if (command.scenario === "stale") {
        point.confirmedAt = new Date(nowMs - STATUS_TTL_MS - 60_000).toISOString();
        point.conflict = false;
        event("scenario", "Demo-Szenario: Bestätigung der Wasserstelle A ist veraltet.", point.id, null);
      } else if (command.scenario === "conflict") {
        point.conflict = true;
        point.note = "Simulierte widersprüchliche Meldungen: Vor-Ort-Prüfung erforderlich.";
        event("scenario", "Demo-Szenario: Widersprüchliche Meldungen zu Wasserstelle A.", point.id, null);
      } else if (command.scenario === "no-alternative") {
        for (const candidate of next.points) {
          if (candidate.id !== "a") candidate.accessVerified = false;
        }
        event("scenario", "Demo-Szenario: Keine verlässlich bestätigte Alternative für Wasserstelle A.", point.id, null);
      } else throw new DomainError("Unbekanntes Demo-Szenario.");
      break;
    }
    default: throw new DomainError("Unbekannte Aktion.");
  }
  return next;
}
