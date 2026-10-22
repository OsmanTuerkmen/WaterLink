// Records the walkthrough shown in the README: the whole repair story on the pitch stage in the sandbox, as an animated GIF.
//   npm run dev                                   (in one terminal)
//   node scripts/record-walkthrough.mjs           (in another; writes ../docs/media/walkthrough.gif)
// Uses the installed Chrome and sharp. Nothing is sent to a server: the sandbox runs in the browser.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.env.WATERLINK_BASE_URL ?? "http://127.0.0.1:5173";
const out = fileURLToPath(new URL("../../docs/media/walkthrough.gif", import.meta.url));
const WIDTH = 1000;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 800 }, deviceScaleFactor: 1 });
await page.goto(`${base}/?view=stage&sandbox=1`);
await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
await page.waitForTimeout(800);

const frames = [];
async function frame(caption, seconds = 2.4) {
  await page.evaluate((text) => {
    let bar = document.getElementById("walkthrough-caption");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "walkthrough-caption";
      Object.assign(bar.style, { position: "fixed", left: "0", right: "0", bottom: "0", padding: "16px 28px", zIndex: "99999", textAlign: "center",
        font: "700 28px/1.25 system-ui, sans-serif", background: "#1b1b1b", color: "#ffffff" });
      document.body.appendChild(bar);
    }
    bar.textContent = text;
  }, caption);
  await page.waitForTimeout(350);
  const png = await page.screenshot();
  frames.push({ png: await sharp(png).resize({ width: WIDTH }).png().toBuffer(), delay: Math.round(seconds * 1000) });
}

const amina = page.getByRole("region", { name: /Amina/ });
const daniel = page.getByRole("region", { name: /Daniel/ });
const rowA = (scope) => scope.getByRole("listitem").filter({ hasText: "Borehole A" });

await frame("Three water points. The board says what was last confirmed: A and B work, C is unclear.", 3.2);

await rowA(amina).getByRole("button", { name: "Report a problem" }).click();
await amina.getByRole("button", { name: /No water/ }).click();
await amina.getByRole("button", { name: "Next" }).click();
await amina.getByLabel("What is wrong?").fill("No water after 20 pumps.");
await amina.getByLabel(/I am at the water point/).check();
await frame("Amina, the operator, reports that borehole A gives no water.");

await amina.getByRole("button", { name: "Send report" }).click();
await page.waitForTimeout(600);
await frame("The board turns A red at once and sends people to B. Daniel gets the repair job.", 3.2);

await daniel.getByRole("button", { name: /take this job/ }).click();
await daniel.getByRole("button", { name: /start work/ }).click();
await frame("Daniel, the technician, takes the job and starts work. Everyone can see who is on it.");

await daniel.getByRole("button", { name: /Report repair/ }).click();
await daniel.getByLabel(/What did you do/).fill("Replaced the cup seal, tested 10 litres.");
await daniel.getByRole("button", { name: "Repaired, ask for test" }).click();
await page.waitForTimeout(600);
await frame("Repaired is not working yet: the board stays red until someone tests it on site.", 3.2);

await amina.getByRole("button", { name: "Back to my water points" }).click();
await rowA(amina).getByRole("button", { name: "Test and confirm" }).click();
await amina.getByRole("button", { name: /Works/ }).first().click();
await amina.getByRole("button", { name: "Next" }).click();
await amina.getByLabel("Your check").fill("Pumped 20 litres, steady flow.");
await amina.getByLabel(/I tested it on site/).check();
await frame("Amina tests the pump on site and confirms the result.");

await amina.getByRole("button", { name: "Confirm result" }).click();
await page.waitForTimeout(600);
await frame("Only now A is green again, and the job is closed.", 3.2);

await page.getByText("Basic phone (SMS)", { exact: true }).click();
await page.getByRole("button", { name: "STATUS", exact: true }).click();
await frame("For people without a smartphone: the same answer by SMS (simulated). Try it yourself, no login needed.", 3.6);

await browser.close();

// WALKTHROUGH_FRAMES=<folder> also keeps every frame as a PNG, to look at them one by one.
if (process.env.WALKTHROUGH_FRAMES) {
  mkdirSync(process.env.WALKTHROUGH_FRAMES, { recursive: true });
  frames.forEach((f, i) => writeFileSync(`${process.env.WALKTHROUGH_FRAMES}/frame-${i + 1}.png`, f.png));
}

mkdirSync(fileURLToPath(new URL("../../docs/media/", import.meta.url)), { recursive: true });
await sharp(frames.map((f) => f.png), { join: { animated: true } })
  .gif({ delay: frames.map((f) => f.delay), loop: 0, effort: 8, colours: 96, dither: 0.6 })
  .toFile(out);
console.log(`Wrote ${out} (${frames.length} frames)`);
