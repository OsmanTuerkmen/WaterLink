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
export interface State { points: WaterPoint[]; jobs: Job[]; events: Event[]; revision: number }
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

export function createSeedState(now: Time = Date.now()): State {
  const time = toMs(now);
  const ago = (minutes: number) => new Date(time - minutes * 60_000).toISOString();
  const shared = {
    conflict: false, accessVerified: true, routeVerified: true, accessConfirmedAt: ago(35),
    opensAt: "06:00", closesAt: "20:00", allDay: true,
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
