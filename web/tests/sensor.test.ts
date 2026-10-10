import { test } from "node:test";
import assert from "node:assert/strict";
import { alertEpisodes, readSensor } from "../lib/sensor.ts";
import { applyCommand, createSeedState, getPointDisplay } from "../lib/domain.ts";
import type { Actor } from "../lib/domain.ts";

// First 25 weeks of 2014 for pump D/174/22 "Tiwi - Mshikeni" (openwashdata/waterpumpkwale, CC BY 4.0).
const tiwi = [null, null, 5691, 11988, 12230, 12027, 9345, 9678, 10198, 12292, 6497, 5900, 0, 0, 0, 0, 0, 2257, 5395, 5592, 5845, 6381, 8658, 13335, 17742];
const NOW = Date.parse("2026-10-10T09:00:00Z");
const operator: Actor = { id: "op", name: "Demo-Betreiberin", role: "operator" };
const coordinator: Actor = { id: "coord", name: "Demo-Koordination", role: "coordinator" };

test("one quiet week is only conspicuous; the hint starts in the second week", () => {
  assert.equal(readSensor(tiwi, 11).state, "normal");
  assert.equal(readSensor(tiwi, 12).state, "low");
  const second = readSensor(tiwi, 13);
  assert.equal(second.state, "alert");
  assert.equal(second.quietWeeks, 2);
  assert.ok(second.baseline! > 8000 && second.baseline! < 11000);
  assert.equal(readSensor(tiwi, 16).quietWeeks, 5);
  assert.equal(readSensor(tiwi, 17).state, "normal", "pumping again ends the hint");
});

test("missing weeks are never read as an outage", () => {
  assert.equal(readSensor(tiwi, 0).state, "no-data");
  const gap = [9000, 9500, 8800, 9100, null, null, null, 9200];
  assert.deepEqual(gap.map((_, i) => readSensor(gap, i).state).filter((s) => s === "alert" || s === "low"), []);
  assert.equal(readSensor([9000, 9500, 8800, 0, null, 0], 5).state, "low", "a gap interrupts a quiet streak");
});

test("without enough history there is no comparison", () => {
  assert.equal(readSensor([0, 0, 0], 2).state, "learning");
  assert.equal(readSensor([300, 200, 250, 0, 0], 4).state, "learning", "a pump that is barely used gives no baseline");
});

test("alert episodes cover the whole quiet streak", () => {
  assert.deepEqual(alertEpisodes(tiwi), [{ start: 12, end: 16 }]);
});

test("a sensor hint makes a point unconfirmed until someone checks on site", () => {
  const hinted = applyCommand(createSeedState(NOW), { type: "scenario", scenario: "sensor" }, coordinator, NOW);
  const display = getPointDisplay(hinted.points.find((p) => p.id === "a")!, NOW);
  assert.equal(display.certainty, "sensor");
  assert.equal(display.status, "unknown", "a sensor never sets a status by itself");
  assert.equal(hinted.jobs.length, createSeedState(NOW).jobs.length, "no repair job without a human report");
  const checked = applyCommand(hinted, { type: "report", pointId: "a", status: "down", note: "Vor Ort geprüft: kein Wasser." }, operator, NOW);
  assert.equal(getPointDisplay(checked.points.find((p) => p.id === "a")!, NOW).status, "down");
});
