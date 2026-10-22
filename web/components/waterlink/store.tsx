"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Actor, Command, Role, State } from "@/lib/domain";

export type Mutation = Command | { type: "reset" };
type Session = { token: string; actor: Actor; expiresAt: string };
type Snapshot = { state: State; serverNow: string };
type Unchanged = { unchanged: true; revision: number; serverNow: string };
export type Connection = "loading" | "online" | "offline";
export interface RoleFeedback { busy: boolean; error: string; notice: string; signInNeeded: boolean }

interface Store {
  state: State | null;
  connection: Connection;
  lastSync: string | null;
  now: number;
  simulatedOffline: boolean;
  toggleOffline(): void;
  refresh(): Promise<void>;
  actor(role: Role): Actor | null;
  feedback(role: Role): RoleFeedback;
  /** Runs a command as the given demo role, creating that role’s session on first use. */
  act(role: Role, command: Mutation): Promise<boolean>;
  /** The error of the role's last failed action, read right after `act` resolves. */
  lastError(role: Role): string;
  clear(role: Role): void;
  /** "code" on a self-hosted deployment that unlocks changes with a shared demo access code. */
  authMode: "sites" | "code";
  /** Redeems the demo access code; resolves to an error message, or "" on success. */
  unlock(code: string): Promise<string>;
}

const SESSION = (role: Role) => `waterlink-session-v2-${role}`;
const ROLES: Role[] = ["operator", "technician", "coordinator"];
const IDLE: RoleFeedback = { busy: false, error: "", notice: "", signInNeeded: false };
const validState = (s: State | undefined | null): s is State =>
  Boolean(s && Number.isSafeInteger(s.revision) && Array.isArray(s.points) && Array.isArray(s.jobs) && Array.isArray(s.events));

const Context = createContext<Store | null>(null);

export function useWaterLink(): Store {
  const store = useContext(Context);
  if (!store) throw new Error("useWaterLink needs a WaterLinkProvider.");
  return store;
}

function readSavedSessions(): Partial<Record<Role, Session>> {
  const restored: Partial<Record<Role, Session>> = {};
  try {
    for (const role of ROLES) {
      const s = JSON.parse(sessionStorage.getItem(SESSION(role)) || "null");
      if (s?.token && s.actor?.role === role && Date.parse(s.expiresAt) > Date.now()) restored[role] = s;
    }
  } catch { /* Invalid storage is discarded. */ }
  return restored;
}

/**
 * `initial` is the state the server read for the first HTML. Starting from it (clock included) makes the browser's first
 * render identical to the server's; the first request then checks whether anything changed in the meantime.
 */
export function WaterLinkProvider({ children, initial = null }: { children: ReactNode; initial?: { state: State; serverNow: string } | null }) {
  const [state, setState] = useState<State | null>(initial?.state ?? null);
  const current = useRef<State | null>(initial?.state ?? null);
  const [connection, setConnection] = useState<Connection>(initial ? "online" : "loading");
  const [lastSync, setLastSync] = useState<string | null>(initial?.serverNow ?? null);
  const [now, setNow] = useState(() => (initial ? Date.parse(initial.serverNow) : Date.now()));
  const offset = useRef(0);
  const [sessions, setSessions] = useState<Partial<Record<Role, Session>>>(readSavedSessions);
  const sessionRef = useRef<Partial<Record<Role, Session>>>(sessions);
  const [feedback, setFeedback] = useState<Record<Role, RoleFeedback>>({ operator: IDLE, technician: IDLE, coordinator: IDLE });
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [authMode, setAuthMode] = useState<"sites" | "code">("sites");
  const simulated = useRef(false), fetching = useRef(false), writing = useRef(false), syncedAtMs = useRef(0);
  const active = useRef<AbortController | null>(null);
  const requestIds = useRef(new Map<string, string>());
  const lastErrors = useRef<Partial<Record<Role, string>>>({});

  const patch = useCallback((role: Role, value: Partial<RoleFeedback>) => {
    if (value.error !== undefined) lastErrors.current[role] = value.error;
    setFeedback((all) => ({ ...all, [role]: { ...all[role], ...value } }));
  }, []);

  const accept = useCallback((data: Snapshot) => {
    if (!validState(data.state) || !Number.isFinite(Date.parse(data.serverNow))) throw new Error("Invalid server answer.");
    if (current.current && data.state.revision < current.current.revision) return;
    const syncedAt = new Date().toISOString();
    offset.current = Date.parse(data.serverNow) - Date.now();
    current.current = data.state;
    syncedAtMs.current = Date.now();
    setState(data.state);
    setNow(Date.now() + offset.current);
    setLastSync(syncedAt);
    setConnection("online");
  }, []);

  /** Same revision as before: only the clock offset and, once in a while, the sync time move. */
  const confirmUnchanged = useCallback((data: Unchanged) => {
    if (!current.current || current.current.revision !== data.revision || !Number.isFinite(Date.parse(data.serverNow))) throw new Error("Invalid server answer.");
    const nowMs = Date.now();
    offset.current = Date.parse(data.serverNow) - nowMs;
    setConnection("online");
    // Nothing on screen changed, so skip re-rendering every consumer: the clock has its own 15 s tick, and
    // "last synced" is only shown to the minute. Update it every 30 s.
    if (nowMs - syncedAtMs.current > 30_000) {
      syncedAtMs.current = nowMs;
      setLastSync(new Date(nowMs).toISOString());
    }
  }, []);

  const refresh = useCallback(async () => {
    if (simulated.current || fetching.current) return;
    fetching.current = true;
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const since = current.current ? `?since=${current.current.revision}` : "";
      const response = await fetch(`/api/waterlink${since}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Unreachable");
      const data = (await response.json()) as Snapshot | Unchanged;
      if (!simulated.current) {
        if ("unchanged" in data) confirmUnchanged(data); else accept(data);
      }
    } catch {
      setConnection("offline");
    } finally {
      clearTimeout(timeout);
      active.current = null;
      fetching.current = false;
    }
  }, [accept, confirmUnchanged]);

  useEffect(() => {
    fetch("/api/access", { cache: "no-store" }).then((r) => r.json() as Promise<{ mode?: string }>).then((d) => { if (d?.mode === "code") setAuthMode("code"); }).catch(() => {});
    // Right after the page has loaded the clock jumps from the server's render time to the real one.
    const first = setTimeout(() => { setNow(Date.now()); void refresh(); }, 0);
    // A hidden tab stops asking; it catches up as soon as it is shown again (see `visible`).
    const poll = setInterval(() => { if (!document.hidden) void refresh(); }, 3000);
    const tick = setInterval(() => setNow(Date.now() + offset.current), 15_000);
    const online = () => void refresh();
    const offline = () => { active.current?.abort(); setConnection("offline"); };
    const visible = () => { setNow(Date.now() + offset.current); if (!document.hidden) void refresh(); };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearTimeout(first); clearInterval(poll); clearInterval(tick); active.current?.abort();
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);

  const toggleOffline = useCallback(() => {
    simulated.current = !simulated.current;
    setSimulatedOffline(simulated.current);
    if (simulated.current) { active.current?.abort(); setConnection("offline"); }
    else { setConnection("loading"); void refresh(); }
  }, [refresh]);

  const forget = useCallback((role: Role) => {
    const next = { ...sessionRef.current };
    delete next[role];
    sessionRef.current = next;
    setSessions(next);
    try { sessionStorage.removeItem(SESSION(role)); } catch { /* ignore */ }
  }, []);

  const ensureSession = useCallback(async (role: Role): Promise<Session> => {
    const existing = sessionRef.current[role];
    if (existing && Date.parse(existing.expiresAt) > Date.now() + 60_000) return existing;
    const response = await fetch("/api/session", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }), signal: AbortSignal.timeout(10_000),
    });
    const data = (await response.json()) as Session & { error?: string };
    if (!response.ok) {
      if (response.status === 401) patch(role, { signInNeeded: true });
      throw new Error(data.error || "The demo role could not be started.");
    }
    sessionRef.current = { ...sessionRef.current, [role]: data };
    setSessions(sessionRef.current);
    try { sessionStorage.setItem(SESSION(role), JSON.stringify(data)); } catch { /* In-memory session still works. */ }
    return data;
  }, [patch]);

  const act = useCallback(async (role: Role, command: Mutation): Promise<boolean> => {
    if (!current.current || simulated.current || writing.current) return false;
    writing.current = true;
    patch(role, { busy: true, error: "", notice: "" });
    const key = `${role}:${JSON.stringify(command)}`;
    const requestId = requestIds.current.get(key) || crypto.randomUUID();
    requestIds.current.set(key, requestId);
    try {
      const session = await ensureSession(role);
      const response = await fetch("/api/waterlink", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ command, expectedRevision: current.current.revision, requestId }),
        signal: AbortSignal.timeout(10_000),
      });
      const data = (await response.json()) as Snapshot & { error?: string; code?: string };
      if (!response.ok) {
        requestIds.current.delete(key);
        if (response.status === 401) {
          forget(role);
          if (data.code === "sign_in_required") patch(role, { signInNeeded: true });
        }
        if (response.status === 409) void refresh();
        throw new Error(data.error || "Not saved.");
      }
      requestIds.current.delete(key);
      accept(data);
      patch(role, { notice: "Saved. Every screen updates within a few seconds.", signInNeeded: false });
      return true;
    } catch (error) {
      const network = error instanceof Error && ["TimeoutError", "AbortError", "TypeError"].includes(error.name);
      if (network) {
        setConnection("offline");
        patch(role, { error: "No confirmation from the server. Your text is kept. Check the latest state once you are back online, then send again." });
      } else {
        patch(role, { error: error instanceof Error ? error.message : "Not saved. Please try again." });
      }
      return false;
    } finally {
      writing.current = false;
      patch(role, { busy: false });
    }
  }, [accept, ensureSession, forget, patch, refresh]);

  const unlock = useCallback(async (code: string): Promise<string> => {
    try {
      const response = await fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }), signal: AbortSignal.timeout(10_000) });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) return data.error || "Could not unlock the demo.";
      for (const role of ROLES) patch(role, { signInNeeded: false, error: "" });
      return "";
    } catch {
      return "No connection. Please try again.";
    }
  }, [patch]);

  const value = useMemo<Store>(() => ({
    state, connection, lastSync, now, simulatedOffline, toggleOffline, refresh, act, authMode, unlock,
    actor: (role) => sessions[role]?.actor ?? null,
    lastError: (role) => lastErrors.current[role] ?? "",
    feedback: (role) => feedback[role],
    clear: (role) => patch(role, { error: "", notice: "" }),
  }), [state, connection, lastSync, now, simulatedOffline, toggleOffline, refresh, act, authMode, unlock, sessions, feedback, patch]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
