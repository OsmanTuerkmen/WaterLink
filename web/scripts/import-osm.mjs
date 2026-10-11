// Loads roads, streams and named places around the demo region from OpenStreetMap
// (© OpenStreetMap contributors, ODbL 1.0) and writes data/osm-area.json, so the
// neighbourhood map is drawn offline in WaterLink's own style.
//   node scripts/import-osm.mjs            bounding box from data/region.json, 0.005° margin
//   node scripts/import-osm.mjs --margin 0.01
import { readFile, writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const margin = Number(flag("--margin", "0.005"));
const region = JSON.parse(await readFile(new URL("../data/region.json", import.meta.url), "utf8"));
if (!region) { console.error("data/region.json is null. Import a WPdx region first (npm run data:wpdx)."); process.exit(1); }

const lats = region.points.map((p) => p.lat), lons = region.points.map((p) => p.lon);
const bbox = [Math.min(...lats) - margin, Math.min(...lons) - margin, Math.max(...lats) + margin, Math.max(...lons) + margin]
  .map((v) => Number(v.toFixed(4)));
const box = bbox.join(",");
const query = `[out:json][timeout:60];(way["highway"](${box});way["waterway"](${box});node["amenity"~"school|place_of_worship|marketplace|clinic|hospital"](${box});node["place"~"village|town|hamlet|locality"](${box}););out geom tags;`;

console.log(`Loading OpenStreetMap data for ${box} …`);
const response = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST", headers: { "User-Agent": "WaterLink-hackathon/0.1", "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ data: query }),
});
if (!response.ok) { console.error(`Overpass answered ${response.status}.`); process.exit(1); }
const raw = await response.json();

/** Douglas–Peucker on lon/lat; tolerance in degrees (~3 m). */
function simplify(points, tolerance = 0.00003) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points.at(-1)];
  let index = 0, max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i], dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / (Math.hypot(dx, dy) || 1);
    if (d > max) { max = d; index = i; }
  }
  if (max <= tolerance) return [a, b];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}
const round = (v) => Number(v.toFixed(5));
const ROAD_RANK = { trunk: 1, primary: 1, secondary: 2, tertiary: 2, unclassified: 3, residential: 3, service: 4, track: 4, path: 5, footway: 5 };

const ways = raw.elements.filter((e) => e.type === "way" && Array.isArray(e.geometry)).map((e) => ({
  kind: e.tags.waterway ? "water" : "road",
  rank: e.tags.waterway ? 0 : ROAD_RANK[e.tags.highway] ?? 4,
  name: e.tags.name ?? null,
  line: simplify(e.geometry.map((g) => [g.lon, g.lat])).map(([lon, lat]) => [round(lon), round(lat)]),
})).filter((w) => w.line.length >= 2);
const places = raw.elements.filter((e) => e.type === "node" && e.tags.name).map((e) => ({
  kind: e.tags.place ? "place" : e.tags.amenity, name: e.tags.name.trim(), lat: round(e.lat), lon: round(e.lon),
}));

const out = {
  meta: { source: "OpenStreetMap", attribution: "© OpenStreetMap contributors, ODbL 1.0", fetchedAt: new Date().toISOString(), bbox },
  ways, places,
};
await writeFile(new URL("../data/osm-area.json", import.meta.url), JSON.stringify(out) + "\n");
console.log(`${ways.length} ways and ${places.length} named places saved to data/osm-area.json.`);
