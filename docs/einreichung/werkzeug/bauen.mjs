// Builds the submission PDFs from the HTML in docs/einreichung/folien/ with the installed Chrome.
//   node docs/einreichung/werkzeug/bauen.mjs            (from the repository root)
// Reads belege/wpdx-kenya-zahlen.json for the chart. Writes WaterLink_Pitch.pdf and WaterLink_OnePager.pdf next to the folders,
// and a PNG of every slide into folien/_vorschau/ (git-ignored) to look at them.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(here("../../../web/node_modules/@playwright/test"));
const data = JSON.parse(readFileSync(here("../belege/wpdx-kenya-zahlen.json"), "utf8"));

/** Records per year of the last survey, up to today; the last two years are empty and say so. */
function chart() {
  const years = Array.from({ length: 21 }, (_, i) => 2006 + i);
  const W = 760, H = 330, left = 8, right = 690, base = 262, top = 44, max = 14000;
  const step = (right - left) / years.length, bar = step * 0.68;
  const x = (year) => left + (year - 2006) * step + (step - bar) / 2;
  const h = (n) => Math.max(0, (n / max) * (base - top));
  const medianX = left + (2026.8 - data.medianAgeYears - 2006) * step + step / 2;
  const bars = years.map((y) => {
    const n = data.byYear[String(y)] ?? 0;
    return n ? `<rect x="${x(y).toFixed(1)}" y="${(base - h(n)).toFixed(1)}" width="${bar.toFixed(1)}" height="${h(n).toFixed(1)}" fill="#1f4fa8" rx="2"/>` : "";
  }).join("");
  const labels = [2006, 2010, 2014, 2018, 2022, 2026].map((y) => `<text x="${(x(y) + bar / 2).toFixed(1)}" y="${base + 26}" text-anchor="middle" font-size="16" fill="#4c483f">${y}</text>`).join("");
  const peak = data.byYear["2023"];
  const gapX = x(2025) - 4, gapW = W - 6 - gapX;
  return `<svg viewBox="0 0 ${W} ${H}" width="720" height="${Math.round(H * 720 / W)}" role="img" aria-label="Number of Kenyan water point survey records by year of the last survey: none after November 2024" xmlns="http://www.w3.org/2000/svg" style="font-family:'Atkinson Hyperlegible Next',system-ui,sans-serif">
    <text x="${left}" y="20" font-size="17" fill="#4c483f">Survey records by year of the last survey</text>
    ${bars}
    <line x1="${left}" y1="${base}" x2="${right}" y2="${base}" stroke="#1b1c1e" stroke-width="2"/>
    <text x="${(x(2023) + bar / 2).toFixed(1)}" y="${(base - h(peak) - 8).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="700" fill="#1b1c1e">${peak.toLocaleString("en-US")} in 2023</text>
    <line x1="${medianX.toFixed(1)}" y1="${top + 6}" x2="${medianX.toFixed(1)}" y2="${base}" stroke="#a34700" stroke-width="2.5" stroke-dasharray="6 5"/>
    <text x="${(medianX - 8).toFixed(1)}" y="${top + 20}" text-anchor="end" font-size="16" font-weight="700" fill="#7a3900">median record: ${data.medianAgeYears} years old</text>
    <rect x="${gapX.toFixed(1)}" y="${top + 62}" width="${gapW.toFixed(1)}" height="${base - top - 62}" fill="none" stroke="#c0302a" stroke-width="2.5" stroke-dasharray="6 5" rx="4"/>
    <text x="${(gapX + gapW / 2).toFixed(1)}" y="${top + 88}" text-anchor="middle" font-size="16" font-weight="700" fill="#8a1f1b">no</text>
    <text x="${(gapX + gapW / 2).toFixed(1)}" y="${top + 108}" text-anchor="middle" font-size="16" font-weight="700" fill="#8a1f1b">survey</text>
    <text x="${(gapX + gapW / 2).toFixed(1)}" y="${top + 128}" text-anchor="middle" font-size="16" font-weight="700" fill="#8a1f1b">since</text>
    <text x="${(gapX + gapW / 2).toFixed(1)}" y="${top + 148}" text-anchor="middle" font-size="16" font-weight="700" fill="#8a1f1b">Nov 2024</text>
    ${labels}
  </svg>`;
}

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext();

async function render(htmlName, pdfName, size) {
  const source = readFileSync(here(`../folien/${htmlName}`), "utf8").replace("<!--CHART-->", chart());
  const built = here(`../folien/_gebaut-${htmlName}`);
  writeFileSync(built, source);
  const page = await context.newPage();
  await page.goto(pathToFileURL(built).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.pdf({ path: here(`../${pdfName}`), width: size.width, height: size.height, printBackground: true, preferCSSPageSize: true });
  const folder = here("../folien/_vorschau/");
  mkdirSync(folder, { recursive: true });
  const slides = await page.locator(".slide").all();
  for (const [i, slide] of slides.entries()) await slide.screenshot({ path: `${folder}${htmlName.replace(".html", "")}-${String(i + 1).padStart(2, "0")}.png` });
  await page.close();
  console.log(`${pdfName}: ${slides.length} pages`);
}

await render("pitch.html", "WaterLink_Pitch.pdf", { width: "1280px", height: "720px" });
await render("onepager.html", "WaterLink_OnePager.pdf", { width: "794px", height: "1123px" }).catch((e) => console.log("one-pager skipped:", e.message.slice(0, 80)));
await browser.close();
