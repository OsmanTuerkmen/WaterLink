"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { parseSms, smsCommand, smsParts, smsReply } from "@/lib/sms";
import { useWaterLink } from "./store";
import { clock } from "./format";
import { SignInPrompt } from "./signin";

type Sender = "household" | "operator";
type Message = { id: number; from: "me" | "wl"; text: string; at: number };

const QUICK: Record<Sender, string[]> = {
  household: ["STATUS", "A", "B", "C", "HELP"],
  operator: ["STATUS", "DOWN A no water", "OK A pumped 20 litres", "FAIL A still no water"],
};
const STORE = (s: Sender) => `waterlink-sms-v1-${s}`;

/**
 * A basic phone that texts WaterLink. Simulated: nothing leaves the browser except the
 * operator's commands, which go through the same server rules as the app.
 */
export function SmsPhone({ framed = false, initialSender = "household" }: { framed?: boolean; initialSender?: Sender }) {
  const { state, now, connection, act, lastError, feedback } = useWaterLink();
  const [sender, setSender] = useState<Sender>(initialSender);
  const [threads, setThreads] = useState<Record<Sender, Message[]>>({ household: [], operator: [] });
  const [text, setText] = useState(""), [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<string | null>(null), [tested, setTested] = useState(false);
  const counter = useRef(0), list = useRef<HTMLOListElement>(null);
  const renderedAt = useRef(0);
  useEffect(() => { renderedAt.current = Date.now(); }, [now]);

  useEffect(() => {
    try {
      const restored = { household: JSON.parse(sessionStorage.getItem(STORE("household")) || "[]"), operator: JSON.parse(sessionStorage.getItem(STORE("operator")) || "[]") };
      counter.current = Math.max(0, ...[...restored.household, ...restored.operator].map((m: Message) => m.id)) + 1;
      setThreads(restored); // eslint-disable-line react-hooks/set-state-in-effect
    } catch { /* A fresh thread is fine. */ }
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(STORE(sender), JSON.stringify(threads[sender].slice(-40))); } catch { /* optional */ }
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [threads, sender]);

  const push = (who: Sender, from: Message["from"], body: string) =>
    setThreads((all) => ({ ...all, [who]: [...all[who], { id: counter.current++, from, text: body, at: Date.now() }] }));

  async function send(body: string, testConfirmed = false) {
    const message = body.trim();
    if (!message || !state || busy) return;
    const who = sender;
    const intent = parseSms(message);
    // A quick example is a draft, never evidence that a physical test happened.
    if (who === "operator" && intent.kind === "confirm" && !testConfirmed) {
      const draft = smsCommand(state, intent, true);
      if ("error" in draft) { push(who, "wl", draft.error); return; }
      setPending(message); setTested(false);
      return;
    }
    push(who, "me", message);
    setText("");
    if (intent.kind === "report" || intent.kind === "confirm") {
      if (who !== "operator") { push(who, "wl", "Only registered operators can report by SMS. Text STATUS to see the water points."); return; }
      const command = smsCommand(state, intent, testConfirmed);
      if ("error" in command) { push(who, "wl", command.error); return; }
      if (connection !== "online") { push(who, "wl", "Not delivered: no connection. Your SMS will not be retried in this demo."); return; }
      setBusy(true);
      const ok = await act("operator", command);
      setBusy(false);
      if (ok) { setPending(null); setTested(false); }
      else setText(message);
      const ref = intent.ref.toUpperCase();
      push(who, "wl", ok
        ? intent.kind === "report"
          ? `Thanks Amina. ${ref} is now shown as ${intent.status === "down" ? "NOT WORKING" : "LIMITED"}. The repair job is recorded or updated.`
          : intent.status === "working" ? `Thanks Amina. ${ref} is confirmed WORKING for the next 12 hours.` : `Thanks Amina. Test result for ${ref} saved; the repair job stays open.`
        : `Not saved: ${lastError("operator") || "please try again."}`);
      return;
    }
    // Replies are computed from the last synced state, like an SMS gateway reading the database.
    // `now` ticks every 15 s; the reply carries the moment it is sent, shifted by the server clock offset.
    const sentAt = Date.now() + (now - renderedAt.current);
    push(who, "wl", smsReply(state, intent, sentAt, connection !== "online"));
  }

  const submit = (e: FormEvent) => { e.preventDefault(); void send(text); };
  const thread = threads[sender];
  return (
    <div className={`sms ${framed ? "sms-framed" : ""}`}>
      <div className="sms-top">
        <div><strong>WaterLink</strong><span>SMS · simulated, nothing is sent</span></div>
        <div className="segmented sms-who" role="tablist" aria-label="Who is texting">
          <button role="tab" disabled={busy} aria-selected={sender === "household"} className={sender === "household" ? "is-on" : ""} onClick={() => { setSender("household"); setPending(null); }}>Household</button>
          <button role="tab" disabled={busy} aria-selected={sender === "operator"} className={sender === "operator" ? "is-on" : ""} onClick={() => setSender("operator")}>Amina</button>
        </div>
      </div>
      <ol className="sms-thread" ref={list} aria-live="polite">
        {!thread.length && <li className="sms-empty">{sender === "household" ? "No smartphone? Text STATUS to see every water point, or a letter for one." : "Amina is the registered operator. She can report and confirm by SMS."}</li>}
        {thread.map((m) => (
          <li key={m.id} className={`sms-msg ${m.from}`}>
            <p>{m.text}</p>
            <small>{clock(m.at)}{m.from === "wl" && smsParts(m.text) > 1 ? ` · ${smsParts(m.text)} SMS` : ""}</small>
          </li>
        ))}
        {busy && <li className="sms-msg wl is-typing"><p>…</p></li>}
      </ol>
      {sender === "operator" && feedback("operator").signInNeeded && <div className="sms-review"><SignInPrompt /></div>}
      {pending && sender === "operator" && (
        <section className="sms-review" aria-label="Review on-site test">
          <strong>Review before saving</strong>
          <p>{pending}</p>
          <label className="check"><input type="checkbox" checked={tested} onChange={(e) => setTested(e.target.checked)} />
            <span>I tested this water point on site and confirm this result. This is not a drinking-water quality test. In this demo the test is simulated.</span>
          </label>
          <button className="btn btn-primary" disabled={!tested || busy || connection !== "online"} onClick={() => void send(pending, tested)}>Confirm test and send</button>
          <button className="btn btn-quiet" disabled={busy} onClick={() => { setPending(null); setTested(false); }}>Cancel</button>
        </section>
      )}
      <div className="sms-quick" aria-label="Example messages">
        {QUICK[sender].map((q) => <button key={q} type="button" onClick={() => void send(q)} disabled={busy || !state}>{q}</button>)}
      </div>
      <form className="sms-compose" onSubmit={submit}>
        <label htmlFor={`sms-${sender}`} className="sr-only">Message</label>
        <input id={`sms-${sender}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={160} placeholder="Type a message" autoComplete="off" />
        <button className="icon-btn sms-send" disabled={!text.trim() || busy} aria-label="Send"><Send size={18} /></button>
      </form>
    </div>
  );
}

/** Full page: the phone and the commands it understands. */
export function SmsPage() {
  return (
    <div className="sms-page">
      <div className="sms-device"><SmsPhone /></div>
      <aside className="sms-aside">
        <h1>For phones without internet</h1>
        <p>A phone with text messaging could provide another way to check a water point or report a problem. This browser simulation explores that flow; an SMS provider is not connected. The public board remains essential for people without a phone.</p>
        <table className="table sms-commands">
          <thead><tr><th scope="col">Text</th><th scope="col">Who</th><th scope="col">Reply</th></tr></thead>
          <tbody>
            <tr><td><code>STATUS</code></td><td>Anyone</td><td>All water points in one SMS</td></tr>
            <tr><td><code>A</code></td><td>Anyone</td><td>One point, with where to go instead</td></tr>
            <tr><td><code>DOWN A …</code></td><td>Operator</td><td>Reports a problem, creates a repair job</td></tr>
            <tr><td><code>OK A …</code></td><td>Operator</td><td>Review and explicitly confirm an on-site test</td></tr>
            <tr><td><code>FAIL A …</code></td><td>Operator</td><td>Test failed, the job stays open</td></tr>
          </tbody>
        </table>
        <p className="muted">Simulated: no SMS provider is connected and no message leaves this page. Operator commands go through the same rules as the app; a repair still has to be reported before “OK”. Swahili keywords HALI and MSAADA also work.</p>
      </aside>
    </div>
  );
}
