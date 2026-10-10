/**
 * Turns weekly handpump volumes into a hint for WaterLink. A sensor hint is never an operating
 * status: it only asks an operator to check on site. Missing weeks (weak signal) are never read
 * as an outage.
 */
export type SensorState = "normal" | "low" | "alert" | "no-data" | "learning";
export interface SensorReading {
  state: SensorState;
  value: number | null;
  /** Typical weekly volume before the current quiet streak (median of up to six reported weeks). */
  baseline: number | null;
  quietWeeks: number;
}

export const ALERT_AFTER_WEEKS = 2;
const QUIET_SHARE = 0.1, BASE_WEEKS = 6, MIN_BASE_WEEKS = 3, MIN_BASELINE = 1000, ACTIVE_FLOOR = 500;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function baselineBefore(volumes: (number | null)[], end: number): number | null {
  const recent: number[] = [];
  // Only weeks with real use count, so an outage never lowers the comparison value.
  for (let i = end - 1; i >= 0 && recent.length < BASE_WEEKS; i--) if (volumes[i] !== null && volumes[i]! >= ACTIVE_FLOOR) recent.push(volumes[i]!);
  if (recent.length < MIN_BASE_WEEKS) return null;
  const value = median(recent);
  return value >= MIN_BASELINE ? value : null;
}

export function readSensor(volumes: (number | null)[], index: number): SensorReading {
  const value = volumes[index] ?? null;
  if (value === null) return { state: "no-data", value, baseline: baselineBefore(volumes, index), quietWeeks: 0 };
  // The earliest start of an unbroken quiet streak ending here, compared with the weeks before it.
  let runStart = index;
  while (runStart > 0 && volumes[runStart - 1] !== null && volumes[runStart - 1] !== undefined) runStart--;
  let quietWeeks = 0, baseline = baselineBefore(volumes, index);
  for (let start = runStart; start <= index; start++) {
    const base = baselineBefore(volumes, start);
    if (base !== null && volumes.slice(start, index + 1).every((v) => v! < base * QUIET_SHARE)) {
      quietWeeks = index - start + 1; baseline = base;
      break;
    }
  }
  if (quietWeeks >= ALERT_AFTER_WEEKS) return { state: "alert", value, baseline, quietWeeks };
  if (quietWeeks === 1) return { state: "low", value, baseline, quietWeeks };
  return { state: baseline === null ? "learning" : "normal", value, baseline, quietWeeks: 0 };
}

/** Weeks in which a hint would have been active, as inclusive index ranges. */
export function alertEpisodes(volumes: (number | null)[]): { start: number; end: number }[] {
  const episodes: { start: number; end: number }[] = [];
  volumes.forEach((_, i) => {
    const reading = readSensor(volumes, i);
    if (reading.state !== "alert") return;
    const start = i - reading.quietWeeks + 1, last = episodes.at(-1);
    if (last && last.start === start) last.end = i;
    else episodes.push({ start, end: i });
  });
  return episodes;
}
