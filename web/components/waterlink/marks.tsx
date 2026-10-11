"use client";
import { useId } from "react";
import { Activity, Check, CircleHelp, TriangleAlert, WifiOff, X } from "lucide-react";
import type { PointDisplay } from "@/lib/domain";
import { advice, toneOf } from "./format";

// One jerrycan geometry for every scale: logo, meter, board. viewBox 0 0 40 48.
const BODY = "M7 13h18.5l8.5 7.2V41a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V13Z";
const HANDLE = "M13.5 3.5h10a3 3 0 0 1 3 3V13h-4V8h-8v5h-4V6.5a3 3 0 0 1 3-3Z";

/** The WaterLink mark: an ink jerrycan with a blue cap. */
export function CanMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size * 0.84} height={size} viewBox="0 0 40 48" aria-hidden="true" className="can-mark">
      <path d={HANDLE} className="can-handle" />
      <path d={BODY} className="can-body-solid" />
      <rect x="27.5" y="8" width="7" height="6" rx="1.6" transform="rotate(40 31 11)" className="can-cap" />
      <path d="M11.5 25.5h18M11.5 34.5h18" className="can-rib-light" />
    </svg>
  );
}

/**
 * Signature move: the water level is the share of the 12-hour validity still left.
 * Full right after an on-site confirmation, empty when it has expired.
 */
export function CanMeter({ level, size = 34, label }: { level: number; size?: number; label?: string }) {
  const clip = useId().replace(/:/g, "");
  const top = 46 - Math.max(0, Math.min(1, level)) * 33;
  return (
    <svg width={size * 0.84} height={size} viewBox="0 0 40 48" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      className={`can-meter ${level <= 0 ? "empty" : ""}`}>
      <defs><clipPath id={clip}><path d={BODY} /></clipPath></defs>
      <path d={HANDLE} className="can-handle" />
      <path d={BODY} className="can-body" />
      <g clipPath={`url(#${clip})`}>
        <path className="can-water" style={{ transform: `translateY(${top}px)` }}
          d="M0 1.2C5 -0.6 9 2.8 14 1.2S23 -0.6 28 1.2 37 2.8 42 1.2V40H0Z" />
      </g>
      <path d={BODY} className="can-outline" />
      <rect x="27.5" y="8" width="7" height="6" rx="1.6" transform="rotate(40 31 11)" className="can-cap" />
      <path d="M11.5 25.5h18M11.5 34.5h18" className="can-rib" />
    </svg>
  );
}

export function StatusIcon({ display, size = 20 }: { display: PointDisplay; size?: number }) {
  const props = { size, strokeWidth: 2.6, "aria-hidden": true as const };
  if (display.certainty === "sensor") return <Activity {...props} />;
  if (display.certainty !== "fresh" && display.label === "No connection") return <WifiOff {...props} />;
  if (display.status === "working") return <Check {...props} />;
  if (display.status === "down") return <X {...props} />;
  if (display.status === "limited") return <TriangleAlert {...props} />;
  return <CircleHelp {...props} />;
}

/** Status as word, drawn symbol and colour together; never colour alone. */
export function StatusChip({ display, size = "md" }: { display: PointDisplay; size?: "sm" | "md" | "lg" }) {
  const tip = advice(display);
  return (
    <span className={`status-chip ${toneOf(display)} ${size}`}>
      <span className="status-chip-icon"><StatusIcon display={display} size={size === "lg" ? 30 : size === "sm" ? 15 : 20} /></span>
      <span className="status-chip-word">{tip.word}</span>
    </span>
  );
}
