import assert from 'node:assert/strict';

// Destructive only to the explicitly disposable local demonstration dataset.
const base = process.env.WATERLINK_BASE_URL || 'http://127.0.0.1:5173';
const parsed = new URL(base);
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname), 'Integration checks only run on a local demo.');
const origin = parsed.origin;
let cookie = '';
async function request(path, { method = 'GET', body, token, expected = 200, headers = {} } = {}) {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === 'POST' ? { Origin: origin, 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15_000),
  });
  const raw = await response.text();
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? JSON.parse(raw) : { error: raw };
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  // The dev server rejects cross-origin requests before the JSON route runs.
  if (isJson) assert.match(response.headers.get('cache-control') || '', /no-store/);
  return data;
}
let revision;
const send = async (token, command, expected = 200, requestId = crypto.randomUUID(), atRevision = revision) => {
  const result = await request('/api/waterlink', { method: 'POST', token, body: { command, expectedRevision: atRevision, requestId }, expected });
  if (result.state) revision = result.state.revision;
  return result;
};

await request('/api/session', { method: 'POST', body: { role: 'operator' }, expected: 401 });
await request('/api/waterlink', { method: 'POST', body: { command: { type: 'reset' }, expectedRevision: 0, requestId: crypto.randomUUID() }, expected: 401 });
const signedIn = await fetch(`${origin}/signin-with-chatgpt?return_to=/`, { redirect: 'manual' });
const cookies = signedIn.headers.getSetCookie();
cookie = cookies.map(value => value.split(';')[0]).join('; ');
assert.ok(cookie, 'Local preview must provide a demo sign-in cookie.');

const operator = await request('/api/session', { method: 'POST', body: { role: 'operator' }, expected: 201 });
const technician = await request('/api/session', { method: 'POST', body: { role: 'technician' }, expected: 201 });
const coordinator = await request('/api/session', { method: 'POST', body: { role: 'coordinator' }, expected: 201 });
assert.equal(operator.actor.role, 'operator');
await request('/api/session', { method: 'POST', body: { role: 'operator' }, headers: { Origin: 'https://unrelated.example' }, expected: 403 });
const initial = await request('/api/waterlink');
revision = initial.state.revision;
const same = await request(`/api/waterlink?since=${revision}`);
assert.equal(same.unchanged, true, 'A screen that holds the current revision gets no state again.');
assert.equal(same.state, undefined);
assert.equal((await request(`/api/waterlink?since=${revision + 1}`)).state.revision, revision, 'An unknown revision gets the full state.');
await send(coordinator.token, { type: 'reset' });

try {
  const body = { type: 'report', pointId: 'a', status: 'down', note: 'Checked on site: no water flow.' };
  const id = crypto.randomUUID();
  const oldRevision = revision;
  const report = await send(operator.token, body, 200, id);
  assert.equal(report.state.points.find(p => p.id === 'a').status, 'down');
  assert.equal(report.state.jobs.filter(j => j.pointId === 'a' && j.status !== 'closed').length, 1);
  const revisionAfterReport = revision;
  await send(operator.token, body, 200, id, oldRevision);
  assert.equal(revision, revisionAfterReport, 'Identical retry must not create another mutation.');
  await send(operator.token, { ...body, note: 'Wiederholte Meldung desselben Ausfalls.' });
  const crossDevice = await request('/api/waterlink');
  assert.equal(crossDevice.state.jobs.filter(j => j.pointId === 'a' && j.status !== 'closed').length, 1);
  assert.equal(crossDevice.state.points.find(p => p.id === 'a').status, 'down');
  const job = crossDevice.state.jobs.find(j => j.pointId === 'a' && j.status !== 'closed');
  assert.ok(job);

  await send(operator.token, { type: 'claim', jobId: job.id }, 403);
  await send(technician.token, { type: 'reset' }, 403);
  await send(technician.token, { type: 'claim', jobId: job.id }, 409, crypto.randomUUID(), oldRevision);
  await send(technician.token, { type: 'claim', jobId: job.id });
  await send(technician.token, { type: 'start', jobId: job.id });
  await send(technician.token, { type: 'progress', jobId: job.id, note: 'Warten auf Dichtung.', blocker: 'parts' });
  const repair = await send(technician.token, { type: 'repair', jobId: job.id, note: 'Dichtung ersetzt, Funktionstest durch Betreiberin ausstehend.' });
  assert.equal(repair.state.points.find(p => p.id === 'a').status, 'down');
  assert.equal(repair.state.jobs.find(j => j.id === job.id).status, 'awaiting_confirmation');
  await send(technician.token, { type: 'confirm', pointId: 'a', status: 'working', note: 'Test', tested: true }, 403);
  const failed = await send(operator.token, { type: 'confirm', pointId: 'a', status: 'down', note: 'Still no water flow.', tested: true });
  assert.equal(failed.state.jobs.find(j => j.id === job.id).status, 'in_progress');
  await send(technician.token, { type: 'repair', jobId: job.id, note: 'Verbindung nachgebessert.' });
  const confirmed = await send(operator.token, { type: 'confirm', pointId: 'a', status: 'working', note: 'Water flow tested on site.', tested: true });
  assert.equal(confirmed.state.points.find(p => p.id === 'a').status, 'working');
  assert.equal(confirmed.state.jobs.find(j => j.id === job.id).status, 'closed');
  assert.ok(confirmed.state.events.length >= 8);

  // Water points: only coordination may add, check routes and remove; a new point is never green by itself.
  const addCommand = { type: 'add_point', name: 'School well', location: 'Near the school', source: 'Borehole', walkingMinutes: 4 };
  await send(operator.token, addCommand, 403);
  await send(coordinator.token, { ...addCommand, source: 'Magic spring' }, 400);
  const added = await send(coordinator.token, addCommand);
  const school = added.state.points.find(p => p.name === 'School well');
  assert.ok(school && school.custom && school.status === 'unknown' && !school.accessVerified);
  const meeting = added.state.region?.meetingPoint;
  if (meeting) {
    await send(coordinator.token, { ...addCommand, name: 'Far well', lat: meeting.lat + 1, lon: meeting.lon }, 400);
    const placed = await send(coordinator.token, { ...addCommand, name: 'Mapped well', lat: meeting.lat + 0.004, lon: meeting.lon + 0.004 });
    const mapped = placed.state.points.find(p => p.name === 'Mapped well');
    assert.ok(typeof mapped.lat === 'number' && typeof mapped.lon === 'number', 'a point with a position is placed on the map');
    await send(coordinator.token, { type: 'remove_point', pointId: mapped.id });
  }
  const routeCheck = { type: 'verify_access', pointId: school.id, walkingMinutes: 4, landmark: 'Follow the main path to the school.', allDay: true, opensAt: '', closesAt: '', checked: true };
  await send(operator.token, routeCheck, 403);
  await send(coordinator.token, { ...routeCheck, checked: false }, 400);
  const verified = await send(coordinator.token, routeCheck);
  assert.equal(verified.state.points.find(p => p.id === school.id).accessVerified, true);
  await send(operator.token, { type: 'remove_point', pointId: school.id }, 403);
  await send(coordinator.token, { type: 'remove_point', pointId: 'a' }, 409);
  const removed = await send(coordinator.token, { type: 'remove_point', pointId: school.id });
  assert.ok(!removed.state.points.some(p => p.id === school.id));

  // Simultaneous independent changes: exactly one may commit this revision.
  const raceRevision = revision;
  const races = await Promise.all(['funding', 'staff'].map(async value => {
    const response = await fetch(`${origin}/api/waterlink`, {
      method: 'POST', headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json', Authorization: `Bearer ${operator.token}` },
      body: JSON.stringify({ command: { type: 'report', pointId: 'b', status: 'limited', note: `Test ${value}` }, expectedRevision: raceRevision, requestId: crypto.randomUUID() }),
    });
    return response.status;
  }));
  assert.deepEqual(races.sort(), [200, 409], 'Concurrent writes must not silently overwrite one another.');
  revision = (await request('/api/waterlink')).state.revision;
  await send(coordinator.token, { type: 'scenario', scenario: 'conflict' });
  assert.ok((await request('/api/waterlink')).state.points.some(p => p.conflict));
  await send(coordinator.token, { type: 'scenario', scenario: 'stale' });
  console.log('PASS: authentication, origins, roles, shared persistence, retries, deduplication, repair confirmation, failed test, concurrency and scenarios.');
} finally {
  revision = (await request('/api/waterlink')).state.revision;
  await send(coordinator.token, { type: 'reset' });
  console.log('Demo dataset restored.');
}
