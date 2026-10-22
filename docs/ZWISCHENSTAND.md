# Arbeitsstand WaterLink

**Zuletzt aktualisiert: 22. Oktober 2026, abends · Branch `main`.**

Offene Aufgaben und Ideen stehen in der [Roadmap](ROADMAP.md). Hier steht nur, wie der Stand ist und was zuletzt geprüft wurde. Ältere Berichte und das vollständige Protokoll bis 21.10.2026: [Archiv](archiv/).

## Ziel

Zuerst eine verlässlich funktionierende App: Haushalte sehen den letzten bestätigten Betriebszustand und mögliche Alternativen; Betreiber melden, Techniker bearbeiten und Betreiber bestätigen eine Reparatur ausdrücklich. Danach kommen Pitch und Drei-Minuten-Vorführung. Ein Feldpilot ist noch nicht vereinbart.

## Stand

- **Offen für Menschen:** Einreichung, Fünf-Personen-Test, Kiswahili-Prüfung, echte Geräte und Screenreader, Partner: mit Anleitung und Listen in [Menschen](MENSCHEN.md). **Das Repository ist privat** (anonymer Abruf liefert 404); die Jury sieht den Code erst nach Freigabe durch Osman.
- **Repository:** Alles liegt auf `main`. Die früheren fünf Branches wurden hineingeführt (reines Vorspulen, kein Commit verloren) und gelöscht; Übersicht und Wiederherstellung in der [Branch-Geschichte](archiv/BRANCH-GESCHICHTE.md).
- **App:** Haushaltsstatus mit Karte, öffentliche Tafel, Feld-App für Betreiberin und Techniker, Koordination, simulierte SMS und Pitch-Bühne sind implementiert. Orte stammen aus echten WPdx-Erhebungen (Busia), historische Sensordaten aus Kwale 2014; Bestätigungen, Personen und Wege sind simuliert und gekennzeichnet.
- **Zugang:** Signiertes Cookie mit serverseitig geprüftem Ablauf, Anmeldeversuche pro Client und global begrenzt; ein gesperrter Client sperrt nicht mehr alle anderen.
- **Demo-Daten:** Nach vier Stunden ohne Aktivität setzt sich die Demo mit frischen simulierten Bestätigungen selbst neu an.
- **Erste Ansicht vom Server:** Das HTML enthält schon den aktuellen Stand (auch ohne JavaScript und bei langsamer Verbindung). Eine Seite, deren Skripte nach 30 s nicht starten, lädt sich neu; ohne JavaScript fordert ein Meta-Refresh alle 60 s neues HTML an (Sicherheitsnetz gegen ein „eingefrorenes Grün“).
- **Weg und Zugang prüfen, Wasserstellen anlegen:** Koordination kann den Weg einer Stelle prüfen (Gehzeit, Beschreibung, Öffnungszeiten, ausdrückliches „ich bin den Weg gegangen“), Zugang als gesperrt melden und Stellen anlegen oder (angelegte) entfernen. Erst danach nennt WaterLink eine neue Stelle als Alternative. Vorher gab es dafür keinen Befehl; die Alternative hing am Beispieldatensatz. Außerdem: Hinweis auf mögliche Doppelerfassungen im Datensatz, SMS-Teile nach Kodierung, Hinweis „draft translation“ auf der Kiswahili-Tafel, beschriftete Bühne im Ausprobier-Modus.
- **Position angelegter Wasserstellen:** Beim Anlegen kann eine Position angegeben werden, eingetippt (Breite, Länge, wie Google Maps sie kopiert) oder per Tipp auf die Karte („Pick on the map“); höchstens 15 km vom Treffpunkt. Die Stelle erscheint dann auf der Karte, trägt den Hinweis „nicht vor Ort geprüft“, und liegt eine erfasste Stelle im Umkreis von 50 m, steht ein Hinweis im Formular und im Verlauf. Der **Prüfbogen für die Kiswahili-Übersetzung** (`docs/KISWAHILI-PRUEFBOGEN.md`) wird mit `npm run export:sw` aus den Tafeltexten erzeugt; ein Test hält ihn aktuell.
- **Orte zusammengeführt:** Der Import führt Erhebungseinträge verschiedener Erhebungen im Umkreis von 50 m zu einem Ort zusammen: aus 60 Einträgen wurden 42 Orte, 16 mit weiteren Erhebungen in den Details. A, B und C bleiben getrennt. Die Live-Seite und der Ausprobier-Modus zeigen die 42 nach der Bereitstellung.
- **Härtung:** Das Zugangs-Cookie wird mit einem eigenen langen Geheimnis signiert (nicht mehr mit dem kurzen Code); ein Browser mit höherer Revision als der Server übernimmt den Serverstand wieder; der API-Ablauf (`test:integration`) läuft als Teil von `npm run test:e2e` und damit in der CI; Entwicklungswerkzeuge aktualisiert (vite 8.3.5, Cloudflare-Plugin 1.64, wrangler 4.151, vinext 1.3.0): `npm audit` von 20 auf 15 Meldungen, in der Laufzeit weiter 0.
- **Link-Vorschau und Ablauf im README:** Open-Graph-Angaben mit Vorschaubild (`/og.png`) für geteilte Links; das README zeigt den Ablauf als Animation (`docs/media/walkthrough.gif`, erzeugt mit `web/scripts/record-walkthrough.mjs`).
- **Einreichung:** Folien als PDF (fünf Seiten, mit Bildschirmfotos zweier UNICEF-Seiten und einer eigenen Rechnung auf den WPdx-Daten zu Kenia, Team 10), Mailtext und Belege liegen in [`docs/einreichung/`](einreichung/README.md). Die Zahlen sind mit Quelle belegt, offene Annahmen stehen als „Open“ auf Folie 10; Notizen aus dem Coaching lagen nicht vor.
- **Ausprobier-Modus (Sandbox):** Jeder kann den ganzen Ablauf ohne Zugangscode mit Übungsdaten durchspielen, nur auf dem eigenen Gerät (`/?view=stage&sandbox=1`, Knopf „Try it yourself“, Angebot im Anmeldefeld). Dieselben Regeln laufen im Browser, der Server sieht nichts.
- **Tafel auf Kiswahili und QR-Code:** Umschalter unten auf der Tafel (`?lang=sw`), QR-Code zur SMS-Ansicht. Die Kiswahili-Texte wurden am 22.10. gegen veröffentlichte Kiswahili-Texte abgeglichen und danach an sechs Stellen verbessert ([Quellenprüfung](KISWAHILI-QUELLENPRUEFUNG.md)). **Sie sind weiter ein Entwurf ohne Prüfung durch Muttersprachler**, sieben Fragen sind offen (Prüfbogen).
- **Sicherheitsmeldungen der Abhängigkeiten:** `npm audit --omit=dev` meldet nichts mehr (Next 16.4.2, React 19.3.1); 20 Meldungen in Entwicklungswerkzeugen bleiben (Roadmap, P3). Ereignisprotokoll auf 200 Einträge begrenzt.
- **Browser-Tests:** 33 Tests mit Playwright und Chrome (`npm run test:e2e`), auch als CI-Auftrag.
- **Oberfläche:** Alle Bedienelemente bei 375 px mindestens 44 px, eine h1 pro Ansicht, Schrift in rem (Textgröße des Browsers gilt, bis 200 % ohne Überbreite), alle Farben aus Tokens, Kontrast mindestens 4,5:1, Bewegungsreduktion mit ruhigem Ersatzsignal. Regeln in [`DESIGN.md`](../DESIGN.md).
- **Live-Seite:** https://waterlink-demo.waterlink.workers.dev wurde am 22.10. abends mit dem Stand `f63ba56` neu bereitgestellt (Version `199e7573`, Konto von Reczec, Zugangscode unverändert, neues Cookie-Geheimnis gesetzt: wer mit dem Code eingeloggt war, ist einmal abgemeldet), siehe [Bereitstellung](BEREITSTELLUNG.md). Der Ausprobier-Modus zeigt die 42 Orte sofort; der **gemeinsame** Demo-Zustand trägt noch die 60 Einträge von vorher und setzt sich nach vier Stunden ohne Aktivität (gegen 15:30 UTC) beim nächsten Aufruf selbst neu an, oder sofort mit „Reset demo“ in den Demo-Werkzeugen.
- **Aufräumen am 22.10.:** Dokumentation neu geordnet (Wegweiser [`docs/README.md`](README.md), Roadmap, Archiv), README für Neueinsteiger neu geschrieben. Ungenutzter Code aus einer UI-Vorlage (`web/components/ui/` und Verwandtes, 61 Dateien) und 19 Abhängigkeiten sind entfernt (Abhängigkeiten 27 → 8). MIT-Lizenz ergänzt. Das Bereitstellungsskript ändert einen vorhandenen Zugangscode nicht mehr, wenn die lokale Datei fehlt.
- **Autorenangaben:** Die Historie wurde am 22.10. umgeschrieben: Commits mit Claude als Autor oder Co-Autor tragen jetzt Osman (`OsmanTuerkmen`) als Autor beziehungsweise Co-Autor, die Claude-Sitzungslinks in den Commit-Texten sind entfernt. Dateien und Anzahl der Commits sind unverändert, alle Hashes ab dem ersten betroffenen Commit sind neu.

## Letzte Prüfungen (selbst ausgeführt)

| Prüfung | Datum | Ergebnis |
|---|---|---|
| `npm test` (nach Kartenposition, Tippen auf die Karte, Prüfbogen) | 22.10.2026 abends | 82/82 bestanden (neu: Position angelegter Stellen, Lesen der Koordinaten, Hinweis bei Nähe, Prüfbogen passt zu den Texten) |
| `npm run typecheck`, `npm run lint`, `npm run build` | 22.10.2026 abends | alle drei Exit-Code 0 |
| `npm run test:e2e` (vollständig, lokal) | 22.10.2026 abends | 34/34 bestanden (neu: Position per Eingabe und per Tipp auf die Karte, zu weit entfernte Position wird abgelehnt, axe im Auswahlmodus) |
| `npm run test:integration` (`npm run dev`), `npm run test:access` (Code-Modus, lokal mit Test-Code, danach `.dev.vars` gelöscht) | 22.10.2026 abends | bestanden, 11/11. Der Integrationstest prüft jetzt auch Position und Ablehnung einer zu weit entfernten Stelle |
| Kiswahili-Wörter gegen zwei Volltexte (IFRC-Handbuch, Twaweza-Umfrage), Wiktionary und Microsoft-Fachwörter (über Glosbe) abgeglichen | 22.10.2026 abends | sechs Änderungen (*ubora* statt *usafi*, *chanzo* statt *kituo*, *kihisi*, *halali*, Einzahlformen), sieben Fragen offen. Amtliche Wörterbücher waren nicht zugänglich; keine Prüfung durch Muttersprachler |
| `npm test` nach Zusammenführen der Orte, Cookie-Geheimnis, Revisionsfix | 22.10.2026 nachts | 85/85 bestanden (neu: Zusammenführen mit Schutz der Demo-Stellen, Cookie mit Geheimnis) |
| `npm run typecheck`, `npm run lint`, `npm run build` (mit den aktualisierten Werkzeugen) | 22.10.2026 nachts | alle drei Exit-Code 0 |
| `npm run test:e2e` vollständig, lokal, mit vite 8.3.5, wrangler 4.151, vinext 1.3.0 | 22.10.2026 nachts | 37/37 bestanden (neu: API-Ablauf, Link-Vorschau, Browser mit höherer Revision; der Revisionstest schlug vor der Korrektur wie erwartet fehl) |
| `npm run test:access` im Code-Modus mit Cookie-Geheimnis (lokal, Test-Werte, danach `.dev.vars` gelöscht) | 22.10.2026 nachts | 11/11 bestanden. Ein zweiter Lauf ohne Geheimnis traf die 15-Minuten-Sperre des ersten (erwartet, 429); dieser Pfad ist durch die Unit-Tests abgedeckt |
| Bereitstellung `npm run deploy:cloudflare` mit `f63ba56` (neue Werkzeug-Versionen), danach Browser-Tests ohne Datenänderung gegen die Live-Seite | 22.10.2026 abends | Bereitstellung erfolgreich (Cookie-Geheimnis gesetzt, lokal gespeichert, von Git ausgeschlossen); Vorschaubild `/og.png` 200; Modus „code“; 34/34 bestanden; gemeinsamer Zustand unverändert (Revision 12) |
| GitHub Actions, direkt in Osmans Konto gelesen (Claude in Chrome) | 22.10.2026 abends | #13 bis #18 grün; #19 (`58856ea`): `web (22)` und `web (24)` grün, `e2e` rot wegen des Wartens auf die Skripte in `quality.spec.ts` (siehe Protokoll), behoben; der Lauf zur Korrektur steht aus |
| Bereitstellung `npm run deploy:cloudflare` mit `a0fbf36`, danach Browser-Tests ohne Datenänderung gegen die Live-Seite | 22.10.2026 nachts | Bereitstellung erfolgreich; neuer Kiswahili-Titel im HTML; 32/32 bestanden; Zustand unverändert (Revision 12) |
| Bereitstellung `npm run deploy:cloudflare` mit `d72683a`, danach Browser-Tests ohne Datenänderung **gegen die Live-Seite** (Ausprobier-Modus, Tafel, Sprache, axe, Handybreite, Druck, neu: Position und Tippen auf die Karte) | 22.10.2026 abends | Bereitstellung erfolgreich; 32/32 bestanden; gemeinsamer Zustand unverändert (Revision 12, 60 Wasserstellen, keine Aufträge) |
| Tippen auf die Karte auf Handybreite (390 px, Touch-Emulation, Bildschirmfoto angesehen) | 22.10.2026 abends | Seite springt zur Karte und zurück zum Formular, Position steht im Feld, Knopf 44 px hoch. Zuerst lag die Karte unter der festen Kopfleiste (Tipp traf die Leiste); mit `scroll-margin-top` behoben |
| Repository und Historie auf Zugangscode und Schlüsseldateien durchsucht (der aktuelle Code gegen alle Commits, ohne ihn auszugeben) | 22.10.2026 abends | kein Fund; `.env*` und `.dev.vars*` sind ausgeschlossen. Anonymer Abruf des Repositorys liefert 404 (privat), die Live-Seite 200 |
| `npm test` (nach Weg-/Zugangsprüfung, Anlegen von Stellen, SMS-Kodierung) | 22.10.2026 abends | 78/78 bestanden |
| `npm run test:e2e` (nach den neuen Funktionen), `npm run lint`, `npm run build` | 22.10.2026 abends | 32/32 bestanden, Lint und Build Exit-Code 0. Neu: Stelle anlegen → bestätigen → Alternative bleibt B, bis der Weg geprüft ist → danach die nähere neue Stelle → Sperre nimmt sie heraus → entfernen; axe auf beiden neuen Formularen |
| Browser-Tests ohne Datenänderung gegen die Live-Seite **nach der Bereitstellung der neuen Funktionen** (Wasserstelle anlegen und Weg prüfen im Ausprobier-Modus, Tafel, Sprache, axe, Handybreite, Druck) | 22.10.2026 abends | 30/30 bestanden; gemeinsamer Zustand unverändert (Revision 12, 60 Wasserstellen, keine Aufträge). Gegen den Produktions-Build lokal ebenfalls 30/30 |
| **Nicht geprüft** | | Physische Geräte, echter Screenreader, Bewegungsreduktion im echten Browser, Papierausdruck, Kiswahili durch Muttersprachler, Ablauf Melden → Reparieren → Bestätigen auf der Live-Seite mit dem Zugangscode, die CI zu den Commits dieser Einheit (nicht angesehen, das Repository ist privat). Anleitung dazu in [Menschen](MENSCHEN.md). |

## Protokoll

### 22.10.2026, abends – Unterlagen für die Einreichung beim IdeaLAB

- **Anlass:** Bewertet werden Problemlösung, Prototyp mit allen wichtigen Funktionen, Zahlen zu den Annahmen und das Gelernte aus dem Coaching. Verlangt: eine Mail mit allem, alle PDFs und die Prototyp-Dateien als Anhang, Hinweis zur IdeaLAB-Teilnahme, eine Folie mit Bildschirmfoto eines aktuellen UNICEF-Berichts.
- **Gemacht:** zuerst 16 Folien, auf Wunsch gekürzt auf fünf (`docs/einreichung/`, aus HTML mit dem Chrome gedruckt; der One-Pager entfiel), Bildschirmfotos der UNICEF-Seiten „Smart Pumps“ und des WHO/UNICEF-JMP-Berichts 2025 (mit gelber Markierung von uns) auf Folie 2, Rechnung auf den 39.959 WPdx-Einträgen für Kenia (neuester Eintrag 30.11.2024, Median 5,7 Jahre), Mailtext mit dem Satz „we would potentially agree to take part in the IdeaLAB“.
- **Geprüft statt vermutet:** Die Handyquote (48,6 % auf dem Land) und die Kwale-Zahl (27 auf unter 3 Tage) wurden an den Quellen nachgesehen, die erste stand bisher nur als „etwa die Hälfte“ in den Dokumenten.
- **Nicht gemacht:** MyStartupStudio: die Plattform war im Chrome nicht angemeldet, ob die Schritte dort erledigt sind, konnte nicht geprüft werden. Coaching-Notizen für Folie 12 fehlen. Die Mail ist als Entwurf vorbereitet und nicht abgeschickt.

### 22.10.2026, nachts (später) – Link-Vorschau, doppelte Erhebungen, Härtung, Ablauf im README

- **CI-Fehler gefunden und behoben:** Lauf #19 (nur Doku geändert) schlug im Auftrag `e2e` fehl, #18 davor war grün. Der Test „keine Tippfläche unter 44 px“ sah auf `/#field/technician` die drei Kartenmarker der Statusansicht (30 × 30 px). Ursache: Auf dem langsamen Rechner war die Seite noch der Server-Schnappschuss, die Skripte waren nicht gestartet, der Hash-Wechsel zur Feld-App fehlte. Lokal mit 25-facher CPU-Drosselung nachgestellt: gleiche drei Elemente, `data-hydrated` fehlt. Behoben: `e2e/quality.spec.ts` wartet vor jeder Messung auf `html[data-hydrated]` (wie die anderen Browser-Tests). Ein Fehler der App war es nicht: vor dem Start der Skripte lässt sich ohnehin nichts antippen.
- **Bereitgestellt** mit `npm run deploy:cloudflare` (`f63ba56`): Browser-Tests gegen die Live-Seite 34/34, Vorschaubild erreichbar, Zustand unverändert. Der gemeinsame Demo-Zustand zeigt die 42 Orte erst nach dem nächsten Neuansatz (siehe Live-Seite oben).
- **Entscheidung:** Fünf-Personen-Test, Prüfung durch Muttersprachler und echte Geräte werden zurückgestellt (niemand zur Hand); in der Roadmap so vermerkt. Dafür die Code-Aufgaben aus der Liste: Link-Vorschau, doppelte Erhebungen, Härtung, und ein Ablauf im README.
- **Doppelte Erhebungen:** `mergeNearby` im Import, `alsoSurveyed` in den Daten und den Details, `--merge-only` für die vorhandene Datei. 60 Einträge wurden 42 Orte. Beim Entwurf zeigte sich, dass die Demo-Stellen A und C (40 m) selbst ein solches Paar sind; sie bleiben als Geschichte getrennt (geschützt).
- **Cookie-Geheimnis:** Bereitstellungsskript erzeugt und setzt `WATERLINK_COOKIE_SECRET` (bleibt unverändert, wenn die lokale Datei fehlt und der Worker eines hat). Beim nächsten Bereitstellen werden alle Browser einmal abgemeldet.
- **Revisionsfix:** Der Test (Browser mit höherem Stand als der Server) schlug zuerst fehl, dann behoben mit einem Zähler, der verspätete Antworten von echten Rückschritten des Servers unterscheidet.
- **Entwicklungswerkzeuge:** Der erste Versuch scheiterte an Peer-Abhängigkeiten (vinext 1.3.0 braucht `@vitejs/plugin-rsc` 0.5.38, wrangler 4.151 `@cloudflare/workers-types` 5); mit beiden zusammen lief alles. 15 Meldungen bleiben ohne Fix ohne Rückschritt.
- **Nicht gemacht:** CI zu diesen Commits nicht gesehen (privates Repository; der Reiter Actions von Osman zeigt es); die neuen Werkzeug-Versionen laufen in der CI mit Node 22 und 24, lokal geprüft nur mit Node 24.

### 22.10.2026, nachts – Kiswahili gegen Quellen abgeglichen

- **Anlass:** Niemand im Team spricht Kiswahili; die Übersetzung sollte wenigstens gegen vertrauenswürdige Quellen geprüft werden.
- **Vorgehen und Ergebnis:** [Quellenprüfung](KISWAHILI-QUELLENPRUEFUNG.md). Zwei Kiswahili-Fachtexte im Volltext durchsucht, Wiktionary-Einträge und Microsoft-Fachwörter gelesen. **Gefunden:** Der Sicherheitssatz sagte *usafi* („Sauberkeit“) statt *ubora* („Qualität“); „Sensor“ war mit *kipimo* („Maß“) übersetzt statt *kihisi*; „1 Minute her“ hatte die falsche Einzahlform; *kituo* („Haltestelle“) ist für Wasserstellen in keiner Quelle belegt, *chanzo cha maji* dagegen vielfach; „gültig“ war *inatumika* statt *halali*.
- **Grenze:** Die Quellen können falsche Wörter finden und gute belegen, aber nicht sagen, ob ein Satz in Busia natürlich klingt. Sieben Fragen stehen im Prüfbogen (unter anderem *chanzo* oder *kituo*, *usitembee* oder *usiende*, *kopo* für den Kanister). Die Tafel nennt den Text weiter einen Entwurf.
- **Bereitgestellt** mit `npm run deploy:cloudflare` (`a0fbf36`): Der neue Titel steht im HTML der Live-Seite (`/?view=display&lang=sw`), der alte nicht mehr. Browser-Tests ohne Datenänderung gegen die Live-Seite: 32/32, gemeinsamer Zustand unverändert (Revision 12, 60 Wasserstellen, keine Aufträge).

### 22.10.2026, spätabends – Position per Tipp auf die Karte, Hinweis bei Nähe, Bereitstellung (`d72683a`)

- **Anlass:** Die Liste „nicht gemacht“ vom Eintrag darunter: Bereitstellung, Prüfung der Position, Setzen per Tipp auf die Karte. Die Übersetzung bleibt offen, weil sie jemanden mit Muttersprache braucht.
- **Tippen auf die Karte:** „Pick on the map“ im Formular, die Karte und das Formular teilen die Position (`coordination.tsx`), Fadenkreuz auf der Karte, auf dem Handy springt die Seite zur Karte und zurück. Beim ersten Versuch lag die Karte unter der festen Kopfleiste; ein Bildschirmfoto zeigte es, `scroll-margin-top` behebt es.
- **Prüfung der Position:** Echt prüfen kann das nur jemand vor Ort. Neu: Hinweis, wenn eine erfasste Stelle im Umkreis von 50 m liegt (Formular und Verlauf, nichts wird blockiert), und die Kennzeichnung „nicht vor Ort geprüft“ an der Stelle. Die Grenze von 15 km bleibt.
- **Bereitstellung** mit `npm run deploy:cloudflare` (Zugangscode unverändert), danach die Browser-Tests ohne Datenänderung gegen die Live-Seite: 32/32, Zustand unverändert.
- **Bewusst offen:** Kiswahili-Prüfung, echte Geräte, Gespräche, Sichtbarkeit des Repositorys (Osman, am Ende).

### 22.10.2026, abend – Offenes zusammengefasst (`34afc19` und Doku)

- **Kartenposition für angelegte Wasserstellen** (`add_point` mit Breite und Länge, höchstens 15 km vom Treffpunkt, im Formular „Position on the map“); die Lücke „Karte kennt nur Busia“ ist damit für Busia geschlossen.
- **Prüfbogen Kiswahili** aus den echten Tafeltexten erzeugt (`npm run export:sw`), mit Test gegen Abweichungen. Die Prüfung selbst steht weiter aus.
- **Neue Anleitung [Menschen](MENSCHEN.md):** Einreichung, Fünf-Personen-Test mit Aufgaben, Prüfbogen, Tabelle für echte Geräte, Papier und Screenreader, Vorlage für die erste Nachricht an Fachleute, Betriebsfragen. Die Roadmap verweist darauf; veraltete Stellen in Demo, Architektur und README wurden korrigiert.
- **Gefunden:** Das Repository ist privat (anonymer Abruf: 404). Ohne Freigabe sieht die Jury den Code nicht. Entscheidung bei Osman; in der Roadmap als P1. Im Repository und seiner Historie liegt kein Zugangscode.
- **Zu diesem Zeitpunkt nicht gemacht:** Bereitstellung, Tippen auf die Karte (beides folgt im nächsten Eintrag), Übersetzungsprüfung, echte Geräte, Gespräche (brauchen Menschen).

### 22.10.2026, 14:03 Europe/Vienna – Codex: Kontext für Projektbeschreibung und Einreichung abgeglichen (Basis `d4fcba1`, ohne Commit)

- GitHub abgerufen und Branches, Issues, PRs sowie letzten CI-Lauf geprüft; README, Dokumentationswegweiser, Produkt, Arbeitsstand, Roadmap, Übergabe, Branch-Geschichte, Architektur, Demo und Produktgrenzen gelesen. Änderungen seit dem früheren Review anhand der Historie und zentraler Implementierung nachvollzogen.
- CI-Lauf #11: Node 22, Node 24 und Browser-Tests erfolgreich. Lokale Tests, Build und Live-Prüfungen nicht wiederholt. Ältere Angaben wie „25 Browser-Tests“ im Stand sind durch die neueren Prüfzeilen mit 30 Tests überholt.
- Parallele lokale Entwicklung an `web/lib/domain.ts` und `web/tests/domain.test.ts` erkannt (unter anderem Wege-/Zugangsprüfung, eigene Wasserstellen und Hinweise auf mögliche doppelte Erhebungen). Nicht verändert und nicht als fertig oder bereitgestellt bewertet. Keine Codeänderung, kein Commit, Push, Merge oder Deployment durch Codex.
- Zweck: anschließendes Ausfüllen der Projektangaben anhand belegter Fähigkeiten, mit klarer Trennung zwischen Umsetzung, Simulation und geplanten Erweiterungen. Offene Aufgaben bleiben in der Roadmap.

### 22.10.2026, abends (später) – Funktion vervollständigt

- **Lücke gefunden:** Die Fachregeln kannten keinen Befehl, der Weg, Zugang oder Öffnungszeiten setzt. Alternativen gab es deshalb nur für die fest eingetragene Stelle B. Neu: `verify_access`, `close_access`, `add_point`, `remove_point` (nur Koordination), Oberfläche in der Koordination, Server-Prüfung in `parseCommand`, Ausprobier-Modus automatisch mit.
- **Datenfund:** 22 Paare von Erhebungseinträgen liegen höchstens 50 m auseinander, alle aus verschiedenen Erhebungen (35 von 60 Einträgen beteiligt). Die „60 Wasserstellen“ sind also deutlich weniger verschiedene Orte. Jetzt als Hinweis in den Details, Auflösung in der Roadmap (P3).
- **SMS-Zählung** nach Kodierung (GSM-7, Erweiterungstabelle, UCS-2), mit Test. **Kiswahili-Tafel** sagt selbst, dass die Übersetzung ein Entwurf ist. **Bühne im Ausprobier-Modus** heißt jetzt „Practice mode“ und „Reset practice data“.
- Sieben Commits dieses Tages auf `main` (`b5f98fc` bis `8dc8e38` und der Doku-Nachtrag), mit `npm run deploy:cloudflare` bereitgestellt, Zugangscode unverändert.
- **Nicht umgesetzt:** Prüfung der Übersetzung (braucht Muttersprachler), Koordinaten beim Anlegen (Karte kennt nur Busia), Weg-/Zugangsmeldung durch Betreiber:innen.

### 22.10.2026, abends – Ausprobier-Modus

- **Anlass:** Das Produkt wird eingereicht und von Beurteilern benutzt, die den Zugangscode nicht haben; ohne Modus könnten sie nur zuschauen.
- **Umsetzung:** `lib/sandbox.ts` (dieselben Regeln, `applyLocal`), `lib/actors.ts` (die drei Personen, vorher in `session.ts`), `resetState` in `domain.ts` (vorher doppelt in `store.ts`), Umschaltung in `store.tsx`, `sandbox.tsx` (Banner, Knopf), Angebot in `signin.tsx`, `?sandbox=1` auf dem Server (erste Ansicht aus den Startdaten, ohne Datenbankzugriff).
- **Bewusste Grenze:** Je Tab, nicht zwischen Tabs oder Geräten geteilt (Roadmap).
- **Gefunden durch einen Lauf der Tests gegen die Live-Seite:** Auf dem lokalen Server bestanden alle Tests, live schlug einer fehl. Ursache: Die Rechneruhr ging hier rund 9 Sekunden hinter der Serveruhr. Die Übungsdaten bekamen Zeitstempel in Serverzeit, nach einem Neuladen galt aber die Geräteuhr, die Einträge lagen „in der Zukunft“ und die Wasserstelle erschien als „unklar“. Behoben: Der Ausprobier-Modus nutzt nur die Geräteuhr. Neuer Test mit einer um 5 Minuten nachgehenden Uhr (scheitert auf dem alten Stand live, besteht auf dem neuen). Lehre: Zeitlogik mit echtem Netz prüfen.
- **Tests gegen die Live-Seite:** `E2E_BASE_URL=<Adresse> npm run test:e2e -- e2e/sandbox.spec.ts e2e/board.spec.ts e2e/quality.spec.ts` führt nur Tests aus, die nichts am gemeinsamen Demo ändern; die anderen verweigern den Lauf gegen einen fremden Server.

Ältere Einträge (22.10.2026 nachmittags und früher) und die zugehörigen Prüfzeilen: [Archiv](archiv/PROTOKOLL-22-10-2026-bis-nachmittags.md).
