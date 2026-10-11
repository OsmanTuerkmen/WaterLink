# WaterLink

**Funktioniert unsere Wasserstelle heute?**

WaterLink verbindet eine öffentliche Statusanzeige für Haushalte mit dem Ablauf von der Störungsmeldung bis zur ausdrücklich bestätigten Reparatur. Personen, Bestätigungen und Aufträge im Prototyp sind simuliert. Die Wasserstellen sind entweder fiktiv oder stammen aus echten Erhebungen der [Water Point Data Exchange](https://www.waterpointdata.org/) (CC BY 4.0); deren Erhebungsstatus ist historisch und nie ein aktueller Zustand. „Funktioniert“ beschreibt den Betrieb, keine geprüfte Trinkwasserqualität.

## Zwischenstand vom 10. Oktober 2026

Der aktuelle Stand liegt in `web/` auf dem Branch `claude/waterlink-mvp` (aufbauend auf `codex/waterlink-mvp`). Eine gehostete Demo ist noch nicht bereitgestellt.

**Redesign zum Vergleich (Branch `claude/waterlink-redesign`, 11. Oktober 2026):** dieselbe Fachlogik mit neuer, englischer Oberfläche in der Bildwelt „gelber Kanister“. Getrennte Ansichten für Haushalte (`#status`), die öffentliche Tafel (`?view=display`), eine Handy-App für Betreiberin und Techniker (`#field`), die Koordination (`#coordination`) und eine Pitch-Bühne (`?view=stage`), die beide Handys und die Tafel live nebeneinander zeigt. Neu ist eine Karte aus echten Koordinaten und OpenStreetMap-Straßen ohne Kartendienst. Details in [Architektur](docs/ARCHITEKTUR.md), Ablauf im [Demo-Skript](docs/DEMO.md).

- Responsive Weboberfläche und öffentliche Statustafel (`?view=display`): große Schrift, Status als Wort und Symbol, Bestätigungszeit und Alternative – lesbar aus einigen Metern Entfernung.
- Gemeinsamer, serverseitig gespeicherter Datenstand mit automatischer Aktualisierung.
- Störung melden, Auftrag übernehmen, Fortschritt und Hindernisse dokumentieren, Reparatur zur Prüfung melden und Funktion ausdrücklich bestätigen.
- Getrennte Betriebs- und Auftragszustände; veraltete, widersprüchliche und offline verfügbare Informationen werden entsprechend gekennzeichnet.
- Alternativen berücksichtigen Bestätigungsalter, Zugänglichkeit, geprüften Weg und Öffnungszeiten.
- Rollenprüfung, Änderungshistorie, Schutz vor doppelten Anfragen und konkurrierenden Änderungen.
- Demo-Werkzeuge für Sonderfälle und Zurücksetzen des Beispieldatensatzes.
- Optional echte Wasserstellen einer Region in Kenia aus WPdx, mit Erhebungsdatum, Quelle und Suchliste.
- Wiedergabe echter, historischer Sensordaten von Smart Handpumps in Kwale (2014): Ein Einbruch der Fördermenge wird zum Hinweis „Prüfung nötig“, nie zu einem bestätigten Status.
- [Vom Prototyp zum echten Produkt](docs/WEG-ZUM-PRODUKT.md): was fehlt, realistischer Weg und Antworten auf typische Jury-Fragen.

Die Rollen sind für die private Demo frei wechselbar. Eine echte lokale Berechtigungsverwaltung, SMS, Sensoren und ein KI-Dienst sind nicht angebunden. Die Störungsbeschreibung lässt sich optional über die Spracherkennung des Browsers diktieren; der Text wird vor dem Speichern geprüft, der Status nie automatisch gesetzt. Pilotregion und Wirksamkeit sind ungeprüft.

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

Das Skript schreibt `data/region.json`. Für die Karte lädt `node scripts/import-osm.mjs` anschließend Straßen und Orte der Region aus OpenStreetMap nach `data/osm-area.json`. Danach den Entwicklungsserver neu starten (bzw. neu bauen) und unter **Demo-Werkzeuge** die Demo zurücksetzen. Mit `null` in `data/region.json` gelten wieder die fiktiven Beispieldaten.

## Prüfungen

```sh
npm test
npm run typecheck
# Mit laufender lokaler Vorschau; setzt ausschließlich die Demo-Daten zurück:
npm run test:integration
```

Stand 10. Oktober 2026: 39 Tests, TypeScript-Prüfung, Produktionsbuild und API-Integrationstest bestanden; der vollständige Ablauf wurde im Browser mit echten Orten aus Busia geprüft. Aktueller Stand, offene Aufgaben und Protokoll aller Schritte stehen im [Arbeitsstand](docs/ZWISCHENSTAND.md).

## Dokumentation

- [Arbeitsstand: Ziel, Stand, offene Aufgaben, Protokoll](docs/ZWISCHENSTAND.md) – wird nach jedem Schritt aktualisiert
- [Demo in drei Minuten](docs/DEMO.md)
- [Technische Entscheidungen](docs/ARCHITEKTUR.md)
- [Ursprüngliche Entscheidungsgrundlage](docs/KONZEPT.md) – enthält frühere Vorschläge; für die umgesetzte Architektur gilt das Architekturdokument.
