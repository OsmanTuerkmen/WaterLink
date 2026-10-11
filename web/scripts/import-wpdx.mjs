// Imports real water points for one neighbourhood in Kenya from the Water Point Data Exchange.
//
//   node scripts/import-wpdx.mjs --list                    Counties with record counts
//   node scripts/import-wpdx.mjs --county Kitui            Neighbourhood around a recent functional point
//   node scripts/import-wpdx.mjs --county Kitui --near -1.0,38.0 --count 40 --radius 5 --walk 3 --recent 3
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
  console.log("County · water points · newest survey");
  for (const row of rows) console.log(`${row.clean_adm1 || "(not given)"} · ${row.n} · ${String(row.newest || "").slice(0, 10)}`);
  process.exit(0);
}

const county = option("county");
if (!county) {
  console.error("Please pass --county, e.g. --county Kitui. --list shows all counties.");
  process.exit(1);
}
const count = Number(option("count") ?? 60);
if (!Number.isInteger(count) || count < 3 || count > 400) {
  console.error("--count must be between 3 and 400.");
  process.exit(1);
}
const radiusKm = Number(option("radius") ?? 5), walkKm = Number(option("walk") ?? 3);
const recentYears = Number(option("recent") ?? 3);
if (!(radiusKm > 0 && radiusKm <= 50) || !(walkKm > 0 && walkKm <= 10) || !(recentYears > 0 && recentYears <= 30)) {
  console.error("--radius must be 0–50 km, --walk 0–10 km, --recent 0–30 years.");
  process.exit(1);
}
let near = null;
if (option("near")) {
  const [lat, lon] = option("near").split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    console.error("--near expects lat,lon, e.g. --near -1.05,38.01");
    process.exit(1);
  }
  near = { lat, lon };
}

console.log(`Loading water points for ${county} from WPdx …`);
const rows = await query({
  $select: WPDX_FIELDS.join(","),
  $where: `clean_country_name='Kenya' AND upper(clean_adm1)=upper(${quote(county)})`,
  $order: "report_date DESC",
  $limit: "50000",
});
if (!rows.length) {
  console.error(`No records for "${county}". Check the spelling with --list.`);
  process.exit(1);
}

let region;
try {
  region = buildRegion(rows, { county, count, near, radiusKm, walkKm, recentYears });
} catch (error) {
  console.error(`${rows.length} records loaded. ${error.message}`);
  process.exit(1);
}
const out = fileURLToPath(new URL(option("out") ?? "../data/region.json", import.meta.url));
writeFileSync(out, `${JSON.stringify(region, null, 2)}\n`);

const find = (id) => region.points.find((p) => p.rowId === id);
const describe = (label, record) => {
  const km = distanceKm(region.meta.meetingPoint, record).toFixed(1);
  console.log(`  ${label}: ${record.waterSource || "Water point"}, ${record.adm3 || record.adm2} · survey ${record.reportDate.slice(0, 10)}: ${record.statusText} · ${km} km`);
};
const dates = region.points.map((p) => p.reportDate).filter(Boolean).sort();
const functional = region.points.filter((p) => p.status === "functional").length;
console.log(`\n${rows.length} records loaded, ${region.points.length} water points within ${radiusKm} km kept (${functional} functional when surveyed).`);
console.log(`Region: ${region.meta.label}`);
describe("A", find(region.demo.a));
describe("B", find(region.demo.b));
describe("C", find(region.demo.c));
console.log(`Surveys: ${dates[0]?.slice(0, 10)} to ${dates.at(-1)?.slice(0, 10)}`);
const newest = rows.map((r) => String(r.report_date || "")).sort().at(-1) ?? "";
const cutoff = newest && new Date(Date.parse(newest) - recentYears * 365.25 * 864e5).toISOString();
if (cutoff && find(region.demo.a).reportDate < cutoff) {
  console.log(`Note: no suitable neighbourhood with surveys from the last ${recentYears} years; A and B come from older surveys.`);
}
console.log(`Saved: ${out}`);
console.log("Then reset the demo under Demo tools so the app loads the new data.");
