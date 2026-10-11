"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Droplet, Droplets, Mic, TriangleAlert, Wrench, X } from "lucide-react";
import { getPointDisplay, type Blocker, type Job, type Role, type State, type WaterPoint } from "@/lib/domain";
import { useWaterLink } from "./store";
import { SignInPrompt } from "./signin";
import { PointTile, StatusChip } from "./marks";
import { BLOCKER, JOB_STEP, ago, clock, isTracked, letter, stamp } from "./format";

type FieldRole = Extract<Role, "operator" | "technician">;
type Screen =
  | { kind: "home" }
  | { kind: "report"; pointId: string; step: 1 | 2 }
  | { kind: "confirm"; pointId: string; step: 1 | 2 }
  | { kind: "done"; title: string; text: string };

const PEOPLE: Record<FieldRole, { name: string; job: string }> = {
  operator: { name: "Amina", job: "Operator" },
  technician: { name: "Daniel", job: "Technician" },
};

/** Phone-first app for people at the water point. One step per screen, large targets. */
export function FieldApp({ role, onRole, initialPoint, framed = false }: { role: FieldRole; onRole?: (role: FieldRole) => void; initialPoint?: string | null; framed?: boolean }) {
  const { state, connection, now, feedback, clear } = useWaterLink();
  const [screen, setScreen] = useState<Screen>(initialPoint ? { kind: "report", pointId: initialPoint, step: 1 } : { kind: "home" });
  useEffect(() => { if (initialPoint) setScreen({ kind: "report", pointId: initialPoint, step: 1 }); }, [initialPoint]);
  useEffect(() => { setScreen({ kind: "home" }); clear(role); }, [role]); // eslint-disable-line react-hooks/exhaustive-deps
  const fb = feedback(role);
  const offline = connection !== "online";
  const go = (next: Screen) => { clear(role); setScreen(next); };
  return (
    <div className={`field ${framed ? "field-framed" : ""}`}>
      <header className="field-head">
        <div className="field-who">
          <span className={`avatar ${role}`} aria-hidden="true">{PEOPLE[role].name[0]}</span>
          <div><strong>{PEOPLE[role].name}</strong><span>{PEOPLE[role].job} · demo person</span></div>
        </div>
        {onRole && (
          <div className="segmented" role="tablist" aria-label="Demo role">
            {(["operator", "technician"] as FieldRole[]).map((r) => (
              <button key={r} role="tab" aria-selected={role === r} className={role === r ? "is-on" : ""} onClick={() => onRole(r)}>{PEOPLE[r].job}</button>
            ))}
          </div>
        )}
      </header>
      {offline && <p className="field-banner warn">{connection === "loading" ? "Connecting …" : "Offline. You can read, but nothing can be sent right now."}</p>}
      {fb.error && (
        <div className="field-banner error" role="alert">
          <span>{fb.error}</span>
          {fb.signInNeeded && <SignInPrompt />}
          <button className="icon-btn" aria-label="Dismiss" onClick={() => clear(role)}><X size={16} /></button>
        </div>
      )}
      <div className="field-body">
        {!state ? <p className="muted">Loading water points …</p>
          : screen.kind === "done" ? <Done title={screen.title} text={screen.text} onBack={() => go({ kind: "home" })} />
          : role === "technician" ? <TechnicianJobs state={state} now={now} disabled={offline || fb.busy} />
          : screen.kind === "home" ? <OperatorHome state={state} now={now} offline={offline} onReport={(id) => go({ kind: "report", pointId: id, step: 1 })} onConfirm={(id) => go({ kind: "confirm", pointId: id, step: 1 })} />
          : screen.kind === "report" ? <ReportFlow key={screen.pointId} state={state} screen={screen} disabled={offline || fb.busy} go={go} />
          : <ConfirmFlow key={screen.pointId} state={state} screen={screen} disabled={offline || fb.busy} go={go} />}
      </div>
    </div>
  );
}

function Done({ title, text, onBack }: { title: string; text: string; onBack: () => void }) {
  return (
    <div className="field-done" role="status">
      <span className="done-mark"><Check size={34} strokeWidth={3} aria-hidden="true" /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="btn btn-primary btn-block" onClick={onBack}>Back to my water points</button>
    </div>
  );
}

function OperatorHome({ state, now, offline, onReport, onConfirm }: { state: State; now: number; offline: boolean; onReport: (id: string) => void; onConfirm: (id: string) => void }) {
  const [other, setOther] = useState("");
  const tracked = state.points.filter(isTracked), recorded = state.points.filter((p) => !isTracked(p));
  return (
    <>
      <h2 className="field-title">My water points</h2>
      <ul className="field-points">
        {tracked.map((p) => {
          const d = getPointDisplay(p, now, offline);
          const job = state.jobs.find((j) => j.pointId === p.id && j.status !== "closed");
          return (
            <li key={p.id}>
              <div className="field-point-top">
                <PointTile point={p} small />
                <div><strong>{p.name}</strong><span>{p.confirmedAt ? `Last check ${clock(p.confirmedAt)}, ${ago(p.confirmedAt, now)}` : "Never checked"}</span></div>
                <StatusChip display={d} size="sm" />
              </div>
              {job && <p className="field-job"><Wrench size={15} aria-hidden="true" />{JOB_STEP[job.status]}</p>}
              <div className="field-point-actions">
                <button className="btn btn-danger-soft" onClick={() => onReport(p.id)}><TriangleAlert size={18} aria-hidden="true" />Report a problem</button>
                <button className="btn btn-primary" onClick={() => onConfirm(p.id)}><ClipboardCheck size={18} aria-hidden="true" />Test and confirm</button>
              </div>
            </li>
          );
        })}
      </ul>
      {recorded.length > 0 && (
        <div className="field-other">
          <label htmlFor="other-point">Another recorded water point</label>
          <div className="field-other-row">
            <select id="other-point" value={other} onChange={(e) => setOther(e.target.value)}>
              <option value="">Choose a water point …</option>
              {recorded.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.location}</option>)}
            </select>
            <button className="btn btn-quiet" disabled={!other} onClick={() => onReport(other)}>Report</button>
          </div>
        </div>
      )}
    </>
  );
}

function StepHead({ point, step, of, title, onBack }: { point: WaterPoint; step: number; of: number; title: string; onBack: () => void }) {
  return (
    <div className="step-head">
      <button className="icon-btn" onClick={onBack} aria-label="Back"><ArrowLeft size={20} /></button>
      <div>
        <span className="step-count">Step {step} of {of} · {letter(point) ? `${letter(point)} · ` : ""}{point.name}</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function Choice({ selected, onClick, icon, title, text, tone, disabled }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; text: string; tone: string; disabled?: boolean }) {
  return (
    <button type="button" className={`choice ${tone} ${selected ? "is-on" : ""}`} aria-pressed={selected} onClick={onClick} disabled={disabled}>
      <span className="choice-icon">{icon}</span>
      <span><strong>{title}</strong><small>{text}</small></span>
    </button>
  );
}

type Recognition = { lang: string; interimResults: boolean; start(): void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void };
/** Browser dictation only fills the text; the person reviews it and chooses the status. */
function useDictation(onText: (text: string) => void) {
  const [supported, setSupported] = useState(false), [listening, setListening] = useState(false);
  const Ctor = () => { const w = window as unknown as Record<string, (new () => Recognition) | undefined>; return w.SpeechRecognition ?? w.webkitSpeechRecognition; };
  useEffect(() => setSupported(Boolean(Ctor())), []);
  function start() {
    const R = Ctor(); if (!R) return;
    const r = new R(); r.lang = "en-KE"; r.interimResults = false;
    r.onresult = (e) => { const text = Array.from(e.results).map((x) => x[0].transcript).join(" ").trim(); if (text) onText(text); };
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    setListening(true);
    try { r.start(); } catch { setListening(false); }
  }
  return { supported, listening, start };
}

const QUICK = ["No water comes out", "Water stops after a few pumps", "Handle is broken", "Pipe is leaking", "Long queue, very slow"];

function NoteField({ id, note, setNote, label, placeholder, quick }: { id: string; note: string; setNote: (fn: (n: string) => string) => void; label: string; placeholder: string; quick?: string[] }) {
  const dictation = useDictation((text) => setNote((n) => (n.trim() ? `${n.trim()} ` : "") + text));
  return (
    <div className="note-field">
      <label htmlFor={id}>{label}</label>
      {quick && (
        <div className="quick" aria-label="Quick phrases">
          {quick.map((q) => <button type="button" key={q} onClick={() => setNote((n) => (n.trim() ? `${n.trim().replace(/\.$/, "")}. ` : "") + q)}>{q}</button>)}
        </div>
      )}
      <textarea id={id} value={note} onChange={(e) => setNote(() => e.target.value)} maxLength={1000} placeholder={placeholder} />
      {dictation.supported && (
        <button type="button" className="btn btn-quiet btn-sm" disabled={dictation.listening} onClick={dictation.start}>
          <Mic size={16} aria-hidden="true" />{dictation.listening ? "Listening …" : "Speak instead"}
        </button>
      )}
      {dictation.supported && <small className="muted">Uses your browser’s speech service. Check the text before sending; it never sets the status.</small>}
    </div>
  );
}

function ReportFlow({ state, screen, disabled, go }: { state: State; screen: Extract<Screen, { kind: "report" }>; disabled: boolean; go: (s: Screen) => void }) {
  const { act } = useWaterLink();
  const point = state.points.find((p) => p.id === screen.pointId);
  const [status, setStatus] = useState<"down" | "limited" | null>(null);
  const [note, setNote] = useState(""), [onSite, setOnSite] = useState(false);
  if (!point) return <p className="muted">This water point no longer exists.</p>;
  const back = () => (screen.step === 1 ? go({ kind: "home" }) : go({ ...screen, step: 1 }));
  if (screen.step === 1) return (
    <div className="flow">
      <StepHead point={point} step={1} of={2} title="What do you see?" onBack={back} />
      <div className="choices">
        <Choice tone="down" selected={status === "down"} onClick={() => setStatus("down")} icon={<X size={26} strokeWidth={3} />} title="No water" text="Nobody can fetch water here." />
        <Choice tone="limit" selected={status === "limited"} onClick={() => setStatus("limited")} icon={<Droplet size={26} strokeWidth={2.6} />} title="Some water, with problems" text="Slow, little water or partly broken." />
      </div>
      <button className="btn btn-primary btn-block" disabled={!status} onClick={() => go({ ...screen, step: 2 })}>Next <ArrowRight size={18} aria-hidden="true" /></button>
    </div>
  );
  async function send() {
    if (!status || !point) return;
    if (await act("operator", { type: "report", pointId: point.id, status, note })) {
      go({ kind: "done", title: "Report sent", text: `Every screen now shows ${point.name} as ${status === "down" ? "not working" : "limited"}. A repair job is waiting for a technician.` });
    }
  }
  return (
    <div className="flow">
      <StepHead point={point} step={2} of={2} title="Tell us briefly" onBack={back} />
      <NoteField id="report-note" note={note} setNote={setNote} label="What is wrong?" placeholder="For example: no water after 20 pumps." quick={QUICK} />
      <label className="check">
        <input type="checkbox" checked={onSite} onChange={(e) => setOnSite(e.target.checked)} />
        <span>I am at the water point and saw this myself. <small>In this demo the visit is simulated.</small></span>
      </label>
      <button className="btn btn-danger btn-block" disabled={disabled || !onSite || note.trim().length < 3} onClick={send}>Send report <ArrowRight size={18} aria-hidden="true" /></button>
      <small className="muted">Nothing changes until the server confirms it.</small>
    </div>
  );
}

function ConfirmFlow({ state, screen, disabled, go }: { state: State; screen: Extract<Screen, { kind: "confirm" }>; disabled: boolean; go: (s: Screen) => void }) {
  const { act } = useWaterLink();
  const point = state.points.find((p) => p.id === screen.pointId);
  const job = state.jobs.find((j) => j.pointId === screen.pointId && j.status !== "closed");
  const canRestore = !job || job.status === "awaiting_confirmation";
  const [result, setResult] = useState<"working" | "limited" | "down" | null>(null);
  const [note, setNote] = useState(""), [tested, setTested] = useState(false);
  if (!point) return <p className="muted">This water point no longer exists.</p>;
  const back = () => (screen.step === 1 ? go({ kind: "home" }) : go({ ...screen, step: 1 }));
  if (screen.step === 1) return (
    <div className="flow">
      <StepHead point={point} step={1} of={2} title="Pump and test it. What happens?" onBack={back} />
      {job && <p className="field-job"><Wrench size={15} aria-hidden="true" />{JOB_STEP[job.status]}{!canRestore && ". “Works” is possible once the technician reports the repair."}</p>}
      <div className="choices">
        <Choice tone="ok" selected={result === "working"} disabled={!canRestore} onClick={() => setResult("working")} icon={<Check size={26} strokeWidth={3} />} title="Works" text="Water flows normally." />
        <Choice tone="limit" selected={result === "limited"} onClick={() => setResult("limited")} icon={<Droplet size={26} strokeWidth={2.6} />} title="Works, but limited" text="More work is needed." />
        <Choice tone="down" selected={result === "down"} onClick={() => setResult("down")} icon={<X size={26} strokeWidth={3} />} title="Still no water" text="The test failed." />
      </div>
      <button className="btn btn-primary btn-block" disabled={!result} onClick={() => go({ ...screen, step: 2 })}>Next <ArrowRight size={18} aria-hidden="true" /></button>
    </div>
  );
  async function send() {
    if (!result || !point) return;
    if (await act("operator", { type: "confirm", pointId: point.id, status: result, note, tested: true })) {
      go({ kind: "done", title: result === "working" ? "Confirmed working" : "Test result saved",
        text: result === "working" ? `${point.name} shows as working for the next 12 hours.${job ? " The repair job is closed." : ""}` : "The repair job stays open." });
    }
  }
  return (
    <div className="flow">
      <StepHead point={point} step={2} of={2} title="What did you test?" onBack={back} />
      <NoteField id="confirm-note" note={note} setNote={setNote} label="Your check" placeholder="For example: pumped 20 litres, steady flow." />
      <label className="check">
        <input type="checkbox" checked={tested} onChange={(e) => setTested(e.target.checked)} />
        <span>I tested it on site and confirm this result. <small>This is not a drinking-water quality test.</small></span>
      </label>
      <button className="btn btn-primary btn-block" disabled={disabled || !tested || note.trim().length < 3 || (result === "working" && !canRestore)} onClick={send}>
        Confirm result <Check size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

const STEPS: { key: string; label: string }[] = [
  { key: "report", label: "Reported" }, { key: "claim", label: "Claimed" }, { key: "start", label: "Work started" },
  { key: "repair", label: "Repaired" }, { key: "confirm", label: "Tested on site" },
];

/** Stamps for a job: nothing disappears, each step keeps its time. */
function jobStamps(job: Job, state: State): Record<string, string | null> {
  const events = state.events.filter((e) => e.jobId === job.id);
  const last = (type: string) => events.filter((e) => e.type === type).at(-1)?.at ?? null;
  const reached = ["open", "claimed", "in_progress", "awaiting_confirmation", "closed"].indexOf(job.status);
  return {
    report: job.createdAt,
    claim: reached >= 1 ? last("claim") : null,
    start: reached >= 2 ? last("start") ?? last("progress") : null,
    repair: reached >= 3 ? job.repairedAt : null,
    confirm: reached >= 4 ? job.closedAt : null,
  };
}

function TechnicianJobs({ state, now, disabled }: { state: State; now: number; disabled: boolean }) {
  const active = state.jobs.filter((j) => j.status !== "closed").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const closed = state.jobs.filter((j) => j.status === "closed").sort((a, b) => (b.closedAt ?? "").localeCompare(a.closedAt ?? "")).slice(0, 3);
  return (
    <>
      <h2 className="field-title">Repair jobs</h2>
      {!active.length && (
        <div className="field-empty">
          <Droplets size={30} aria-hidden="true" />
          <strong>No open repairs.</strong>
          <p>When an operator reports a problem, the job appears here.</p>
        </div>
      )}
      <ul className="coupons">
        {active.map((job) => <JobCoupon key={job.id} job={job} state={state} now={now} disabled={disabled} />)}
        {closed.map((job) => <JobCoupon key={job.id} job={job} state={state} now={now} disabled />)}
      </ul>
    </>
  );
}

function JobCoupon({ job, state, now, disabled }: { job: Job; state: State; now: number; disabled: boolean }) {
  const { act, actor } = useWaterLink();
  const point = state.points.find((p) => p.id === job.pointId);
  const [note, setNote] = useState(""), [blocker, setBlocker] = useState<Blocker>(job.blocker), [writing, setWriting] = useState(false);
  const stamps = jobStamps(job, state);
  const me = actor("technician")?.id ?? "demo-technician";
  const mine = job.assignedTo === me;
  const closed = job.status === "closed";
  const nextIndex = STEPS.findIndex((s) => !stamps[s.key]);
  async function save(kind: "progress" | "repair") {
    const ok = kind === "progress" ? await act("technician", { type: "progress", jobId: job.id, note, blocker }) : await act("technician", { type: "repair", jobId: job.id, note });
    if (ok) { setNote(""); setWriting(false); }
  }
  return (
    <li className={`coupon ${closed ? "is-closed" : ""}`}>
      <div className="coupon-head">
        <PointTile point={point} small />
        <div><strong>{point?.name ?? "Water point"}</strong><span>Job {job.id.replace("job-", "#")} · reported {ago(job.createdAt, now)}</span></div>
        {job.blocker && !closed && <span className="tag tag-limit">{BLOCKER[job.blocker]}</span>}
      </div>
      <p className="coupon-note">“{job.note}”</p>
      <ol className="stamps">
        {STEPS.map((s, i) => (
          <li key={s.key} className={stamps[s.key] ? "is-done" : i === nextIndex && !closed ? "is-next" : ""}>
            <span className="stamp-dot" aria-hidden="true">{stamps[s.key] ? <Check size={13} strokeWidth={3.2} /> : null}</span>
            <span className="stamp-label">{s.label}</span>
            <span className="stamp-time">{stamps[s.key] ? clock(stamps[s.key]) : ""}</span>
          </li>
        ))}
      </ol>
      {closed ? <p className="coupon-closed">Closed {stamp(job.closedAt)} after the operator’s test.</p> : (
        <div className="coupon-actions">
          {job.status === "open" && <button className="btn btn-primary btn-block" disabled={disabled} onClick={() => act("technician", { type: "claim", jobId: job.id })}>I’ll take this job <ArrowRight size={18} aria-hidden="true" /></button>}
          {job.status === "claimed" && <button className="btn btn-primary btn-block" disabled={disabled || !mine} onClick={() => act("technician", { type: "start", jobId: job.id })}>I’m at the site, start work <Wrench size={18} aria-hidden="true" /></button>}
          {(job.status === "claimed" || job.status === "in_progress") && mine && !writing && (
            <div className="coupon-row">
              <button className="btn btn-quiet" disabled={disabled} onClick={() => setWriting(true)}>Add a note or blocker</button>
              {job.status === "in_progress" && <button className="btn btn-primary" disabled={disabled} onClick={() => setWriting(true)}>Report repair <ClipboardCheck size={18} aria-hidden="true" /></button>}
            </div>
          )}
          {writing && (
            <div className="coupon-write">
              <NoteField id={`note-${job.id}`} note={note} setNote={setNote} label="What did you do? What is missing?" placeholder="For example: replaced the cup seal, tested 10 litres." />
              <fieldset className="blockers">
                <legend>Is something blocking the repair?</legend>
                {([null, "parts", "funding", "staff"] as Blocker[]).map((b) => (
                  <label key={b ?? "none"} className={blocker === b ? "is-on" : ""}>
                    <input type="radio" name={`blocker-${job.id}`} checked={blocker === b} onChange={() => setBlocker(b)} />{b ? BLOCKER[b] : "Nothing"}
                  </label>
                ))}
              </fieldset>
              <div className="coupon-row">
                <button className="btn btn-quiet" disabled={disabled || note.trim().length < 3} onClick={() => save("progress")}>Save note</button>
                {job.status === "in_progress" && <button className="btn btn-primary" disabled={disabled || note.trim().length < 3} onClick={() => save("repair")}>Repaired, ask for test</button>}
              </div>
            </div>
          )}
          {job.status === "awaiting_confirmation" && <p className="coupon-wait">Waiting for the operator to test the water point. Until then the public board does not show it as working.</p>}
          {job.status === "claimed" && !mine && <p className="muted">Claimed by {job.assignedName}.</p>}
        </div>
      )}
    </li>
  );
}
