# Arbeitsweise in diesem Repository

- Sprache mit dem Nutzer und in den Dokumenten: Deutsch.
- **Nach jedem Arbeitsschritt `docs/ZWISCHENSTAND.md` aktualisieren**, bevor die Antwort an den Nutzer geht:
  - „Zuletzt aktualisiert“ und „Aktueller Stand“ anpassen, inklusive Tabelle der letzten Prüfungen (nur tatsächlich ausgeführte Prüfungen eintragen).
  - „Offene Aufgaben“ pflegen: Erledigtes auf „erledigt“ setzen oder entfernen, Neues mit Priorität (P1/P2/P3) und Zuständigkeit ergänzen.
  - Im „Protokoll“ oben einen kurzen Eintrag mit Uhrzeit und Commit ergänzen: was gemacht wurde, was gefunden wurde, was bewusst offen bleibt.
- README, `docs/DEMO.md` und `docs/ARCHITEKTUR.md` mitziehen, wenn sich Ablauf oder Technik ändern.
- Simulierte und historische Daten immer als solche kennzeichnen; „Funktioniert“ ist nie eine Aussage zur Trinkwasserqualität.
- Prüfungen im Ordner `web/`: `npm test`, `npm run typecheck`, `npm run build`, mit laufender Vorschau `npm run test:integration`. Unter Windows-PowerShell `npm.cmd`.
- `web/data/region.json` nur committen, wenn der Nutzer es entschieden hat (siehe offene Aufgaben).
