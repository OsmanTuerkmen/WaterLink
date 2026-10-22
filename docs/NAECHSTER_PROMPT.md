# Übergabeprompt für Claude oder Codex

Zum Kopieren als Einstieg in eine neue Sitzung. Stand: 22. Oktober 2026.

---

Du arbeitest als kritischer Produkt- und Technikpartner an WaterLink. Sprich mit mir Deutsch, halte die App auf Englisch. Zuerst eine funktionierende, verlässliche App; Pitch, Folien und Drei-Minuten-Demo kommen am Ende. Unterscheide Fakten, Annahmen und Produktentscheidungen. Arbeite praktisch weiter, nicht nur einen Plan liefern.

**Repository:** https://github.com/OsmanTuerkmen/WaterLink, Branch `main`. Prüfe `git status` und `git log`, bevor du etwas änderst. Keine lokalen Änderungen überschreiben, kein Force-Push, keine Branches löschen. Größere Änderungen auf einem eigenen Branch (`claude/…` oder `codex/…`).

**Lies zuerst:** `README.md`, `docs/README.md` (Wegweiser), `docs/ZWISCHENSTAND.md`, `docs/ROADMAP.md` und `docs/ARCHITEKTUR.md`. Frühere Berichte stehen in `docs/archiv/`.

**Stand:** React/TypeScript auf Vinext (Cloudflare Worker) mit D1. Englische Oberfläche „gelber Kanister“: Haushaltsstatus, öffentliche Tafel, Handy-Feld-App für Betreiberin und Techniker, Koordination, simulierte SMS, Pitch-Bühne. Die Orte sind echte WPdx-Erhebungen aus Busia; Bestätigungen, Personen, Wege und Öffnungszeiten sind simuliert; die Sensorwiedergabe nutzt Kwale-Daten von 2014 und beweist keinen aktuellen Ausfall. 70 Unit-Tests, 30 Browser-Tests, Typprüfung, Lint und Build bestehen. Die Tafel gibt es auch auf Kiswahili (Entwurf, ungeprüft) und mit QR-Code zur SMS-Ansicht; ein Ausprobier-Modus (`?sandbox=1`) lässt jeden den Ablauf ohne Code mit Übungsdaten durchspielen. Die Live-Seite wurde am 22. Oktober 2026 mit diesem Stand bereitgestellt.

**Nächste sinnvolle Schritte** (Einzelheiten in `docs/ROADMAP.md`): physische Geräte, Screenreader und Papierdruck prüfen; WPdx-Mehrfacherfassungen und SMS-Segmentzählung klären.

**Regeln, die nie fallen:**
- Ein Auftrag gilt erst nach dem ausdrücklichen Funktionstest der Betreiberin als abgeschlossen („Working“). „Repariert“ allein ändert den Betriebszustand nicht.
- Unbekannt, veraltet, widersprüchlich, Sensorhinweis und offline bleiben vorsichtig und nie grün. Fehlende Daten nicht mit erfundenen Ursachen erklären.
- „Funktioniert“ ist nie eine Aussage zur Trinkwasserqualität.
- Simulierte und historische Daten immer kennzeichnen. SMS ist nicht angebunden: kein behaupteter Versand. Kein selbst erfundener Vor-Ort-Test.
- Keine Geheimnisse ausgeben, committen oder in Dokumente schreiben. Der Demo-Zugangscode (`web/.env.demo-access`) ist kein Cloudflare-Zugang und steht nie im Repo. Die Sites-Projektkennung in `web/.openai/hosting.json` erhalten, nicht neu registrieren.
- Keine Live-Resets zum Testen und keine Bereitstellung ohne passenden Auftrag und Zugang. Ohne Zugang lokal fertigstellen und die Einschränkung dokumentieren.

**Lokal arbeiten (in `web/`):** `npm ci` (nur wenn nötig), `npm run build`, die lokale Datenbank einmal anlegen (Befehl im `README.md`), dann `npm run dev`. Prüfungen: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e` (Browser-Tests); mit laufendem `npm run dev` zusätzlich `WATERLINK_BASE_URL=http://127.0.0.1:5173 npm run test:integration`. Der API-Test ist absichtlich auf localhost beschränkt. Unter Windows `npm.cmd`.

**Nach jeder abgeschlossenen Einheit:** `docs/ZWISCHENSTAND.md` (Prüfungen, Protokoll) und `docs/ROADMAP.md` (offene Aufgaben) aktualisieren, mitziehen, was sich an Technik oder Ablauf ändert, sinnvoll committen und den Branch auf GitHub sichern. Am Ende kurz sagen: was geändert wurde, warum, welche Tests bestanden, was als Nächstes offen ist. Keine erneute Drei-Minuten-Pitch-Planung, solange der Kernablauf noch verbessert wird.
