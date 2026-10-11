import test from "node:test";
import assert from "node:assert/strict";
import { applyCommand, createSeedState, type Actor } from "../lib/domain.ts";
import { HELP_TEXT, parseSms, pointByRef, smsCommand, smsParts, smsReply } from "../lib/sms.ts";

const NOW = Date.parse("2026-10-22T09:00:00.000Z");
const operator: Actor = { id: "op", name: "Amina", role: "operator" };

test("keywords are read case-insensitively, a lone letter asks for one point", () => {
  assert.deepEqual(parseSms("status"), { kind: "status", ref: null });
  assert.deepEqual(parseSms(" Hali  b "), { kind: "status", ref: "b" });
  assert.deepEqual(parseSms("a"), { kind: "status", ref: "a" });
  assert.deepEqual(parseSms("HELP"), { kind: "help" });
  assert.deepEqual(parseSms("down A no water after 20 pumps"), { kind: "report", ref: "a", status: "down", note: "no water after 20 pumps" });
  assert.deepEqual(parseSms("OK a pumped 20 litres"), { kind: "confirm", ref: "a", status: "working", note: "pumped 20 litres" });
  assert.deepEqual(parseSms("hello there"), { kind: "unknown" });
  assert.deepEqual(parseSms("DOWN"), { kind: "unknown" });
});

test("status replies fit one SMS and never call an expired point working", () => {
  const state = createSeedState(NOW);
  const all = smsReply(state, { kind: "status", ref: null }, NOW);
  assert.match(all, /A WORKING, B WORKING, C UNCLEAR/);
  assert.equal(smsParts(all), 1);
  const later = NOW + 13 * 3_600_000;
  assert.match(smsReply(state, { kind: "status", ref: "a" }, later), /UNCLEAR.*Ask on site/);
  assert.match(smsReply(state, { kind: "status", ref: "z" }, NOW), /No water point "Z"/);
  assert.equal(smsReply(state, { kind: "help" }, NOW), HELP_TEXT);
});

test("an SMS report goes through the normal rules and the reply names the alternative", () => {
  const state = createSeedState(NOW);
  const command = smsCommand(state, parseSms("DOWN A no water"));
  assert.ok(!("error" in command));
  const next = applyCommand(state, command, operator, NOW);
  assert.equal(next.points.find((p) => p.id === "a")?.status, "down");
  assert.equal(next.jobs.length, 1);
  const reply = smsReply(next, { kind: "status", ref: "a" }, NOW);
  assert.match(reply, /NOT WORKING since .* Go to B/);
  assert.match(reply, /Repair reported/);
});

test("an SMS confirmation cannot skip the repair step", () => {
  const reported = applyCommand(createSeedState(NOW), { type: "report", pointId: "a", status: "down", note: "No water at all." }, operator, NOW);
  const command = smsCommand(reported, parseSms("OK A works again"));
  assert.ok(!("error" in command));
  assert.throws(() => applyCommand(reported, command, operator, NOW), /technician has to report the repair first/);
  assert.ok("error" in smsCommand(reported, parseSms("OK Q works")));
  assert.equal(pointByRef(reported, "a")?.id, "a");
});
