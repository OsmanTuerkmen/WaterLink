// Writes docs/KISWAHILI-PRUEFBOGEN.md from lib/i18n.ts: every board text in English and Kiswahili, to be checked by a native speaker.
// Run: npm run export:sw. A unit test fails when the file no longer matches the texts.
import { writeFileSync } from "node:fs";
import { TEXT } from "../lib/i18n.ts";

export const SHEET_PATH = new URL("../../docs/KISWAHILI-PRUEFBOGEN.md", import.meta.url);

// What the app fills into a text: a number by default, a time, or a place credit.
const EXAMPLE: Record<string, unknown[]> = { offlineBody: ["10:15"], goTo: [4, "13:30"], places: ["Roads © OpenStreetMap contributors"] };
type Entry = [key: string, text: string];

function flat(value: unknown, path = ""): Entry[] {
  if (typeof value === "string") return [[path, value]];
  if (typeof value === "function") return flat((value as (...args: unknown[]) => unknown)(...(EXAMPLE[path.split(".").pop()!] ?? [2])), `${path}(…)`);
  // Two-part sentences (the second part follows a bold word or a point name) read as one sentence on the board.
  if (Array.isArray(value)) return [[path, value.join(path.startsWith("goTo") ? "⟨name of the water point⟩" : "")]];
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => flat(item, path ? `${path}.${key}` : key));
  return [];
}
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function sheet(): string {
  const en = flat(TEXT.en), sw = flat(TEXT.sw);
  const rows = en.map(([key, text], i) => `| ${key} | ${cell(text)} | ${cell(sw[i][1])} | | |`);
  return `# Kiswahili check sheet: the public board

*Generated from \`web/lib/i18n.ts\` by \`npm run export:sw\`. Do not edit the table by hand; send corrections to the team.*

## For the reviewer (about 30 minutes)

WaterLink shows a public board ("Does our water point work today?") for people who fetch water. The Kiswahili version was written
by a machine and has **not** been checked by a native speaker. Please read each line as a person at a water point would.

1. Is it correct Kiswahili that people in western Kenya (Busia) understand, in simple everyday words?
2. Is the meaning the same as the English? Please look hardest at the lines marked **safety** below.
3. Is it short enough for a sign? Write a better wording in the last column where it is not.

Mark column "OK?" with \`yes\` or \`no\`. Numbers and times in the examples (2, 4, 10:15, 13:30) are filled in by the app. A line with \`(…)\` has a number or time in it.

**Safety lines (the most important ones).** "Working" means that the water flows. It says nothing about whether the water is safe to drink.
Please check especially \`workingNote\` and \`canNote\`, and that no line can be read as "the water is clean".

| Text | English | Kiswahili (draft) | OK? | Better wording |
|---|---|---|---|---|
${rows.join("\n")}

## After the review (team)

1. Put the corrections into \`web/lib/i18n.ts\` (object \`sw\`).
2. Set \`draft: null\` in \`sw\`, so the board no longer says "draft translation".
3. Change the test "both languages fill every text" in \`web/tests/i18n.test.ts\` (it expects the draft note), run \`npm run export:sw\` and \`npm test\`.
4. Write the reviewer's name and the date into \`docs/ZWISCHENSTAND.md\`.
`;
}

if (process.argv[1]?.endsWith("kiswahili-sheet.ts")) {
  writeFileSync(SHEET_PATH, sheet());
  console.log(`Wrote ${SHEET_PATH.pathname}`);
}
