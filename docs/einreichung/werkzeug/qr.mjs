// Writes the QR codes of the slides (the practice-mode link and the repository) as SVG.
//   node --experimental-strip-types docs/einreichung/werkzeug/qr.mjs   (run from web/)
import { writeFileSync } from "node:fs";
import { qrPath } from "../../../web/lib/qr.ts";

const out = new URL("../folien/assets/", import.meta.url);
for (const [name, url] of [["qr-sandbox", "https://waterlink-demo.waterlink.workers.dev/?view=stage&sandbox=1"], ["qr-github", "https://github.com/OsmanTuerkmen/WaterLink"]]) {
  const { size, path } = qrPath(url);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${size + 4} ${size + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${size + 4}" height="${size + 4}" fill="#fff"/><path d="${path}" fill="#1b1c1e"/></svg>\n`;
  writeFileSync(new URL(`${name}.svg`, out), svg);
  console.log(name, size);
}
