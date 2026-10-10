import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCommand, createSeedState, distanceKm, findAlternative, getNearby, getPointDisplay, parseRegion } from "../lib/domain.ts";
import type { Actor } from "../lib/domain.ts";
import { buildRegion, dedupe, mapRecord, mapStatus } from "../scripts/wpdx-lib.mjs";

const NOW = Date.parse("2026-10-10T09:00:00Z");
const operator: Actor = { id: "op", name: "Demo-Betreiberin", role: "operator" };

// Synthetic rows in the WPdx response shape (field names as returned by the API); not real records.
function row(id: number, lat: number, lon: number, status = "Functional", date = "2024-12-01T00:00:00.000") {
  return {
    row_id: String(id), lat_deg: String(lat), lon_deg: String(lon), report_date: date, status_id: "Yes",
    status_clean: status, water_source_clean: "Borehole", water_tech_clean: "Hand Pump",
    clean_adm1: "Testcounty", clean_adm2: "Testsub", clean_adm3: `Ward ${id % 3}`, dataset_title: "Synthetic test set",
  };
}
const rows = [
  row(1, -1.0, 38.0), row(2, -1.005, 38.0), row(3, -1.0, 38.008, "Non-Functional"), row(4, -1.01, 38.01),
  row(5, -1.3, 38.4), row(6, -1.0, 38.0, "Functional", "2019-01-01T00:00:00.000"), row(7, 0, 0), row(8, -1.002, 38.003, "Unknown"),
];

test("status mapping prefers status_clean and handles disagreement with status_id", () => {
  assert.equal(mapStatus("Functional, needs repair", "No"), "functional");
  assert.equal(mapStatus("Non-Functional, dry", "Yes"), "non_functional");
  assert.equal(mapStatus("Abandoned/Decommissioned", "Yes"), "non_functional");
  assert.equal(mapStatus("", "Yes"), "functional");
  assert.equal(mapStatus("Unknown", "Yes"), "unknown");
});

test("records without usable coordinates are dropped; repeated surveys keep the newest", () => {
  assert.equal(mapRecord(row(7, 0, 0)), null);
  assert.equal(mapRecord({ ...row(9, 1, 1), lat_deg: "abc" }), null);
  const unique = dedupe([mapRecord(row(1, -1, 38))!, mapRecord(row(6, -1, 38, "Functional", "2019-01-01T00:00:00.000"))!]);
  assert.equal(unique.length, 1);
  assert.equal(unique[0].rowId, "1");
});

test("import builds a compact neighbourhood with demo trio and attribution", () => {
  const region = buildRegion(rows, { county: "Testcounty", count: 5, fetchedAt: "2026-10-10T00:00:00.000Z" });
  assert.equal(region.points.length, 5);
  assert.ok(!region.points.some((p) => p.rowId === "5"), "far point is outside the neighbourhood");
  assert.notEqual(region.demo.b, region.demo.a);
  assert.notEqual(region.demo.c, region.demo.b);
  assert.equal(region.points.find((p) => p.rowId === region.demo.b)?.status, "functional");
  assert.match(region.meta.attribution, /CC BY 4\.0/);
  assert.ok(parseRegion(region));
});

test("region seed: simulated confirmations only on A/B, every other point unconfirmed with survey", () => {
  const region = parseRegion(buildRegion(rows, { county: "Testcounty", count: 6 }))!;
  const state = createSeedState(NOW, region);
  const ids = state.points.map((p) => p.id);
  assert.deepEqual(ids.slice(0, 3), ["a", "b", "c"]);
  assert.equal(state.region?.pointCount, state.points.length);
  const [a, b, c] = state.points;
  assert.equal(getPointDisplay(a, NOW).status, "working");
  assert.match(a.confirmedBy ?? "", /simuliert/);
  assert.equal(getPointDisplay(c, NOW).certainty, "unknown");
  for (const point of state.points.slice(3)) {
    assert.equal(point.tracked, false);
    assert.equal(point.confirmedAt, null);
    assert.equal(getPointDisplay(point, NOW).certainty, "unknown", "a historical survey is never a current confirmation");
    assert.equal(point.survey?.source, "WPdx");
  }
  assert.ok(b.walkingMinutes >= 1);
});

test("demo alternative still works on real points; untracked points are never recommended", () => {
  const region = parseRegion(buildRegion(rows, { county: "Testcounty", count: 6 }))!;
  const reported = applyCommand(createSeedState(NOW, region), { type: "report", pointId: "a", status: "down", note: "Kein Wasserfluss." }, operator, NOW);
  assert.equal(findAlternative(reported.points, "a", NOW)?.id, "b");
  const noB = { ...reported, points: reported.points.map((p) => (p.id === "b" ? { ...p, accessVerified: false } : p)) };
  assert.equal(findAlternative(noB.points, "a", NOW), null);
});

test("nearby points are sorted by straight-line distance and skip points without coordinates", () => {
  const region = parseRegion(buildRegion(rows, { county: "Testcounty", count: 6 }))!;
  const state = createSeedState(NOW, region);
  const nearby = getNearby(state.points, "a", 3);
  assert.equal(nearby.length, 3);
  assert.ok(nearby[0].km <= nearby[1].km && nearby[1].km <= nearby[2].km);
  assert.equal(getNearby(createSeedState(NOW).points, "a").length, 0);
  assert.ok(Math.abs((distanceKm({ lat: -1, lon: 38 }, { lat: -1.009, lon: 38 }) ?? 0) - 1) < 0.01);
});

test("a report on a recorded but untracked point brings it into the programme", () => {
  const region = parseRegion(buildRegion(rows, { county: "Testcounty", count: 6 }))!;
  const state = createSeedState(NOW, region);
  const target = state.points.find((p) => !p.tracked)!;
  const next = applyCommand(state, { type: "report", pointId: target.id, status: "limited", note: "Nur langsamer Wasserfluss." }, operator, NOW);
  const updated = next.points.find((p) => p.id === target.id)!;
  assert.equal(updated.tracked, true);
  assert.equal(next.jobs.length, 1);
  assert.equal(next.region?.label, state.region?.label);
});

test("malformed region data is rejected or cleaned instead of trusted", () => {
  assert.equal(parseRegion(null), null);
  assert.equal(parseRegion({ meta: {}, demo: {}, points: [] }), null);
  const region = buildRegion(rows, { county: "Testcounty", count: 5 });
  const tampered = { ...region, points: [...region.points, { rowId: "<script>", lat: 1, lon: 1 }, { rowId: "x1", lat: 999, lon: 1 }] };
  const parsed = parseRegion(tampered)!;
  assert.equal(parsed.points.length, region.points.length);
  assert.equal(parseRegion({ ...region, demo: { a: region.demo.a, b: region.demo.a, c: region.demo.c } }), null);
});
