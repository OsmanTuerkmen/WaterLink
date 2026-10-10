# WaterLink

**Funktioniert unsere Wasserstelle heute?**

WaterLink verbindet eine öffentliche Statusanzeige für Haushalte mit dem Ablauf von der Störungsmeldung bis zur ausdrücklich bestätigten Reparatur. Personen, Bestätigungen und Aufträge im Prototyp sind simuliert. Die Wasserstellen sind entweder fiktiv oder stammen aus echten Erhebungen der [Water Point Data Exchange](https://www.waterpointdata.org/) (CC BY 4.0); deren Erhebungsstatus ist historisch und nie ein aktueller Zustand. „Funktioniert“ beschreibt den Betrieb, keine geprüfte Trinkwasserqualität.

## Zwischenstand vom 10. Oktober 2026

Der aktuelle Stand liegt in `web/` auf dem Branch `claude/waterlink-mvp` (aufbauend auf `codex/waterlink-mvp`). Eine gehostete Demo ist noch nicht bereitgestellt.

- Responsive Weboberfläche und separate öffentliche Anzeige (`?view=display`).
- Gemeinsamer, serverseitig gespeicherter Datenstand mit automatischer Aktualisierung.
- Störung melden, Auftrag übernehmen, Fortschritt und Hindernisse dokumentieren, Reparatur zur Prüfung melden und Funktion ausdrücklich bestätigen.
- Getrennte Betriebs- und Auftragszustände; veraltete, widersprüchliche und offline verfügbare Informationen werden entsprechend gekennzeichnet.
- Alternativen berücksichtigen Bestätigungsalter, Zugänglichkeit, geprüften Weg und Öffnungszeiten.
- Rollenprüfung, Änderungshistorie, Schutz vor doppelten Anfragen und konkurrierenden Änderungen.
- Demo-Werkzeuge für Sonderfälle und Zurücksetzen des Beispieldatensatzes.
- Optional echte Wasserstellen einer Region in Kenia aus WPdx, mit Erhebungsdatum, Quelle und Suchliste.

Die Rollen sind für die private Demo frei wechselbar. Eine echte lokale Berechtigungsverwaltung, SMS, Sensoren und KI-Spracherkennung sind nicht angebunden. Pilotregion und Wirksamkeit sind ungeprüft.

## Lokal starten

Voraussetzung: Node.js ab 22.13 und npm. Im Verzeichnis `web/`:

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_salty_kingpin.sql
npm run dev
```

Den Datenbankbefehl einmalig bei einer neuen lokalen Datenbank ausführen. Die Vorschau läuft standardmäßig auf `http://127.0.0.1:5173/`. Über die Anmeldeschaltfläche ist lokal eine simulierte Anmeldung möglich. Auf einer späteren privaten Sites-Bereitstellung übernimmt die Plattform die Anmeldung.

## Echte Wasserstellen laden

Im Verzeichnis `web/` (unter Windows in PowerShell `npm.cmd` statt `npm`):

```sh
npm run data:wpdx -- --list                 # Counties mit Anzahl der Einträge
npm run data:wpdx -- --county Kitui         # Nachbarschaft um eine zuletzt funktionierende Stelle
npm run data:wpdx -- --county Kitui --count 40 --near -1.05,38.01
```

Das Skript wählt nur Nachbarschaften, in denen zwei gefasste, als „Functional“ erhobene Wasserstellen höchstens 3 km auseinanderliegen (`--walk`), und übernimmt Stellen im Umkreis von 5 km (`--radius`). Dabei bevorzugt es Erhebungen aus den letzten 3 Jahren vor der neuesten Erhebung im County (`--recent`). Gute Ausgangswahl ist z. B. `--county Busia`. Bei Datensätzen, deren bereinigter Status für alle Einträge gleich ist, obwohl die Rohangabe „Wasser vorhanden ja/nein“ wechselt (Evidence Action Kenya 2023–2024: immer „Non-Functional“), gilt die Rohangabe. Gibt ein County das nicht her (z. B. Kitui: 48 weit verstreute, meist als defekt erhobene Einträge), bricht es mit einer Meldung ab.

Das Skript schreibt `data/region.json`. Danach den Entwicklungsserver neu starten (bzw. neu bauen) und unter **Demo-Werkzeuge** die Demo zurücksetzen. Mit `null` in `data/region.json` gelten wieder die fiktiven Beispieldaten.

## Prüfungen

```sh
npm test
npm run typecheck
# Mit laufender lokaler Vorschau; setzt ausschließlich die Demo-Daten zurück:
npm run test:integration
```

Zum gespeicherten Zwischenstand bestehen 22 Fachregeltests und die TypeScript-Prüfung. Der API-Integrationstest hat den vollständigen Ablauf einschließlich Rollenprüfung, Wiederholungen, fehlgeschlagener Funktionsprüfung und gleichzeitiger Änderungen bestanden. Der vollständige Ablauf von der Ausfallmeldung bis zur bestätigten Wiederherstellung wurde in zwei Browserfenstern geprüft, ebenso schmale und breite Ansichten und die Druckansicht (Details und Einschränkungen im [Arbeitsstand](docs/ZWISCHENSTAND.md)). TypeScript-Prüfung und Produktionsbuild nach den letzten Oberflächenkorrekturen stehen noch aus.

## Dokumentation

- [Arbeitsstand und nächste Schritte](docs/ZWISCHENSTAND.md)
- [Demo in drei Minuten](docs/DEMO.md)
- [Technische Entscheidungen](docs/ARCHITEKTUR.md)
- [Ursprüngliche Entscheidungsgrundlage](docs/KONZEPT.md) – enthält frühere Vorschläge; für die umgesetzte Architektur gilt das Architekturdokument.
