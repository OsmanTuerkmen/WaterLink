# Kiswahili: Prüfung der Tafeltexte gegen veröffentlichte Quellen

Stand: 22. Oktober 2026. Geprüft wurden die Texte der öffentlichen Tafel (`web/lib/i18n.ts`, Objekt `sw`).

**Grenze vorweg:** Das ist **keine** Prüfung durch eine Muttersprachlerin oder einen Muttersprachler, sondern ein Abgleich der Wörter mit veröffentlichten Kiswahili-Texten und Wörterbucheinträgen. Er findet falsche Wörter und belegt gute, er kann aber nicht sagen, ob ein Satz für Menschen in Busia natürlich klingt. Die Tafel nennt den Text deshalb weiter einen Entwurf. Was die Quellen nicht klären konnten, steht als Fragenliste im [Prüfbogen](KISWAHILI-PRUEFBOGEN.md).

## Vorgehen

- Zwei Kiswahili-Fachtexte im Volltext gelesen und nach den Wörtern durchsucht: das Handbuch der Internationalen Rotkreuz-Föderation zur Wasseraufbereitung im Haushalt ([IFRC, Kiswahili](https://wash.ifrc.org/wp-content/uploads/2025/01/ifrc-hwts-manual-kiswahili.pdf), 44 Seiten) und die Umfrage zu Wasser und Hygiene von Twaweza ([Sauti za Wananchi Nr. 40, 2017, Tansania](https://twaweza.org/wp-content/uploads/2021/01/SzW-TZ-2017-Water-KIS-FINAL-web.pdf), 12 Seiten). Die Zahlen unten sind Trefferzahlen im Volltext.
- Einträge im Kiswahili-Wiktionary und im englischen Wiktionary gelesen ([kihisi](https://sw.wiktionary.org/wiki/kihisi), [kituo](https://sw.wiktionary.org/wiki/kituo), [ubora](https://sw.wiktionary.org/wiki/ubora), [usafi](https://sw.wiktionary.org/wiki/usafi), [kisima](https://sw.wiktionary.org/wiki/kisima), [kopo](https://en.wiktionary.org/wiki/kopo), [dumu](https://en.wiktionary.org/wiki/dumu)).
- Fachwörter der Benutzeroberfläche in Glosbe nachgeschlagen, das Einträge aus dem Microsoft Language Portal und aus Wörterbüchern sammelt ([sensor](https://glosbe.com/en/sw/sensor), [full screen](https://glosbe.com/en/sw/full%20screen), [offline](https://glosbe.com/en/sw/offline), [valid](https://glosbe.com/en/sw/valid), [simulate](https://glosbe.com/en/sw/simulate), [confirm](https://glosbe.com/en/sw/confirm), [check](https://glosbe.com/en/sw/check), [fictional](https://glosbe.com/en/sw/fictional)). Glosbe ist eine Sammlung, keine Normquelle; wo es nur dort steht, ist es unten so vermerkt.
- **Nicht zugänglich:** die amtlichen Wörterbücher (Kamusi ya Kiswahili Sanifu, TUKI) und Fachwortlisten des Kiswahili-Rats. Die Tansania-Umfrage ist Kiswahili aus Tansania, nicht aus Kenia.

## Geändert (die Quelle widerspricht dem Entwurf)

| Bedeutung | Vorher | Jetzt | Befund |
|---|---|---|---|
| Wasserqualität (Sicherheitssatz) | *usafi wa maji ya kunywa* | *ubora wa maji ya kunywa* | *ubora wa maji* steht 15-mal im IFRC-Handbuch für „Wasserqualität“, *usafi wa maji* kein einziges Mal. *usafi* bedeutet nach dem Wiktionary „Zustand eines Ortes, an dem der Schmutz entfernt ist“, also Sauberkeit. Der Satz sagte so „nichts über die Sauberkeit“ statt „nichts über die Qualität“. |
| Wasserstelle (Titel, Kanister-Hinweis) | *kituo cha maji* | *chanzo cha maji* | Beide Fachtexte nennen *chanzo cha maji* („Wasserquelle“) für jede Art von Wasserstelle (*chanzo cha maji* und *vyanzo vya maji*: Twaweza 11-mal, IFRC 8-mal; dort gehören Leitung, Brunnen und Quelle dazu, als *chanzo kilichoboreshwa*). *kituo cha maji* kommt in keiner der gelesenen Quellen vor; *kituo* bedeutet im Wiktionary Haltestelle oder Station. **Nicht gefunden heißt nicht falsch**: Das ist die Frage 1 im Prüfbogen. |
| Sensor | *Kipimo* | *Kihisi* | Das Kiswahili-Wiktionary definiert *kihisi* als „Gerät, das Veränderungen in der Umgebung wie Wärme, Licht, Bewegung oder Druck erkennt“ (Beispiel: *Kihisi cha mwendo kimegundua mtu chumbani*). Das Microsoft Language Portal führt *kihisio* für „sensor“. *Kipimo* ist ein Maß oder eine Messung. |
| Gültigkeit der Bestätigung | *Inatumika kwa saa 2 zaidi* („wird verwendet“) | *Ni halali kwa saa 2 zaidi* | *halali* ist das Wort für „gültig“ (Glosbe nennt es für „valid“, mit Beleg aus einer Veröffentlichung; ein Lehrtext benutzt *Leseni yangu ni halali*, „meine Lizenz ist gültig“). Für *inatumika* in der Bedeutung „gültig“ fand sich kein Beleg. Mittlere Sicherheit, Frage 6. |
| „vor 1 Minute, Stunde, Tag“ | *dakika 1 zilizopita* | *dakika moja iliyopita* (ebenso *saa moja*, *siku moja*) | Die Mehrzahlform *zilizopita* passt zu „2 Minuten“; für „1“ braucht das Wort die Einzahlform *iliyopita*. Die Fachtexte belegen *dakika moja*, *saa moja* und die Mehrzahlform (*dakika thelathini zilizopendekezwa*). Die Regel selbst ist Grammatikwissen, das die Texte nur stützen. |

## Bestätigt (keine Änderung)

| Wort | Bedeutung | Beleg |
|---|---|---|
| *kuchota maji* | Wasser schöpfen | IFRC (*maji ya kunywa yanafaa kuchotwa kutoka chombo*), Twaweza (*uchotaji maji*). *kuteka* (IFRC, 7-mal) ist ein gleichwertiges Wort. |
| *maji ya kunywa* | Trinkwasser | IFRC (4-mal), Twaweza (6-mal) |
| *skrini nzima* | Vollbild | Microsoft Language Portal (über Glosbe) |
| *Hakuna mtandao* | keine Verbindung | Microsoft führt *nje ya mtandao* für „offline“; *mtandao* ist das Wort für Netz. |
| *badala yake* | stattdessen | *badala ya* in beiden Fachtexten (Twaweza 2-mal, IFRC 2-mal); das Wörterbuch führt *-badala* für „alternative“. |
| *mbadala* | Alternative | Nur als Teil von Wortgruppen gefunden (*elimu mbadala*), kein eigener Beleg; Frage 3 deckt es mit ab. |
| *Imethibitishwa*, *Haijathibitishwa* | bestätigt | *thibitisha* steht in der Liste für „confirm“. |
| *ukaguzi*, *haijakaguliwa* | Prüfung, nicht geprüft | *kagua* steht in der Liste für „check“. |
| *ya kuigwa*, *ya kubuni* | simuliert, erfunden | *kuiga* für „simulate“ (mit Beispielsatz aus einem Computertext), *-a kubuniwa* für „fictional“. |
| *taarifa*, *Tafadhali*, *kusubiri* | Angabe, bitte, warten | *taarifa* (Twaweza, 10-mal), *tafadhali* (IFRC); *kusubiri* wurde nicht gefunden, gilt aber als gewöhnliches Wort. |
| *Changanua* | scannen | Auf einer Kiswahili-Seite für QR-Codes (*Kuchanganua Msimbo wa QR*, kommerziell) belegt; das Microsoft Language Portal nutzt für Dateien *tambaza*. Schwach belegt, Frage 5. |

## Offen (die Quellen entscheiden es nicht)

Diese Punkte gehen als Fragen an die Prüferin oder den Prüfer (siehe Prüfbogen):

1. *chanzo* oder *kituo* für die Wasserstelle.
2. *Tafadhali usitembee hapa kwa sasa*: wörtlich „bitte nicht spazieren“; natürlicher könnte *usiende* („geh nicht“) sein. Kein Beleg gefunden, deshalb nicht geändert.
3. *Uliza hapo kabla ya kwenda* und *Tafadhali uliza hapo*: ob „frag dort“ verständlich ist.
4. *Kopo* ist laut Wiktionary eine Dose oder Konservendose; das Bild ist ein Wasserkanister. *dumu* heißt dort „Krug, Gefäß“; ein Beleg für *jerikani* fand sich nicht. Die Fachtexte sagen *ndoo* (Eimer), *mtungi* (Behälter) und *chombo cha maji*.
5. *Changanua* (siehe oben).
6. *Ni halali* (siehe oben).
7. *kihisi* oder *kihisio*: beide sind belegt (Wiktionary, Microsoft).

Außerdem ungeprüft: Satzbau und Natürlichkeit des Ganzen, Unterschiede zwischen kenianischem und tansanischem Kiswahili, und ob die Wörter für Menschen mit wenig Schulbildung verständlich sind.

## Was sich im Programm geändert hat

`web/lib/i18n.ts` (sechs Stellen wie oben), Test `web/tests/i18n.test.ts` (Einzahlformen, „ubora statt usafi“), `web/e2e/board.spec.ts` (neuer Titel), Prüfbogen neu erzeugt (`npm run export:sw`) mit der Fragenliste. Der Hinweis „Tafsiri ya awali“ auf der Tafel bleibt, weil keine Muttersprachlerin geprüft hat.
