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

export function mapRecord(row) {
  const lat = Number(row?.lat_deg), lon = Number(row?.lon_deg);
  const rowId = str(row?.row_id);
  if (!rowId || !Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const date = Date.parse(row.report_date);
  return {
    rowId,
    lat: Math.round(lat * 1e6) / 1e6,
    lon: Math.round(lon * 1e6) / 1e6,
    reportDate: Number.isFinite(date) ? new Date(date).toISOString() : "",
    status: mapStatus(row.status_clean, row.status_id),
    statusText: str(row.status_clean) || str(row.status_id) || "Unbekannt",
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

/**
 * Chooses a compact neighbourhood: a recently surveyed functional point A with nearby points,
 * the nearest functional neighbour B (demo alternative) and the next neighbour C.
 */
export function pickNeighbourhood(records, { count = 60, near = null, radiusKm = 3 } = {}) {
  if (records.length < 3) throw new Error("Zu wenige Wasserstellen mit Koordinaten (mindestens 3 nötig).");
  let a;
  if (near) {
    a = [...records].sort(byDistance(near))[0];
  } else {
    const candidates = records.filter((r) => r.status === "functional").sort((x, y) => y.reportDate.localeCompare(x.reportDate));
    a = candidates.find((candidate) => {
      const close = records.filter((r) => r !== candidate && distanceKm(candidate, r) <= radiusKm);
      return close.length >= 3 && close.some((r) => r.status === "functional");
    }) ?? candidates[0] ?? records[0];
  }
  const neighbourhood = [...records].sort(byDistance(a)).slice(0, Math.max(3, count));
  const others = neighbourhood.filter((r) => r !== a);
  const b = others.find((r) => r.status === "functional") ?? others[0];
  const c = others.find((r) => r !== b);
  return { a, b, c, points: neighbourhood };
}

export function buildRegion(rows, { county, count, near, fetchedAt = new Date().toISOString() } = {}) {
  const records = dedupe(rows.map(mapRecord).filter(Boolean));
  const { a, b, c, points } = pickNeighbourhood(records, { count, near });
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
