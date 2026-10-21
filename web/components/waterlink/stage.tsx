"use client";
import { useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import type { State } from "@/lib/domain";
import { useWaterLink } from "./store";
import { SignInPrompt } from "./signin";
import { FieldApp } from "./field";
import { DisplayBoard } from "./board";
import { CanMark } from "./marks";
import { SmsPhone } from "./sms";

const SCRIPT = [
  { who: "Amina", text: "reports that A has no water" },
  { who: "Daniel", text: "takes the repair job" },
  { who: "Daniel", text: "starts work and reports the repair" },
  { who: "Amina", text: "tests A on site and confirms it works" },
];

/** How far the three-minute story has come, read from the shared state for water point A. */
function progress(state: State | null): number {
  const job = state?.jobs.filter((j) => j.pointId === "a").sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1);
  if (!job) return 0;
  return { open: 1, claimed: 2, in_progress: 2, awaiting_confirmation: 3, closed: 4 }[job.status];
}

/** Pitch view: both phones and the public board on one screen, all live on the same server state. */
export function Stage() {
  const { state, now, connection, lastSync, act, feedback } = useWaterLink();
  const [confirmReset, setConfirmReset] = useState(false);
  const [third, setThird] = useState<"board" | "sms">("board");
  const step = progress(state);
  const offline = connection !== "online";
  const coord = feedback("coordinator");
  return (
    <div className="stage">
      <h1 className="sr-only">WaterLink pitch stage: both phones and the public board on one screen</h1>
      <header className="stage-head">
        <div className="stage-brand"><CanMark size={30} /><span>WaterLink</span><small>Live demo · Marachi East, Busia</small></div>
        <ol className="stage-script" aria-label="Demo steps">
          {SCRIPT.map((s, i) => (
            <li key={s.text} className={i < step ? "is-done" : i === step ? "is-next" : ""} aria-current={i === step ? "step" : undefined}>
              <span className="stage-num">{i < step ? <Check size={14} strokeWidth={3.2} /> : i + 1}</span>
              <span><b>{s.who}</b> {s.text}</span>
            </li>
          ))}
        </ol>
        <div className="stage-reset">
          {confirmReset ? (
            <>
              <button className="btn btn-danger btn-sm" disabled={coord.busy || offline} onClick={async () => { if (await act("coordinator", { type: "reset" })) setConfirmReset(false); }}>Reset now</button>
              <button className="btn btn-quiet btn-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
            </>
          ) : <button className="btn btn-quiet btn-sm" onClick={() => setConfirmReset(true)}><RefreshCw size={15} />Reset demo</button>}
        </div>
      </header>
      {coord.error && (
        <p className="stage-error" role="alert">{coord.error}
          {coord.signInNeeded && <SignInPrompt />}
        </p>
      )}
      <div className="stage-floor">
        <section className="stage-phone" aria-label="Amina’s phone, operator">
          <div className="phone"><FieldApp role="operator" framed /></div>
          <p className="stage-caption">Amina looks after the boreholes</p>
        </section>
        <section className="stage-phone" aria-label="Daniel’s phone, technician">
          <div className="phone"><FieldApp role="technician" framed /></div>
          <p className="stage-caption">Daniel repairs them</p>
        </section>
        <section className="stage-board" data-show={third} aria-label="Public board and basic phone">
          <div className="segmented stage-switch" role="tablist" aria-label="Third screen">
            <button role="tab" aria-selected={third === "board"} className={third === "board" ? "is-on" : ""} onClick={() => setThird("board")}>Shop board</button>
            <button role="tab" aria-selected={third === "sms"} className={third === "sms" ? "is-on" : ""} onClick={() => setThird("sms")}>Basic phone (SMS)</button>
          </div>
          <div className="stage-third">
            <div className="stage-board-unit">
              <div className="stage-screen">{state && <DisplayBoard state={state} now={now} offline={offline} lastSync={lastSync} compact />}</div>
              <p className="stage-caption">The board at the shop, for everyone without a smartphone</p>
            </div>
            <div className="stage-sms-unit">
              <div className="basic-phone"><SmsPhone framed /></div>
              <p className="stage-caption">A basic phone, by SMS (simulated)</p>
            </div>
          </div>
        </section>
      </div>
      <footer className="stage-foot">Demo: people and confirmations are simulated · places from WPdx surveys, roads © OpenStreetMap contributors · “working” is not a water-quality claim</footer>
    </div>
  );
}
