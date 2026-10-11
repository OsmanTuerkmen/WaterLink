# Arbeitsweise in diesem Repository

- Sprache mit dem Nutzer und in den Dokumenten: Deutsch.
- **Nach jedem Arbeitsschritt `docs/ZWISCHENSTAND.md` aktualisieren**, bevor die Antwort an den Nutzer geht:
  - „Zuletzt aktualisiert“ und „Aktueller Stand“ anpassen, inklusive Tabelle der letzten Prüfungen (nur tatsächlich ausgeführte Prüfungen eintragen).
  - „Offene Aufgaben“ pflegen: Erledigtes auf „erledigt“ setzen oder entfernen, Neues mit Priorität (P1/P2/P3) und Zuständigkeit ergänzen.
  - Im „Protokoll“ oben einen kurzen Eintrag mit Uhrzeit und Commit ergänzen: was gemacht wurde, was gefunden wurde, was bewusst offen bleibt.
- README, `docs/DEMO.md` und `docs/ARCHITEKTUR.md` mitziehen, wenn sich Ablauf oder Technik ändern.
- Simulierte und historische Daten immer als solche kennzeichnen; „Funktioniert“ ist nie eine Aussage zur Trinkwasserqualität.
- Prüfungen im Ordner `web/`: `npm test`, `npm run typecheck`, `npm run build`, mit laufender Vorschau `npm run test:integration`. Unter Windows-PowerShell `npm.cmd`.
- `web/data/region.json` ist seit dem 11.10.2026 mit den Busia-Daten im Repo (Entscheidung von Reczec).
- Aktiver Arbeitsbranch: `codex/waterlink-review`, abgeleitet von `claude/waterlink-redesign`. Nichts in `main` oder `claude/waterlink-mvp` zusammenführen, bevor Osman zugestimmt hat.
- Oberflächentexte auf Englisch, Dokumente auf Deutsch. Gestaltung nach `DESIGN.md`, Produktgrundlagen in `PRODUCT.md`.
- Live-Demo: Cloudflare (`npm run deploy:cloudflare` in `web/`), siehe `docs/BEREITSTELLUNG.md`. Den Zugangscode (`web/.env.demo-access`) nie committen, ausgeben oder in Dokumente schreiben.
- Wer neu dazukommt, zuerst `docs/ZWISCHENSTAND.md`, `docs/REVIEW_CODEX.md` und `docs/NAECHSTER_PROMPT.md` lesen. `docs/UEBERGABE.md` beschreibt die frühere Übergabe. Zuerst die App stabilisieren; Pitch und Folien erst danach. Live-Stand und Branch-Stand unterscheiden.
