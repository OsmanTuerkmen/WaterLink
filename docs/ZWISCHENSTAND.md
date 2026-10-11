# Arbeitsstand WaterLink

**Zuletzt aktualisiert: 11. Oktober 2026, ca. 15:30 EAT · Claude · Branch `codex/waterlink-review`.**

## Ziel

Zuerst eine verlässlich funktionierende App: Haushalte sehen den letzten bestätigten Betriebszustand und mögliche Alternativen; Betreiber melden, Techniker bearbeiten und Betreiber bestätigen eine Reparatur ausdrücklich. Danach kommen Pitch und Drei-Minuten-Vorführung. Ein Feldpilot ist noch nicht vereinbart.

## Aktueller Stand

- Basis: Claudes englisches Redesign bei Commit `2207f2c`. Codex arbeitet auf einem eigenen Branch und empfiehlt, die neue Oberfläche als Grundlage zu behalten.
- Haushaltsstatus, öffentliche Tafel, Betreiber-/Technikeransicht, Koordination, simulierte SMS und Bühne sind implementiert. WPdx-Orte und historische Sensordaten sind enthalten; aktuelle Bestätigungen, Wege und Rollen bleiben simuliert.
- Codex hat SMS-Offline-Antworten, ausdrückliche SMS-Funktionsprüfung, SMS-Anmeldung, Direktlinks zu Meldungen, Ablaufzeiten auf dem Druckblatt und mehrere irreführende Texte korrigiert.
- **Demo-Zugang gehärtet (Claude):** Das Cookie trägt einen signierten Ablaufzeitpunkt, den der Server prüft. Anmeldeversuche sind pro Client und global begrenzt und werden vor der Codeprüfung atomar gezählt. Details in [Architektur](ARCHITEKTUR.md). Auf der Live-Seite noch **nicht** bereitgestellt.
- **Handy, Druck, zwei Geräte geprüft (Claude):** Zielflächen auf Touch-Geräten jetzt mindestens 48 px wie in `DESIGN.md` verlangt; Druckblatt passt auf eine A4-Seite, nennt die Demo-Kennzeichnung und Quelle und druckt nur absolute Zeiten; Meldungs- und Testentwürfe überstehen die Anmelde-Weiterleitung und Neuladen.
- **Live-Adresse:** https://waterlink-demo.waterlink.workers.dev – läuft auf Reczecs Cloudflare-Konto und enthält bislang Claudes früheren Stand, nicht die Änderungen dieses Branches.
- Kein Merge und kein neues Deployment vorgenommen. Vollständiger Bericht: [Review](REVIEW_CODEX.md).

## Aktuell selbst ausgeführte Prüfungen

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
| P1 | Gehärteten Zugang auf die Live-Seite bringen (Reczecs Cloudflare-Konto, `npm run deploy:cloudflare`) | Danach: Freischalten funktioniert, alte Cookies sind ungültig (einmal neu freischalten), gefälschte Header 401. **Kein** `test:access` gegen Live |
| ~~P1~~ erledigt | Änderungen bei echter Handybreite und als A4-Ausdruck prüfen | Erfüllt mit Browser-Emulation und PDF; siehe Prüfungen |
| ~~P1~~ erledigt | Vollständiger Ablauf auf zwei Geräten inklusive echter Netzunterbrechung | Erfüllt mit zwei Tabs und beendetem Server; siehe Prüfungen |
| P2 | Gegenprobe auf **physischen** Geräten (ein echtes Handy, ein zweiter Rechner) und ein Papierausdruck | Gleiches Ergebnis wie in der Emulation; bisher nur Emulation und PDF |
| P2 | Pitch-Bühne (`?view=stage`) und Tafel bei Handybreite prüfen | Bisher nicht in dieser Runde geprüft |
| P1 | Eigenen Branch zur Prüfung bereitstellen und später Deploymentzuständigkeit klären | GitHub-Stand gesichert; gemeinsamer Live-Stand nur mit passendem Kontozugang aktualisiert |
| P2 | Zugangscode stärker machen: Der erzeugte Code hat rund 1,3 Mio. Möglichkeiten. Mit der Begrenzung reicht das für die Demo; beim nächsten Codewechsel einen längeren Code wählen | Entscheidung Reczec/Osman; ein Codewechsel meldet alle ab |
| P2 | Vorbestehende Lint-Befunde beheben (setState in Effects in `page.tsx`, `field.tsx`, `store.tsx`; `any` in `domain.ts`; ungenutzte Variable in `coordination.tsx`) | `npm run lint` ohne Fehler, Verhalten unverändert |
| P2 | WPdx-Mehrfacherfassungen und Quellenattribute prüfen | Dokumentierte Trennung von Datensätzen und eindeutigen Standorten; keine Live-Statusbehauptung |
| P2 | SMS-Simulation fachlich schärfen | Historische Antworten klar, Segmentanzahl als Schätzung oder korrekt nach Encoding, Vor-Ort-Prüfung weiterhin zwingend |
| Später | Pitch, Folien, Beamer und finales Zurücksetzen | Erst nach stabilem App-Ablauf |
| Feldpilot | Partner, Verantwortlichkeiten, Anzeigeort, Sprache, Reparaturmittel | Interviews und Vor-Ort-Prüfung statt erfundener Wirkungszahlen |

## Übergabe und Fortsetzung

[Nächster Prompt](NAECHSTER_PROMPT.md) ist als direkt nutzbarer Einstieg für Claude oder Codex geschrieben. [Claudes Übergabe](UEBERGABE.md) und [bisherige Historie](HISTORIE_BIS_CLAUDE.md) bleiben erhalten. Frühere Prüfaussagen sind Fremdberichte, sofern sie oben nicht erneut bestätigt sind.

Lokale uncommittete Busia-Daten vom alten Branch wurden vor dem Wechsel im Git-Stash gesichert (Details im Review). Keine Zugangscodes in Dokumente übernehmen.

## Protokoll

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
