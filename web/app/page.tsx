"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { WaterLinkProvider, useWaterLink } from "@/components/waterlink/store";
import { CanMark } from "@/components/waterlink/marks";
import { StatusView } from "@/components/waterlink/status-view";
import { DisplayBoard } from "@/components/waterlink/board";
import { FieldApp } from "@/components/waterlink/field";
import { Coordination, type CoordTab } from "@/components/waterlink/coordination";
import { Stage } from "@/components/waterlink/stage";
import { SmsPage } from "@/components/waterlink/sms";
import { clock } from "@/components/waterlink/format";

type Route =
  | { view: "status" }
  | { view: "field"; role: "operator" | "technician"; point: string | null }
  | { view: "coordination"; tab: CoordTab }
  | { view: "sms" };

function parseHash(hash: string): Route {
  const [view, a, b] = hash.replace(/^#\/?/, "").split("/");
  if (view === "field") {
    if (a === "report" && b) return { view: "field", role: "operator", point: decodeURIComponent(b) };
    return { view: "field", role: a === "technician" ? "technician" : "operator", point: null };
  }
  if (view === "sms") return { view: "sms" };
  if (view === "coordination") return { view: "coordination", tab: a === "history" || a === "demo" ? a : "overview" };
  return { view: "status" };
}
const hashOf = (r: Route) => r.view === "status" ? "#status" : r.view === "sms" ? "#sms" : r.view === "field" ? (r.point ? `#field/report/${encodeURIComponent(r.point)}` : `#field/${r.role}`) : `#coordination/${r.tab}`;

export default function Home() {
  return <WaterLinkProvider><App /></WaterLinkProvider>;
}

function App() {
  const [mode, setMode] = useState<"app" | "display" | "stage" | null>(null);
  const [route, setRoute] = useState<Route>({ view: "status" });
  useEffect(() => {
    const view = new URLSearchParams(location.search).get("view");
    setMode(view === "display" ? "display" : view === "stage" ? "stage" : "app");
    // Links, bookmarks and the back button change only the hash; follow them.
    const follow = () => setRoute(parseHash(location.hash));
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, []);
  const navigate = (next: Route) => {
    setRoute(next);
    const hash = hashOf(next);
    if (location.hash !== hash) history.pushState(null, "", hash);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  if (mode === null) return null;
  if (mode === "display") return <BoardPage />;
  if (mode === "stage") return <Stage />;
  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <TopBar route={route} navigate={navigate} />
      <DemoStrip />
      <main id="main" className={`main main-${route.view}`}>
        <Content route={route} navigate={navigate} />
      </main>
    </div>
  );
}

function TopBar({ route, navigate }: { route: Route; navigate: (r: Route) => void }) {
  const { connection, state } = useWaterLink();
  const items: { label: string; to: Route; on: boolean }[] = [
    { label: "Status", to: { view: "status" }, on: route.view === "status" },
    { label: "Field app", to: { view: "field", role: route.view === "field" ? route.role : "operator", point: null }, on: route.view === "field" },
    { label: "SMS", to: { view: "sms" }, on: route.view === "sms" },
    { label: "Coordination", to: { view: "coordination", tab: "overview" }, on: route.view === "coordination" },
  ];
  const region = state?.region?.label.split(",").slice(0, 2).join(",") ?? "Demo neighbourhood";
  return (
    <header className="topbar">
      <a className="brand" href="#status" onClick={(e) => { e.preventDefault(); navigate({ view: "status" }); }}>
        <CanMark size={30} /><span>WaterLink</span>
      </a>
      <nav className="topnav" aria-label="Main">
        {items.map((item) => (
          <a key={item.label} href={hashOf(item.to)} aria-current={item.on ? "page" : undefined} onClick={(e) => { e.preventDefault(); navigate(item.to); }}>{item.label}</a>
        ))}
      </nav>
      <div className="topbar-meta">
        <span className="region">{region}</span>
        <span className={`conn ${connection}`}>
          {connection === "online" ? <Wifi size={15} aria-hidden="true" /> : <WifiOff size={15} aria-hidden="true" />}
          {connection === "loading" ? "Connecting" : connection === "online" ? "Live" : "Offline"}
        </span>
      </div>
    </header>
  );
}

function DemoStrip() {
  const { state } = useWaterLink();
  return (
    <div className="demo-strip">
      <p><b>Demo.</b> <span className="demo-long">{state?.region ? "Places come from real WPdx surveys (CC BY 4.0). Confirmations, people and routes are simulated." : "All places, people and reports are fictional example data."}</span><span className="demo-short">{state?.region ? "Real places, simulated confirmations." : "Fictional example data."}</span></p>
      <div>
        <a href="/?view=display" target="_blank" rel="noopener noreferrer">Public board <ArrowUpRight size={14} aria-hidden="true" /></a>
        <a href="/?view=stage" target="_blank" rel="noopener noreferrer">Pitch stage <ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
    </div>
  );
}

function Content({ route, navigate }: { route: Route; navigate: (r: Route) => void }) {
  const { state, connection, now, lastSync, refresh, simulatedOffline } = useWaterLink();
  const offline = connection !== "online";
  if (!state) return (
    <div className="loading">
      <CanMark size={56} />
      <h1>{connection === "offline" ? "WaterLink can’t be reached right now." : "Loading water points …"}</h1>
      <p>{connection === "offline" ? "There is no saved copy on this device yet, so we show no status at all." : "Fetching the latest confirmations."}</p>
      <button className="btn btn-primary" onClick={() => void refresh()}><RefreshCw size={17} aria-hidden="true" />Try again</button>
    </div>
  );
  return (
    <>
      {connection === "offline" && (
        <div className="banner warn" role="status">
          <WifiOff size={20} aria-hidden="true" />
          <span><b>{simulatedOffline ? "Connection cut (simulation in this window)." : "No live connection."}</b> Showing the copy from {clock(lastSync)} EAT. Today’s state is not confirmed.</span>
          {!simulatedOffline && <button className="link" onClick={() => void refresh()}>Retry</button>}
        </div>
      )}
      {route.view === "status" && <StatusView state={state} now={now} offline={offline} lastSync={lastSync} onReport={(id) => navigate({ view: "field", role: "operator", point: id })} />}
      {route.view === "field" && (
        <div className="field-page">
          <FieldApp role={route.role} initialPoint={route.point} onRole={(role) => navigate({ view: "field", role, point: null })} />
          <aside className="field-aside">
            <h2>The app for people at the water point</h2>
            <p>One step per screen and big buttons, so it works outdoors on a cheap phone. The same steps fit an SMS flow for phones without internet, which is planned but not connected yet.</p>
            <p>A reported repair never turns a water point green. Only the operator’s on-site test does.</p>
          </aside>
        </div>
      )}
      {route.view === "sms" && <SmsPage />}
      {route.view === "coordination" && <Coordination tab={route.tab} onTab={(tab) => navigate({ view: "coordination", tab })} />}
      <footer className="foot">
        <p>WaterLink · hackathon prototype · times in Kenya (EAT) · <a href="/?view=display" target="_blank" rel="noopener noreferrer">Public board</a> · <a href="/?view=stage" target="_blank" rel="noopener noreferrer">Pitch stage</a></p>
        <p>{state.region ? `${state.region.attribution}. Roads © OpenStreetMap contributors (ODbL).` : "Fictional demo data."}</p>
      </footer>
    </>
  );
}

/** Keeps a kiosk screen awake while the board is visible; silently skipped where unsupported. */
function useWakeLock() {
  useEffect(() => {
    type Lock = { release(): Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request(type: "screen"): Promise<Lock> } };
    if (!nav.wakeLock) return;
    let lock: Lock | null = null, alive = true;
    const acquire = () => { if (document.visibilityState === "visible") nav.wakeLock!.request("screen").then((l) => { if (alive) lock = l; else void l.release(); }).catch(() => {}); };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => { alive = false; document.removeEventListener("visibilitychange", acquire); void lock?.release(); };
  }, []);
}

function BoardPage() {
  const { state, now, connection, lastSync } = useWaterLink();
  useWakeLock();
  const fullscreen = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen?.().catch(() => {}); };
  return (
    <div className="board-page">
      {state ? <DisplayBoard state={state} now={now} offline={connection !== "online"} lastSync={lastSync} onFullscreen={fullscreen} />
        : <div className="loading"><CanMark size={56} /><h1>{connection === "offline" ? "No connection. Status unknown." : "Loading …"}</h1></div>}
    </div>
  );
}
