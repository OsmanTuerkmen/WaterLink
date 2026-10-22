// Screenshots of the UNICEF pages used as evidence on the slides (public pages, captured on the day of the submission).
// The yellow highlighter is added by us and says so on the slide; the unmarked captures are kept next to it.
//   node docs/einreichung/werkzeug/belege.cjs
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.resolve(__dirname, "../../../web/node_modules/@playwright/test"));
const out = path.resolve(__dirname, "../belege") + path.sep;
fs.mkdirSync(out, { recursive: true });

const targets = [
  { name: "unicef-smart-pumps", url: "https://www.unicef.org/innovation/smart-pumps", viewport: { width: 1440, height: 1000 }, offset: 520,
    mark: "up to one third of hand pumps do not function at any one time across Africa" },
  { name: "unicef-jmp-2025", url: "https://data.unicef.org/resources/jmp-report-2025/", viewport: { width: 1440, height: 1500 }, offset: null,
    mark: "2.1 billion people still lack safely managed drinking water" },
  { name: "unicef-esa-water", url: "https://www.unicef.org/esa/water-and-environment", viewport: { width: 1440, height: 1000 }, offset: 460,
    mark: "has a high proportion of non-functional systems especially handpumps" },
];

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: false });
  const meta = {};
  for (const t of targets) {
    const page = await browser.newPage({ viewport: t.viewport, deviceScaleFactor: 1 });
    await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3500);
    // The most privacy-preserving answer on a consent banner.
    for (const name of [/reject all/i, /decline/i, /only necessary/i, /necessary only/i, /^reject/i]) {
      const button = page.getByRole("button", { name }).first();
      if (await button.waitFor({ state: "visible", timeout: 6000 }).then(() => true, () => false)) { await button.click().catch(() => {}); await page.waitForTimeout(800); break; }
    }
    // Position: the paragraph with the sentence somewhere in the upper half of the picture.
    await page.evaluate(({ text, offset }) => {
      if (offset === null) return;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.textContent.includes(text)) {
          const top = node.parentElement.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "instant" });
          break;
        }
      }
    }, { text: t.mark, offset: t.offset });
    await page.waitForTimeout(800);
    await page.screenshot({ path: out + t.name + ".png" });
    const found = await page.evaluate((text) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const at = node.textContent.indexOf(text);
        if (at < 0) continue;
        const range = document.createRange();
        range.setStart(node, at); range.setEnd(node, at + text.length);
        const mark = document.createElement("mark");
        mark.style.cssText = "background:#ffd400;color:#000;padding:0 2px;box-decoration-break:clone";
        range.surroundContents(mark);
        return true;
      }
      return false;
    }, t.mark);
    await page.waitForTimeout(300);
    await page.screenshot({ path: out + t.name + "-markiert.png" });
    meta[t.name] = { url: t.url, title: await page.title(), markedSentenceFound: found, capturedAt: new Date().toISOString() };
    console.log(t.name, JSON.stringify(meta[t.name]));
    await page.close();
  }
  fs.writeFileSync(out + "belege.json", JSON.stringify(meta, null, 2));
  await browser.close();
})();
