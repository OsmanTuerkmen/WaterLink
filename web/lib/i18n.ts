/**
 * Texts of the public board in English and Kiswahili. Nothing here depends on the framework.
 * The Kiswahili is a careful draft and has NOT been reviewed by a native speaker yet (see docs/ROADMAP.md);
 * the safety sentence "working says nothing about drinking-water quality" in particular needs that review.
 */
export type Lang = "en" | "sw";
export const LANGS: readonly Lang[] = ["en", "sw"];
export const LANG_NAME: Record<Lang, string> = { en: "English", sw: "Kiswahili" };
export const parseLang = (value: unknown): Lang => (value === "sw" ? "sw" : "en");

export interface Words {
  boardTitle: string;
  neighbourhood: string;
  offlineTitle: string;
  offlineBody(time: string): string;
  walk(minutes: number): string;
  word: Record<"working" | "limited" | "down" | "unclear", string>;
  line: Record<"working" | "limited" | "down" | "unclear" | "sensor", string>;
  confirmed: string;
  lastConfirmed: string;
  reported: string;
  noCheck: string;
  never: string;
  justNow: string;
  minAgo(n: number): string;
  hourAgo(n: number): string;
  dayAgo(n: number): string;
  noConfirmation: string;
  expired: string;
  lessThanHour: string;
  validHours(n: number): string;
  conflict: string;
  sensor: string;
  offline: string;
  notConfirmed: string;
  /** Text before the point's name (shown in bold) and after it. */
  goTo(minutes: number, time: string): [string, string];
  noAlternative: string;
  /** Bold start and the rest of the sentence. */
  workingNote: [string, string];
  canNote: [string, string];
  fullscreen: string;
  places(attribution: string): string;
  fictional: string;
  qrCaption: string;
  language: string;
  /** Shown under the board when this language is a draft that has not been checked by a native speaker; null otherwise. */
  draft: string | null;
}

const en: Words = {
  boardTitle: "Does our water point work today?",
  neighbourhood: "Demo neighbourhood",
  offlineTitle: "No connection. Today’s state is not confirmed.",
  offlineBody: (time) => `Please ask on site before you walk. Last update ${time} EAT. The board updates itself when the connection is back.`,
  walk: (m) => `About ${m} min walk`,
  word: { working: "Working", limited: "Limited", down: "Not working", unclear: "Unclear" },
  line: {
    working: "You can fetch water here", limited: "Expect a wait or little water", down: "Please don’t walk here for now",
    unclear: "Ask on site before you go", sensor: "Sensor hint: ask before you go",
  },
  confirmed: "Confirmed",
  lastConfirmed: "Last confirmed",
  reported: "Reported",
  noCheck: "no check yet",
  never: "never",
  justNow: "just now",
  minAgo: (n) => `${n} min ago`,
  hourAgo: (n) => `${n} h ago`,
  dayAgo: (n) => `${n} day${n === 1 ? "" : "s"} ago`,
  noConfirmation: "No confirmation yet",
  expired: "Expired, needs a new check",
  lessThanHour: "Valid for less than 1 hour",
  validHours: (n) => `Valid for ${n} more hour${n === 1 ? "" : "s"}`,
  conflict: "Reports disagree",
  sensor: "Sensor hint",
  offline: "No connection",
  notConfirmed: "Not confirmed",
  goTo: (m, t) => ["Go to ", ` instead, about ${m} min. Confirmed ${t}.`],
  noAlternative: "No confirmed alternative. Please ask on site.",
  workingNote: ["Working", " means water can be drawn. It says nothing about drinking-water quality."],
  canNote: ["The can empties in 12 hours.", " After that a point shows as unclear until someone checks on site."],
  fullscreen: "Full screen",
  places: (a) => `Places: ${a}. Confirmations and people are simulated.`,
  fictional: "Demo with fictional example data.",
  qrCaption: "Scan to try the SMS check",
  language: "Language",
  draft: null,
};

const sw: Words = {
  boardTitle: "Je, kituo chetu cha maji kinafanya kazi leo?",
  neighbourhood: "Mtaa wa majaribio",
  offlineTitle: "Hakuna mtandao. Hali ya leo haijathibitishwa.",
  offlineBody: (time) => `Tafadhali uliza hapo kabla ya kutembea. Sasisho la mwisho ${time} EAT. Ubao hujisasisha mtandao ukirudi.`,
  walk: (m) => `Takriban dakika ${m} kwa miguu`,
  word: { working: "Inafanya kazi", limited: "Maji kidogo", down: "Haifanyi kazi", unclear: "Haijulikani" },
  line: {
    working: "Unaweza kuchota maji hapa", limited: "Tarajia kusubiri au maji kidogo", down: "Tafadhali usitembee hapa kwa sasa",
    unclear: "Uliza hapo kabla ya kwenda", sensor: "Kipimo kinaonyesha tatizo: uliza kabla ya kwenda",
  },
  confirmed: "Imethibitishwa",
  lastConfirmed: "Ilithibitishwa mwisho",
  reported: "Imeripotiwa",
  noCheck: "bado haijakaguliwa",
  never: "haijawahi",
  justNow: "sasa hivi",
  minAgo: (n) => `dakika ${n} zilizopita`,
  hourAgo: (n) => `saa ${n} zilizopita`,
  dayAgo: (n) => `siku ${n} zilizopita`,
  noConfirmation: "Bado haijathibitishwa",
  expired: "Muda umeisha, inahitaji ukaguzi mpya",
  lessThanHour: "Inatumika kwa chini ya saa 1",
  validHours: (n) => `Inatumika kwa saa ${n} zaidi`,
  conflict: "Taarifa zinapingana",
  sensor: "Kipimo kinaonyesha tatizo",
  offline: "Hakuna mtandao",
  notConfirmed: "Haijathibitishwa",
  goTo: (m, t) => ["Nenda ", ` badala yake, takriban dakika ${m}. Ilithibitishwa ${t}.`],
  noAlternative: "Hakuna mbadala uliothibitishwa. Tafadhali uliza hapo.",
  workingNote: ["Inafanya kazi", " inamaanisha maji yanaweza kuchotwa. Haisemi chochote kuhusu usafi wa maji ya kunywa."],
  canNote: ["Kopo hupungua baada ya saa 12.", " Baada ya hapo kituo huonyesha “haijulikani” hadi mtu akague hapo."],
  fullscreen: "Skrini nzima",
  places: (a) => `Maeneo: ${a}. Uthibitisho na watu ni wa kuigwa.`,
  fictional: "Onyesho lenye data ya mfano ya kubuni.",
  qrCaption: "Changanua ili ujaribu ukaguzi wa SMS",
  language: "Lugha",
  draft: "Tafsiri ya awali (draft translation): bado haijakaguliwa na mzungumzaji wa Kiswahili.",
};

export const TEXT: Record<Lang, Words> = { en, sw };
