# WaterLink

**Funktioniert unsere Wasserstelle heute?**

WaterLink verbindet eine öffentliche Statusanzeige für Haushalte mit dem Ablauf von der Störungsmeldung bis zur ausdrücklich bestätigten Reparatur. Alle Wasserstellen und Personen im Prototyp sind fiktive Beispieldaten. „Funktioniert“ beschreibt den Betrieb, keine geprüfte Trinkwasserqualität.

## Zwischenstand vom 10. Oktober 2026

Der implementierte MVP liegt in `web/` auf dem Branch `codex/waterlink-mvp`. Eine gehostete Demo ist noch nicht bereitgestellt.

- Responsive Weboberfläche und separate öffentliche Anzeige (`?view=display`).
- Gemeinsamer, serverseitig gespeicherter Datenstand mit automatischer Aktualisierung.
- Störung melden, Auftrag übernehmen, Fortschritt und Hindernisse dokumentieren, Reparatur zur Prüfung melden und Funktion ausdrücklich bestätigen.
- Getrennte Betriebs- und Auftragszustände; veraltete, widersprüchliche und offline verfügbare Informationen werden entsprechend gekennzeichnet.
- Alternativen berücksichtigen Bestätigungsalter, Zugänglichkeit, geprüften Weg und Öffnungszeiten.
- Rollenprüfung, Änderungshistorie, Schutz vor doppelten Anfragen und konkurrierenden Änderungen.
- Demo-Werkzeuge für Sonderfälle und Zurücksetzen des Beispieldatensatzes.

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
