"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Maximize, WifiOff } from "lucide-react";
import { findAlternative, getPointDisplay, type State } from "@/lib/domain";
import { LANGS, LANG_NAME, TEXT, type Lang } from "@/lib/i18n";
import { CanMark, CanMeter, PointTile, StatusIcon } from "./marks";
import { advice, ago, clock, isTracked, letter, toneOf, validityLeft, validityText } from "./format";
import { QrCode } from "./qr";

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

/** Where the QR code leads: the SMS view of this same site. Empty on the server, filled in once the page runs. */
function useSmsLink(): string {
  return useSyncExternalStore(() => () => {}, () => `${location.origin}/#sms`, () => "");
}

interface BoardProps {
  state: State;
  now: number;
  offline: boolean;
  lastSync: string | null;
  compact?: boolean;
  onFullscreen?: () => void;
  lang?: Lang;
  /** Shows the language switch (and, on the full board, the QR code). */
  onLang?: (lang: Lang) => void;
}

/** Glanceable board for a shop or meeting point, readable from a few metres. */
export function DisplayBoard({ state, now, offline, lastSync, compact = false, onFullscreen, lang = "en", onLang }: BoardProps) {
  const t = TEXT[lang];
  const points = state.points.filter(isTracked);
  const region = state.region ?? null;
  const shown = Object.fromEntries(points.map((p) => { const d = getPointDisplay(p, now, offline); return [p.id, `${d.certainty}:${d.status}`]; }));
  const changed = useChanged(shown);
  const smsLink = useSmsLink();
  return (
    <div className={`board ${compact ? "board-compact" : ""}`} lang={lang}>
      <header className="board-head">
        <div className="board-brand"><CanMark size={compact ? 26 : 40} /><span>WaterLink</span></div>
        <h1>{t.boardTitle}</h1>
        <div className="board-clock">
          <strong>{clock(now)}</strong>
          <span>{region ? region.label.split(",")[0] : t.neighbourhood} · EAT</span>
        </div>
      </header>
      {offline && (
        <div className="board-offline" role="status">
          <WifiOff size={compact ? 22 : 34} aria-hidden="true" />
          <div><strong>{t.offlineTitle}</strong><p>{t.offlineBody(clock(lastSync))}</p></div>
        </div>
      )}
      <ul className="board-rows">
        {points.map((p) => {
          const d = getPointDisplay(p, now, offline), tip = advice(d, lang);
          const alt = d.status !== "working" ? findAlternative(state.points, p.id, now, offline) : null;
          return (
            <li key={p.id} className={`board-row ${toneOf(d)} ${changed.has(p.id) ? "is-changed" : ""}`}>
              <PointTile point={p} className="board-letter" />
              <div className="board-name"><strong>{p.name}</strong><span>{t.walk(p.walkingMinutes)}</span></div>
              <div className="board-state">
                <span className="board-icon"><StatusIcon display={d} size={compact ? 26 : 44} /></span>
                <div><strong>{tip.word}</strong><span>{tip.line}</span></div>
              </div>
              <div className="board-fresh">
                <CanMeter level={validityLeft(p, d, now)} size={compact ? 34 : 58} label={validityText(p, d, now, lang)} />
                <div>
                  <span>{d.certainty !== "fresh" ? t.lastConfirmed : d.status === "working" ? t.confirmed : t.reported}</span>
                  <strong>{p.confirmedAt ? clock(p.confirmedAt) : "–"}</strong>
                  <small>{p.confirmedAt ? ago(p.confirmedAt, now, lang) : t.noCheck}</small>
                </div>
              </div>
              {d.status !== "working" && !offline && (
                <p className={`board-alt ${alt ? "" : "no-alt"}`}>
                  <ArrowRight size={compact ? 18 : 30} aria-hidden="true" />
                  {alt ? (() => { const [before, after] = t.goTo(alt.walkingMinutes, clock(alt.confirmedAt)); return <span>{before}<b>{letter(alt)} · {alt.name}</b>{after}</span>; })()
                    : <span>{t.noAlternative}</span>}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <footer className="board-foot">
        <p><b>{t.workingNote[0]}</b>{t.workingNote[1]}</p>
        <p><b>{t.canNote[0]}</b>{t.canNote[1]}</p>
        {onLang && !compact && (
          <div className="board-tools">
            {smsLink && (
              <div className="board-qr">
                <QrCode value={smsLink} label={t.qrCaption} />
                <p>{t.qrCaption}</p>
              </div>
            )}
            <div className="board-lang" role="group" aria-label={t.language}>
              {LANGS.map((code) => (
                <button key={code} type="button" lang={code} aria-pressed={code === lang} onClick={() => onLang(code)}>{LANG_NAME[code]}</button>
              ))}
            </div>
          </div>
        )}
        {onFullscreen && <button className="board-fs" onClick={onFullscreen}><Maximize size={16} aria-hidden="true" />{t.fullscreen}</button>}
        {t.draft && <p className="board-draft">{t.draft}</p>}
        <p className="board-source">{region ? t.places(region.attribution.replace(/\.$/, "")) : t.fictional}</p>
      </footer>
    </div>
  );
}
