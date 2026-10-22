import { test } from "node:test";
import assert from "node:assert/strict";
import jsQR from "jsqr";
import { LANGS, TEXT, parseLang } from "../lib/i18n.ts";
import { qrPath } from "../lib/qr.ts";

test("only Kiswahili is picked for \"sw\"; everything else is English", () => {
  assert.equal(parseLang("sw"), "sw");
  for (const value of ["en", "SW", "", null, undefined, 3, "fr"]) assert.equal(parseLang(value), "en");
});

test("both languages fill every text, and Swahili really differs from English", () => {
  const flat = (value: unknown, path = ""): [string, string][] => {
    if (typeof value === "string") return [[path, value]];
    if (typeof value === "function") return flat((value as (...args: unknown[]) => unknown)(2, "10:15", "x"), `${path}()`);
    if (Array.isArray(value)) return value.flatMap((item, i) => flat(item, `${path}[${i}]`));
    if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => flat(item, `${path}.${key}`));
    return [[path, String(value)]];
  };
  const [en, sw] = LANGS.map((lang) => flat(TEXT[lang]));
  assert.deepEqual(en.map(([path]) => path), sw.map(([path]) => path), "same keys in both languages");
  for (const [path, text] of [...en, ...sw]) assert.ok(text.trim().length > 0, `${path} is empty`);
  assert.equal(TEXT.en.draft, null);
  assert.match(TEXT.sw.draft ?? "", /draft translation/, "the Swahili board says it is a draft until a native speaker has checked it");
  const same = en.filter(([path, text], i) => text === sw[i][1] && !/\.(never|sensor)$/.test(path));
  assert.deepEqual(same.map(([path]) => path), [], "texts that were never translated");
});

test("texts with numbers and times use them", () => {
  for (const lang of LANGS) {
    const t = TEXT[lang];
    assert.match(t.walk(7), /7/);
    assert.match(t.validHours(5), /5/);
    assert.match(t.offlineBody("23:15"), /23:15/);
    assert.match(t.goTo(4, "13:30").join(""), /4.*13:30/);
  }
  assert.equal(TEXT.en.dayAgo(1), "1 day ago");
  assert.equal(TEXT.en.dayAgo(3), "3 days ago");
});

/** Draws the path into a bitmap, scale pixels per module, so a QR reader can look at it. */
function bitmap(path: string, size: number, scale = 6) {
  const width = size * scale, data = new Uint8ClampedArray(width * width * 4).fill(255);
  for (const [, x, y] of path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const at = ((Number(y) * scale + dy) * width + Number(x) * scale + dx) * 4;
      data[at] = data[at + 1] = data[at + 2] = 0;
    }
  }
  return { data, width };
}

test("the QR code reads back as the address it was made from", () => {
  for (const url of ["https://waterlink-demo.waterlink.workers.dev/#sms", "http://127.0.0.1:5173/#sms"]) {
    const { size, path } = qrPath(url);
    const { data, width } = bitmap(path, size);
    assert.equal(jsQR(data, width, width)?.data, url);
  }
});
