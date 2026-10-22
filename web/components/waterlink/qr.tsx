import { useMemo } from "react";
import { qrPath } from "@/lib/qr";

/** A QR code drawn as one SVG path (no image, no network). Black on white, whatever the colours around it. */
export function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
  const { size, path } = useMemo(() => qrPath(value), [value]);
  return (
    <svg className={className} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}
