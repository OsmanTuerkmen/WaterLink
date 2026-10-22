import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACCESS_TTL_MS, STATUS_TTL_MS, DomainError, applyCommand, createSeedState,
  MAX_EVENTS, MAX_TRACKED, findAlternative, getAlternatives, getPointDisplay, getPossibleDuplicate, isPointOpen, parseCoordinates, findNearbyPoint,
} from "../lib/domain.ts";
import { REGION } from "../lib/region.ts";
import type { Actor, Command, State, WaterPoint } from "../lib/domain.ts";

const NOW = Date.parse("2026-10-10T09:00:00Z"); // Noon in the example region.
const operator: Actor = { id: "op", name: "Demo-Betreiberin", role: "operator" };
const technician: Actor = { id: "tech", name: "Demo-Techniker", role: "technician" };
const coordinator: Actor = { id: "coord", name: "Demo-Koordination", role: "coordinator" };
const report: Command = { type: "report", pointId: "a", status: "down", note: "Bei der Prüfung kommt kein Wasser." };
const working: Command = { type: "confirm", pointId: "a", status: "working", note: "Wasserentnahme vor Ort erfolgreich geprüft.", tested: true };

function transition(state: State, command: Command, actor = operator, time = NOW) {
  return applyCommand(state, command, actor, time);
}
function reported() { return transition(createSeedState(NOW), report); }
function started() {
  const state = reported();
  const claimed = transition(state, { type: "claim", jobId: state.jobs[0].id }, technician);
  return transition(claimed, { type: "start", jobId: state.jobs[0].id }, technician);
}
function repaired() {
  const state = started();
  return transition(state, { type: "repair", jobId: state.jobs[0].id, note: "Dichtung ausgetauscht." }, technician);
}
function rejects(action: () => unknown, status: number) {
  assert.throws(action, (error: unknown) => error instanceof DomainError && error.status === status);
}
function point(changes: Partial<WaterPoint> = {}): WaterPoint {
  return { ...createSeedState(NOW).points[1], ...changes };
}

test("seed is explicitly fictitious, fresh A/B and unconfirmed C", () => {
  const state = createSeedState(NOW);
  assert.deepEqual(state.points.map((item) => item.id), ["a", "b", "c"]);
  assert.equal(getPointDisplay(state.points[0], NOW).status, "working");
  assert.equal(getPointDisplay(state.points[2], NOW).certainty, "unknown");
  assert.match(state.events[0].message, /Fictional demo/);
  assert.equal(state.jobs.length, 0);
});

test("outage atomically updates operating status, creates one job and audit event", () => {
  const previous = createSeedState(NOW);
  const original = JSON.stringify(previous);
  const state = transition(previous, report);
  assert.equal(state.points[0].status, "down");
  assert.equal(state.points[0].confirmedAt, new Date(NOW).toISOString());
  assert.equal(state.jobs.length, 1);
  assert.equal(state.jobs[0].status, "open");
  assert.equal(state.jobs[0].pointId, "a");
  assert.equal(state.events.at(-1)?.jobId, state.jobs[0].id);
  assert.equal(state.revision, previous.revision + 1);
  assert.equal(JSON.stringify(previous), original);
});

test("repeat outage retains one active job and its identity", () => {
  const first = reported();
  const second = transition(first, report, operator, NOW + 1000);
  assert.equal(second.jobs.length, 1);
  assert.equal(second.jobs[0].id, first.jobs[0].id);
  assert.equal(second.events.length, first.events.length + 1);
});

test("complete lifecycle preserves outage until explicit successful operator check", () => {
  const state = repaired();
  assert.equal(state.jobs[0].status, "awaiting_confirmation");
  assert.equal(state.points[0].status, "down");
  assert.equal(state.jobs[0].closedAt, null);
  const confirmed = transition(state, working, operator, NOW + 60_000);
  assert.equal(confirmed.points[0].status, "working");
  assert.equal(confirmed.points[0].confirmedBy, operator.name);
  assert.equal(confirmed.jobs[0].status, "closed");
  assert.equal(confirmed.jobs[0].closedAt, new Date(NOW + 60_000).toISOString());
  assert.equal(state.points[0].status, "down");
});

test("successful confirmation cannot skip the repair workflow", () => {
  rejects(() => transition(reported(), working), 409);
  rejects(() => transition(started(), working), 409);
});

test("confirmation requires an explicit physical test and correct role", () => {
  rejects(() => transition(repaired(), { ...working, tested: false } as unknown as Command), 400);
  rejects(() => transition(repaired(), working, technician), 403);
  rejects(() => transition(repaired(), working, coordinator), 403);
});

test("unsuccessful repair verification reopens work while preserving assignee", () => {
  const state = transition(repaired(), { type: "confirm", pointId: "a", status: "down", note: "Die Prüfung ist fehlgeschlagen.", tested: true });
  assert.equal(state.points[0].status, "down");
  assert.equal(state.jobs[0].status, "in_progress");
  assert.equal(state.jobs[0].assignedTo, technician.id);
  assert.equal(state.jobs[0].repairedAt, null);
  assert.equal(state.jobs[0].closedAt, null);
});

test("repeated failure during pending verification invalidates repair declaration", () => {
  const state = transition(repaired(), report);
  assert.equal(state.jobs.length, 1);
  assert.equal(state.jobs[0].status, "in_progress");
  assert.equal(state.jobs[0].repairedAt, null);
  rejects(() => transition(state, working), 409);
});

test("an incident after confirmed restoration creates a new job and retains history", () => {
  const closed = transition(repaired(), working);
  const newIncident = transition(closed, report, operator, NOW + 5000);
  assert.equal(newIncident.jobs.length, 2);
  assert.equal(newIncident.jobs[0].status, "closed");
  assert.equal(newIncident.jobs[1].status, "open");
  assert.notEqual(newIncident.jobs[0].id, newIncident.jobs[1].id);
});

test("operator can recheck a healthy point without a fictitious repair job", () => {
  const state = transition(createSeedState(NOW), working);
  assert.equal(state.jobs.length, 0);
  assert.equal(state.points[0].confirmedAt, new Date(NOW).toISOString());
});

test("a limited check creates work and does not close an awaiting job", () => {
  const limited: Command = { type: "confirm", pointId: "a", status: "limited", note: "Es kommt nur wenig Wasser.", tested: true };
  assert.equal(transition(createSeedState(NOW), limited).jobs[0].status, "open");
  const state = transition(repaired(), limited);
  assert.equal(state.points[0].status, "limited");
  assert.equal(state.jobs[0].status, "in_progress");
});

test("claim, ownership, role and transition checks reject unauthorized edits", () => {
  const state = reported();
  const claim: Command = { type: "claim", jobId: state.jobs[0].id };
  rejects(() => transition(state, claim, operator), 403);
  rejects(() => transition(state, report, technician), 403);
  const claimed = transition(state, claim, technician);
  rejects(() => transition(claimed, claim, technician), 409);
  rejects(() => transition(claimed, { type: "start", jobId: state.jobs[0].id }, { ...technician, id: "other" }), 403);
  rejects(() => transition(claimed, { type: "repair", jobId: state.jobs[0].id, note: "Fertig repariert." }, technician), 409);
  rejects(() => transition(claimed, { type: "progress", jobId: state.jobs[0].id, note: "In Arbeit.", blocker: null }, operator), 403);
});

test("funding, parts and staff blockers remain visible without changing operational status", () => {
  let state = started();
  for (const blocker of ["parts", "funding", "staff"] as const) {
    state = transition(state, { type: "progress", jobId: state.jobs[0].id, note: `Wartet auf ${blocker}.`, blocker }, technician);
    assert.equal(state.jobs[0].blocker, blocker);
    assert.equal(state.points[0].status, "down");
  }
  rejects(() => transition(state, { type: "progress", jobId: state.jobs[0].id, note: "Unbekannt.", blocker: "invalid" } as unknown as Command, technician), 400);
});

test("stale, missing, malformed and future timestamps cannot display fresh green", () => {
  assert.equal(getPointDisplay(point({ confirmedAt: new Date(NOW - STATUS_TTL_MS + 1).toISOString() }), NOW).status, "working");
  assert.equal(getPointDisplay(point({ confirmedAt: new Date(NOW - STATUS_TTL_MS).toISOString() }), NOW).certainty, "stale");
  for (const confirmedAt of [null, "invalid", new Date(NOW + 1).toISOString()]) {
    assert.equal(getPointDisplay(point({ confirmedAt }), NOW).status, "unknown");
  }
});

test("conflict persists through another report and only explicit check resolves it", () => {
  const conflict = transition(createSeedState(NOW), { type: "scenario", scenario: "conflict" }, coordinator);
  assert.equal(getPointDisplay(conflict.points[0], NOW).certainty, "conflict");
  const anotherReport = transition(conflict, report);
  assert.equal(anotherReport.points[0].conflict, true);
  const checked = transition(anotherReport, { type: "confirm", pointId: "a", status: "down", note: "Vor Ort geprüft: kein Wasser.", tested: true });
  assert.equal(checked.points[0].conflict, false);
  assert.equal(getPointDisplay(checked.points[0], NOW).status, "down");
});

test("offline display cannot imply a live confirmation or recommend an alternative", () => {
  const points = createSeedState(NOW).points;
  assert.equal(getPointDisplay(points[0], NOW, true).status, "unknown");
  assert.deepEqual(getAlternatives(points, "a", NOW, true), []);
  assert.equal(points[0].status, "working");
});

test("alternatives exclude the source, unconfirmed, limited, inaccessible and unverified routes", () => {
  assert.equal(findAlternative(createSeedState(NOW).points, "a", NOW)?.id, "b");
  const invalid: Partial<WaterPoint>[] = [
    { id: "a" }, { status: "limited" }, { status: "down" }, { status: "unknown" },
    { conflict: true }, { confirmedAt: null }, { accessVerified: false }, { routeVerified: false },
    { accessConfirmedAt: null }, { accessConfirmedAt: new Date(NOW - ACCESS_TTL_MS).toISOString() },
    { walkingMinutes: -2 }, { walkingMinutes: NaN },
  ];
  for (const changes of invalid) assert.equal(findAlternative([point(changes)], "a", NOW), null, JSON.stringify(changes));
});

test("candidate must remain fresh until expected arrival", () => {
  const candidate = point({ confirmedAt: new Date(NOW - STATUS_TTL_MS + 10 * 60_000).toISOString(), walkingMinutes: 22 });
  assert.equal(getPointDisplay(candidate, NOW).status, "working");
  assert.equal(findAlternative([candidate], "a", NOW), null);
});

test("opening hours use Nairobi and exclude points closing before expected arrival", () => {
  const candidate = point({ allDay: false, opensAt: "08:00", closesAt: "12:15", walkingMinutes: 22 });
  assert.equal(isPointOpen(candidate, NOW), true); // 12:00 Nairobi, 09:00 UTC.
  assert.equal(findAlternative([candidate], "a", NOW), null);
  assert.equal(findAlternative([point({ ...candidate, closesAt: "13:00" })], "a", NOW)?.id, "b");
  assert.equal(isPointOpen(point({ ...candidate, closesAt: "12:00" }), NOW), false);
  assert.equal(isPointOpen(point({ ...candidate, opensAt: "13:00", closesAt: "15:00" }), NOW), false);
});

test("overnight opening intervals and malformed schedules are handled conservatively", () => {
  const overnight = point({ allDay: false, opensAt: "22:00", closesAt: "05:00" });
  assert.equal(isPointOpen(overnight, "2026-10-10T20:00:00Z"), true); // 23:00 Nairobi.
  assert.equal(isPointOpen(overnight, "2026-10-11T00:00:00Z"), true); // 03:00 Nairobi.
  assert.equal(isPointOpen(overnight, NOW), false);
  assert.equal(isPointOpen({ ...overnight, opensAt: "garbage" }, NOW), false);
  assert.equal(isPointOpen({ ...overnight, opensAt: "05:00" }, NOW), false);
});

test("demo scenarios are restricted and no-alternative is explicit", () => {
  const initial = createSeedState(NOW);
  rejects(() => transition(initial, { type: "scenario", scenario: "stale" }, operator), 403);
  const stale = transition(initial, { type: "scenario", scenario: "stale" }, coordinator);
  assert.equal(getPointDisplay(stale.points[0], NOW).certainty, "stale");
  const unavailable = transition(initial, { type: "scenario", scenario: "no-alternative" }, coordinator);
  assert.equal(findAlternative(unavailable.points, "a", NOW), null);
});

test("invalid commands fail atomically and do not mutate the prior audit history", () => {
  const state = repaired();
  const before = JSON.stringify(state);
  rejects(() => transition(state, { ...working, note: "" }), 400);
  rejects(() => transition(state, { ...working, pointId: "missing" }), 404);
  rejects(() => transition(state, { type: "unknown" } as unknown as Command), 400);
  rejects(() => transition(state, null as unknown as Command), 400);
  rejects(() => transition(state, working, operator, NOW - 1), 409);
  assert.equal(JSON.stringify(state), before);
});

test("the history keeps only the latest events", () => {
  let state = createSeedState(NOW);
  for (let i = 0; i < MAX_EVENTS + 15; i++) state = transition(state, { ...report, note: `Report number ${i}` });
  assert.equal(state.events.length, MAX_EVENTS);
  assert.match(state.events.at(-1)!.message, new RegExp(`Report number ${MAX_EVENTS + 14}`), "the newest event is kept");
  assert.equal(new Set(state.events.map((event) => event.id)).size, MAX_EVENTS, "ids stay unique");
});

const verify = { type: "verify_access", pointId: "c", walkingMinutes: 5, landmark: "Follow the path past the big acacia tree.", allDay: true, opensAt: "", closesAt: "", checked: true } as const;
const alternativesOfA = (state: State) => getAlternatives(state.points, "a", NOW).map((p) => p.id);

test("a water point only becomes an alternative once someone checked route and access on site", () => {
  let state = createSeedState(NOW);
  state = transition(state, { type: "confirm", pointId: "c", status: "working", note: "Pumped 20 litres, steady flow.", tested: true });
  state = transition(state, report);
  assert.deepEqual(alternativesOfA(state), ["b"], "C works, but nobody has checked the way there");

  state = transition(state, verify, coordinator);
  assert.deepEqual(alternativesOfA(state), ["c", "b"], "now C is the nearest alternative");
  const c = state.points.find((p) => p.id === "c")!;
  assert.equal(c.walkingMinutes, 5);
  assert.equal(c.accessCheckedBy, coordinator.name);
  assert.match(state.events.at(-1)!.message, /route and access checked on site/);
});

test("a closed gate withdraws the alternative at once, and the checks are the coordinator's and explicit", () => {
  let state = createSeedState(NOW);
  state = transition(state, { type: "confirm", pointId: "c", status: "working", note: "Pumped 20 litres, steady flow.", tested: true });
  state = transition(state, report);
  state = transition(state, verify, coordinator);
  state = transition(state, { type: "close_access", pointId: "c", note: "The landowner locked the gate." }, coordinator);
  assert.deepEqual(alternativesOfA(state), ["b"]);

  rejects(() => transition(state, verify, operator), 403);
  rejects(() => transition(state, { type: "close_access", pointId: "c", note: "Not allowed." }, technician), 403);
  rejects(() => transition(state, { ...verify, checked: false as unknown as true }, coordinator), 400);
  rejects(() => transition(state, { ...verify, walkingMinutes: 0 }, coordinator), 400);
  rejects(() => transition(state, { ...verify, walkingMinutes: 2.5 }, coordinator), 400);
  rejects(() => transition(state, { ...verify, landmark: "ok" }, coordinator), 400);
  rejects(() => transition(state, { ...verify, allDay: false, opensAt: "25:00", closesAt: "18:00" }, coordinator), 400);
  rejects(() => transition(state, { ...verify, allDay: false, opensAt: "08:00", closesAt: "08:00" }, coordinator), 400);
  rejects(() => transition(state, { ...verify, pointId: "zz" }, coordinator), 404);
  const hours = transition(state, { ...verify, allDay: false, opensAt: "06:30", closesAt: "18:00" }, coordinator).points.find((p) => p.id === "c")!;
  assert.deepEqual([hours.allDay, hours.opensAt, hours.closesAt], [false, "06:30", "18:00"]);
});

test("the coordinator can add a water point, it takes the next free letter and starts unconfirmed", () => {
  const add = { type: "add_point", name: "School well", location: "Near the school", source: "Borehole", walkingMinutes: 7 } as const;
  const state = transition(createSeedState(NOW), add, coordinator);
  const added = state.points.find((p) => p.id === "d")!;
  assert.deepEqual(state.points.map((p) => p.id), ["a", "b", "c", "d"]);
  assert.deepEqual([added.status, added.tracked, added.custom, added.accessVerified, added.walkingMinutes], ["unknown", true, true, false, 7]);
  assert.equal(getPointDisplay(added, NOW).status, "unknown", "never green before an on-site confirmation");
  assert.equal(transition(state, { ...add, name: "Church tap" }, coordinator).points.at(-1)!.id, "e");

  rejects(() => transition(createSeedState(NOW), add, operator), 403);
  rejects(() => transition(createSeedState(NOW), { ...add, name: "x" }, coordinator), 400);
  rejects(() => transition(createSeedState(NOW), { ...add, source: "Magic spring" }, coordinator), 400);
  rejects(() => transition(createSeedState(NOW), { ...add, walkingMinutes: 500 }, coordinator), 400);
});

test("an added water point can be placed on the map, but only near the meeting point", () => {
  assert.ok(REGION, "the Busia data is part of the repository");
  const region = createSeedState(NOW, REGION);
  const meeting = region.region!.meetingPoint;
  const add = { type: "add_point", name: "School well", location: "Near the school", source: "Borehole", walkingMinutes: 7 } as const;
  const placed = transition(region, { ...add, lat: meeting.lat + 0.01, lon: meeting.lon + 0.01 }, coordinator);
  const point = placed.points.find((p) => p.custom)!;
  assert.deepEqual([point.lat, point.lon], [Math.round((meeting.lat + 0.01) * 1e5) / 1e5, Math.round((meeting.lon + 0.01) * 1e5) / 1e5]);
  assert.match(placed.events.at(-1)!.message, /marked on the map/);
  assert.equal(transition(region, add, coordinator).points.find((p) => p.custom)!.lat, null, "without a position it has none");
  rejects(() => transition(region, { ...add, lat: meeting.lat + 1, lon: meeting.lon }, coordinator), 400);
  rejects(() => transition(region, { ...add, lat: meeting.lat }, coordinator), 400);
  rejects(() => transition(region, { ...add, lat: 95, lon: 0 }, coordinator), 400);
  rejects(() => transition(region, { ...add, lat: NaN, lon: 1 }, coordinator), 400);
});

test("a position on top of a recorded water point comes with a hint, never with a block", () => {
  const region = createSeedState(NOW, REGION!);
  const recorded = region.points.find((p) => p.tracked === false && typeof p.lat === "number")!;
  const add = { type: "add_point", name: "School well", location: "Near the school", source: "Borehole", walkingMinutes: 7 } as const;
  const close = { lat: recorded.lat! + 0.0001, lon: recorded.lon! };
  const hit = findNearbyPoint(region.points, close);
  assert.ok(hit && hit.meters <= 20, "about 11 m from a recorded point");
  assert.equal(findNearbyPoint(region.points, { lat: 0, lon: 0 }), null);
  const added = transition(region, { ...add, ...close }, coordinator);
  assert.match(added.events.at(-1)!.message, /lies about \d+ m away: please check that this is not the same one/);
  assert.ok(added.points.some((p) => p.custom), "the point is added all the same");
  const meeting = region.region!.meetingPoint;
  const far = transition(region, { ...add, lat: meeting.lat + 0.09, lon: meeting.lon }, coordinator);
  assert.doesNotMatch(far.events.at(-1)!.message, /lies about/);
});

test("coordinates are read as Google Maps copies them", () => {
  assert.deepEqual(parseCoordinates("0.4601, 34.1115"), { lat: 0.4601, lon: 34.1115 });
  assert.deepEqual(parseCoordinates(" 0.4601 34.1115 "), { lat: 0.4601, lon: 34.1115 });
  assert.deepEqual(parseCoordinates("-1.5;36"), { lat: -1.5, lon: 36 });
  for (const bad of ["", "0.46", "north, east", "91, 20", "20, 181", "0.4601, 34.1115, 5", "0,4601, 34,1115"]) assert.equal(parseCoordinates(bad), null, bad);
});

test("the demo looks after a limited number of water points, and only added ones can be removed", () => {
  let state = createSeedState(NOW);
  for (let i = state.points.length; i < MAX_TRACKED; i++) {
    state = transition(state, { type: "add_point", name: `Extra point ${i}`, location: "Somewhere in the village", source: "Other", walkingMinutes: 10 }, coordinator);
  }
  assert.equal(state.points.length, MAX_TRACKED);
  rejects(() => transition(state, { type: "add_point", name: "One too many", location: "Somewhere in the village", source: "Other", walkingMinutes: 10 }, coordinator), 409);

  rejects(() => transition(state, { type: "remove_point", pointId: "a" }, coordinator), 409);
  rejects(() => transition(state, { type: "remove_point", pointId: "d" }, operator), 403);
  const withJob = transition(state, { type: "report", pointId: "d", status: "down", note: "No water at the spout." });
  rejects(() => transition(withJob, { type: "remove_point", pointId: "d" }, coordinator), 409);
  const removed = transition(state, { type: "remove_point", pointId: "d" }, coordinator);
  assert.equal(removed.points.length, MAX_TRACKED - 1);
  assert.ok(!removed.points.some((p) => p.id === "d"));
});

test("two survey records of different years at the same place are pointed out as a possible duplicate", () => {
  const points = createSeedState(NOW, REGION).points;
  const c = points.find((p) => p.id === "c")!, b = points.find((p) => p.id === "b")!;
  const hint = getPossibleDuplicate(points, c);
  assert.ok(hint && hint.meters > 0 && hint.meters <= 50, "C (2012 survey) has a 2023 record right next to it");
  assert.notEqual(hint.point.survey?.dataset, c.survey?.dataset);
  assert.equal(getPossibleDuplicate(points, b), null, "records of the same survey are not flagged");
  assert.equal(getPossibleDuplicate(createSeedState(NOW).points, createSeedState(NOW).points[0]), null, "no survey, no hint");
});
