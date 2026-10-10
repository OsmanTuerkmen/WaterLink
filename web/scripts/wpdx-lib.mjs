// Pure helpers for turning Water Point Data Exchange rows into data/region.json.
// Kept free of I/O so they can be tested without network access.

export const WPDX_ENDPOINT = "https://data.waterpointdata.org/resource/jfkt-jmqa.json";
export const WPDX_FIELDS = [
  "row_id", "lat_deg", "lon_deg", "report_date", "status_id", "status_clean", "water_source_clean",
  "water_tech_clean", "clean_adm1", "clean_adm2", "clean_adm3", "dataset_title",
];

const str = (value) => (typeof value === "string" ? value.trim() : "");

/** status_clean is preferred; raw status_id ("Yes"/"No") disagrees with it in some rows. */
export function mapStatus(statusClean, statusId) {
  const clean = str(statusClean).toLowerCase();
  if (clean.startsWith("functional")) return "functional";
  if (/non.?functional|abandoned|decommissioned/.test(clean)) return "non_functional";
  const raw = str(statusId).toLowerCase();
  if (!clean && raw === "yes") return "functional";
  if (!clean && raw === "no") return "non_functional";
  return "unknown";
}

export const WATER_SEEN = "Wasser am Erhebungstag: ja";
const WATER_NOT_SEEN = "Wasser am Erhebungstag: nein";

/**
 * Datasets whose status_clean is one constant while status_id ("water available on the day of
 * the visit") varies. Their status_clean carries no information (e.g. Evidence Action Kenya
 * 2023-2024: always "Non-Functional", status_id mostly "Yes"), so status_id is used instead.
 */
export function constantCleanStatusDatasets(rows) {
  const seen = new Map();
  for (const row of rows) {
    const key = str(row?.dataset_title);
    const entry = seen.get(key) ?? { clean: new Set(), ids: new Set() };
    entry.clean.add(str(row?.status_clean));
    const id = str(row?.status_id).toLowerCase();
    if (id === "yes" || id === "no") entry.ids.add(id);
    seen.set(key, entry);
  }
  return new Set([...seen].filter(([, e]) => e.clean.size === 1 && e.ids.size === 2).map(([key]) => key));
}

export function mapRecord(row, { useStatusId = false } = {}) {
  const lat = Number(row?.lat_deg), lon = Number(row?.lon_deg);
  const rowId = str(row?.row_id);
  if (!rowId || !Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const date = Date.parse(row.report_date);
  const status = useStatusId ? mapStatus("", row.status_id) : mapStatus(row.status_clean, row.status_id);
  const statusText = useStatusId
    ? { functional: WATER_SEEN, non_functional: WATER_NOT_SEEN }[status] ?? "Unbekannt"
    : str(row.status_clean) || str(row.status_id) || "Unbekannt";
  return {
    rowId,
    lat: Math.round(lat * 1e6) / 1e6,
    lon: Math.round(lon * 1e6) / 1e6,
    reportDate: Number.isFinite(date) ? new Date(date).toISOString() : "",
    status,
    statusText,
    waterSource: str(row.water_source_clean),
    technology: str(row.water_tech_clean),
    adm1: str(row.clean_adm1),
    adm2: str(row.clean_adm2),
    adm3: str(row.clean_adm3),
    dataset: str(row.dataset_title),
  };
}

export function distanceKm(a, b) {
  const rad = (v) => (v * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Repeated surveys of one physical point share coordinates; keep the newest report. */
export function dedupe(records) {
  const byPlace = new Map();
  for (const record of records) {
    const key = `${record.lat.toFixed(5)},${record.lon.toFixed(5)}`;
    const existing = byPlace.get(key);
    if (!existing || record.reportDate > existing.reportDate) byPlace.set(key, record);
  }
  return [...byPlace.values()];
}

const byDistance = (origin) => (x, y) => distanceKm(origin, x) - distanceKm(origin, y);

/** Surface water and unnamed sources are not a sensible demo pump or recommendation. */
export function isImprovedSource(record) {
  const source = str(record.waterSource).toLowerCase();
  return Boolean(source) && !/surface water|river|stream|lake|pond|unprotected|delivered|packaged/.test(source);
}
/** Plain "Functional" (or water seen) only; "needs repair" or "not in use" is not a clean demo baseline. */
export function isCleanFunctional(record) {
  const text = str(record.statusText);
  return record.status === "functional" && (/^functional\.?$/i.test(text) || text === WATER_SEEN);
}
const demoReady = (record) => isImprovedSource(record) && isCleanFunctional(record);

/**
 * Chooses a compact neighbourhood within radiusKm: A is a recently surveyed, cleanly functional,
 * improved water point in the densest cluster; B is the nearest such point within walkKm (demo
 * alternative); C is the next nearest point. A and B are first sought among surveys at most
 * recentYears older than the county's newest survey, then among all surveys (stale: true).
 * Sparse counties fail with a clear message.
 */
export function pickNeighbourhood(records, { count = 60, near = null, radiusKm = 5, walkKm = 3, recentYears = 3 } = {}) {
  if (records.length < 3) throw new Error("Zu wenige Wasserstellen mit Koordinaten (mindestens 3 nötig).");
  const within = (origin, km) => records.filter((r) => r !== origin && distanceKm(origin, r) <= km);
  const newest = records.reduce((max, r) => (r.reportDate > max ? r.reportDate : max), "");
  const cutoff = newest ? new Date(Date.parse(newest) - recentYears * 365.25 * 864e5).toISOString() : "";
  const choose = (eligible) => {
    const partner = (origin) => within(origin, walkKm).filter(eligible).sort(byDistance(origin))[0];
    const candidates = records.filter((r) => eligible(r) && partner(r));
    if (near) return { a: candidates.sort(byDistance(near))[0], partner };
    const scored = candidates
      .map((r) => ({ r, neighbours: within(r, radiusKm).length }))
      .filter((x) => x.neighbours >= 2)
      .sort((x, y) => y.neighbours - x.neighbours || y.r.reportDate.localeCompare(x.r.reportDate));
    return { a: scored[0]?.r, partner };
  };
  let { a, partner } = choose((r) => demoReady(r) && r.reportDate >= cutoff);
  let stale = false;
  if (!a) {
    ({ a, partner } = choose(demoReady));
    stale = Boolean(a);
  }
  if (!a) {
    throw new Error(`Keine geeignete Nachbarschaft gefunden: Es braucht zwei gefasste, als „Functional“ erhobene Wasserstellen höchstens ${walkKm} km voneinander entfernt. Anderes County wählen (--list) oder --radius / --walk erhöhen.`);
  }
  const b = partner(a);
  const neighbourhood = [a, ...within(a, radiusKm).sort(byDistance(a))].slice(0, Math.max(3, count));
  const c = neighbourhood.find((r) => r !== a && r !== b);
  if (!c) throw new Error("In der Nachbarschaft gibt es keine dritte Wasserstelle. --radius erhöhen.");
  return { a, b, c, points: neighbourhood, stale };
}

export function buildRegion(rows, { county, count, near, radiusKm, walkKm, recentYears, fetchedAt = new Date().toISOString() } = {}) {
  const statusIdOnly = constantCleanStatusDatasets(rows);
  const records = dedupe(rows.map((row) => mapRecord(row, { useStatusId: statusIdOnly.has(str(row?.dataset_title)) })).filter(Boolean));
  const { a, b, c, points } = pickNeighbourhood(records, { count, near, radiusKm, walkKm, recentYears });
  const datasets = [...new Set(points.map((p) => p.dataset).filter(Boolean))];
  const label = [a.adm3, a.adm2, a.adm1].filter(Boolean).join(", ") || county;
  return {
    meta: {
      label,
      county: a.adm1 || county,
      fetchedAt,
      attribution: `Water Point Data Exchange (WPdx), CC BY 4.0. Datensätze: ${datasets.slice(0, 3).join("; ")}${datasets.length > 3 ? " u. a." : ""}`.slice(0, 400),
      meetingPoint: { lat: a.lat, lon: a.lon, label: `Demo-Treffpunkt bei Wasserstelle A (${a.adm3 || a.adm2})` },
    },
    demo: { a: a.rowId, b: b.rowId, c: c.rowId },
    points,
  };
}
