"use client";
import { useState, type FormEvent } from "react";
import { Crosshair, Footprints, Plus, Trash2 } from "lucide-react";
import { ACCESS_TTL_MS, MAX_POINT_RADIUS_KM, MAX_TRACKED, NEW_POINT_SOURCES, findNearbyPoint, parseCoordinates, type State, type WaterPoint } from "@/lib/domain";
import { useWaterLink } from "./store";
import { isTracked, stamp } from "./format";

const inRange = (value: string, min: number, max: number) => Number.isInteger(Number(value)) && value.trim() !== "" && Number(value) >= min && Number(value) <= max;

/** Under a water point in the coordination list: is its route checked, and the way to check it (or to take it back). */
export function PointAdmin({ point, state, now, disabled }: { point: WaterPoint; state: State; now: number; disabled: boolean }) {
  const { act } = useWaterLink();
  const [open, setOpen] = useState(false);
  const checkedAt = point.accessVerified && point.routeVerified && point.accessConfirmedAt ? Date.parse(point.accessConfirmedAt) : NaN;
  const fresh = Number.isFinite(checkedAt) && checkedAt + ACCESS_TTL_MS > now;
  const by = point.accessCheckedBy ? ` by ${point.accessCheckedBy.split(" ·")[0]}` : " (simulated)";
  const until = Number.isFinite(checkedAt) ? stamp(new Date(checkedAt + ACCESS_TTL_MS).toISOString()) : "";
  const summary = fresh ? `Route and access checked ${stamp(point.accessConfirmedAt)} EAT${by}, valid until ${until} EAT.`
    : Number.isFinite(checkedAt) ? "The route check has expired (12 hours in this demo): no alternative points here until it is checked again."
    : "Route and access not checked: no alternative will point here.";
  const hasJob = state.jobs.some((job) => job.pointId === point.id && job.status !== "closed");
  return (
    <div className="coord-point-extra">
      <p className={`route-state ${fresh ? "is-ok" : ""}`}><Footprints size={15} aria-hidden="true" />{summary}</p>
      {point.custom && point.lat != null && <p className="muted">Position entered by coordination, not checked on the ground.</p>}
      <div className="route-actions">
        <button type="button" className="btn btn-quiet btn-sm" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Check route and access"}</button>
        {point.custom && (
          <button type="button" className="btn btn-quiet btn-sm" disabled={disabled || hasJob} title={hasJob ? "Close its repair job first" : undefined}
            onClick={() => act("coordinator", { type: "remove_point", pointId: point.id })}><Trash2 size={15} aria-hidden="true" />Remove</button>
        )}
      </div>
      {open && <RouteForm point={point} disabled={disabled} onDone={() => setOpen(false)} />}
    </div>
  );
}

function RouteForm({ point, disabled, onDone }: { point: WaterPoint; disabled: boolean; onDone: () => void }) {
  const { act } = useWaterLink();
  const [minutes, setMinutes] = useState(String(point.walkingMinutes));
  const [landmark, setLandmark] = useState(point.accessCheckedBy ? point.landmark : "");
  const [allDay, setAllDay] = useState(point.allDay);
  const [opens, setOpens] = useState(point.opensAt || "06:00"), [closes, setCloses] = useState(point.closesAt || "20:00");
  const [walked, setWalked] = useState(false);
  const valid = walked && inRange(minutes, 1, 180) && landmark.trim().length >= 3 && (allDay || (Boolean(opens) && Boolean(closes) && opens !== closes));
  async function save(e: FormEvent) {
    e.preventDefault();
    const ok = await act("coordinator", {
      type: "verify_access", pointId: point.id, walkingMinutes: Number(minutes), landmark: landmark.trim(),
      allDay, opensAt: allDay ? "" : opens, closesAt: allDay ? "" : closes, checked: true,
    });
    if (ok) onDone();
  }
  async function close() {
    if (await act("coordinator", { type: "close_access", pointId: point.id, note: "Access closed or route blocked." })) onDone();
  }
  return (
    <form className="route-check" onSubmit={save}>
      <label>Walking time from the meeting point (minutes)
        <input type="number" inputMode="numeric" min={1} max={180} value={minutes} onChange={(e) => setMinutes(e.target.value)} required />
      </label>
      <label>Directions
        <input type="text" maxLength={200} value={landmark} onChange={(e) => setLandmark(e.target.value)} required />
        <small>For example: follow the main path to the school; the well is next to the blue gate.</small>
      </label>
      <fieldset>
        <legend>Opening hours</legend>
        <label className="check-inline"><input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />Open all day</label>
        {!allDay && (
          <div className="hours-row">
            <label>Opens<input type="time" value={opens} onChange={(e) => setOpens(e.target.value)} required /></label>
            <label>Closes<input type="time" value={closes} onChange={(e) => setCloses(e.target.value)} required /></label>
          </div>
        )}
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={walked} onChange={(e) => setWalked(e.target.checked)} />
        <span>I walked the route and checked on site that the public can use this water point. <small>In this demo the visit is simulated.</small></span>
      </label>
      <div className="route-actions">
        <button className="btn btn-primary" type="submit" disabled={disabled || !valid}>Save route check</button>
        <button className="btn btn-quiet" type="button" disabled={disabled} onClick={close}>Access is closed or blocked</button>
      </div>
    </form>
  );
}

/** Registers another water point in the programme (a new village, a new well). It starts as not confirmed and unchecked. */
export function AddPoint({ state, disabled, position, setPosition, picking, setPicking }: {
  state: State; disabled: boolean; position: string; setPosition: (value: string) => void; picking: boolean; setPicking: (on: boolean) => void;
}) {
  const { act } = useWaterLink();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""), [location, setLocation] = useState(""), [source, setSource] = useState<string>(NEW_POINT_SOURCES[0]), [minutes, setMinutes] = useState("10");
  const coords = parseCoordinates(position);
  const nearby = coords ? findNearbyPoint(state.points, coords) : null;
  const full = state.points.filter(isTracked).length >= MAX_TRACKED;
  const valid = name.trim().length >= 3 && location.trim().length >= 2 && inRange(minutes, 1, 180) && (!position.trim() || coords !== null);
  async function add(e: FormEvent) {
    e.preventDefault();
    if (await act("coordinator", { type: "add_point", name: name.trim(), location: location.trim(), source, walkingMinutes: Number(minutes), ...(coords ?? {}) })) {
      setName(""); setLocation(""); setPosition(""); setPicking(false); setOpen(false);
    }
  }
  return (
    <div className="add-point">
      {!open && <button type="button" className="btn btn-quiet" disabled={disabled || full} onClick={() => setOpen(true)}><Plus size={18} aria-hidden="true" />Add a water point</button>}
      {full && <p className="muted">The demo looks after at most {MAX_TRACKED} water points. Remove one you added to make room.</p>}
      {open && (
        <form className="route-check" onSubmit={add}>
          <label>Name<input type="text" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Where is it?<input type="text" maxLength={80} value={location} onChange={(e) => setLocation(e.target.value)} required /></label>
          <label>Type of water point
            <select value={source} onChange={(e) => setSource(e.target.value)}>{NEW_POINT_SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label>Walking time from the meeting point, estimated (minutes)
            <input type="number" inputMode="numeric" min={1} max={180} value={minutes} onChange={(e) => setMinutes(e.target.value)} required />
          </label>
          <label>Position on the map (optional)
            <input type="text" inputMode="decimal" placeholder="0.4601, 34.1115" value={position} onChange={(e) => setPosition(e.target.value)}
              aria-invalid={Boolean(position.trim()) && coords === null} aria-describedby="position-help" />
            <small id="position-help">{position.trim() && coords === null ? "Latitude, then longitude, for example 0.4601, 34.1115." : `In Google Maps press and hold on the spot, then tap the numbers to copy them. Within ${MAX_POINT_RADIUS_KM} km of the meeting point.`}</small>
          </label>
          <div className="route-actions">
            <button type="button" className="btn btn-quiet btn-sm" aria-pressed={picking} onClick={() => setPicking(!picking)}>
              <Crosshair size={15} aria-hidden="true" />{picking ? "Stop picking" : "Pick on the map"}
            </button>
          </div>
          {nearby && <p className="muted" role="status">A recorded water point, {nearby.point.name}, is about {nearby.meters} m from this position. Check that it is not the same one.</p>}
          <p className="muted">A new water point starts as not confirmed. An operator confirms it with an on-site test, and coordination checks route and access before it can be named as an alternative.</p>
          <div className="route-actions">
            <button className="btn btn-primary" type="submit" disabled={disabled || !valid}>Add to the programme</button>
            <button className="btn btn-quiet" type="button" onClick={() => { setOpen(false); setPosition(""); setPicking(false); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
