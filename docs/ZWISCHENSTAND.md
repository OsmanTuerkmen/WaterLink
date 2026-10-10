# Gesicherter Zwischenstand – 10. Oktober 2026

## Implementiert

React/TypeScript-Oberfläche, Vinext/Cloudflare-Worker-API und persistente D1-Datenhaltung. Der vollständige manuelle Kernablauf ist implementiert. Fachregeln liegen in `web/lib/domain.ts`, Serverzugriff und Rollenprüfung in `web/lib/`, Ansichten und Synchronisierung in `web/app/`. Die Ausgangsdaten sind ausdrücklich fiktiv.

## Bereits geprüft

- 22 von 22 Fachregeltests bestanden.
- TypeScript-Prüfung bestanden, zuletzt direkt vor diesem GitHub-Zwischenstand.
- API-Integrationstest bestanden: Anmeldung, Herkunftsprüfung, Rollen, gemeinsame Speicherung, Wiederholungen, Auftrags-Deduplizierung, Reparaturbestätigung, fehlgeschlagener Funktionstest, konkurrierende Änderungen und Demo-Sonderfälle.
- Browserprüfung: Betreiberin meldet Ausfall; separates öffentliches Anzeigefenster aktualisiert automatisch den Zustand und zeigt eine bestätigte Alternative.
- Ein früherer Produktionsbuild vor den letzten Oberflächenänderungen war erfolgreich.

## Als Nächstes

1. Sichtbaren Reparaturablauf bis zur Betreiberbestätigung in beiden Browserfenstern durchspielen.
2. Schmale und breite Ansichten, Verbindungsverlust und Druckansicht visuell prüfen; gegebenenfalls korrigieren.
3. Produktionsbuild des endgültigen Oberflächenstands ausführen.
4. Private Sites-Bereitstellung durchführen und dort Anmeldung, Datenbank und Ablauf prüfen. Das Sites-Projekt ist bereits registriert; es gibt noch keine bestätigte Live-Bereitstellung. Kein zweites Projekt anlegen.
5. Finale Screenshots, Demo-Link und getesteten Stand dokumentieren.

## Bewusste Grenzen

Die zwölf Stunden Gültigkeit sind ein Demo-Parameter. Rollenwechsel ist eine Demo-Funktion, keine fertige lokale Benutzerverwaltung. Keine SMS, Hardware, Sprach-KI oder reale Pilotdaten. Keine Aussagen über eingesparte Wege oder Reparaturzeiten ohne Feldprüfung. Das ursprüngliche Konzept ist archiviert; einige vorgeschlagene Details gehen über diesen Zwischenstand hinaus.

## Ablage

GitHub: `OsmanTuerkmen/WaterLink`, Branch `codex/waterlink-mvp`. Lokale Zugangstoken, Datenbankdateien, Sitzungen, Abhängigkeiten und erzeugte Build-Dateien werden nicht versioniert. Die Sites-Projektkennung in `web/.openai/hosting.json` ist eine nicht geheime Projektzuordnung.
