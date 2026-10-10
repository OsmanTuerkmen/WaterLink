"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Droplets, Footprints, History, LayoutGrid, MapPin, Monitor, Radio, RefreshCw, ShieldCheck, TriangleAlert, Users, Wifi, WifiOff, Wrench, X, FlaskConical, ClipboardCheck, Printer, Search, Mic, Play, Pause, Activity } from "lucide-react";
import { STATUS_TTL_MS, distanceKm, findAlternative, getNearby, getPointDisplay, isPointOpen, type PointDisplay, type RegionMeta, type Survey, type Actor, type Blocker, type Job, type Role, type State, type WaterPoint } from "@/lib/domain";
import { useWaterLink, type Mutation } from "./use-waterlink";
import { alertEpisodes, readSensor, type SensorState } from "@/lib/sensor";
import kwale from "@/data/kwale-sensors.json";

type Screen = "overview" | "report" | "repairs" | "history" | "demo";
const roles: Record<Role, string> = { operator: "Betreiberin", technician: "Techniker", coordinator: "Koordination" };
const roleSubject: Record<Role, string> = { operator: "die Betreiberin", technician: "der Techniker", coordinator: "die Koordination" };
const jobLabels = { open: "Offen", claimed: "Übernommen", in_progress: "In Bearbeitung", awaiting_confirmation: "Bestätigung ausstehend", closed: "Bestätigt abgeschlossen" };
const statusLabels = { working: "Funktioniert", limited: "Eingeschränkt", down: "Ausgefallen", unknown: "Unbekannt" };
const blockers = { parts: "Ersatzteile fehlen", funding: "Finanzierung fehlt", staff: "Personal fehlt" };
const nav = [{ id: "overview", label: "Wasserstellen", icon: LayoutGrid }, { id: "report", label: "Störung melden", icon: Radio }, { id: "repairs", label: "Reparaturen", icon: Wrench }, { id: "history", label: "Verlauf & Überblick", icon: History }, { id: "demo", label: "Demo-Werkzeuge", icon: FlaskConical }] as const;

function time(at: string | null, full = false) {
  if (!at || !Number.isFinite(Date.parse(at))) return "Noch nicht bestätigt";
  return new Intl.DateTimeFormat("de-DE", { timeZone: "Africa/Nairobi", ...(full ? { day: "2-digit", month: "2-digit" } : {}), hour: "2-digit", minute: "2-digit" }).format(new Date(at)) + " EAT";
}
function age(at: string | null, now: number) {
  if (!at) return "Keine Bestätigung";
  const n = Math.max(0, Math.floor((now - Date.parse(at)) / 60000));
  return n < 1 ? "gerade eben" : n < 60 ? `vor ${n} Min.` : n < 1440 ? `vor ${Math.floor(n / 60)} Std.` : `vor ${Math.floor(n / 1440)} Tagen`;
}
type Submit = (c: Mutation) => Promise<boolean>;
const isTracked = (p: WaterPoint) => p.tracked ?? true;
const code = (p: WaterPoint) => (p.id.length <= 2 ? p.id.toUpperCase() : "W");
const surveyLabels: Record<Survey["status"], string> = { functional: "funktionierte damals", non_functional: "funktionierte damals nicht", unknown: "Zustand nicht erfasst" };
function month(at: string) { return Number.isFinite(Date.parse(at)) ? new Intl.DateTimeFormat("de-DE", { month: "2-digit", year: "numeric", timeZone: "Africa/Nairobi" }).format(new Date(at)) : "unbekannt"; }
function km(value: number | null) { return value === null ? "" : `${value.toLocaleString("de-DE", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km`; }
function osm(p: WaterPoint) { return typeof p.lat === "number" && typeof p.lon === "number" ? `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=16/${p.lat}/${p.lon}` : null; }

export default function Home() {
  const data = useWaterLink();
  const { state, connection, lastSync, now, session, busy, roleBusy, error, notice, signInNeeded, simulatedOffline, toggleOffline, refresh, chooseRole, mutate, clearMessages } = data;
  const [screen, setScreen] = useState<Screen>("overview"), [kiosk, setKiosk] = useState(false), [selected, setSelected] = useState("a");
  useEffect(() => {
    setKiosk(new URLSearchParams(location.search).get("view") === "display");
    // Links, bookmarks and the back button change only the hash; follow them.
    const fromHash = () => { const hash = location.hash.slice(1) as Screen; if (nav.some(n => n.id === hash)) setScreen(hash); };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  function navigate(next: Screen) { setScreen(next); clearMessages(); if (location.hash !== `#${next}`) window.history.pushState(null, "", `#${next}`); window.scrollTo({ top: 0, behavior: "instant" }); }
  const offline = connection !== "online", role = session?.actor.role;
  const jobs = state?.jobs.filter(j => j.status !== "closed") || [];
  const region = state?.region ?? null;
  const tracked = state?.points.filter(isTracked) || [];
  const good = tracked.filter(p => getPointDisplay(p, now, offline).certainty === "fresh").length;
  const gate = (wanted: Role) => role === wanted ? <div className="acting"><ShieldCheck size={16} />Aktive Demo-Rolle: {session?.actor.name}</div> : <div className="role-gate"><Users size={23} /><div><strong>Hier handelt {roleSubject[wanted]}.</strong><p>Wähle für diesen Schritt die passende Demo-Rolle. Alle Personen sind fiktiv.</p></div><button className="button secondary" disabled={roleBusy || offline} onClick={() => chooseRole(wanted)}>Als {roles[wanted]} fortfahren <ArrowRight size={16} /></button></div>;

  return <div className={`app ${kiosk ? "kiosk" : ""}`}>
    <a className="skip" href="#main">Zum Inhalt</a>
    {!kiosk && <aside className="sidebar"><a href="/" className="brand"><Droplets size={31} /><span>waterlink<b>.</b></span></a><div className="workspace"><MapPin size={19} /><div>{region ? region.label.split(",")[0] : "Demo-Wohngebiet"}<small>{region ? `${region.county || "Kenia"} · Daten: WPdx` : "Kenia · Pilotregion noch offen"}</small></div></div><div className="nav-label">GEMEINSAM GUT INFORMIERT</div><nav aria-label="Hauptnavigation">{nav.map(n => <button key={n.id} title={n.label} aria-label={n.label} aria-current={screen === n.id ? "page" : undefined} className={`nav-item ${screen === n.id ? "active" : ""}`} onClick={() => navigate(n.id)}><n.icon size={19} /><span>{n.label}</span>{n.id === "repairs" && jobs.length > 0 && <b>{jobs.length}</b>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-note"><Monitor size={23} /><strong>Eine Anzeige. Viele Menschen.</strong><p>Informationen vor dem Wasserweg – auch ohne eigenes Handy.</p><a href="/?view=display" target="_blank" rel="noopener noreferrer">Öffentliche Anzeige <ArrowUpRight size={16} /></a></div><div className="sidebar-meta"><i />Hackathon-Prototyp<span>v0.1</span></div></div></aside>}
    <div className="main-wrap"><header className="topbar"><div className="topbar-left">{kiosk ? <a className="brand compact" href="/"><Droplets size={24} /><span>waterlink.</span></a> : <span className="breadcrumb">Deine Wasserstellen <b>/</b> {nav.find(n => n.id === screen)?.label}</span>}<span className="demo-badge">{region ? "DEMO · BESTÄTIGUNGEN SIMULIERT" : "DEMO · BEISPIELDATEN"}</span></div><div className={`connection ${offline ? "disconnected" : ""}`}>{offline ? <WifiOff size={15} /> : <Wifi size={15} />}{connection === "loading" ? "Verbinde …" : offline ? "Keine Live-Verbindung" : "Verbunden"}</div></header>
    <main id="main">
      {connection === "offline" && state && <div className="alert warning" role="status"><WifiOff size={21} /><div><strong>{simulatedOffline ? "Verbindung unterbrochen – Simulation" : "Keine aktuelle Verbindung"}</strong><p>Gespeicherter Stand: {time(lastSync, true)}. Der aktuelle Betrieb ist nicht bestätigt.{simulatedOffline && " Nur dieses Fenster ist betroffen."}</p></div>{!simulatedOffline && <button className="text-button" onClick={() => void refresh()}>Erneut laden</button>}</div>}
      {error && <div className="alert error" role="alert"><TriangleAlert size={21} /><div><strong>{error}</strong>{signInNeeded && <p><a className="sign-in" href={`/signin-with-chatgpt?return_to=${encodeURIComponent("/#" + screen)}`} target="_top">Für die private Demo anmelden <ArrowUpRight size={16} /></a></p>}</div><button className="icon-button" aria-label="Fehlermeldung schließen" onClick={clearMessages}><X size={17} /></button></div>}
      {notice && !error && <div className="alert success" role="status"><CheckCircle2 size={20} /><span>{notice}</span><button className="icon-button" aria-label="Hinweis schließen" onClick={clearMessages}><X size={17} /></button></div>}
      {!state ? <div className="loading"><Droplets size={45} /><h1>{connection === "offline" ? "Der Stand ist gerade nicht erreichbar." : "Wasserstellen werden geladen …"}</h1><p>{connection === "offline" ? "Noch keine gespeicherte Information vorhanden. Wir zeigen deshalb keinen Betriebszustand an." : "Wir laden die zuletzt bestätigten Informationen."}</p><button className="button primary" onClick={() => void refresh()}><RefreshCw size={17} />Erneut laden</button></div> : <>
      {kiosk && <DisplayBoard state={state} now={now} offline={offline} lastSync={lastSync} />}
      {!kiosk && screen === "overview" && <>
        <section className="print-head"><strong>WaterLink · Statusblatt</strong><p>Ausdruck: {time(new Date(now).toISOString(), true)}. Momentaufnahme; spätere Störungen sind möglich. Ohne neue Bestätigung nach Ablauf der angegebenen Frist: Zustand unbestätigt. Bei Stromausfall betreute Tafel mit Datum und Uhrzeit verwenden.</p><p>{region ? `Orte: ${region.label} (${region.attribution}). Bestätigungen simuliert.` : "Quelle: WaterLink Demo · fiktive Beispieldaten."} Betriebsstatus, keine Aussage zur Trinkwasserqualität.</p></section>
        <section className="status-head">
          <div>
            <div className="eyebrow dark">VOR DEM WEG ZUR WASSERSTELLE</div>
            <h1>Funktioniert unsere Wasserstelle heute?</h1>
            <p className={connection === "offline" ? "warn" : ""}>{connection === "loading" ? <><RefreshCw size={16} />Stand wird aktualisiert …</> : offline ? <><WifiOff size={16} />Keine Live-Verbindung. Der heutige Betrieb ist nicht bestätigt.</> : <><Clock3 size={16} />{good} von {tracked.length} Wasserstellen mit aktueller Bestätigung · Stand {time(lastSync)}</>}</p>
          </div>
          <div className="status-head-actions">
            <a className="button primary" href="/?view=display" target="_blank" rel="noopener noreferrer"><Monitor size={17} />Öffentliche Anzeige<ArrowUpRight size={16} /></a>
            <button className="button secondary" onClick={() => window.print()}><Printer size={17} />Statusblatt drucken</button>
          </div>
        </section>
        <div className="point-grid">{tracked.map(p => <PointCard key={p.id} point={p} state={state} now={now} offline={offline} onReport={() => { setSelected(p.id); navigate("report"); }} />)}</div>
        <p className="freshness-note"><ShieldCheck size={18} /><span>Jede Bestätigung gilt 12 Stunden, danach heißt der Status „unklar“. „Funktioniert“ bedeutet betriebsfähig – keine Aussage zur Trinkwasserqualität und keine Garantie für den Zeitpunkt deiner Ankunft.{region && " Erhebungsdaten sind historisch und zeigen nie den heutigen Zustand."}</span></p>
        {region && <RecordedList points={state.points.filter(p => !isTracked(p))} region={region} onReport={(id) => { setSelected(id); navigate("report"); }} />}
      </>}
      {!kiosk && screen === "report" && <><Title eyebrow="BETRIEB & BESTÄTIGUNG" title="Eine Meldung macht den Unterschied." text="Melde eine beobachtete Störung oder bestätige den Betrieb nach einer ausdrücklichen Prüfung." />{gate("operator")}<div className="form-grid"><ReportForm points={state.points} selected={selected} setSelected={setSelected} disabled={role !== "operator" || offline || busy} submit={mutate} /><ConfirmForm state={state} disabled={role !== "operator" || offline || busy} submit={mutate} /></div><div className="explainer"><ShieldCheck size={20} /><p><strong>Zwei getrennte Schritte.</strong> Der Techniker meldet die Reparatur. Die Betreiberperson bestätigt anschließend den tatsächlichen Betrieb. Scheitert die Prüfung, bleibt die Störung offen.</p></div></>}
      {!kiosk && screen === "repairs" && <><Title eyebrow="VON DER MELDUNG ZUR WIEDERHERSTELLUNG" title="Reparaturen mit Verantwortung." text="Übernehmen, Fortschritt dokumentieren und die Reparatur zur Funktionsprüfung übergeben." />{gate("technician")}<div className="metrics"><Metric title="Offene Aufträge" value={jobs.filter(j => j.status === "open").length} /><Metric title="In Bearbeitung" value={jobs.filter(j => ["claimed", "in_progress"].includes(j.status)).length} /><Metric title="Bestätigung ausstehend" value={jobs.filter(j => j.status === "awaiting_confirmation").length} /></div>{!state.jobs.length ? <Empty title="Aktuell keine Reparaturaufträge." text="Sobald eine Betreiberperson einen Ausfall meldet, erscheint der Auftrag hier." action={<button className="button primary" onClick={() => navigate("report")}>Eine Störung melden <ArrowRight size={17} /></button>} /> : [...state.jobs].sort((a,b) => Number(a.status === "closed")-Number(b.status === "closed") || b.createdAt.localeCompare(a.createdAt)).map(j => <JobCard key={j.id} job={j} point={state.points.find(p => p.id === j.pointId)!} actor={session?.actor} disabled={role !== "technician" || offline || busy} submit={mutate} />)}</>}
      {!kiosk && screen === "history" && <><Title eyebrow="NACHVOLLZIEHBAR STATT UNKLAR" title="Was ist passiert? Wer kümmert sich?" text="Meldungen, Zuständigkeiten und bestätigte Wiederherstellungen im gemeinsamen Verlauf." /><div className="metrics"><Metric title="Aktive Reparaturaufträge" value={jobs.length} /><Metric title="Blockiert: Teile, Geld oder Personal" value={jobs.filter(j => j.blocker).length} /><Metric title="Bestätigt abgeschlossen" value={state.jobs.filter(j => j.status === "closed").length} /></div>{jobs.length > 0 && <section className="panel"><h2>Aktuelle Zuständigkeiten</h2><div className="responsibilities">{jobs.map(j => <div key={j.id}><span><strong>{state.points.find(p => p.id === j.pointId)?.name}</strong><small>{j.assignedName || "Noch nicht übernommen"} · gemeldet {age(j.createdAt, now)}</small></span><span className="pill neutral">{jobLabels[j.status]}</span>{j.blocker && <span className="pill amber">{blockers[j.blocker]}</span>}</div>)}</div></section>}<section className="panel"><div className="section-heading"><h2>Gemeinsamer Verlauf</h2><span className="small-label">{state.events.length} EREIGNISSE · DEMO</span></div><ol className="timeline">{[...state.events].reverse().map(e => <li key={e.id}><span className={`timeline-symbol ${e.type === "confirm" ? "green" : ""}`}><EventIcon type={e.type} /></span><div><p>{e.message}</p><small>{e.actorName} · {time(e.at,true)}</small></div></li>)}</ol></section></>}
      {!kiosk && screen === "demo" && <><Title eyebrow="EIN PROTOTYP, DER SEINE GRENZEN ZEIGT" title="Drei Minuten. Ein vollständiger Ablauf." text={region ? "Die Orte stammen aus echten Erhebungen; alle Werkzeuge verändern nur simulierte Demo-Bestätigungen und Aufträge. Eine Wirkung in Kenia ist noch nicht nachgewiesen." : "Alle Werkzeuge verändern ausschließlich fiktive Beispieldaten. Eine Wirkung in Kenia ist noch nicht nachgewiesen."} />{gate("coordinator")}<DemoTools disabled={role !== "coordinator" || busy || offline} submit={mutate} simulated={simulatedOffline} toggle={toggleOffline} navigate={navigate} /><SensorReplay disabled={role !== "coordinator" || busy || offline} submit={mutate} onApplied={() => navigate("overview")} /><section className="panel scope"><h2>Was noch offen ist</h2><div><p><CircleHelp size={20} />Keine angeschlossenen Sensoren, kein SMS-Versand und kein KI-Dienst. Die Rollen sind eine Simulation.</p><p><MapPin size={20} />{region ? `Die Wasserstellen stammen aus WPdx-Erhebungen (${region.label}). Heutiger Zustand, Wege, Zugang, lokale Sprache und Betreuung der Anzeige sind nicht vor Ort geprüft.` : "Pilotregion, lokale Sprache, Standort und Betreuung der Anzeige müssen vor Ort geprüft werden."}</p><p><Users size={20} />Software beschafft weder Geld noch Ersatzteile oder Personal. Blockierungen machen diese Grenzen sichtbar.</p><p><Monitor size={20} />Bei Stromausfall: betreute Schreibtafel mit Quelle, Prüf- und Ablaufzeit. Ohne neue Prüfung: Status unbekannt.</p></div></section></>}
      </>}
      {kiosk ? <footer className="footer"><a href="/">Zur Arbeitsansicht <ArrowUpRight size={14} /></a></footer> : <footer className="footer"><div><Droplets size={17} /><strong>Betriebsstatus – keine Aussage zur Trinkwasserqualität.</strong></div><p>{region ? <>Orte: {region.attribution} · Bestätigungen, Wege und Personen simuliert · Zeiten in Kenia (EAT)</> : "Fiktive Orte und Wege · Zeiten in Kenia (EAT) · WaterLink Demo"}</p></footer>}
    </main></div>
  </div>;
}

function EventIcon({type}:{type:string}) { const Icon = type === "confirm" ? Check : type === "repair" ? ClipboardCheck : ["claim","start","progress"].includes(type) ? Wrench : type === "scenario" ? FlaskConical : type === "report" ? Radio : RefreshCw; return <Icon size={15} />; }
function Title({eyebrow,title,text}:{eyebrow:string;title:string;text:string}) { return <div className="page-title"><div className="eyebrow dark">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div>; }
function Metric({title,value}:{title:string;value:number}) { return <div className="metric"><strong>{String(value).padStart(2,"0")}</strong><span>{title}</span></div>; }
function Empty({title,text,action}:{title:string;text:string;action?:ReactNode}) { return <div className="empty"><Wrench size={33} /><h2>{title}</h2><p>{text}</p>{action}</div>; }

type Tone = "green" | "red" | "amber" | "neutral";
const toneOf = (d: PointDisplay): Tone => d.status === "working" ? "green" : d.status === "down" ? "red" : d.status === "limited" ? "amber" : "neutral";
function StatusIcon({ d, size }: { d: PointDisplay; size: number }) {
  const Icon = d.status === "working" ? Check : d.status === "down" ? X : d.status === "limited" ? TriangleAlert : CircleHelp;
  return <Icon size={size} strokeWidth={2.4} />;
}
/** One short instruction per state, shared by the cards and the public display. */
function advice(d: PointDisplay) {
  if (d.certainty !== "fresh") return { title: "Unklar – vor dem Weg prüfen", text: d.reason };
  if (d.status === "working") return { title: "Wasserentnahme möglich", text: "Betrieb zuletzt ausdrücklich bestätigt." };
  if (d.status === "down") return { title: "Bitte vorerst nicht hingehen", text: "Störung gemeldet. Reparatur wird organisiert." };
  return { title: "Nur eingeschränkt nutzbar", text: "Mit Wartezeit oder wenig Wasser rechnen." };
}

function PointCard({point:p,state,now,offline,onReport}:{point:WaterPoint;state:State;now:number;offline:boolean;onReport:()=>void}) {
  const [expanded,setExpanded]=useState(false), d=getPointDisplay(p,now,offline), tone=toneOf(d), tip=advice(d);
  const alternative=d.status !== "working" ? findAlternative(state.points,p.id,now,offline):null;
  const job=state.jobs.find(j=>j.pointId===p.id && j.status!=="closed");
  const nearby=d.status!=="working" && !alternative && p.survey && !offline ? getNearby(state.points,p.id,2) : [];
  const simulated=Boolean(p.survey);
  const hours=p.allDay?(simulated?"Zugang jederzeit (simulierte Demo-Angabe)":"Jederzeit zugänglich"):!p.opensAt?"Öffnungszeiten nicht erfasst":`${p.opensAt}–${p.closesAt} EAT · jetzt ${isPointOpen(p,now)?"geöffnet":"geschlossen"}`;
  const confirmed=Boolean(p.confirmedAt && Number.isFinite(Date.parse(p.confirmedAt)));
  return <article className={`point-card ${tone}`}>
    <div className="point-card-top"><span className="point-letter">{code(p)}</span><div><h3>{p.name}</h3><div className="location"><MapPin size={14}/>{p.location}</div></div></div>
    <div className={`status-box ${tone}`}><span className="status-icon"><StatusIcon d={d} size={26}/></span><div><span className="status-word">{d.certainty==="fresh"?statusLabels[d.status]:d.label}</span><strong>{tip.title}</strong><span>{d.certainty==="fresh"&&p.note?p.note:tip.text}</span></div></div>
    <div className="point-facts">
      <span><Clock3 size={16}/>{confirmed?<>Bestätigt {time(p.confirmedAt,true)} · {age(p.confirmedAt,now)}</>:"Noch keine Betriebsbestätigung"}</span>
      <span><Footprints size={16}/>ca. {p.walkingMinutes} Min. vom Treffpunkt{simulated&&" (geschätzt)"}</span>
    </div>
    {job && <div className="job-hint"><Wrench size={15}/>Reparatur: {jobLabels[job.status]}{job.status==="awaiting_confirmation" && " · Betrieb noch nicht bestätigt"}</div>}
    {d.status!=="working" && <div className={`alternative ${alternative?"available":""}`}><ArrowRight size={18}/><div><span className="small-label">{alternative?"STATTDESSEN":"ALTERNATIVE"}</span><strong>{alternative?`${code(alternative)} · ${alternative.name}`:"Keine verlässlich bestätigte Alternative."}</strong>{alternative && <small>ca. {alternative.walkingMinutes} Min. vom Treffpunkt · bestätigt {time(alternative.confirmedAt)}</small>}{nearby.length>0&&<small>Nächste erfasste Stellen, Zustand und Weg unbestätigt: {nearby.map(n=>`${n.point.name} (${km(n.km)})`).join(", ")}</small>}</div></div>}
    <button className="card-details" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>Details & Weg <ChevronDown size={17} className={expanded?"rotate":""}/></button>
    {expanded && <div className="point-details">
      <p>{p.landmark}</p>
      <p>{p.routeVerified&&p.accessVerified?(simulated?"Weg und Zugang sind für die Demo als geprüft simuliert.":"Weg und öffentlicher Zugang sind in den Beispieldaten bestätigt."):"Weg oder Zugang sind nicht verlässlich bestätigt."}</p>
      <small>{hours}</small>
      {confirmed && <small>{p.confirmedBy && `Bestätigt durch ${p.confirmedBy} · `}{now>=Date.parse(p.confirmedAt!)+STATUS_TTL_MS?"Gültigkeit abgelaufen":"Gültig bis"} {time(new Date(Date.parse(p.confirmedAt!)+STATUS_TTL_MS).toISOString(),true)}{d.certainty!=="fresh"&&` · damals gemeldet: ${statusLabels[p.status]}`}</small>}
      {p.survey?<><small>Erhebung {month(p.survey.reportDate)}: {surveyLabels[p.survey.status]} · {p.survey.dataset || "WPdx"} · laut Erhebung: {p.survey.statusText}{p.survey.technology&&` · ${p.survey.technology}`}</small>{osm(p)&&<a className="text-button" href={osm(p)!} target="_blank" rel="noopener noreferrer">Auf OpenStreetMap ansehen <ArrowUpRight size={15}/></a>}</>:<small>Fiktive Wegeangaben, keine Navigation. Zugang geprüft: {time(p.accessConfirmedAt,true)}.</small>}
      <button className="text-button" onClick={onReport}>Störung hier melden <ArrowRight size={15}/></button>
    </div>}
  </article>;
}

/** Large, glanceable board for a shop or meeting point: status as word + symbol, never colour alone. */
function DisplayBoard({state,now,offline,lastSync}:{state:State;now:number;offline:boolean;lastSync:string|null}) {
  const region=state.region??null, points=state.points.filter(isTracked);
  return <div className="board">
    <header className="board-head">
      <div><h1>Funktioniert unsere Wasserstelle heute?</h1><p>{region?region.label:"Demo-Wohngebiet · fiktive Beispieldaten"}</p></div>
      <div className="board-clock"><strong>{time(new Date(now).toISOString()).replace(" EAT","")}</strong><span>{offline?`Letzter Stand ${time(lastSync,true)}`:`Aktualisiert ${time(lastSync)}`}</span></div>
    </header>
    {offline && <div className="board-offline" role="status"><WifiOff size={30}/><div><strong>Keine Verbindung – Zustand heute unbestätigt</strong><p>Bitte vor dem Weg vor Ort nachfragen. Die Anzeige aktualisiert sich, sobald die Verbindung zurück ist.</p></div></div>}
    <ul className="board-list">{points.map(p=>{
      const d=getPointDisplay(p,now,offline), tone=toneOf(d), tip=advice(d);
      const alt=d.status!=="working"?findAlternative(state.points,p.id,now,offline):null;
      return <li key={p.id} className={`board-row ${tone}`}>
        <span className="board-letter">{code(p)}</span>
        <div className="board-name"><strong>{p.name}</strong><span>{p.location} · ca. {p.walkingMinutes} Min.</span></div>
        <div className="board-status"><span className="board-symbol"><StatusIcon d={d} size={34}/></span><div><strong>{d.certainty==="fresh"?statusLabels[d.status]:"Unklar"}</strong><span>{d.certainty==="fresh"?tip.title:d.label}</span></div></div>
        <div className="board-time"><span>{d.certainty!=="fresh"?"Zuletzt bestätigt":d.status!=="working"?"Gemeldet":"Bestätigt"}</span><strong>{p.confirmedAt?time(p.confirmedAt).replace(" EAT",""):"–"}</strong><small>{age(p.confirmedAt,now)}</small></div>
        {d.status!=="working" && <div className="board-alt"><ArrowRight size={22}/>{alt?<span>Stattdessen <b>{code(alt)} · {alt.name}</b>, ca. {alt.walkingMinutes} Min. · bestätigt {time(alt.confirmedAt)}</span>:<span>Keine bestätigte Alternative. Bitte vor Ort nachfragen.</span>}</div>}
      </li>;
    })}</ul>
    <footer className="board-foot">
      <p><Check size={18}/>„Funktioniert“ heißt: Wasser kann entnommen werden. Keine Aussage zur Trinkwasserqualität.</p>
      <p><Clock3 size={18}/>Jede Bestätigung gilt 12 Stunden. Danach steht hier „Unklar“, bis jemand vor Ort neu prüft.</p>
      <p className="board-source">{region?`Orte: ${region.attribution.replace(/.$/,"")}. Bestätigungen und Personen simuliert.`:"Demo mit fiktiven Beispieldaten."} Zeiten in Kenia (EAT).</p>
    </footer>
  </div>;
}

function RecordedList({points,region,onReport}:{points:WaterPoint[];region:RegionMeta;onReport:(id:string)=>void}) {
  const [query,setQuery]=useState(""),[all,setAll]=useState(false);
  if(!points.length) return null;
  const needle=query.trim().toLowerCase();
  const matches=points.filter(p=>!needle||`${p.name} ${p.location}`.toLowerCase().includes(needle));
  const shown=all||needle?matches:matches.slice(0,8);
  return <section className="panel recorded"><div className="section-heading"><div><div className="eyebrow dark">ERHEBUNGSDATEN · WPDX</div><h2>Weitere erfasste Wasserstellen <span className="count">{points.length}</span></h2></div><label className="search"><Search size={16}/><span className="sr-only">Wasserstellen durchsuchen</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ort oder Name suchen"/></label></div>
    <p className="panel-description">Aus Erhebungen bekannt, aber nicht in WaterLink betreut. Der heutige Zustand ist unbestätigt. Entfernungen sind Luftlinie vom {region.meetingPoint.label}.</p>
    <ul className="recorded-list">{shown.map(p=><li key={p.id}><span className="point-letter">{code(p)}</span><div><strong>{p.name}</strong><small>{p.location} · {km(distanceKm(p,region.meetingPoint))}</small></div><span className="pill neutral"><History size={14}/>{p.survey?`${month(p.survey.reportDate)}: ${surveyLabels[p.survey.status]}`:"Keine Erhebung"}</span><span className="pill neutral"><CircleHelp size={14}/>Heute unbestätigt</span><button className="text-button" onClick={()=>onReport(p.id)}>Melden <ArrowRight size={15}/></button></li>)}</ul>
    {!shown.length&&<p className="panel-description">Keine Wasserstelle passt zur Suche.</p>}
    {!needle&&matches.length>shown.length&&<button className="text-button" onClick={()=>setAll(true)}>Alle {matches.length} anzeigen <ChevronDown size={15}/></button>}
    {all&&!needle&&<button className="text-button" onClick={()=>setAll(false)}>Weniger anzeigen</button>}
  </section>;
}

function PointOptions({points}:{points:WaterPoint[]}) {
  const tracked=points.filter(isTracked), others=points.filter(p=>!isTracked(p));
  const option=(p:WaterPoint)=><option key={p.id} value={p.id}>{code(p)} · {p.name}</option>;
  return others.length?<><optgroup label="Betreute Wasserstellen">{tracked.map(option)}</optgroup><optgroup label="Weitere erfasste Wasserstellen">{others.map(option)}</optgroup></>:<>{points.map(option)}</>;
}

type Recognition = { lang: string; interimResults: boolean; start(): void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void };
/** Browser dictation only fills the description; the operator reviews it and chooses the status. */
function useDictation(onText:(text:string)=>void) {
  const [supported,setSupported]=useState(false),[listening,setListening]=useState(false);
  const Ctor=()=>{const w=window as unknown as Record<string,(new()=>Recognition)|undefined>;return w.SpeechRecognition??w.webkitSpeechRecognition;};
  useEffect(()=>setSupported(Boolean(Ctor())),[]);
  function start(){
    const R=Ctor(); if(!R) return;
    const r=new R(); r.lang="de-DE"; r.interimResults=false;
    r.onresult=e=>{const text=Array.from(e.results).map(x=>x[0].transcript).join(" ").trim(); if(text) onText(text);};
    r.onend=()=>setListening(false); r.onerror=()=>setListening(false);
    setListening(true); try{r.start();}catch{setListening(false);}
  }
  return {supported,listening,start};
}

function ReportForm({points,selected,setSelected,disabled,submit}:{points:WaterPoint[];selected:string;setSelected:(s:string)=>void;disabled:boolean;submit:Submit}) {
  const [status,setStatus]=useState<"down"|"limited">("down"),[note,setNote]=useState(""),[observed,setObserved]=useState(false);
  const dictation=useDictation(text=>setNote(n=>(n.trim()?`${n.trim()} `:"")+text));
  async function send(e:FormEvent){e.preventDefault();if(await submit({type:"report",pointId:selected,status,note})){setNote("");setObserved(false);}}
  return <form className="panel form-panel" onSubmit={send}><span className="form-icon"><Radio size={24}/></span><h2>Störung melden</h2><p>Die Meldung aktualisiert die Anzeige und erzeugt einen Reparaturauftrag.</p><label htmlFor="report-point">Wasserstelle</label><select id="report-point" value={selected} onChange={e=>setSelected(e.target.value)}><PointOptions points={points}/></select><label htmlFor="report-status">Was hast du beobachtet?</label><select id="report-status" value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="down">Ausgefallen – kein Betrieb möglich</option><option value="limited">Eingeschränkt – teilweise betriebsfähig</option></select><label htmlFor="report-note">Kurze Beschreibung</label><textarea id="report-note" required minLength={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Zum Beispiel: Beim Pumpen kommt kein Wasser."/>{dictation.supported&&<div className="dictate"><button type="button" className="button secondary" disabled={dictation.listening} onClick={dictation.start}><Mic size={17}/>{dictation.listening?"Hört zu …":"Beschreibung diktieren"}</button><small>Spracherkennung des Browsers; die Aufnahme geht an dessen Anbieter. Text vor dem Speichern prüfen – der Status wird nicht automatisch gesetzt.</small></div>}<label className="checkbox"><input type="checkbox" required checked={observed} onChange={e=>setObserved(e.target.checked)}/><span>Ich habe den Zustand jetzt vor Ort beobachtet. In dieser Demo ist das ein simulierter Vor-Ort-Bericht.</span></label><button className="button primary full" disabled={disabled||!observed||note.trim().length<3}>Störung speichern <ArrowRight size={17}/></button><small className="form-foot">Eine Erfolgsmeldung erscheint erst nach Bestätigung durch den Server.</small></form>;
}

function ConfirmForm({state,disabled,submit}:{state:State;disabled:boolean;submit:Submit}) {
  const [pointId,setPointId]=useState("a"),[status,setStatus]=useState<"working"|"limited"|"down">("working"),[note,setNote]=useState(""),[tested,setTested]=useState(false);
  const job=state.jobs.find(j=>j.pointId===pointId&&j.status!=="closed"),canRestore=!job||job.status==="awaiting_confirmation";
  // "Funktioniert" is not selectable before a repair report; never leave it preselected.
  useEffect(()=>{if(!canRestore&&status==="working")setStatus("down");},[canRestore,status]);
  async function send(e:FormEvent){e.preventDefault();if(await submit({type:"confirm",pointId,status,note,tested:true})){setNote("");setTested(false);}}
  return <form className="panel form-panel" onSubmit={send}><span className="form-icon green"><ClipboardCheck size={24}/></span><h2>Funktion ausdrücklich bestätigen</h2><p>Nach einer Reparatur oder zur Prüfung eines unbekannten, veralteten oder widersprüchlichen Zustands.</p><label htmlFor="confirm-point">Geprüfte Wasserstelle</label><select id="confirm-point" value={pointId} onChange={e=>{setPointId(e.target.value);setTested(false);}}><PointOptions points={state.points}/></select>{job && <div className="form-message"><Wrench size={17}/><span>{jobLabels[job.status]}{!canRestore&&". Erst nach der Reparaturmeldung ist eine erfolgreiche Wiederherstellung möglich."}</span></div>}<label htmlFor="confirm-status">Ergebnis des Funktionstests</label><select id="confirm-status" value={status} onChange={e=>{setStatus(e.target.value as typeof status);setTested(false);}}><option value="working" disabled={!canRestore}>Funktioniert – Betrieb wieder möglich</option><option value="limited">Eingeschränkt – weitere Arbeit nötig</option><option value="down">Ausgefallen – Prüfung nicht bestanden</option></select><label htmlFor="confirm-note">Was wurde geprüft?</label><textarea id="confirm-note" required minLength={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Zum Beispiel: Wasserfluss durch Pumpen vor Ort geprüft."/><label className="checkbox"><input type="checkbox" required checked={tested} onChange={e=>setTested(e.target.checked)}/><span>Ich habe die Funktion ausdrücklich geprüft und bestätige dieses Ergebnis. Dies ist kein Trinkwasserqualitätstest.</span></label><button className="button primary full" disabled={disabled||!tested||note.trim().length<3||(status==="working"&&!canRestore)}>Prüfergebnis bestätigen <Check size={17}/></button><small className="form-foot">Eine fehlgeschlagene Prüfung lässt den Reparaturauftrag offen.</small></form>;
}

function JobCard({job,point,actor,disabled,submit}:{job:Job;point:WaterPoint;actor?:Actor;disabled:boolean;submit:Submit}) {
  const [note,setNote]=useState(""),[blocker,setBlocker]=useState<Blocker>(job.blocker);
  const owned=actor?.id===job.assignedTo,active=job.status==="claimed"||job.status==="in_progress";
  async function save(type:"progress"|"repair"){const c:Mutation=type==="progress"?{type,jobId:job.id,note,blocker}:{type,jobId:job.id,note};if(await submit(c))setNote("");}
  return <article className={`panel job-card ${job.status==="closed"?"closed":""}`}><div className="job-header"><div className="job-title"><span className="point-letter">{code(point)}</span><div><small>REPARATURAUFTRAG · {job.id.toUpperCase()}</small><h2>{point.name}</h2></div></div><span className={`pill ${job.status==="closed"?"green":job.status==="awaiting_confirmation"?"amber":"neutral"}`}>{job.status==="closed"?<Check size={15}/>:<Clock3 size={15}/>} {jobLabels[job.status]}</span></div><p className="job-note">{job.note}</p><div className="job-meta"><span><Users size={16}/>{job.assignedName||"Noch keine Fachkraft zuständig"}</span><span><Clock3 size={16}/>Gemeldet {time(job.createdAt,true)}</span>{job.blocker&&<span className="blocker"><TriangleAlert size={15}/>{blockers[job.blocker]}</span>}</div>{job.status==="open"&&<button className="button primary" disabled={disabled} onClick={()=>submit({type:"claim",jobId:job.id})}>Auftrag übernehmen <ArrowRight size={16}/></button>}{job.status==="claimed"&&<button className="button primary" disabled={disabled||!owned} onClick={()=>submit({type:"start",jobId:job.id})}>Bearbeitung starten <Wrench size={16}/></button>}{active&&owned&&<div className="job-edit"><div><label htmlFor={`note-${job.id}`}>Fortschritt / Reparaturbericht</label><textarea id={`note-${job.id}`} value={note} onChange={e=>setNote(e.target.value)} maxLength={1000} placeholder="Welche Arbeit wurde durchgeführt? Was fehlt noch?"/></div><div><label htmlFor={`blocker-${job.id}`}>Gibt es eine Blockierung?</label><select id={`blocker-${job.id}`} value={blocker||""} onChange={e=>setBlocker((e.target.value||null)as Blocker)}><option value="">Keine Blockierung</option><option value="parts">Ersatzteile fehlen</option><option value="funding">Finanzierung fehlt</option><option value="staff">Personal fehlt</option></select><small className="form-foot">Diese Angaben machen strukturelle Engpässe sichtbar.</small></div><div className="job-actions"><button className="button secondary" disabled={disabled||note.trim().length<3} onClick={()=>save("progress")}>Fortschritt speichern</button>{job.status==="in_progress"&&<button className="button primary" disabled={disabled||note.trim().length<3} onClick={()=>save("repair")}>Reparatur zur Prüfung melden <ClipboardCheck size={16}/></button>}</div></div>}{job.status==="awaiting_confirmation"&&<div className="form-message"><ClipboardCheck size={19}/><span>Die Betreiberperson muss die Funktion jetzt prüfen. Der Betriebszustand wurde durch die Reparaturmeldung nicht verändert.</span></div>}{job.status==="closed"&&<p className="closed-message"><CheckCircle2 size={17}/>Funktionsbestätigung erhalten · {time(job.closedAt,true)}</p>}</article>;
}

function DemoTools({disabled,submit,simulated,toggle,navigate}:{disabled:boolean;submit:Submit;simulated:boolean;toggle:()=>void;navigate:(s:Screen)=>void}) {
  const [reset,setReset]=useState(false);
  const steps=[{title:"Öffentliche Anzeige öffnen",text:"Zweites Fenster zeigt die Information für Haushalte.",screen:"overview"},{title:"Ausfall melden",text:"Betreiberin meldet einen Ausfall an Wasserstelle A.",screen:"report"},{title:"Auftrag übernehmen",text:"Techniker übernimmt und beginnt die Arbeit.",screen:"repairs"},{title:"Reparatur melden",text:"Der Betriebszustand bleibt bis zur Prüfung unverändert.",screen:"repairs"},{title:"Funktion bestätigen",text:"Betreiberin bestätigt den Vor-Ort-Funktionstest.",screen:"report"}] as const;
  return <div className="demo-grid"><section className="panel"><div className="section-heading"><h2>Dein Demo-Ablauf</h2><span className="pill neutral"><Clock3 size={14}/>3 Minuten</span></div><ol className="demo-steps">{steps.map((s,i)=><li key={s.title}><span>{i+1}</span><div><strong>{s.title}</strong><p>{s.text}</p></div>{i===0?<a href="/?view=display" target="_blank" rel="noopener noreferrer" aria-label="Öffentliche Anzeige öffnen"><ArrowUpRight size={18}/></a>:<button className="icon-button" aria-label={s.title} onClick={()=>navigate(s.screen)}><ArrowRight size={18}/></button>}</li>)}</ol></section><section className="panel"><h2>Unsicherheit sichtbar machen</h2><p className="panel-description">Die Szenarien verändern Beispieldaten. Nach der Vorführung die Demo zurücksetzen.</p><div className="scenarios">{[{id:"stale",title:"Bestätigung veralten lassen",text:"Wasserstelle A überschreitet die 12-Stunden-Frist.",icon:Clock3},{id:"conflict",title:"Widerspruch zeigen",text:"Eine erneute ausdrückliche Prüfung wird nötig.",icon:TriangleAlert},{id:"no-alternative",title:"Keine verlässliche Alternative",text:"Zugang zu B und C ist nicht bestätigt.",icon:MapPin}].map(s=><button key={s.id} disabled={disabled} onClick={()=>submit({type:"scenario",scenario:s.id as "stale"|"conflict"|"no-alternative"})}><s.icon size={21}/><span><strong>{s.title}</strong><small>{s.text}</small></span><ArrowRight size={16}/></button>)}<button className={simulated?"simulation-active":""} onClick={toggle}>{simulated?<Wifi size={21}/>:<WifiOff size={21}/>}<span><strong>{simulated?"Verbindung wiederherstellen":"Verbindung lokal unterbrechen"}</strong><small>Gekennzeichnete Simulation nur in diesem Fenster.</small></span><ArrowRight size={16}/></button></div><div className="reset-area">{reset?<><p>Alle Demo-Meldungen und Aufträge zurücksetzen?</p><div className="job-actions"><button className="button danger" disabled={disabled} onClick={async()=>{if(await submit({type:"reset"}))setReset(false);}}>Ja, Beispieldaten zurücksetzen</button><button className="text-button" onClick={()=>setReset(false)}>Abbrechen</button></div></>:<button className="button secondary full" disabled={disabled} onClick={()=>setReset(true)}><RefreshCw size={17}/>Demo zurücksetzen</button>}</div></section></div>;
}

const sensorLabels: Record<SensorState, string> = { normal: "Wird genutzt", low: "Auffällig wenig", alert: "Sensorhinweis", "no-data": "Keine Daten", learning: "Zu wenig Verlauf" };
const weekLabel = (w: string) => { const [y, n] = w.split("-W"); return `KW ${Number(n)}/${y}`; };
const litres = (v: number | null) => v === null ? "–" : v.toLocaleString("de-DE");

/** Replays real, historical Smart Handpump volumes from Kwale; it never feeds a live status. */
function SensorReplay({disabled,submit,onApplied}:{disabled:boolean;submit:Submit;onApplied:()=>void}) {
  const pumps=kwale.pumps as {id:string;name:string;km:number;volumes:(number|null)[]}[], focus=pumps[0], weeks=kwale.weeks;
  const [week,setWeek]=useState(8),[playing,setPlaying]=useState(false);
  useEffect(()=>{
    if(!playing) return;
    const timer=setInterval(()=>setWeek(w=>{if(w>=weeks.length-1){setPlaying(false);return w;}return w+1;}),650);
    return ()=>clearInterval(timer);
  },[playing,weeks.length]);
  const reading=readSensor(focus.volumes,week), episodes=alertEpisodes(focus.volumes);
  const max=Math.max(...focus.volumes.map(v=>v??0)), barW=10;
  const working=pumps.slice(1).filter(p=>readSensor(p.volumes,week).state==="normal");
  const past=episodes.filter(e=>e.end<week && week-e.end<=6).at(-1);
  return <section className="panel sensor">
    <div className="section-heading"><div><div className="eyebrow dark"><Activity size={14}/>ECHTE SENSORDATEN · WIEDERGABE</div><h2>Handpumpe {focus.name}, Kwale</h2></div><span className="pill neutral"><History size={14}/>Historisch, nicht live</span></div>
    <p className="panel-description">Wöchentliche Fördermenge aus Smart-Handpump-Sensoren ({[...new Set([weeks[0],weeks.at(-1)!].map(w=>w.slice(0,4)))].join("–")}). Wir spielen den echten Verlauf ab und zeigen, was WaterLink daraus machen würde: einen Hinweis zur Prüfung – nie einen bestätigten Status.</p>
    <div className="sensor-controls">
      <button className="button primary" onClick={()=>{if(week>=weeks.length-1)setWeek(0);setPlaying(!playing);}}>{playing?<Pause size={17}/>:<Play size={17}/>}{playing?"Pause":"Abspielen"}</button>
      <input type="range" min={0} max={weeks.length-1} value={week} onChange={e=>{setPlaying(false);setWeek(Number(e.target.value));}} aria-label="Woche wählen"/>
      <strong>{weekLabel(weeks[week])}</strong>
    </div>
    <svg className="sensor-chart" viewBox={`0 0 ${weeks.length*barW} 120`} preserveAspectRatio="none" role="img" aria-label={`Fördermenge ${focus.name} pro Woche, ${weekLabel(weeks[0])} bis ${weekLabel(weeks.at(-1)!)}`}>
      {episodes.map(e=><rect key={e.start} className="episode" x={e.start*barW} y={0} width={(e.end-e.start+1)*barW} height={120}/>)}
      {focus.volumes.map((v,i)=>v===null?<rect key={i} className="gap" x={i*barW+3} y={114} width={barW-6} height={4}/>:<rect key={i} className={i<=week?"bar":"bar later"} x={i*barW+1} y={118-Math.max(1,v/max*110)} width={barW-2} height={Math.max(1,v/max*110)}/>)}
      <rect className="now" x={week*barW} y={0} width={barW} height={120}/>
    </svg>
    <div className="sensor-legend"><span><i className="bar"/>Fördermenge pro Woche</span><span><i className="episode"/>Sensorhinweis aktiv</span><span><i className="gap"/>Keine Daten (Funksignal)</span></div>
    <div className={`sensor-hint ${reading.state}`}>
      {reading.state==="alert"?<TriangleAlert size={24}/>:reading.state==="normal"?<CheckCircle2 size={24}/>:<CircleHelp size={24}/>}
      <div>
        <strong>{reading.state==="alert"?`Sensorhinweis: seit ${reading.quietWeeks} Wochen fast keine Förderung`:reading.state==="low"?"Diese Woche auffällig wenig – noch kein Hinweis":reading.state==="no-data"?"Keine Daten diese Woche":reading.state==="learning"?"Noch zu wenig Verlauf für einen Vergleich":"Pumpe wird genutzt – kein Hinweis"}</strong>
        <p>{reading.state==="alert"?"WaterLink würde die Wasserstelle auf „Unklar – Prüfung nötig“ setzen und die Betreiberin bitten, vor Ort zu prüfen. Null kann Ausfall oder defekter Sensor bedeuten; erst die Prüfung erzeugt eine Meldung und einen Reparaturauftrag.":reading.state==="low"?"Eine einzelne Woche kann Zufall sein (Ferien, Regen). Ein Hinweis entsteht erst ab zwei Wochen in Folge.":reading.state==="no-data"?"Fehlende Werte entstehen durch schwaches Funksignal. Das ist kein Ausfall – der Status bleibt, wie zuletzt bestätigt.":reading.state==="learning"?"Ohne Vergleichswert gibt es keinen Hinweis.":past?`Die Förderung läuft wieder. Laut Sensor fiel die Pumpe ${past.end-past.start+1} Wochen aus (${weekLabel(weeks[past.start])} bis ${weekLabel(weeks[past.end])}). In WaterLink würde erst die Funktionsprüfung vor Ort den Status wieder auf „Funktioniert“ setzen.`:`Diese Woche: ${litres(reading.value)} (üblich etwa ${litres(reading.baseline&&Math.round(reading.baseline))}).`}</p>
        {reading.state==="alert"&&<p>{working.length?<>Laut Sensor in Betrieb: {working.map(p=>`${p.name} (${p.km.toLocaleString("de-DE")} km)`).join(", ")}. Als Alternative zählt das erst nach einer Bestätigung.</>:"Keine Nachbarpumpe meldet in dieser Woche normalen Betrieb."}</p>}
      </div>
    </div>
    <ul className="sensor-neighbours">{pumps.map(p=>{const r=readSensor(p.volumes,week);return <li key={p.id}><span><strong>{p.name}</strong><small>{p.id===focus.id?"Abgespielte Pumpe":`${p.km.toLocaleString("de-DE")} km entfernt`}</small></span><span className="sensor-value">{litres(r.value)}</span><span className={`pill ${r.state==="alert"?"amber":r.state==="normal"?"green":"neutral"}`}>{sensorLabels[r.state]}</span></li>;})}</ul>
    <div className="sensor-apply"><p>Für den Demo-Ablauf: Das Muster als simulierten Sensorhinweis auf Wasserstelle A übertragen. Danach prüft die Betreiberin vor Ort und meldet.</p><button className="button secondary" disabled={disabled||reading.state!=="alert"} onClick={async()=>{if(await submit({type:"scenario",scenario:"sensor"}))onApplied();}}><Activity size={17}/>Hinweis auf A übertragen</button>{reading.state!=="alert"&&<small>Verfügbar, sobald in der Wiedergabe ein Sensorhinweis aktiv ist.</small>}</div>
    <small className="sensor-source">Daten: {kwale.meta.source}, {kwale.meta.license}, doi:{kwale.meta.doi}. {kwale.meta.notes} Sensorwert ohne Angabe der Einheit im Datensatz.</small>
  </section>;
}
