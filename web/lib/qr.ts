import qrcode from "qrcode-generator";

/** The QR code of a text as one SVG path of 1x1 squares, with a quiet zone of four modules on every side. */
export function qrPath(value: string): { size: number; path: string } {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  let path = "";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) if (qr.isDark(row, col)) path += `M${col + 4} ${row + 4}h1v1h-1z`;
  }
  return { size: count + 8, path };
}
