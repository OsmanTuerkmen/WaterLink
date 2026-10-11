"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Actor, Command, Role, State } from "@/lib/domain";

export type Mutation = Command | { type: "reset" };
type Session = { token: string; actor: Actor; expiresAt: string };
type Snapshot = { state: State; serverNow: string };
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
  clear(role: Role): void;
}

const CACHE = "waterlink-snapshot-v2";
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

export function WaterLinkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null);
  const current = useRef<State | null>(null);
  const [connection, setConnection] = useState<Connection>("loading");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const offset = useRef(0);
  const [sessions, setSessions] = useState<Partial<Record<Role, Session>>>({});
  const sessionRef = useRef<Partial<Record<Role, Session>>>({});
  const [feedback, setFeedback] = useState<Record<Role, RoleFeedback>>({ operator: IDLE, technician: IDLE, coordinator: IDLE });
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const simulated = useRef(false), fetching = useRef(false), writing = useRef(false);
  const active = useRef<AbortController | null>(null);
  const requestIds = useRef(new Map<string, string>());

  const patch = useCallback((role: Role, value: Partial<RoleFeedback>) => {
    setFeedback((all) => ({ ...all, [role]: { ...all[role], ...value } }));
  }, []);

  const accept = useCallback((data: Snapshot) => {
    if (!validState(data.state) || !Number.isFinite(Date.parse(data.serverNow))) throw new Error("Invalid server answer.");
    if (current.current && data.state.revision < current.current.revision) return;
    const syncedAt = new Date().toISOString();
    offset.current = Date.parse(data.serverNow) - Date.now();
    current.current = data.state;
    setState(data.state);
    setNow(Date.now() + offset.current);
    setLastSync(syncedAt);
    setConnection("online");
    try { localStorage.setItem(CACHE, JSON.stringify({ state: data.state, syncedAt, offset: offset.current })); } catch { /* The cache is optional. */ }
  }, []);

  const refresh = useCallback(async () => {
    if (simulated.current || fetching.current) return;
    fetching.current = true;
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch("/api/waterlink", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Unreachable");
      const data = (await response.json()) as Snapshot;
      if (!simulated.current) accept(data);
    } catch {
      setConnection("offline");
    } finally {
      clearTimeout(timeout);
      active.current = null;
      fetching.current = false;
    }
  }, [accept]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CACHE) || "null");
      if (saved && validState(saved.state)) {
        current.current = saved.state;
        setState(saved.state);
        setLastSync(saved.syncedAt);
        offset.current = Number.isFinite(saved.offset) ? saved.offset : 0;
      }
      const restored: Partial<Record<Role, Session>> = {};
      for (const role of ROLES) {
        const s = JSON.parse(sessionStorage.getItem(SESSION(role)) || "null");
        if (s?.token && s.actor?.role === role && Date.parse(s.expiresAt) > Date.now()) restored[role] = s;
      }
      sessionRef.current = restored;
      setSessions(restored);
    } catch { /* Invalid storage is discarded. */ }
    void refresh();
    const poll = setInterval(() => void refresh(), 3000);
    const tick = setInterval(() => setNow(Date.now() + offset.current), 15_000);
    const online = () => void refresh();
    const offline = () => { active.current?.abort(); setConnection("offline"); };
    const visible = () => { setNow(Date.now() + offset.current); if (!document.hidden) void refresh(); };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(poll); clearInterval(tick); active.current?.abort();
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

  const value = useMemo<Store>(() => ({
    state, connection, lastSync, now, simulatedOffline, toggleOffline, refresh, act,
    actor: (role) => sessions[role]?.actor ?? null,
    feedback: (role) => feedback[role],
    clear: (role) => patch(role, { error: "", notice: "" }),
  }), [state, connection, lastSync, now, simulatedOffline, toggleOffline, refresh, act, sessions, feedback, patch]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
