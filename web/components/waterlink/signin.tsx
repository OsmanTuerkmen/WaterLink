"use client";
import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, KeyRound } from "lucide-react";
import { useWaterLink } from "./store";

/** Shown when an action needs sign-in: the platform link on Sites, a demo access code when self-hosted. */
export function SignInPrompt() {
  const { authMode, unlock } = useWaterLink();
  const codeId = useId();
  const [code, setCode] = useState(""), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  if (authMode !== "code") {
    const back = typeof location === "undefined" ? "/" : location.pathname + location.search + location.hash;
    return <a className="link" href={`/signin-with-chatgpt?return_to=${encodeURIComponent(back)}`} target="_top">Sign in for the demo <ArrowUpRight size={15} aria-hidden="true" /></a>;
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const error = await unlock(code);
    setBusy(false);
    setMessage(error);
    if (!error) setCode("");
  }
  return (
    <form className="unlock" onSubmit={submit}>
      <label htmlFor={codeId}><KeyRound size={16} aria-hidden="true" />Demo access code</label>
      <div>
        <input id={codeId} type="password" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} required />
        <button className="btn btn-primary btn-sm" disabled={busy || code.trim().length < 4}>Unlock</button>
      </div>
      {message && <small role="alert">{message}</small>}
    </form>
  );
}
