// Imports real weekly handpump volumes (Smart Handpumps, Kwale County, Kenya, 2014–2015) for the
// sensor replay in the demo tools.
//
//   node scripts/import-kwale.mjs                       Default: Tiwi - Mshikeni and its neighbours
//   node scripts/import-kwale.mjs --pump D/174/22 --radius 1.5 --neighbours 3 --year 2014|2015|all
//
// Source: openwashdata/waterpumpkwale (CC BY 4.0, doi:10.5281/zenodo.8399886), pinned to one commit.
// The data is historical. WaterLink replays it and never shows it as a current status.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { distanceKm } from "./wpdx-lib.mjs";

const COMMIT = "4c1ec2ca756b58817d312de77f20801c5a534996";
const BASE = `https://raw.githubusercontent.com/openwashdata/waterpumpkwale/${COMMIT}/inst/extdata`;
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
const focusId = option("pump", "D/174/22");
const radiusKm = Number(option("radius", 1.5)), maxNeighbours = Number(option("neighbours", 3));
// The default pump reports almost nothing in 2015, so the replay covers 2014 unless asked otherwise.
const year = option("year", "2014");

async function csv(file) {
  const response = await fetch(`${BASE}/${file}`, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  return (await response.text()).trim().split(/\r?\n/).map((line) => line.split(","));
}

console.log("Lade Smart-Handpump-Daten (Kwale) …");
const [locations, y2014, y2015] = await Promise.all([csv("location.csv"), csv("weeklyvol2014.csv"), csv("weeklyvol2015.csv")]);
const place = new Map(locations.slice(1).map((r) => [r[0], { name: r[1].trim(), lat: Number(r[4]), lon: Number(r[5]) }]));
const weeks = [], volumes = new Map();
for (const [rows, year] of [[y2014, 2014], [y2015, 2015]]) {
  const header = rows[0].slice(1);
  weeks.push(...header.map((w) => `${year}-W${String(w).padStart(2, "0")}`));
  const seen = new Set();
  for (const row of rows.slice(1)) {
    seen.add(row[0]);
    const values = row.slice(1).map((v) => (v === "NA" || v === "" ? null : Math.round(Number(v))));
    volumes.set(row[0], [...(volumes.get(row[0]) ?? new Array(weeks.length - header.length).fill(null)), ...values]);
  }
  // Pumps missing from one year keep the timeline aligned.
  for (const [id, list] of volumes) if (!seen.has(id)) list.push(...new Array(header.length).fill(null));
}

const focus = place.get(focusId);
if (!focus || !volumes.has(focusId)) {
  console.error(`Pumpe ${focusId} nicht gefunden.`);
  process.exit(1);
}
const neighbours = [...volumes.keys()]
  .filter((id) => id !== focusId && place.has(id))
  .map((id) => ({ id, km: distanceKm(focus, place.get(id)) }))
  .filter((n) => n.km <= radiusKm)
  .sort((a, b) => a.km - b.km)
  .slice(0, maxNeighbours);

const keep = weeks.map((w) => year === "all" || w.startsWith(`${year}-`));
const pump = (id, km) => ({ id, ...place.get(id), km: Math.round(km * 10) / 10, volumes: volumes.get(id).filter((_, i) => keep[i]) });
const data = {
  meta: {
    title: "Smart Handpumps, Kwale County, Kenya",
    source: "openwashdata/waterpumpkwale (Thomson, Hope, Foster et al.; University of Oxford)",
    license: "CC BY 4.0",
    doi: "10.5281/zenodo.8399886",
    url: "https://github.com/openwashdata/waterpumpkwale",
    notes: "Weekly volume pumped according to the sensor, accuracy ±20 %. Gaps come from an unstable radio signal.",
  },
  focus: focusId,
  weeks: weeks.filter((_, i) => keep[i]),
  pumps: [pump(focusId, 0), ...neighbours.map((n) => pump(n.id, n.km))],
};
const out = fileURLToPath(new URL(option("out", "../data/kwale-sensors.json"), import.meta.url));
writeFileSync(out, `${JSON.stringify(data)}\n`);
console.log(`${data.pumps.length} Pumpen, ${data.weeks.length} Wochen: ${data.pumps.map((p) => `${p.name} (${p.km} km)`).join(", ")}`);
console.log(`Gespeichert: ${out}`);
