"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Maximize, WifiOff } from "lucide-react";
import { findAlternative, getPointDisplay, type State } from "@/lib/domain";
import { CanMark, CanMeter, PointTile, StatusIcon } from "./marks";
import { advice, ago, clock, isTracked, letter, toneOf, validityLeft, validityText } from "./format";

/** Rows whose shown status changed recently; drives the board’s one authored motion. */
function useChanged(keys: Record<string, string>): Set<string> {
  const previous = useRef<Record<string, string> | null>(null);
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const signature = JSON.stringify(keys);
  useEffect(() => {
    const before = previous.current;
    previous.current = keys;
    if (!before) return;
    const ids = Object.keys(keys).filter((id) => before[id] !== undefined && before[id] !== keys[id]);
    if (!ids.length) return;
    setChanged(new Set(ids));
    const timer = setTimeout(() => setChanged(new Set()), 2600);
    return () => clearTimeout(timer);
    // The signature string is the dependency; keys is rebuilt every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  return changed;
}

/** Glanceable board for a shop or meeting point, readable from a few metres. */
export function DisplayBoard({ state, now, offline, lastSync, compact = false, onFullscreen }: { state: State; now: number; offline: boolean; lastSync: string | null; compact?: boolean; onFullscreen?: () => void }) {
  const points = state.points.filter(isTracked);
  const region = state.region ?? null;
  const shown = Object.fromEntries(points.map((p) => { const d = getPointDisplay(p, now, offline); return [p.id, `${d.certainty}:${d.status}`]; }));
  const changed = useChanged(shown);
  return (
    <div className={`board ${compact ? "board-compact" : ""}`}>
      <header className="board-head">
        <div className="board-brand"><CanMark size={compact ? 26 : 40} /><span>WaterLink</span></div>
        <h1>Does our water point work today?</h1>
        <div className="board-clock">
          <strong>{clock(now)}</strong>
          <span>{region ? region.label.split(",")[0] : "Demo neighbourhood"} · EAT</span>
        </div>
      </header>
      {offline && (
        <div className="board-offline" role="status">
          <WifiOff size={compact ? 22 : 34} aria-hidden="true" />
          <div><strong>No connection. Today’s state is not confirmed.</strong><p>Please ask on site before you walk. Last update {clock(lastSync)} EAT. The board updates itself when the connection is back.</p></div>
        </div>
      )}
      <ul className="board-rows">
        {points.map((p) => {
          const d = getPointDisplay(p, now, offline), tip = advice(d);
          const alt = d.status !== "working" ? findAlternative(state.points, p.id, now, offline) : null;
          return (
            <li key={p.id} className={`board-row ${toneOf(d)} ${changed.has(p.id) ? "is-changed" : ""}`}>
              <PointTile point={p} className="board-letter" />
              <div className="board-name"><strong>{p.name}</strong><span>About {p.walkingMinutes} min walk</span></div>
              <div className="board-state">
                <span className="board-icon"><StatusIcon display={d} size={compact ? 26 : 44} /></span>
                <div><strong>{tip.word}</strong><span>{tip.line}</span></div>
              </div>
              <div className="board-fresh">
                <CanMeter level={validityLeft(p, d, now)} size={compact ? 34 : 58} label={validityText(p, d, now)} />
                <div>
                  <span>{d.certainty !== "fresh" ? "Last confirmed" : d.status === "working" ? "Confirmed" : "Reported"}</span>
                  <strong>{p.confirmedAt ? clock(p.confirmedAt) : "–"}</strong>
                  <small>{p.confirmedAt ? ago(p.confirmedAt, now) : "no check yet"}</small>
                </div>
              </div>
              {d.status !== "working" && !offline && (
                <p className={`board-alt ${alt ? "" : "no-alt"}`}>
                  <ArrowRight size={compact ? 18 : 30} aria-hidden="true" />
                  {alt ? <span>Go to <b>{letter(alt)} · {alt.name}</b> instead, about {alt.walkingMinutes} min. Confirmed {clock(alt.confirmedAt)}.</span>
                    : <span>No confirmed alternative. Please ask on site.</span>}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <footer className="board-foot">
        <p><b>Working</b> means water can be drawn. It says nothing about drinking-water quality.</p>
        <p><b>The can empties in 12 hours.</b> After that a point shows as unclear until someone checks on site.</p>
        {onFullscreen && <button className="board-fs" onClick={onFullscreen}><Maximize size={16} aria-hidden="true" />Full screen</button>}
        <p className="board-source">{region ? `Places: ${region.attribution.replace(/\.$/, "")}. Confirmations and people are simulated.` : "Demo with fictional example data."}</p>
      </footer>
    </div>
  );
}
