# Kiswahili check sheet: the public board

*Generated from `web/lib/i18n.ts` by `npm run export:sw`. Do not edit the table by hand; send corrections to the team.*

## For the reviewer (about 30 minutes)

WaterLink shows a public board ("Does our water point work today?") for people who fetch water. The Kiswahili version was written
by a machine and has **not** been checked by a native speaker. Please read each line as a person at a water point would.

1. Is it correct Kiswahili that people in western Kenya (Busia) understand, in simple everyday words?
2. Is the meaning the same as the English? Please look hardest at the lines marked **safety** below.
3. Is it short enough for a sign? Write a better wording in the last column where it is not.

Mark column "OK?" with `yes` or `no`. Numbers and times in the examples (2, 4, 10:15, 13:30) are filled in by the app. A line with `(…)` has a number or time in it.

**Safety lines (the most important ones).** "Working" means that the water flows. It says nothing about whether the water is safe to drink.
Please check especially `workingNote` and `canNote`, and that no line can be read as "the water is clean".

**Already compared with Swahili texts** (by the team, with published Swahili sources, not by a native speaker; details in `docs/KISWAHILI-QUELLENPRUEFUNG.md`):
*ubora wa maji* (water quality), *maji ya kunywa* (drinking water), *kuchota maji* (to draw water), *chanzo cha maji* (water source),
*kihisi* (sensor), *halali* (valid), *skrini nzima* (full screen), *nje ya mtandao* (offline), *badala* (instead), *thibitisha* (confirm), *kagua* (check).

**Questions the sources could not settle. Please decide:**

1. Is *chanzo cha maji* what people in Busia call a water point, or *kituo cha maji*? (We use *chanzo*; *kituo* means a stop or station.)
2. `line.down`: *usitembee* ("do not walk") or *usiende* ("do not go")?
3. `line.unclear`, `noAlternative`: is *uliza hapo* clear for "ask on site", or is there a more natural wording?
4. `canNote`: *kopo* means a tin can. The picture shows a water jerrycan. Is there a better word (*jerikani*, *dumu*)?
5. `qrCaption`: is *changanua* the word people use for scanning a QR code with a phone?
6. `validHours`, `lessThanHour`: is *ni halali* natural for "this confirmation is still valid", or is there a better phrase?
7. `sensor`: *kihisi* or *kihisio*?

| Text | English | Kiswahili (draft) | OK? | Better wording |
|---|---|---|---|---|
| boardTitle | Does our water point work today? | Je, chanzo chetu cha maji kinafanya kazi leo? | | |
| neighbourhood | Demo neighbourhood | Mtaa wa majaribio | | |
| offlineTitle | No connection. Today’s state is not confirmed. | Hakuna mtandao. Hali ya leo haijathibitishwa. | | |
| offlineBody(…) | Please ask on site before you walk. Last update 10:15 EAT. The board updates itself when the connection is back. | Tafadhali uliza hapo kabla ya kutembea. Sasisho la mwisho 10:15 EAT. Ubao hujisasisha mtandao ukirudi. | | |
| walk(…) | About 2 min walk | Takriban dakika 2 kwa miguu | | |
| word.working | Working | Inafanya kazi | | |
| word.limited | Limited | Maji kidogo | | |
| word.down | Not working | Haifanyi kazi | | |
| word.unclear | Unclear | Haijulikani | | |
| line.working | You can fetch water here | Unaweza kuchota maji hapa | | |
| line.limited | Expect a wait or little water | Tarajia kusubiri au maji kidogo | | |
| line.down | Please don’t walk here for now | Tafadhali usitembee hapa kwa sasa | | |
| line.unclear | Ask on site before you go | Uliza hapo kabla ya kwenda | | |
| line.sensor | Sensor hint: ask before you go | Kihisi kinaonyesha tatizo: uliza kabla ya kwenda | | |
| confirmed | Confirmed | Imethibitishwa | | |
| lastConfirmed | Last confirmed | Ilithibitishwa mwisho | | |
| reported | Reported | Imeripotiwa | | |
| noCheck | no check yet | bado haijakaguliwa | | |
| never | never | haijawahi | | |
| justNow | just now | sasa hivi | | |
| minAgo(…) | 2 min ago | dakika 2 zilizopita | | |
| hourAgo(…) | 2 h ago | saa 2 zilizopita | | |
| dayAgo(…) | 2 days ago | siku 2 zilizopita | | |
| noConfirmation | No confirmation yet | Bado haijathibitishwa | | |
| expired | Expired, needs a new check | Muda umeisha, inahitaji ukaguzi mpya | | |
| lessThanHour | Valid for less than 1 hour | Ni halali kwa chini ya saa 1 | | |
| validHours(…) | Valid for 2 more hours | Ni halali kwa saa 2 zaidi | | |
| conflict | Reports disagree | Taarifa zinapingana | | |
| sensor | Sensor hint | Kihisi kinaonyesha tatizo | | |
| offline | No connection | Hakuna mtandao | | |
| notConfirmed | Not confirmed | Haijathibitishwa | | |
| goTo(…) | Go to ⟨name of the water point⟩ instead, about 4 min. Confirmed 13:30. | Nenda ⟨name of the water point⟩ badala yake, takriban dakika 4. Ilithibitishwa 13:30. | | |
| noAlternative | No confirmed alternative. Please ask on site. | Hakuna mbadala uliothibitishwa. Tafadhali uliza hapo. | | |
| workingNote | Working means water can be drawn. It says nothing about drinking-water quality. | Inafanya kazi inamaanisha maji yanaweza kuchotwa. Haisemi chochote kuhusu ubora wa maji ya kunywa. | | |
| canNote | The can empties in 12 hours. After that a point shows as unclear until someone checks on site. | Kopo hupungua baada ya saa 12. Baada ya hapo chanzo cha maji huonyeshwa kama “haijulikani” hadi mtu akague hapo. | | |
| fullscreen | Full screen | Skrini nzima | | |
| places(…) | Places: Roads © OpenStreetMap contributors. Confirmations and people are simulated. | Maeneo: Roads © OpenStreetMap contributors. Uthibitisho na watu ni wa kuigwa. | | |
| fictional | Demo with fictional example data. | Onyesho lenye data ya mfano ya kubuni. | | |
| qrCaption | Scan to try the SMS check | Changanua ili ujaribu ukaguzi wa SMS | | |
| language | Language | Lugha | | |

## After the review (team)

1. Put the corrections into `web/lib/i18n.ts` (object `sw`).
2. Set `draft: null` in `sw`, so the board no longer says "draft translation".
3. Change the test "both languages fill every text" in `web/tests/i18n.test.ts` (it expects the draft note), run `npm run export:sw` and `npm test`.
4. Write the reviewer's name and the date into `docs/ZWISCHENSTAND.md`.
