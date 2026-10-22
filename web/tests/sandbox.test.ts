import { test } from "node:test";
import assert from "node:assert/strict";
import { DomainError, createSeedState, type State } from "../lib/domain.ts";
import { applyLocal } from "../lib/sandbox.ts";
import { REGION } from "../lib/region.ts";

const NOW = new Date("2026-10-22T09:00:00Z");
const run = (state: State, role: Parameters<typeof applyLocal>[1], mutation: Parameters<typeof applyLocal>[2]) => applyLocal(state, role, mutation, NOW, REGION);
const point = (state: State, id: string) => state.points.find((p) => p.id === id)!;

test("the whole repair story runs on the device with the real rules", () => {
  let state = createSeedState(NOW, REGION);
  assert.equal(point(state, "a").status, "working");

  state = run(state, "operator", { type: "report", pointId: "a", status: "down", note: "No water after 20 pumps." });
  assert.equal(point(state, "a").status, "down");
  const job = state.jobs[0];

  state = run(state, "technician", { type: "claim", jobId: job.id });
  state = run(state, "technician", { type: "start", jobId: job.id });
  state = run(state, "technician", { type: "repair", jobId: job.id, note: "Replaced the cup seal." });
  assert.equal(point(state, "a").status, "down", "a reported repair is not a working water point");

  state = run(state, "operator", { type: "confirm", pointId: "a", status: "working", note: "Pumped 20 litres.", tested: true });
  assert.equal(point(state, "a").status, "working");
  assert.equal(state.jobs[0].status, "closed");
});

test("the roles are enforced exactly as on the server", () => {
  const state = createSeedState(NOW, REGION);
  const refused = (action: () => unknown, status: number) => assert.throws(action, (e) => e instanceof DomainError && e.status === status);
  refused(() => run(state, "technician", { type: "report", pointId: "a", status: "down", note: "Technicians cannot report." }), 403);
  refused(() => run(state, "operator", { type: "scenario", scenario: "stale" }), 403);
  refused(() => run(state, "operator", { type: "reset" }), 403);
  refused(() => run(state, "operator", { type: "report", pointId: "a", status: "down", note: "x" }), 400);
});

test("a reset starts over one revision further and says who did it", () => {
  let state = createSeedState(NOW, REGION);
  state = run(state, "operator", { type: "report", pointId: "a", status: "down", note: "No water at the spout." });
  const reset = run(state, "coordinator", { type: "reset" });
  assert.equal(reset.revision, state.revision + 1);
  assert.equal(reset.jobs.length, 0);
  assert.equal(point(reset, "a").status, "working");
  assert.equal(reset.events.length, 1);
  assert.match(reset.events[0].actorName, /coordination/);
});
