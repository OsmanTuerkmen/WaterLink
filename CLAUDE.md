# Arbeitsweise in diesem Repository

- Sprache mit dem Nutzer und in den Dokumenten: Deutsch. Oberflächentexte auf Englisch. Code, Commits und Bezeichner englisch.
- **Nach jedem Arbeitsschritt `docs/ZWISCHENSTAND.md` aktualisieren**, bevor die Antwort an den Nutzer geht:
  - „Zuletzt aktualisiert“ und „Stand“ anpassen, inklusive Tabelle der letzten Prüfungen (nur tatsächlich ausgeführte Prüfungen eintragen).
  - Im „Protokoll“ oben einen kurzen Eintrag mit Datum und Commit ergänzen: was gemacht wurde, was gefunden wurde, was bewusst offen bleibt. Ältere Einträge wandern bei Gelegenheit nach `docs/archiv/`.
- **Offene Aufgaben stehen in `docs/ROADMAP.md`** (eine Liste, nicht doppelt führen): Erledigtes auf „erledigt“ setzen oder entfernen, Neues mit Priorität (P1/P2/P3) ergänzen.
- README, `docs/DEMO.md` und `docs/ARCHITEKTUR.md` mitziehen, wenn sich Ablauf oder Technik ändern.
- Simulierte und historische Daten immer als solche kennzeichnen; „Funktioniert“ ist nie eine Aussage zur Trinkwasserqualität.
- Prüfungen im Ordner `web/`: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`; mit laufendem `npm run dev` zusätzlich `npm run test:integration`. Unter Windows-PowerShell `npm.cmd`.
- Gestaltung nach `DESIGN.md`, Produktgrundlagen in `PRODUCT.md`. `web/data/region.json` enthält die Busia-Daten (Entscheidung von Reczec, 11.10.2026).
- **Git:** `main` ist der gemeinsame Stand (die früheren Branches wurden am 22.10.2026 hineingeführt und gelöscht, siehe `docs/archiv/BRANCH-GESCHICHTE.md`). Größere oder riskante Änderungen auf einem eigenen Branch (`claude/…` oder `codex/…`), damit man sie vergleichen kann. Kein Force-Push und kein Löschen von Branches ohne ausdrückliche Anweisung.
- Live-Demo: Cloudflare (`npm run deploy:cloudflare` in `web/`), siehe `docs/BEREITSTELLUNG.md`. Den Zugangscode (`web/.env.demo-access`) nie committen, ausgeben oder in Dokumente schreiben. Live-Stand und Repository-Stand unterscheiden.
- Wer neu dazukommt, zuerst `README.md`, dann `docs/README.md` (Wegweiser), `docs/ZWISCHENSTAND.md`, `docs/ROADMAP.md` und `docs/NAECHSTER_PROMPT.md` lesen. Zuerst die App stabilisieren; Pitch und Folien erst danach.
