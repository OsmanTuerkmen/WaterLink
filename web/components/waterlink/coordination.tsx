"use client";
import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, Check, CircleHelp, Clock3, MapPin, Pause, Play, RefreshCw, TriangleAlert, Wifi, WifiOff, Wrench } from "lucide-react";
import { getPointDisplay, type State } from "@/lib/domain";
import { alertEpisodes, readSensor, type SensorState } from "@/lib/sensor";
import kwale from "@/data/kwale-sensors.json";
import { useWaterLink } from "./store";
import { NeighbourhoodMap } from "./map";
import { StatusChip } from "./marks";
import { BLOCKER, JOB_STEP, ago, isTracked, letter, stamp } from "./format";

export type CoordTab = "overview" | "history" | "demo";

export function Coordination({ tab, onTab }: { tab: CoordTab; onTab: (t: CoordTab) => void }) {
  const { state, now, connection } = useWaterLink();
  const offline = connection !== "online";
  if (!state) return null;
  return (
    <div className="coord">
      <header className="coord-head">
        <h1>Coordination</h1>
        <nav className="tabs" aria-label="Coordination">
          {([["overview", "Overview"], ["history", "History"], ["demo", "Demo tools"]] as [CoordTab, string][]).map(([id, label]) => (
            <a key={id} href={`#coordination/${id}`} aria-current={tab === id ? "page" : undefined} onClick={(e) => { e.preventDefault(); onTab(id); }}>{label}</a>
          ))}
        </nav>
      </header>
      {tab === "overview" && <Overview state={state} now={now} offline={offline} />}
      {tab === "history" && <History state={state} />}
      {tab === "demo" && <DemoTools />}
    </div>
  );
}

function Overview({ state, now, offline }: { state: State; now: number; offline: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const open = state.jobs.filter((j) => j.status !== "closed");
  const closed = state.jobs.filter((j) => j.status === "closed");
  const tracked = state.points.filter(isTracked);
  const blocked = open.filter((j) => j.blocker);
  const pick = selected ? state.points.find((p) => p.id === selected) : null;
  return (
    <div className="coord-overview">
      <section className="coord-map">
        <NeighbourhoodMap state={state} now={now} offline={offline} extent="all" selected={selected} onSelect={setSelected}
          label="Map of all recorded water points in the region" />
        {pick && (
          <div className="coord-pick">
            <strong>{pick.name}</strong>
            <span>{isTracked(pick) ? getPointDisplay(pick, now, offline).label : pick.survey ? `Surveyed ${pick.survey.statusText.toLowerCase()} · not confirmed today` : "Not confirmed today"}</span>
          </div>
        )}
      </section>
      <section className="coord-side">
        <p className="coord-summary">
          <b>{open.length}</b> open repair{open.length === 1 ? "" : "s"} · <b>{blocked.length}</b> blocked · <b>{closed.length}</b> tested and closed · <b>{tracked.length}</b> of {state.points.length} water points looked after
        </p>
        <h2>Water points in the programme</h2>
        <ul className="coord-points">
          {tracked.map((p) => (
            <li key={p.id}>
              <span className="point-letter sm" aria-hidden="true">{letter(p)}</span>
              <span className="coord-points-name">{p.name}</span>
              <StatusChip display={getPointDisplay(p, now, offline)} size="sm" />
            </li>
          ))}
        </ul>
        <h2>Open repairs</h2>
        {!open.length ? <p className="muted">No open repairs. New reports from operators appear here.</p> : (
          <table className="table">
            <thead><tr><th scope="col">Water point</th><th scope="col">Step</th><th scope="col">Who</th><th scope="col">Reported</th></tr></thead>
            <tbody>
              {open.map((j) => {
                const p = state.points.find((x) => x.id === j.pointId);
                return (
                  <tr key={j.id}>
                    <td><strong>{p?.name}</strong>{j.blocker && <span className="tag tag-limit">{BLOCKER[j.blocker]}</span>}</td>
                    <td>{JOB_STEP[j.status]}</td>
                    <td>{j.assignedName?.split(" ·")[0] ?? "Nobody yet"}</td>
                    <td>{ago(j.createdAt, now)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="muted">Blockers show where money, parts or people are missing. WaterLink makes them visible; it does not solve them.</p>
      </section>
    </div>
  );
}

function History({ state }: { state: State }) {
  const icon = (type: string) => type === "confirm" ? <Check size={15} /> : type === "report" ? <TriangleAlert size={15} /> : ["claim", "start", "progress", "repair"].includes(type) ? <Wrench size={15} /> : type === "scenario" ? <Activity size={15} /> : <RefreshCw size={15} />;
  return (
    <section className="history">
      <ol className="timeline">
        {[...state.events].reverse().map((e) => (
          <li key={e.id} className={`ev-${e.type}`}>
            <span className="timeline-dot" aria-hidden="true">{icon(e.type)}</span>
            <div><p>{e.message}</p><small>{e.actorName} · {stamp(e.at)} EAT</small></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DemoTools() {
  const { act, feedback, clear, simulatedOffline, toggleOffline, connection } = useWaterLink();
  const [confirmReset, setConfirmReset] = useState(false);
  const fb = feedback("coordinator");
  const disabled = fb.busy || connection !== "online";
  const scenarios = [
    { id: "stale", title: "Let A’s confirmation expire", text: "A passes the 12-hour limit and shows as unclear.", icon: <Clock3 size={20} /> },
    { id: "conflict", title: "Conflicting reports for A", text: "A needs a fresh on-site check.", icon: <TriangleAlert size={20} /> },
    { id: "no-alternative", title: "No reliable alternative", text: "Access to the other points is unconfirmed.", icon: <MapPin size={20} /> },
  ] as const;
  return (
    <div className="demo">
      {(fb.error || fb.notice) && (
        <p className={`banner ${fb.error ? "error" : "ok"}`} role="status">{fb.error || fb.notice}
          {fb.signInNeeded && <a className="link" href={`/signin-with-chatgpt?return_to=${encodeURIComponent("/#coordination/demo")}`} target="_top">Sign in <ArrowUpRight size={14} /></a>}
          <button className="icon-btn" onClick={() => clear("coordinator")} aria-label="Dismiss">×</button>
        </p>
      )}
      <section className="demo-block">
        <h2>Three-minute demo</h2>
        <ol className="demo-script">
          <li><span>Open the <a className="link" href="/?view=stage" target="_blank" rel="noopener noreferrer">pitch stage <ArrowUpRight size={14} /></a> or the <a className="link" href="/?view=display" target="_blank" rel="noopener noreferrer">public board <ArrowUpRight size={14} /></a> on a second screen.</span></li>
          <li><span>Amina (operator) reports that A has no water. The board shows it at once, with B as the alternative.</span></li>
          <li><span>Daniel (technician) takes the job, starts work and reports the repair.</span></li>
          <li><span>The board stays careful: a reported repair is not a working water point.</span></li>
          <li><span>Amina tests on site and confirms. A is working again, the job closes.</span></li>
        </ol>
        <p className="muted">Reset just before the pitch: simulated confirmations expire after 12 hours.</p>
      </section>
      <section className="demo-block">
        <h2>Show uncertainty</h2>
        <div className="scenario-list">
          {scenarios.map((s) => (
            <button key={s.id} disabled={disabled} onClick={() => act("coordinator", { type: "scenario", scenario: s.id })}>
              {s.icon}<span><strong>{s.title}</strong><small>{s.text}</small></span>
            </button>
          ))}
          <button className={simulatedOffline ? "is-on" : ""} onClick={toggleOffline}>
            {simulatedOffline ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span><strong>{simulatedOffline ? "Reconnect this window" : "Cut the connection in this window"}</strong><small>A labelled simulation; other screens stay online.</small></span>
          </button>
        </div>
        <div className="reset">
          {confirmReset ? (
            <>
              <p>Reset all demo reports and repair jobs?</p>
              <div className="coupon-row">
                <button className="btn btn-danger" disabled={disabled} onClick={async () => { if (await act("coordinator", { type: "reset" })) setConfirmReset(false); }}>Yes, reset the demo</button>
                <button className="btn btn-quiet" onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            </>
          ) : <button className="btn btn-quiet btn-block" disabled={disabled} onClick={() => setConfirmReset(true)}><RefreshCw size={18} />Reset the demo</button>}
        </div>
      </section>
      <SensorReplay disabled={disabled} />
      <section className="demo-block demo-limits">
        <h2>What is not real yet</h2>
        <ul>
          <li><CircleHelp size={18} />No sensors, SMS or AI service are connected. Roles are simulated.</li>
          <li><MapPin size={18} />Places come from WPdx surveys. Today’s state, routes, access and local language are not checked on site.</li>
          <li><Wrench size={18} />Software does not bring money, parts or staff. Blockers make those limits visible.</li>
        </ul>
      </section>
    </div>
  );
}

const SENSOR_LABEL: Record<SensorState, string> = { normal: "In use", low: "Unusually low", alert: "Sensor hint", "no-data": "No data", learning: "Too little history" };
const weekLabel = (w: string) => { const [y, n] = w.split("-W"); return `Week ${Number(n)}, ${y}`; };
const fmt = (v: number | null) => (v === null ? "–" : v.toLocaleString("en-GB"));

/** Replays real, historical Smart Handpump volumes from Kwale; never a live status. */
function SensorReplay({ disabled }: { disabled: boolean }) {
  const { act } = useWaterLink();
  const pumps = kwale.pumps as { id: string; name: string; km: number; volumes: (number | null)[] }[];
  const focus = pumps[0], weeks = kwale.weeks;
  const [week, setWeek] = useState(8), [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setWeek((w) => { if (w >= weeks.length - 1) { setPlaying(false); return w; } return w + 1; }), 650);
    return () => clearInterval(timer);
  }, [playing, weeks.length]);
  const reading = readSensor(focus.volumes, week), episodes = alertEpisodes(focus.volumes);
  const max = Math.max(...focus.volumes.map((v) => v ?? 0)), barW = 10;
  const message = reading.state === "alert" ? `Sensor hint: almost no pumping for ${reading.quietWeeks} weeks`
    : reading.state === "low" ? "Unusually low this week, no hint yet" : reading.state === "no-data" ? "No data this week (weak radio signal)"
    : reading.state === "learning" ? "Too little history to compare" : "Pump is in use, no hint";
  return (
    <section className="demo-block sensor">
      <h2>Real sensor data, replayed: {focus.name}, Kwale</h2>
      <p className="muted">Weekly volumes from Smart Handpump sensors in {weeks[0].slice(0, 4)}. Historical, not live. WaterLink turns a drop into a request to check on site, never into a confirmed status.</p>
      <div className="sensor-controls">
        <button className="btn btn-primary" onClick={() => { if (week >= weeks.length - 1) setWeek(0); setPlaying(!playing); }}>
          {playing ? <Pause size={17} /> : <Play size={17} />}{playing ? "Pause" : "Play"}
        </button>
        <input type="range" min={0} max={weeks.length - 1} value={week} onChange={(e) => { setPlaying(false); setWeek(Number(e.target.value)); }} aria-label="Choose week" />
        <strong>{weekLabel(weeks[week])}</strong>
      </div>
      <svg className="sensor-chart" viewBox={`0 0 ${weeks.length * barW} 120`} preserveAspectRatio="none" role="img" aria-label={`Weekly volume for ${focus.name}`}>
        {episodes.map((e) => <rect key={e.start} className="episode" x={e.start * barW} y={0} width={(e.end - e.start + 1) * barW} height={120} />)}
        {focus.volumes.map((v, i) => v === null
          ? <rect key={i} className="gap" x={i * barW + 3} y={114} width={barW - 6} height={4} />
          : <rect key={i} className={i <= week ? "bar" : "bar later"} x={i * barW + 1} y={118 - Math.max(1, (v / max) * 110)} width={barW - 2} height={Math.max(1, (v / max) * 110)} />)}
        <rect className="now" x={week * barW} y={0} width={barW} height={120} />
      </svg>
      <p className={`sensor-read ${reading.state}`}><Activity size={18} />{message}. <span>{reading.value !== null ? `This week ${fmt(reading.value)}, usually about ${fmt(reading.baseline && Math.round(reading.baseline))}.` : ""}</span></p>
      <ul className="sensor-pumps">
        {pumps.map((p) => { const r = readSensor(p.volumes, week); return (
          <li key={p.id}><span>{p.name}<small>{p.id === focus.id ? "replayed pump" : `${p.km.toLocaleString("en-GB")} km away`}</small></span><span className="num">{fmt(r.value)}</span><span className={`tag ${r.state === "alert" ? "tag-limit" : r.state === "normal" ? "tag-ok" : "tag-unk"}`}>{SENSOR_LABEL[r.state]}</span></li>
        ); })}
      </ul>
      <div className="coupon-row">
        <button className="btn btn-quiet" disabled={disabled || reading.state !== "alert"} onClick={() => act("coordinator", { type: "scenario", scenario: "sensor" })}><Activity size={17} />Send this hint to water point A</button>
        {reading.state !== "alert" && <small className="muted">Available while the replay shows a sensor hint.</small>}
      </div>
      <small className="muted">Data: {kwale.meta.source}, {kwale.meta.license}, doi:{kwale.meta.doi}. {kwale.meta.notes}</small>
    </section>
  );
}
