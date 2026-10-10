"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Actor, Command, Role, State } from "@/lib/domain";

export type Mutation = Command | { type: "reset" };
type Session = { token: string; actor: Actor; expiresAt: string };
type Snapshot = { state: State; serverNow: string };
const CACHE = "waterlink-snapshot-v1", SESSION = "waterlink-session-v1";
const valid = (s: State) => s && Number.isSafeInteger(s.revision) && Array.isArray(s.points) && Array.isArray(s.jobs) && Array.isArray(s.events);

export function useWaterLink() {
  const [state, setState] = useState<State | null>(null);
  const current = useRef<State | null>(null);
  const [connection, setConnection] = useState<"loading" | "online" | "offline">("loading");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const offset = useRef(0);
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [roleBusy, setRoleBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [signInNeeded, setSignInNeeded] = useState(false);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const simulated = useRef(false), fetching = useRef(false), writeBusy = useRef(false);
  const active = useRef<AbortController | null>(null);
  const ids = useRef(new Map<string, string>());

  const accept = useCallback((data: Snapshot) => {
    if (!valid(data.state) || !Number.isFinite(Date.parse(data.serverNow))) throw new Error("Ungültige Serverantwort.");
    if (current.current && data.state.revision < current.current.revision) return;
    const stamp = new Date().toISOString();
    offset.current = Date.parse(data.serverNow) - Date.now();
    current.current = data.state; setState(data.state); setNow(Date.now() + offset.current);
    setLastSync(stamp); setConnection("online");
    try { localStorage.setItem(CACHE, JSON.stringify({ state: data.state, stamp, offset: offset.current })); } catch { /* Cache is optional. */ }
  }, []);

  const refresh = useCallback(async () => {
    if (simulated.current || fetching.current) return;
    fetching.current = true;
    const controller = new AbortController(); active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const r = await fetch("/api/waterlink", { cache: "no-store", signal: controller.signal });
      if (!r.ok) throw new Error("Nicht erreichbar");
      const data = await r.json() as Snapshot; if (!simulated.current) accept(data);
    } catch { setConnection("offline"); }
    finally { clearTimeout(timeout); active.current = null; fetching.current = false; }
  }, [accept]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CACHE) || "null");
      if (saved && valid(saved.state)) { current.current = saved.state; setState(saved.state); setLastSync(saved.stamp); offset.current = Number.isFinite(saved.offset) ? saved.offset : 0; setConnection("offline"); }
      const s = JSON.parse(sessionStorage.getItem(SESSION) || "null");
      if (s?.token && s.actor && Date.parse(s.expiresAt) > Date.now()) setSession(s);
    } catch { /* Invalid storage is discarded. */ }
    void refresh();
    const poll = setInterval(() => void refresh(), 3000);
    const clock = setInterval(() => setNow(Date.now() + offset.current), 15000);
    const online = () => void refresh();
    const offline = () => { active.current?.abort(); setConnection("offline"); };
    const visible = () => { setNow(Date.now() + offset.current); if (!document.hidden) void refresh(); };
    window.addEventListener("online", online); window.addEventListener("offline", offline); document.addEventListener("visibilitychange", visible);
    return () => { clearInterval(poll); clearInterval(clock); active.current?.abort(); window.removeEventListener("online", online); window.removeEventListener("offline", offline); document.removeEventListener("visibilitychange", visible); };
  }, [refresh]);

  function toggleOffline() {
    simulated.current = !simulated.current; setSimulatedOffline(simulated.current);
    if (simulated.current) { active.current?.abort(); setConnection("offline"); }
    else { setConnection("loading"); void refresh(); }
  }
  async function chooseRole(role: Role) {
    setRoleBusy(true); setError(""); setNotice("");
    try {
      const r = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }), signal: AbortSignal.timeout(10000) });
      const d = await r.json() as Session & { error?: string };
      if (!r.ok) { if (r.status === 401) setSignInNeeded(true); throw new Error(d.error); }
      setSession(d); setSignInNeeded(false);
      try { sessionStorage.setItem(SESSION, JSON.stringify(d)); } catch { /* In-memory session still works. */ }
      setNotice(`Demo-Rolle aktiv: ${d.actor.name}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Rolle konnte nicht gewählt werden."); }
    finally { setRoleBusy(false); }
  }
  async function mutate(command: Mutation): Promise<boolean> {
    if (!session || !current.current || connection !== "online" || writeBusy.current) return false;
    writeBusy.current = true; setBusy(true); setError(""); setNotice("");
    const key = JSON.stringify(command), requestId = ids.current.get(key) || crypto.randomUUID();
    ids.current.set(key, requestId);
    try {
      const r = await fetch("/api/waterlink", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ command, expectedRevision: current.current.revision, requestId }), signal: AbortSignal.timeout(10000) });
      const d = await r.json() as Snapshot & { error?: string };
      if (!r.ok) {
        ids.current.delete(key);
        if (r.status === 401) { setSession(null); setSignInNeeded(true); try { sessionStorage.removeItem(SESSION); } catch {} }
        if (r.status === 409) void refresh();
        throw new Error(d.error || "Nicht gespeichert.");
      }
      ids.current.delete(key); accept(d); setNotice("Gespeichert. Die öffentliche Anzeige aktualisiert sich automatisch."); return true;
    } catch (e) {
      const network = e instanceof Error && ["TimeoutError", "AbortError", "TypeError"].includes(e.name);
      if (network) { setConnection("offline"); setError("Keine Speicherbestätigung erhalten. Dein Entwurf bleibt erhalten. Nach erneuter Verbindung bitte den Stand prüfen und gegebenenfalls erneut speichern."); }
      else setError(e instanceof Error ? e.message : "Nicht gespeichert. Bitte erneut versuchen.");
      return false;
    } finally { writeBusy.current = false; setBusy(false); }
  }
  return { state, connection, lastSync, now, session, busy, roleBusy, error, notice, signInNeeded, simulatedOffline, toggleOffline, refresh, chooseRole, mutate, clearMessages: () => { setError(""); setNotice(""); } };
}
