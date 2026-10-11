"use client";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Footprints, MapPin, Monitor, Printer, Search, Wrench } from "lucide-react";
import { STATUS_TTL_MS, distanceKm, findAlternative, getNearby, getPointDisplay, isPointOpen, type RegionMeta, type State, type WaterPoint } from "@/lib/domain";
import { CanMeter, StatusChip } from "./marks";
import { NeighbourhoodMap } from "./map";
import { JOB_STEP, SURVEY_TEXT, advice, clock, isTracked, km, letter, month, osmLink, stamp, toneOf, validityLeft, validityText } from "./format";

interface ViewProps { state: State; now: number; offline: boolean; lastSync: string | null; onReport: (pointId: string) => void }

export function StatusView({ state, now, offline, lastSync, onReport }: ViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const tracked = state.points.filter(isTracked);
  const working = tracked.filter((p) => { const d = getPointDisplay(p, now, offline); return d.certainty === "fresh" && d.status === "working"; }).length;
  const firstDown = tracked.find((p) => getPointDisplay(p, now, offline).status !== "working");
  const routeTo = firstDown ? findAlternative(state.points, firstDown.id, now, offline) : null;
  const region = state.region ?? null;
  return (
    <div className="status-view">
      <section className="print-sheet-head" aria-hidden="true">
        <strong>WaterLink status sheet · printed {stamp(new Date(now).toISOString())} EAT</strong>
        <p>A snapshot. Problems can start after printing. Without a new check after the time shown, treat the state as unclear. Working means water can be drawn; it says nothing about drinking-water quality.</p>
      </section>
      <header className="status-intro">
        <div>
          <h1>Does our water point work today?</h1>
          <p className={offline ? "is-warn" : ""}>
            {offline ? "No live connection. Today’s state is not confirmed." :
              `${working} of ${tracked.length} water points confirmed working · updated ${clock(lastSync)} EAT`}
          </p>
        </div>
        <div className="status-intro-actions">
          <a className="btn btn-quiet" href="/?view=display" target="_blank" rel="noopener noreferrer"><Monitor size={18} aria-hidden="true" />Public board<ArrowUpRight size={16} aria-hidden="true" /></a>
          <button className="btn btn-quiet" onClick={() => window.print()}><Printer size={18} aria-hidden="true" />Print sheet</button>
        </div>
      </header>
      <div className="status-layout">
        <ol className="point-rows">
          {tracked.map((p) => (
            <PointRow key={p.id} point={p} state={state} now={now} offline={offline} highlighted={selected === p.id}
              onReport={() => onReport(p.id)} onFocus={() => setSelected(p.id)} />
          ))}
        </ol>
        <aside className="status-map">
          <NeighbourhoodMap state={state} now={now} offline={offline} selected={selected} onSelect={setSelected}
            route={firstDown && routeTo ? { from: firstDown.id, to: routeTo.id } : null} />
        </aside>
      </div>
      <p className="quality-note">Working means water can be drawn. It says nothing about drinking-water quality. A confirmation is valid for 12 hours, then it shows as unclear until someone checks again.</p>
      {region && <RecordedPoints points={state.points.filter((p) => !isTracked(p))} region={region} onReport={onReport} />}
    </div>
  );
}

function PointRow({ point: p, state, now, offline, highlighted, onReport, onFocus }: {
  point: WaterPoint; state: State; now: number; offline: boolean; highlighted: boolean; onReport: () => void; onFocus: () => void;
}) {
  const [open, setOpen] = useState(false);
  const d = getPointDisplay(p, now, offline), tip = advice(d);
  const alternative = d.status !== "working" ? findAlternative(state.points, p.id, now, offline) : null;
  const nearby = d.status !== "working" && !alternative && p.survey && !offline ? getNearby(state.points, p.id, 2) : [];
  const job = state.jobs.find((j) => j.pointId === p.id && j.status !== "closed");
  const level = validityLeft(p, d, now);
  const estimated = Boolean(p.survey);
  const confirmed = Boolean(p.confirmedAt && Number.isFinite(Date.parse(p.confirmedAt)));
  const hours = p.allDay ? `Open all day${estimated ? " (simulated)" : ""}` : !p.opensAt ? "Opening hours not recorded"
    : `${p.opensAt}–${p.closesAt} EAT · ${isPointOpen(p, now) ? "open now" : "closed now"}`;
  return (
    <li className={`point-row ${toneOf(d)} ${highlighted ? "is-highlighted" : ""}`} onMouseEnter={onFocus}>
      <div className="point-row-main">
        <span className="point-letter" aria-hidden="true">{letter(p)}</span>
        <div className="point-name">
          <h2>{p.name}</h2>
          <span><MapPin size={14} aria-hidden="true" />{p.location}</span>
        </div>
        <div className="point-state">
          <StatusChip display={d} />
          <strong>{tip.line}</strong>
          {d.certainty !== "fresh" && <small>{d.reason}</small>}
        </div>
        <div className="point-fresh">
          <CanMeter level={level} size={48} label={validityText(p, d, now)} />
          <div>
            <strong>{confirmed ? `${d.status === "working" || d.certainty !== "fresh" ? "Confirmed" : "Reported"} ${clock(p.confirmedAt)}` : "Never confirmed"}</strong>
            <span>{validityText(p, d, now)}</span>
          </div>
        </div>
        <div className="point-walk">
          <Footprints size={17} aria-hidden="true" />
          <span>About {p.walkingMinutes} min<small>from the meeting point{estimated ? ", estimated" : ""}</small></span>
        </div>
      </div>
      {job && (
        <p className="point-job"><Wrench size={16} aria-hidden="true" />Repair: {JOB_STEP[job.status]}{job.assignedName ? ` · ${job.assignedName.split(" ·")[0]}` : ""}</p>
      )}
      {d.status !== "working" && (
        <div className={`point-alt ${alternative ? "has-alt" : ""}`}>
          <ArrowRight size={20} aria-hidden="true" />
          {alternative ? (
            <p><span>Go to</span> <b>{letter(alternative)} · {alternative.name}</b> instead. About {alternative.walkingMinutes} min, confirmed working at {clock(alternative.confirmedAt)}.</p>
          ) : (
            <p><b>No confirmed alternative right now.</b> Ask on site before you go.
              {nearby.length > 0 && <small> Nearest recorded points (state and route not checked): {nearby.map((n) => `${n.point.name}, ${km(n.km)}`).join("; ")}.</small>}
            </p>
          )}
        </div>
      )}
      <button className="point-more" aria-expanded={open} onClick={() => setOpen(!open)}>
        Details and directions <ChevronDown size={18} className={open ? "is-flipped" : ""} aria-hidden="true" />
      </button>
      {open && (
        <div className="point-details">
          <dl>
            <div><dt>Where</dt><dd>{p.landmark}</dd></div>
            <div><dt>Access</dt><dd>{p.routeVerified && p.accessVerified ? (estimated ? "Route and public access are simulated as checked for the demo." : "Route and public access are confirmed in the example data.") : "Route or access not reliably confirmed."}</dd></div>
            <div><dt>Hours</dt><dd>{hours}</dd></div>
            {confirmed && <div><dt>Last check</dt><dd>{p.confirmedBy ? `${p.confirmedBy}, ` : ""}{stamp(p.confirmedAt)} EAT · {Date.parse(p.confirmedAt!) + STATUS_TTL_MS > now ? "valid until" : "expired at"} {stamp(new Date(Date.parse(p.confirmedAt!) + STATUS_TTL_MS).toISOString())}</dd></div>}
            {p.survey && <div><dt>Survey</dt><dd>{month(p.survey.reportDate)}: {SURVEY_TEXT[p.survey.status]} ({p.survey.statusText}) · {p.survey.dataset || "WPdx"}</dd></div>}
          </dl>
          <div className="point-details-actions">
            {osmLink(p) && <a className="link" href={osmLink(p)!} target="_blank" rel="noopener noreferrer">Open in OpenStreetMap <ArrowUpRight size={15} aria-hidden="true" /></a>}
            <button className="link" onClick={onReport}>Report a problem here <ArrowRight size={15} aria-hidden="true" /></button>
          </div>
        </div>
      )}
    </li>
  );
}

function RecordedPoints({ points, region, onReport }: { points: WaterPoint[]; region: RegionMeta; onReport: (id: string) => void }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState("");
  if (!points.length) return null;
  const needle = query.trim().toLowerCase();
  const matches = points.filter((p) => !needle || `${p.name} ${p.location}`.toLowerCase().includes(needle));
  return (
    <section className="recorded">
      <button className="recorded-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span><strong>{points.length} more recorded water points nearby</strong><small>Known from surveys, not looked after by WaterLink yet. Not confirmed today.</small></span>
        <ChevronDown size={22} className={open ? "is-flipped" : ""} aria-hidden="true" />
      </button>
      {open && (
        <div className="recorded-body">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search recorded water points</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or place" />
          </label>
          <ul className="recorded-list">
            {matches.map((p) => (
              <li key={p.id}>
                <div><strong>{p.name}</strong><small>{p.location} · {km(distanceKm(p, region.meetingPoint))} straight line</small></div>
                <span className="tag">{p.survey ? `Surveyed ${month(p.survey.reportDate)}: ${SURVEY_TEXT[p.survey.status]}` : "No survey"}</span>
                <span className="tag tag-unk">Not confirmed today</span>
                <button className="link" onClick={() => onReport(p.id)}>Report <ArrowRight size={15} aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
          {!matches.length && <p className="muted">No water point matches “{query}”.</p>}
        </div>
      )}
    </section>
  );
}
