// Takes the app screenshots used on the slides. Needs `npm run dev` in web/ (default http://127.0.0.1:5173).
// Everything runs in the practice mode (?sandbox=1): nothing reaches the shared demo.
//   node docs/einreichung/werkzeug/screenshots.cjs
const path = require("node:path");
const { chromium } = require(path.resolve(__dirname, "../../../web/node_modules/@playwright/test"));
const out = path.resolve(__dirname, "../folien/assets/app") + path.sep;
const base = process.env.WATERLINK_BASE_URL ?? "http://127.0.0.1:5173";
const jpeg = { type: "jpeg", quality: 90 };

async function open(browser, url, viewport, extra = {}) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1.5, ...extra });
  await page.goto(base + url);
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await page.waitForTimeout(1000);
  return page;
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });

  let page = await open(browser, "/?view=display&sandbox=1", { width: 1280, height: 720 });
  await page.screenshot({ path: out + "board-en.jpg", ...jpeg });
  await page.close();

  page = await open(browser, "/?view=display&lang=sw&sandbox=1", { width: 1280, height: 720 });
  await page.screenshot({ path: out + "board-sw.jpg", ...jpeg });
  await page.close();

  page = await open(browser, "/?sandbox=1#status", { width: 1280, height: 820 });
  await page.screenshot({ path: out + "status-desktop.jpg", ...jpeg });
  await page.close();

  page = await open(browser, "/?sandbox=1#status", { width: 390, height: 844 }, { hasTouch: true, isMobile: true });
  await page.screenshot({ path: out + "status-phone.jpg", ...jpeg });
  await page.close();

  // The whole story on the stage.
  page = await open(browser, "/?view=stage&sandbox=1", { width: 1440, height: 800 });
  const amina = page.getByRole("region", { name: /Amina/ });
  const daniel = page.getByRole("region", { name: /Daniel/ });
  const rowA = (scope) => scope.getByRole("listitem").filter({ hasText: "Borehole A" });
  await page.screenshot({ path: out + "stage-1-start.jpg", ...jpeg });
  await rowA(amina).getByRole("button", { name: "Report a problem" }).click();
  await amina.getByRole("button", { name: /No water/ }).click();
  await amina.getByRole("button", { name: "Next" }).click();
  await amina.getByLabel("What is wrong?").fill("No water after 20 pumps.");
  await amina.getByLabel(/I am at the water point/).check();
  await amina.getByRole("button", { name: "Send report" }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: out + "stage-2-reported.jpg", ...jpeg });
  await daniel.getByRole("button", { name: /take this job/ }).click();
  await daniel.getByRole("button", { name: /start work/ }).click();
  await daniel.getByRole("button", { name: /Report repair/ }).click();
  await daniel.getByLabel(/What did you do/).fill("Replaced the cup seal, tested 10 litres.");
  await daniel.getByRole("button", { name: "Repaired, ask for test" }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: out + "stage-3-repaired-not-green.jpg", ...jpeg });
  await amina.getByRole("button", { name: "Back to my water points" }).click();
  await rowA(amina).getByRole("button", { name: "Test and confirm" }).click();
  await amina.getByRole("button", { name: /Works/ }).first().click();
  await amina.getByRole("button", { name: "Next" }).click();
  await amina.getByLabel("Your check").fill("Pumped 20 litres, steady flow.");
  await amina.getByLabel(/I tested it on site/).check();
  await amina.getByRole("button", { name: "Confirm result" }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: out + "stage-4-confirmed.jpg", ...jpeg });
  await page.getByText("Basic phone (SMS)", { exact: true }).click();
  await page.getByRole("button", { name: "STATUS", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: out + "stage-5-sms.jpg", ...jpeg });
  await page.close();

  // Coordination: a new water point with a position on the map.
  page = await open(browser, "/?sandbox=1#coordination/overview", { width: 1280, height: 860 });
  await page.getByRole("button", { name: "Add a water point" }).click();
  await page.getByLabel("Name").fill("School well");
  await page.getByLabel("Where is it?").fill("Next to the primary school");
  await page.getByLabel(/Walking time from the meeting point, estimated/).fill("8");
  await page.getByLabel(/Position on the map/).fill("0.3640, 34.3330");
  await page.getByRole("button", { name: "Add to the programme" }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: out + "coordination.jpg", ...jpeg });
  await page.close();

  await browser.close();
  console.log("Screenshots written to " + out);
})();
