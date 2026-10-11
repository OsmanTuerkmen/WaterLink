# Arbeitsstand WaterLink

**Zuletzt aktualisiert: 11. Oktober 2026 · Codex · Branch `codex/waterlink-review`.**

## Ziel

Zuerst eine verlässlich funktionierende App: Haushalte sehen den letzten bestätigten Betriebszustand und mögliche Alternativen; Betreiber melden, Techniker bearbeiten und Betreiber bestätigen eine Reparatur ausdrücklich. Danach kommen Pitch und Drei-Minuten-Vorführung. Ein Feldpilot ist noch nicht vereinbart.

## Aktueller Stand

- Basis: Claudes englisches Redesign bei Commit `2207f2c`. Codex arbeitet auf einem eigenen Branch und empfiehlt, die neue Oberfläche als Grundlage zu behalten.
- Haushaltsstatus, öffentliche Tafel, Betreiber-/Technikeransicht, Koordination, simulierte SMS und Bühne sind implementiert. WPdx-Orte und historische Sensordaten sind enthalten; aktuelle Bestätigungen, Wege und Rollen bleiben simuliert.
- Codex hat SMS-Offline-Antworten, ausdrückliche SMS-Funktionsprüfung, SMS-Anmeldung, Direktlinks zu Meldungen, Ablaufzeiten auf dem Druckblatt und mehrere irreführende Texte korrigiert.
- **Live-Adresse:** https://waterlink-demo.waterlink.workers.dev – läuft auf Reczecs Cloudflare-Konto und enthält bislang Claudes Stand, nicht die Änderungen dieses Branches.
- Kein Merge und kein neues Deployment vorgenommen. Vollständiger Bericht: [Review](REVIEW_CODEX.md).

## Aktuell selbst ausgeführte Prüfungen

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
| P1 | Demo-Zugang härten und im Code-Modus automatisiert prüfen | Server weist abgelaufene/manipulierte Cookies und gefälschte Sites-Header ab; richtige Anmeldung funktioniert |
| P1 | Änderungen bei echter Handybreite und als A4-Ausdruck prüfen | Alle Bedienelemente erreichbar, keine horizontale Überbreite, Prüf- und Ablaufdatum lesbar |
| P1 | Vollständiger Ablauf auf zwei Geräten inklusive echter Netzunterbrechung | Reparaturmeldung allein schaltet nicht grün; klare Unsicherheit offline; Entwürfe bleiben bei Fehler erhalten |
| P1 | Eigenen Branch zur Prüfung bereitstellen und später Deploymentzuständigkeit klären | GitHub-Stand gesichert; gemeinsamer Live-Stand nur mit passendem Kontozugang aktualisiert |
| P2 | WPdx-Mehrfacherfassungen und Quellenattribute prüfen | Dokumentierte Trennung von Datensätzen und eindeutigen Standorten; keine Live-Statusbehauptung |
| P2 | SMS-Simulation fachlich schärfen | Historische Antworten klar, Segmentanzahl als Schätzung oder korrekt nach Encoding, Vor-Ort-Prüfung weiterhin zwingend |
| Später | Pitch, Folien, Beamer und finales Zurücksetzen | Erst nach stabilem App-Ablauf |
| Feldpilot | Partner, Verantwortlichkeiten, Anzeigeort, Sprache, Reparaturmittel | Interviews und Vor-Ort-Prüfung statt erfundener Wirkungszahlen |

## Übergabe und Fortsetzung

[Nächster Prompt](NAECHSTER_PROMPT.md) ist als direkt nutzbarer Einstieg für Claude oder Codex geschrieben. [Claudes Übergabe](UEBERGABE.md) und [bisherige Historie](HISTORIE_BIS_CLAUDE.md) bleiben erhalten. Frühere Prüfaussagen sind Fremdberichte, sofern sie oben nicht erneut bestätigt sind.

Lokale uncommittete Busia-Daten vom alten Branch wurden vor dem Wechsel im Git-Stash gesichert (Details im Review). Keine Zugangscodes in Dokumente übernehmen.

## Protokoll

### 11.10.2026 – Codex übernimmt auf eigenem Branch

Übergabe und Live-Oberfläche gelesen; Branch `codex/waterlink-review` von `2207f2c` angelegt. Zunächst Funktions- und Verlässlichkeitsfehler korrigiert, keine Pitch-Arbeit. Zwei SMS-Regressionstests ergänzt. Tests, Typprüfung, Build und lokaler API-Ablauf erfolgreich. UI-Prüfungen und ihre Grenzen im Review dokumentiert. GitHub-Sicherung erfolgt mit dem Commit dieses Dokuments; Remote-Hash vor Abschluss prüfen.
