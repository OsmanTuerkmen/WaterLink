# Arbeitsstand WaterLink

**Zuletzt aktualisiert: 21. Oktober 2026, nachts · Claude · Arbeitsbranch `codex/waterlink-review` unverändert bei `12ba4a6`; die neuen Änderungen liegen zur Entscheidung auf dem getrennten Branch `claude/waterlink-p1-ui-review` (siehe Protokoll).**

## Ziel

Zuerst eine verlässlich funktionierende App: Haushalte sehen den letzten bestätigten Betriebszustand und mögliche Alternativen; Betreiber melden, Techniker bearbeiten und Betreiber bestätigen eine Reparatur ausdrücklich. Danach kommen Pitch und Drei-Minuten-Vorführung. Ein Feldpilot ist noch nicht vereinbart.

## Aktueller Stand

- Lokaler Arbeitsordner dieses Chats: `C:\Users\basre\Desktop\WaterLink`, bereits vollständig geklont und mit `https://github.com/OsmanTuerkmen/WaterLink` verbunden. Am 21.10.2026 erneut erfolgreich alle Remote-Branches und Tags abgerufen; Arbeitsbranch und Remote stehen bei `12ba4a6`. Bestehende lokale Dokumentationsänderungen sind erhalten.
- Basis: Claudes englisches Redesign bei Commit `2207f2c`. Codex arbeitet auf einem eigenen Branch und empfiehlt, die neue Oberfläche als Grundlage zu behalten.
- Haushaltsstatus, öffentliche Tafel, Betreiber-/Technikeransicht, Koordination, simulierte SMS und Bühne sind implementiert. WPdx-Orte und historische Sensordaten sind enthalten; aktuelle Bestätigungen, Wege und Rollen bleiben simuliert.
- Codex hat SMS-Offline-Antworten, ausdrückliche SMS-Funktionsprüfung, SMS-Anmeldung, Direktlinks zu Meldungen, Ablaufzeiten auf dem Druckblatt und mehrere irreführende Texte korrigiert.
- **Demo-Zugang gehärtet (Claude):** Das Cookie trägt einen signierten Ablaufzeitpunkt, den der Server prüft. Anmeldeversuche sind pro Client und global begrenzt und werden vor der Codeprüfung atomar gezählt. Details in [Architektur](ARCHITEKTUR.md). Auf der Live-Seite noch **nicht** bereitgestellt.
- **Handy, Druck, zwei Geräte geprüft (Claude):** Zielflächen auf Touch-Geräten jetzt mindestens 48 px wie in `DESIGN.md` verlangt; Druckblatt passt auf eine A4-Seite, nennt die Demo-Kennzeichnung und Quelle und druckt nur absolute Zeiten; Meldungs- und Testentwürfe überstehen die Anmelde-Weiterleitung und Neuladen.
- **Live-Adresse:** https://waterlink-demo.waterlink.workers.dev – läuft auf Reczecs Cloudflare-Konto und enthält bislang Claudes früheren Stand, nicht die Änderungen dieses Branches.
- **Seit 21.10. nachts (Claude, auf Branch `claude/waterlink-p1-ui-review`, nicht live, nicht in den Arbeitsbranch übernommen):** Anmeldesperre kann nicht mehr alle aussperren; die Demo setzt sich nach 4 Stunden ohne Aktivität selbst mit frischen simulierten Bestätigungen neu an; Lint ohne Befund; CI-Datei `.github/workflows/ci.yml`; Abfrage `?since=<Revision>` (rund 400 statt 47.000 Byte, versteckte Tabs fragen nicht); Oberfläche: alle Tippflächen ≥ 44 px bei 375 px, eine h1 pro Ansicht, Schrift in rem, Farben nur über Tokens, Kontrast ≥ 4,5:1, Bewegungsreduktion mit ruhigem Ersatzsignal. Details im Protokoll.
- Kein Merge und kein neues Deployment vorgenommen. Vollständiger Bericht: [Review](REVIEW_CODEX.md).

## Aktuell selbst ausgeführte Prüfungen

**Claude, 21.10.2026 nachts (P1 und Oberfläche, Branch `claude/waterlink-p1-ui-review`):**

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 62/62 bestanden (neu: `tests/store.test.ts` mit 8 Tests für Befehle, Wiederholung, Revisionskonflikt, Reset, Neuansatz nach 4 Stunden, Sitzungen, Anfragekörper; ein Test für die Sperre) |
| `npm run typecheck`, `npm run lint`, `npm run build` | alle drei Exit-Code 0 (Lint vorher 7 Befunde) |
| `npm run test:integration` gegen `npm run dev` (Port 5174, lokale DB) | bestanden, einschließlich der neuen `since`-Abfrage. Gegen `npm start` nicht aussagekräftig: dort gibt es keine Mock-Anmeldung, und die lokale Laufzeit liefert zusätzlich abwechselnd 503 |
| `npm run test:access` gegen `npm run dev` (Port 5175, Code-Modus, Test-Code, `.dev.vars` danach gelöscht) | 11/11 bestanden |
| 375 px (Emulation), alle 7 Ansichten | keine Bedienelemente unter 44 px, genau eine h1, keine horizontale Überbreite; bei Textgröße 150 % und 200 % ebenfalls keine Überbreite |
| Abfrage im Browser | 3 Anfragen in 10 s, Antwort bei unverändertem Stand 402 Byte |
| Kontrast aller Text-/Hintergrund-Paare der Tokens | alle ≥ 4,5:1 nach Anpassung von `--limit` (4,39 → 5,13) und `--ink-3` (4,11 → 5,0) |
| Nicht geprüft | physische Geräte, Screenreader, Bewegungsreduktion im Browser (nur im CSS gelesen), erster CI-Lauf auf GitHub, Papierausdruck, Verhalten nach 4 Stunden Stillstand gegen die echte Datenbank (nur Unit-Test) |

**Codex, 21.10.2026 (erneute Übernahme in diesem Chat):**

| Prüfung | Ergebnis |
|---|---|
| `git fetch --all --tags` | Mit genehmigtem Zugriff erfolgreich; vollständiger Klon, kein Shallow-Klon |
| Alle fünf Remote-Branches und gesamte Commit-Liste | 20 Commits; `codex/waterlink-review` enthält alle anderen Branch-Spitzen, keine Divergenz; keine Tags vorhanden |
| GitHub-Suche nach Issues und PRs | Keine Einträge zurückgegeben |
| `node --experimental-strip-types --test tests/*.test.ts` in `web/` | 53/53 bestanden |
| `node node_modules/typescript/bin/tsc --noEmit` in `web/` | Bestanden |

Build, Lint, Browser-, Integrations- und Live-Prüfungen in dieser Übernahme nicht erneut ausgeführt. `npm.cmd` ist in der aktuellen Shell nicht im PATH; Tests und Typprüfung wurden direkt mit Node 24.19.0 ausgeführt.

**Claude, 21.10.2026 (Tiefenprüfung):** zusätzlich Impeccable-Detektor 0 Befunde; Tippflächen bei 375 px gemessen (siehe Protokoll); `test:integration` lokal nicht bestanden wegen 503 der lokalen Laufzeit, kein Produktbefund bestätigt.

**Claude, 21.10.2026 (Gesamtprüfung):** `npm test` 53/53, `npm run typecheck` und `npm run build` bestanden, `npm run lint` 7 Befunde (unverändert), Live-Seite HTTP 200. Integrations- und Zugangstest nicht erneut gelaufen.

**Claude, 11.10.2026 ca. 15:30 EAT (nach Handy-, Druck- und Zwei-Geräte-Prüfung):**

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 53/53 bestanden |
| `npm run typecheck` | bestanden |
| `npm run build` | bestanden |
| `WATERLINK_BASE_URL=http://127.0.0.1:5174 npm run test:integration` | bestanden (lokale DB, danach zurückgesetzt) |
| `npm run lint` | unverändert 7 vorbestehende Befunde |
| Handybreite 375 px (Browser-Emulation mit Touch, diesmal wirksam): Status, Feld Betreiberin/Techniker, Meldungs-Direktlink, SMS, Koordination (3 Tabs) | Keine horizontale Überbreite. Vorher 7–14 Bedienelemente unter 32 px (Navigation 31 px, Rollenumschalter 28 px, SMS-Knöpfe 25 px); jetzt Navigation, Umschalter, SMS-/Schnellknöpfe, Koordinations-Tabs und „Details“ ≥ 48 px. Übrig: Logo-Link 30 px und Textlinks im Fließtext |
| A4-Ausdruck als PDF über Chromes Druckfunktion (headless), Statusseite | Vorher 2 Seiten, ohne Demo-Kennzeichnung, mit „Valid for 11 more hours“. Jetzt 1 Seite, Demo-Hinweis und WPdx-Quelle im Kopf, nur absolute Prüf-/Ablaufzeiten. **Kein Papierausdruck** |
| Zwei Geräte (Handy-Tab 375 px + Tafel-Tab), lokaler Server | Ausfall A gemeldet → Tafel zeigt „Not working“ + Alternative B; Techniker übernimmt, startet, meldet Reparatur → Tafel bleibt „Not working“; Server beendet (echter Verbindungsabbruch) → Tafel „No connection“, alle „Unclear“, keine Alternative; Senden gesperrt mit Hinweis, Entwurf bleibt; Server neu gestartet → beide Tabs erholen sich selbst; Funktionstest bestätigt → Tafel „Working“ |
| Anmeldung mitten im Formular (Sites-Modus) | Vorher ging der Entwurf durch die Weiterleitung verloren; jetzt bleiben Auswahl und Text erhalten, das Vor-Ort-Häkchen muss neu gesetzt werden |

**Claude, 11.10.2026 nachmittags (nach Härtung des Zugangs):**

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 53/53 bestanden (8 neue Zugangstests) |
| `npm run typecheck` | bestanden |
| `npm run build` | bestanden |
| `WATERLINK_BASE_URL=http://127.0.0.1:5174 npm run test:integration` (Sites-Modus, lokale DB) | bestanden |
| `npm run test:access` gegen lokalen Worker im Code-Modus mit Test-Code (lokale D1) | 11/11 bestanden: gefälschte Header 401, richtiger Code 200 mit `v2`-Cookie, verlängertes Cookie abgewiesen, 15 parallele Fehlversuche ergeben 10× 401 und 5× 429 mit `Retry-After`, Sperre gilt auch für den richtigen Code, bestehendes Cookie funktioniert weiter |
| `npm run lint` | 7 Befunde, alle vorbestehend und außerhalb der geänderten Dateien (siehe Aufgaben) |

**Codex, 11.10.2026 vormittags:**

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 45/45 bestanden |
| `npm run typecheck` | bestanden |
| Produktionsbuild über Sites-Build-Helfer (`npm run build`) | bestanden |
| `WATERLINK_BASE_URL=http://127.0.0.1:5174 npm run test:integration` | bestanden; nur lokale Datenbank |
| Live-Seite: Status und Bühne lesen | erreichbar, Kennzeichnung sichtbar |
| Browser lokal: Direktlink `#field/report/b` | öffnet Meldung für B |
| Browser lokal: SMS-Test prüfen, explizit bestätigen, anmelden, speichern | bestanden |
| Browser lokal: Offline-SMS `STATUS` | UNCLEAR; keine behauptete aktuelle Alternative |
| Desktop-SMS-Ansicht | visuell geprüft; Screenshot im Repo |
| Neue mobile Prüfung | nicht bestätigt: Breitenoverride wirkungslos, Browser blieb bei 1280 px |
| Neue Druckprüfung / zwei physische Geräte / Mikrofon | noch offen |

## Nächste Aufgaben

| Priorität | Aufgabe | Abnahmekriterium |
|---|---|---|
| ~~P1~~ erledigt | Demo-Zugang härten und im Code-Modus automatisiert prüfen | Lokal erfüllt (Unit-Tests und `test:access`); Live-Bereitstellung siehe nächste Zeile |
| P1 | Gehärteten Zugang **und die neuen Änderungen** auf die Live-Seite bringen (Reczecs Cloudflare-Konto, `npm run deploy:cloudflare`) | Danach: Freischalten funktioniert, alte Cookies sind ungültig (einmal neu freischalten), gefälschte Header 401, Live-Seite zeigt A und B als bestätigt. **Kein** `test:access` gegen Live. Erst nach Commit und Zustimmung |
| ~~P1~~ erledigt | Änderungen bei echter Handybreite und als A4-Ausdruck prüfen | Erfüllt mit Browser-Emulation und PDF; siehe Prüfungen |
| ~~P1~~ erledigt | Vollständiger Ablauf auf zwei Geräten inklusive echter Netzunterbrechung | Erfüllt mit zwei Tabs und beendetem Server; siehe Prüfungen |
| ~~P1~~ lokal erledigt | Start-Daten nach 4 h ohne Aktivität neu ansetzen (`lib/store.ts`) | Unit-Test; wirkt auf der Live-Seite erst nach der Bereitstellung |
| ~~P1~~ lokal erledigt | Anmeldesperre: gesperrter Client füllt den globalen Zähler nicht mehr | Unit-Test; `test:access` 11/11 |
| P1 | CI-Datei und Lint sind fertig; **offen: erster grüner Lauf auf GitHub** (Node 22 und 24, Ubuntu; `npm run build` dort noch nie gelaufen) | Grüner Lauf nach dem Push |
| ~~P2~~ erledigt | Tests für `parseCommand`, `mutateState`, Sitzungen, `readJsonBody` | `tests/store.test.ts` |
| ~~P2~~ erledigt | Tippflächen und h1 | Gemessen bei 375 px: keine Bedienelemente unter 44 px, eine h1 pro Ansicht. Die 57 kleinen Punkte der Karte „Coordination“ sind nur eine Zusatz-Auswahl; dieselbe Auswahl gibt es in der Liste |
| ~~P2~~ erledigt | Abfrage nur bei Revisionsänderung vollständig, im Hintergrund pausiert | 402 Byte statt 47 KB bei unverändertem Stand |
| P2 | Ungenutztes entfernen: `web/components/ui/` (61 Dateien, 7.300 Zeilen), `components/connector-error.tsx`, Vorlagen-SVGs, `examples/d1`, rund 14 Abhängigkeiten; `web/README.md` durch WaterLink-Text ersetzen | `npm ci` schneller, Build und Tests unverändert |
| P3 | Zustand begrenzen (Ereignisse auf die letzten ca. 200); Cookie nicht mit dem Zugangscode als Schlüssel signieren (eigenes Geheimnis); Browser-Kopie mit höherer Revision als der Server (z. B. nach neuem Datenbestand) wird ignoriert | Kleine Härtung. Deutsche Servertexte in `lib/http.ts`: erledigt |
| P2 | Gegenprobe auf **physischen** Geräten (ein echtes Handy, ein zweiter Rechner) und ein Papierausdruck | Gleiches Ergebnis wie in der Emulation; bisher nur Emulation und PDF |
| P2 | Pitch-Bühne (`?view=stage`) und Tafel bei Handybreite prüfen | Bisher nicht in dieser Runde geprüft |
| P1 | Eigenen Branch zur Prüfung bereitstellen und später Deploymentzuständigkeit klären | GitHub-Stand gesichert; gemeinsamer Live-Stand nur mit passendem Kontozugang aktualisiert |
| P2 | Zugangscode stärker machen: Der erzeugte Code hat rund 1,3 Mio. Möglichkeiten. Mit der Begrenzung reicht das für die Demo; beim nächsten Codewechsel einen längeren Code wählen | Entscheidung Reczec/Osman; ein Codewechsel meldet alle ab |
| ~~P2~~ erledigt | Lint-Befunde beheben | `npm run lint` Exit-Code 0 |
| P2 | WPdx-Mehrfacherfassungen und Quellenattribute prüfen | Dokumentierte Trennung von Datensätzen und eindeutigen Standorten; keine Live-Statusbehauptung |
| P2 | SMS-Simulation fachlich schärfen | Historische Antworten klar, Segmentanzahl als Schätzung oder korrekt nach Encoding, Vor-Ort-Prüfung weiterhin zwingend |
| Später | Pitch, Folien, Beamer und finales Zurücksetzen | Erst nach stabilem App-Ablauf |
| Feldpilot | Partner, Verantwortlichkeiten, Anzeigeort, Sprache, Reparaturmittel | Interviews und Vor-Ort-Prüfung statt erfundener Wirkungszahlen |

## Übergabe und Fortsetzung

[Nächster Prompt](NAECHSTER_PROMPT.md) ist als direkt nutzbarer Einstieg für Claude oder Codex geschrieben. [Claudes Übergabe](UEBERGABE.md) und [bisherige Historie](HISTORIE_BIS_CLAUDE.md) bleiben erhalten. Frühere Prüfaussagen sind Fremdberichte, sofern sie oben nicht erneut bestätigt sind.

Lokale uncommittete Busia-Daten vom alten Branch wurden vor dem Wechsel im Git-Stash gesichert (Details im Review). Keine Zugangscodes in Dokumente übernehmen.

## Protokoll

### 21.10.2026, nachts – Claude: P1 und Oberfläche umgesetzt (Basis `12ba4a6`, Branch `claude/waterlink-p1-ui-review`)

- **Anmeldesperre** (`lib/access-limit.ts`): Ein Client, der sein eigenes Limit erreicht hat, erhöht den globalen Zähler nicht mehr. Vorher konnten 100 Versuche von einer Adresse die Anmeldung für alle eine Stunde sperren. Test ergänzt.
- **Frische Demo** (`lib/store.ts`): Nach 4 Stunden ohne Ereignis wird der Zustand beim nächsten Lesen mit frischen simulierten Bestätigungen neu angesetzt (Revision + 1, Hinweis im Verlauf, wiederholbar ohne Doppelschreiben). Grund: Die Live-Seite stand auf Revision 0 mit zehn Tage alten Bestätigungen. Die Seed-Ereignisse sind 35 Minuten zurückdatiert, die Frist beginnt dort.
- **Lint und CI:** 7 Befunde behoben (gespeicherte Kopie und Sitzungen werden beim Erzeugen des Anbieters gelesen statt im Effekt, Abfrage über `useSyncExternalStore` und `key`, kein `any` mehr in `parseRegion`). `.github/workflows/ci.yml` (Node 22 und 24: ci, test, typecheck, lint, build). Dazu `import … with { type: "json" }` in `lib/region.ts`, `.ts`-Endungen in `store.ts`, `http.ts`, `session.ts` und eine `HttpError`-Klasse ohne Parameter-Eigenschaften, damit Node die Dateien in Tests direkt lädt.
- **Tests:** `tests/store.test.ts` (8) prüft Befehlsfelder, Wiederholung mit gleicher und fremder Anfragekennung, Revisionskonflikt auch bei gleichzeitigen Schreibern, Reset nur durch Koordination, Neuansatz nach 4 Stunden, Sitzungen (Nutzer, Ablauf, Bearer-Form) und Anfragekörper, gegen echtes SQLite.
- **Abfrage:** `GET /api/waterlink?since=<Revision>` antwortet bei gleicher Revision mit `unchanged`; der Client schreibt dann nur alle 30 s Synczeit und gespeicherte Kopie und rendert nicht neu. Versteckte Tabs fragen nicht.
- **Oberfläche (Impeccable-Audit, vorher geschätzt 16/20):** Kartenmarker mindestens 46 px auf dem Bildschirm (Messung per ResizeObserver); Logo, Fußlinks, Demo-Links ≥ 44 px; SMS-Eintritt auf der Statusseite eigene Zeile statt Link im Satz; h1 für Feld-App und Bühne; Schrift in rem (94 px-Angaben), sodass die Browser-Textgröße gilt, mit einspaltigen Rastern `minmax(0, 1fr)` und umbrechenden Tabs/Chips, damit 150 % und 200 % ohne Überbreite laufen; alle Farben in Regeln über Tokens (Druck bleibt schwarz auf weiß); `--limit` und `--ink-3` abgedunkelt (Kontrast); `prefers-reduced-motion` entfernt Bewegung, die Tafel behält einen ruhigen Farbton für „Zeile geändert“. `DESIGN.md` und `.impeccable/design.json` (nur die beiden Farbwerte; die Farbleitern dort sind nicht neu berechnet) angepasst.
- **Bewusst nicht gemacht:** kein Dunkelmodus (Sonnenlicht und Tafel; `color-scheme: light` war schon gesetzt); ungenutzte `components/ui/` und Abhängigkeiten nicht entfernt (P2); nichts in `codex/waterlink-review`, `main` oder die anderen Branches übernommen, nichts bereitgestellt. Die Änderungen stehen in fünf Commits auf `claude/waterlink-p1-ui-review` (Backend und Tests, Client und Lint, Oberfläche, CI, Dokumente), damit man sie einzeln ansehen und verwerfen kann. Ein Versuch, den lokalen 503 durch Verwerfen ungelesener Anfragekörper zu beheben, half nicht und wurde zurückgenommen.

### 21.10.2026, ca. 22:13 Europe/Vienna – Codex: GitHub-Verbindung und Kontext für diesen Chat geprüft (Basis `12ba4a6`, ohne Commit)

- Vorhandenen Klon weiterverwendet, alle Remote-Branches und Tags erfolgreich abgerufen. Arbeitsbranch `codex/waterlink-review` ist synchron zu `origin/codex/waterlink-review`. Die vier anderen Branches sind Vorfahren (main 19, codex/waterlink-mvp 18, claude/waterlink-mvp 9, claude/waterlink-redesign 3 Commits zurück).
- Projektanweisungen, Produkt, Gestaltung, Architektur, Review, Übergaben, Historie, Demo, Bereitstellung und offene Aufgaben gelesen; zentrale Fachtypen, Speicherung und Einstieg der Oberfläche gesichtet. GitHub liefert keine Issues oder PRs. Stash leer.
- Selbst geprüft: 53 Tests und TypeScript erfolgreich. Kein erneuter Build oder App-Start; bestehende Dokumentationsänderungen erhalten. Keine Codeänderungen, Branch-Wechsel, Commits, Pushes, Merges oder Deployments.
- Weiterarbeit: App zuerst stabilisieren; P1 für globale Anmeldesperre, abgelaufene Demo-Startbestätigungen und Lint/CI aus der bisherigen Prüfung bleiben offen. Live-Stand wurde hier nicht erneut abgefragt.

### 21.10.2026 (später) – Claude: Tiefenprüfung mit Impeccable, Security-Review, Ponytail-Audit (ohne Commit)

- Gelesen: gesamtes Backend (`lib/access*.ts`, `http.ts`, `store.ts`, `session.ts`, `domain.ts`, `sms.ts`, Routen, Deploy-Skript), `store.tsx`, `page.tsx`, CSS-Kennzahlen. Lokal gebaut gestartet (`npm start`, Port 5174, danach beendet), Ansichten bei Desktop und 375 px angesehen, Tippflächen per Skript gemessen. Impeccable-Detektor auf `web/app` und `web/components/waterlink`: 0 Befunde.
- **Live-Stand gelesen (nur GET):** Revision 0, Bestätigungen von A und B vom 11.10. 09:23/09:09 UTC, also über 12 Stunden alt – wer die Live-Seite öffnet, sieht alles als „Confirmation expired“, bis jemand mit Code zurücksetzt.
- Neu gefunden: Sperr-Zähler im Zugang erlaubt, dass ein Client alle aussperrt; Entwurf ohne CI; 60 ungenutzte UI-Bausteine und etwa 14 ungenutzte Abhängigkeiten; Startseiten-README von `web/` ist die Vorlage; Feld-Ansicht ohne h1; Karten-Marker 22 px, Demo-Leistenlinks 17 px hoch; Backend-Kernlogik (`parseCommand`, `mutateState`, Sitzungen) ohne Unit-Test.
- `npm run test:integration` gegen lokales `npm start`: abgebrochen, weil die lokale Laufzeit bei schnellen aufeinanderfolgenden POSTs abwechselnd 503 liefert (mit Pause 4/4 mal 401, Live 8/8 mal 401). Nicht als Bestanden gewertet; vermutlich Werkzeugeffekt, nicht bestätigt.
- Bewusst offen: nichts davon behoben; Priorisierung in „Nächste Aufgaben“ ergänzt.

### 21.10.2026 – Claude: Gesamtprüfung Stand und Branches (Basis `12ba4a6`, ohne Commit)

- Gelesen: Arbeitsstand, Review, Übergaben, nächster Prompt. Branches: `main` (3ac8228), `claude/waterlink-mvp`, `codex/waterlink-mvp`, `claude/waterlink-redesign` sind alle reine Vorfahren von `codex/waterlink-review` (0 Commits Rückstand, 19/18/9/3 Commits Vorsprung); keine Divergenz, Merge wäre fast-forward. Lokal = Remote, Stash leer, einzige lokale Änderung ist dieses Dokument.
- Selbst ausgeführt: `npm test` 53/53, `npm run typecheck`, `npm run build` bestanden; `npm run lint` weiter 7 Befunde (6 Fehler, 1 Warnung, u. a. `store.tsx:107`, `domain.ts:244/250`). Live-Seite antwortet mit HTTP 200. `test:integration` und `test:access` nicht ausgeführt.
- Bewusst offen: gehärteter Zugang nicht live, Lint, physische Geräte/Papier, Bühne/Tafel am Handy, P2-Daten- und SMS-Punkte. Kein Merge, kein Deployment.

### 21.10.2026 – Codex: Desktop-Repository übernommen und Branches abgeglichen

- Arbeitsordner dieses Chats für weitere Befehle: `C:\Users\basre\Desktop\WaterLink`. Die App-Projektzuordnung des Chats wurde dadurch nicht geändert.
- Alle fünf Branch-Spitzen über die GitHub-Verbindung abgefragt: entsprechen den lokal gespeicherten Remote-Refs (main 3ac8228, codex/waterlink-mvp ae2e42c, claude/waterlink-mvp 3f8ac54, claude/waterlink-redesign 2207f2c, codex/waterlink-review 12ba4a6).
- Alle 20 Commit-Einträge, Branch-Unterschiede, Arbeitsstand, Review, Übergaben, Produkt und Architektur gelesen. Vor dieser Dokumentationsänderung war der Arbeitsbaum sauber; die lokale Stash-Liste ist leer. Der früher dokumentierte Stash ist in diesem Klon nicht vorhanden.
- `git fetch --all --prune` konnte `.git/FETCH_HEAD` wegen eines Schreibzugriffsfehlers nicht öffnen; der Remote-Abgleich erfolgte stattdessen lesend über die GitHub-Verbindung.
- Keine App-Tests erneut ausgeführt; frühere Testergebnisse bleiben Fremdberichte. Keine Branch-Wechsel, Commits, Pushes, Merges oder Deployments. Offene Aufgaben bleiben bestehen.


### 11.10.2026, ca. 15:30 EAT – Claude: Handy, Druck und zwei Geräte geprüft und korrigiert

- **Touch-Zielflächen:** `DESIGN.md` verlangt ≥ 48 px, umgesetzt waren 25–33 px. Neue Regel in `globals.css` für Touch-Geräte und Breiten ≤ 720 px; Desktop bleibt kompakt.
- **Druckblatt:** Demo-Kennzeichnung und WPdx-Quelle im Kopf (vorher fehlte auf Papier jeder Hinweis auf simulierte Bestätigungen); relative Gültigkeit und SMS-Hinweis ausgeblendet; zweispaltige Zeilen im Druck, damit drei Stellen auf eine A4-Seite passen.
- **Entwürfe:** Meldung und Funktionstest speichern Auswahl und Text pro Wasserstelle in `sessionStorage`; nach Anmeldung oder Neuladen sind sie wieder da, nach erfolgreichem Senden gelöscht. Vor-Ort- und Test-Häkchen werden absichtlich nie wiederhergestellt.
- Zwei-Geräte-Ablauf mit echtem Verbindungsabbruch bestanden (Details oben).
- Bewusst offen: physische Geräte und Papier, Bühne/Tafel auf dem Handy, Lint-Befunde, Live-Bereitstellung.

### 11.10.2026, Nachmittag – Claude: Demo-Zugang gehärtet (`c38b60c`)

- `web/lib/access-token.ts` (neu, ohne Plattformimporte): Cookie `v2.<Ablauf>.<HMAC>`. Der Ablauf wird auf dem Server geprüft; weit in der Zukunft liegende Ablaufzeiten und alte statische Cookies werden abgewiesen; ein Codewechsel macht alle Cookies ungültig. Im Code-Modus werden Plattform-Header vollständig ignoriert.
- `web/lib/access-limit.ts` (neu): Begrenzung in D1 mit 10 Versuchen pro Client in 15 Minuten und 100 insgesamt pro Stunde, atomar vor der Codeprüfung gezählt. Die IP wird nur als gekürzter Hash gespeichert. Die Tabelle wird bei Bedarf angelegt. Die frühere Verzögerung von 800 ms entfällt.
- `web/tests/access.test.ts`: 8 Tests; die Begrenzung läuft dabei gegen echtes SQLite (`node:sqlite`). `web/scripts/check-access.mjs` (`npm run test:access`) prüft den Code-Modus Ende-zu-Ende, nur auf localhost.
- `.dev.vars*` in `web/.gitignore` aufgenommen; die lokale Test-`.dev.vars` wurde nach dem Test gelöscht.
- Befund: `npm run lint` meldet 7 vorbestehende Probleme; in dieser Einheit nicht behoben.
- Bewusst offen: Live-Bereitstellung (Kontozugang Reczec), stärkerer Code, mobile/Druck/Zwei-Geräte-Prüfung als nächste Einheit.

### 11.10.2026 – Codex übernimmt auf eigenem Branch

Übergabe und Live-Oberfläche gelesen; Branch `codex/waterlink-review` von `2207f2c` angelegt. Zunächst Funktions- und Verlässlichkeitsfehler korrigiert, keine Pitch-Arbeit. Zwei SMS-Regressionstests ergänzt. Tests, Typprüfung, Build und lokaler API-Ablauf erfolgreich. UI-Prüfungen und ihre Grenzen im Review dokumentiert. GitHub-Sicherung erfolgt mit dem Commit dieses Dokuments; Remote-Hash vor Abschluss prüfen.
