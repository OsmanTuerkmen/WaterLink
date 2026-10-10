// Imports real water points for one neighbourhood in Kenya from the Water Point Data Exchange.
//
//   node scripts/import-wpdx.mjs --list                    Counties with record counts
//   node scripts/import-wpdx.mjs --county Kitui            Neighbourhood around a recent functional point
//   node scripts/import-wpdx.mjs --county Kitui --near -1.0,38.0 --count 40
//
// Writes data/region.json. WPdx data is CC BY 4.0; the attribution is stored with the data.
// Survey status is historical. WaterLink never shows it as the current operating status.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WPDX_ENDPOINT, WPDX_FIELDS, buildRegion, distanceKm } from "./wpdx-lib.mjs";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;

async function query(params) {
  const url = `${WPDX_ENDPOINT}?${new URLSearchParams(params)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(90_000), headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`WPdx antwortet mit HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}

if (args.includes("--list")) {
  const rows = await query({
    $select: "clean_adm1, count(*) AS n, max(report_date) AS newest",
    $where: "clean_country_name='Kenya'",
    $group: "clean_adm1",
    $order: "n DESC",
    $limit: "100",
  });
  console.log("County · Wasserstellen · neueste Erhebung");
  for (const row of rows) console.log(`${row.clean_adm1 || "(ohne Angabe)"} · ${row.n} · ${String(row.newest || "").slice(0, 10)}`);
  process.exit(0);
}

const county = option("county");
if (!county) {
  console.error("Bitte --county angeben, z. B. --county Kitui. Mit --list siehst du alle Counties.");
  process.exit(1);
}
const count = Number(option("count") ?? 60);
if (!Number.isInteger(count) || count < 3 || count > 400) {
  console.error("--count muss zwischen 3 und 400 liegen.");
  process.exit(1);
}
let near = null;
if (option("near")) {
  const [lat, lon] = option("near").split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    console.error("--near erwartet Breite,Länge, z. B. --near -1.05,38.01");
    process.exit(1);
  }
  near = { lat, lon };
}

console.log(`Lade Wasserstellen für ${county} von WPdx …`);
const rows = await query({
  $select: WPDX_FIELDS.join(","),
  $where: `clean_country_name='Kenya' AND upper(clean_adm1)=upper(${quote(county)})`,
  $order: "report_date DESC",
  $limit: "50000",
});
if (!rows.length) {
  console.error(`Keine Einträge für „${county}“. Schreibweise mit --list prüfen.`);
  process.exit(1);
}

const region = buildRegion(rows, { county, count, near });
const out = fileURLToPath(new URL(option("out") ?? "../data/region.json", import.meta.url));
writeFileSync(out, `${JSON.stringify(region, null, 2)}\n`);

const find = (id) => region.points.find((p) => p.rowId === id);
const describe = (label, record) => {
  const km = distanceKm(region.meta.meetingPoint, record).toFixed(1);
  console.log(`  ${label}: ${record.waterSource || "Wasserstelle"}, ${record.adm3 || record.adm2} · Erhebung ${record.reportDate.slice(0, 10)}: ${record.statusText} · ${km} km`);
};
const dates = region.points.map((p) => p.reportDate).filter(Boolean).sort();
console.log(`\n${rows.length} Einträge geladen, ${region.points.length} Wasserstellen übernommen.`);
console.log(`Region: ${region.meta.label}`);
describe("A", find(region.demo.a));
describe("B", find(region.demo.b));
describe("C", find(region.demo.c));
console.log(`Erhebungen: ${dates[0]?.slice(0, 10)} bis ${dates.at(-1)?.slice(0, 10)}`);
console.log(`Gespeichert: ${out}`);
console.log("Danach in der App unter Demo-Werkzeuge die Demo zurücksetzen, damit die neuen Daten geladen werden.");
