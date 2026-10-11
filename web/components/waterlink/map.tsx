"use client";
import { useMemo } from "react";
import { getPointDisplay, type State, type WaterPoint } from "@/lib/domain";
import osm from "@/data/osm-area.json";
import { isTracked, letter, toneOf } from "./format";

type Way = { kind: "road" | "water"; rank: number; name: string | null; line: [number, number][] };
type Place = { kind: string; name: string; lat: number; lon: number };
const WAYS = osm.ways as Way[];
const PLACES = osm.places as Place[];
const UNIT = 111_320; // metres per degree of latitude
// Status symbols drawn at badge scale (radius 15), the same four meanings as the rows.
const SYMBOL: Record<string, string> = {
  working: "M-6.5 0.5l4.5 4.5 8.5-9", down: "M-5.5-5.5l11 11M5.5-5.5l-11 11",
  limited: "M0-7v8M0 6.2v0.6", unknown: "M-4.2-3.4a4.4 4.4 0 1 1 6 4.1c-1.3.6-1.8 1.3-1.8 2.6M0 6.6v0.6",
};

interface Props {
  state: State;
  now: number;
  offline: boolean;
  /** "near" frames the programme’s points, "all" every recorded point. */
  extent?: "near" | "all";
  selected?: string | null;
  onSelect?: (id: string) => void;
  /** Draws the walk from a point that is not working to its confirmed alternative. */
  route?: { from: string; to: string } | null;
  className?: string;
  label?: string;
}

/** Neighbourhood map drawn from WPdx coordinates and OpenStreetMap roads. No tiles, works offline. */
export function NeighbourhoodMap({ state, now, offline, extent = "near", selected, onSelect, route, className = "", label }: Props) {
  const geo = useMemo(() => {
    const located = state.points.filter((p) => typeof p.lat === "number" && typeof p.lon === "number");
    const framed = extent === "near" ? located.filter(isTracked) : located;
    if (!framed.length) return null;
    const lats = framed.map((p) => p.lat!), lons = framed.map((p) => p.lon!);
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const k = Math.cos((midLat * Math.PI) / 180);
    // Metres east/north of the frame’s south-west corner.
    const pad = extent === "near" ? 700 : 260;
    const minLat = Math.min(...lats), minLon = Math.min(...lons);
    const width = Math.max((Math.max(...lons) - minLon) * UNIT * k + pad * 2, 900);
    const height = Math.max((Math.max(...lats) - minLat) * UNIT + pad * 2, 640);
    const cx = ((Math.max(...lons) + minLon) / 2 - minLon) * UNIT * k, cy = ((Math.max(...lats) + minLat) / 2 - minLat) * UNIT;
    const x = (lon: number) => (lon - minLon) * UNIT * k - cx + width / 2;
    const y = (lat: number) => height / 2 - ((lat - minLat) * UNIT - cy);
    return { x, y, width, height, located };
  }, [state.points, extent]);

  if (!geo) return null;
  const { x, y, width, height, located } = geo;
  const scale = width / 900; // marker sizes stay readable at any extent
  const tracked = located.filter(isTracked);
  const others = located.filter((p) => !isTracked(p));
  const place = (p: WaterPoint) => ({ px: x(p.lon!), py: y(p.lat!) });

  // Points recorded at the same spot fan out with a leader line instead of hiding each other.
  const r = (extent === "all" ? 22 : 30) * scale;
  const markers: { p: WaterPoint; px: number; py: number; ox: number; oy: number }[] = [];
  for (const p of tracked) {
    const { px, py } = place(p);
    let ox = px, oy = py, turn = 0;
    // Square tiles overlap unless they are apart on at least one axis.
    while (markers.some((m) => Math.abs(m.ox - ox) < r * 3.1 && Math.abs(m.oy - oy) < r * 3.1) && turn < 12) {
      const angle = -Math.PI / 2 + turn * (Math.PI / 3);
      const reach = r * (turn < 6 ? 3.5 : 6.4);
      ox = px + Math.cos(angle) * reach; oy = py + Math.sin(angle) * reach; turn++;
    }
    markers.push({ p, px, py, ox, oy });
  }
  const at = (id: string) => markers.find((m) => m.p.id === id);
  const from = route ? at(route.from) : null, to = route ? at(route.to) : null;
  const path = (line: [number, number][]) => line.map(([lon, lat], i) => `${i ? "L" : "M"}${x(lon).toFixed(1)} ${y(lat).toFixed(1)}`).join("");

  return (
    <figure className={`nmap ${className}`}>
      <svg viewBox={`0 0 ${width.toFixed(0)} ${height.toFixed(0)}`} role="img" aria-label={label ?? "Map of the neighbourhood with the water points"} preserveAspectRatio="xMidYMid slice">
        <rect width={width} height={height} className="nmap-ground" />
        {WAYS.filter((w) => w.kind === "water").map((w, i) => <path key={`w${i}`} d={path(w.line)} className="nmap-stream" />)}
        {WAYS.filter((w) => w.kind === "road").sort((a, b) => b.rank - a.rank).map((w, i) => (
          <g key={`r${i}`}>
            <path d={path(w.line)} className={`nmap-road-case rank-${w.rank}`} />
            <path d={path(w.line)} className={`nmap-road rank-${w.rank}`} />
          </g>
        ))}
        {PLACES.map((pl) => (
          <g key={pl.name} transform={`translate(${x(pl.lon)} ${y(pl.lat)})`} className="nmap-place">
            <rect x={-5 * scale} y={-5 * scale} width={10 * scale} height={10 * scale} rx={2 * scale} />
            <text x={12 * scale} y={5 * scale} style={{ fontSize: 17 * scale }}>{pl.name}</text>
          </g>
        ))}
        {others.map((p) => {
          const { px, py } = place(p);
          return (
            <circle key={p.id} cx={px} cy={py} r={(selected === p.id ? 9 : 6) * scale}
              className={`nmap-recorded ${selected === p.id ? "selected" : ""}`} onClick={onSelect ? () => onSelect(p.id) : undefined}>
              <title>{`${p.name}: recorded in a survey, not confirmed today`}</title>
            </circle>
          );
        })}
        {from && to && (
          <g className="nmap-route">
            <path d={`M${from.ox} ${from.oy}L${to.ox} ${to.oy}`} style={{ strokeWidth: 7 * scale, strokeDasharray: `${2 * scale} ${14 * scale}` }} />
          </g>
        )}
        {markers.filter((m) => m.ox !== m.px || m.oy !== m.py).map(({ p, px, py, ox, oy }) => (
          <g key={`lead-${p.id}`}>
            <path d={`M${px} ${py}L${ox} ${oy}`} className="nmap-leader" style={{ strokeWidth: 2.5 * scale }} />
            <circle cx={px} cy={py} r={5 * scale} className="nmap-anchor" />
          </g>
        ))}
        {markers.map(({ p, px, py, ox, oy }) => {
          const d = getPointDisplay(p, now, offline);
          // The badge sits on the corner facing away from the spot a fanned-out tile came from.
          const bx = ox + (ox < px ? -1 : 1) * r * 0.95, by = oy + (oy > py ? 1 : -1) * r * 0.95;
          return (
            <g key={p.id} className={`nmap-marker ${toneOf(d)} ${selected === p.id ? "selected" : ""}`}
              onClick={onSelect ? () => onSelect(p.id) : undefined} role={onSelect ? "button" : undefined}
              aria-label={onSelect ? `${p.name}, ${d.label}` : undefined} tabIndex={onSelect ? 0 : undefined}
              onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(p.id); } } : undefined}>
              <rect x={ox - r} y={oy - r} width={r * 2} height={r * 2} rx={9 * scale} className="nmap-tile" style={{ strokeWidth: 4 * scale }} />
              <text x={ox} y={oy + r / 3} textAnchor="middle" style={{ fontSize: r }}>{letter(p) || "•"}</text>
              <g className="nmap-badge" transform={`translate(${bx} ${by}) scale(${r / 23})`}>
                <circle r="15" />
                <path d={SYMBOL[d.certainty === "fresh" ? d.status : "unknown"]} />
              </g>
            </g>
          );
        })}
      </svg>
      <figcaption>Roads © OpenStreetMap contributors · water points from WPdx surveys · straight lines are not walking routes</figcaption>
    </figure>
  );
}
