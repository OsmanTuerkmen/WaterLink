# Gesicherter Zwischenstand – 10. Oktober 2026

## Implementiert

React/TypeScript-Oberfläche, Vinext/Cloudflare-Worker-API und persistente D1-Datenhaltung. Der vollständige manuelle Kernablauf ist implementiert. Fachregeln liegen in `web/lib/domain.ts`, Serverzugriff und Rollenprüfung in `web/lib/`, Ansichten und Synchronisierung in `web/app/`. Die Ausgangsdaten sind ausdrücklich fiktiv.

## Bereits geprüft

- 22 von 22 Fachregeltests bestanden.
- TypeScript-Prüfung bestanden, zuletzt direkt vor diesem GitHub-Zwischenstand.
- API-Integrationstest bestanden: Anmeldung, Herkunftsprüfung, Rollen, gemeinsame Speicherung, Wiederholungen, Auftrags-Deduplizierung, Reparaturbestätigung, fehlgeschlagener Funktionstest, konkurrierende Änderungen und Demo-Sonderfälle.
- Browserprüfung: Betreiberin meldet Ausfall; separates öffentliches Anzeigefenster aktualisiert automatisch den Zustand und zeigt eine bestätigte Alternative.
- Ein früherer Produktionsbuild vor den letzten Oberflächenänderungen war erfolgreich.

## Nachtrag 10. Oktober 2026, abends (Claude)

In dieser Arbeitsumgebung war das npm-Paketverzeichnis gesperrt. Vinext, Wrangler und die D1-Emulation konnten deshalb nicht installiert werden. Geprüft wurde stattdessen mit einem temporären Testaufbau außerhalb des Repositorys: die echte Oberfläche (`app/page.tsx`, `app/use-waterlink.ts`, `globals.css`) als Browser-Bundle, dazu die echten Servermodule `lib/store.ts`, `lib/session.ts` und `lib/http.ts` auf SQLite mit der Migration aus `drizzle/`. Abweichend sind nur Symbole (gleiche Lucide-Formen aus einem anderen Paket), Schrift und die Anmeldung (Cookie statt Plattform-Header).

**Geprüft:**

- 22 von 22 Fachregeltests bestanden.
- `scripts/check-flow.mjs` gegen den Testaufbau bestanden.
- Vollständiger Reparaturablauf in zwei unabhängigen Browserfenstern: Ausfall melden, Alternative B erscheint, Auftrag übernehmen, Hindernis dokumentieren, Reparatur melden (Anzeige bleibt „Ausgefallen“), Funktionstest bestätigen, veralteter Stand, Verbindungsverlust und Wiederverbindung. Die Anzeige folgte jeweils nach etwa 2–3 Sekunden; keine Konsolenfehler.
- Alle Ansichten bei 390, 768, 1024 und 1440 Pixel Breite ohne horizontalen Überlauf; Druckansicht als PDF.

**Behoben:**

- Direktlinks wie `/#repairs` und die Zurück-Taste wechselten die Ansicht nicht. Die Navigation folgt jetzt dem Hash und legt Verlaufseinträge an.
- Die Auftragszahl am Menüpunkt „Reparaturen“ war hell auf hell und unlesbar.
- Beim Neuladen blitzte kurz die Warnung „Keine aktuelle Verbindung“ auf. Sie erscheint jetzt erst nach einem fehlgeschlagenen Abruf; Schreibaktionen bleiben bis zum ersten Abruf gesperrt.
- Rollenhinweis lautete „Hier handelt die Techniker“; jetzt mit richtigem Artikel.
- Das Bestätigungsformular zeigte „Funktioniert“ vorausgewählt, obwohl diese Option bis zur Reparaturmeldung gesperrt ist.
- Jede Karte nennt jetzt, bis wann die Bestätigung höchstens gilt bzw. seit wann sie abgelaufen ist (Konzept: Prüfzeit, Ablaufzeit, Quelle).
- Der Druck „Statusblatt“ war drei Seiten lang, ohne Rand und mit dem Sprunglink auf jeder Seite. Jetzt eine Seite A4 quer mit Druckzeit, Quelle und dem Hinweis, dass nach Ablauf „Status unbekannt“ gilt.
- Organisationsübersicht zeigt das Alter offener Aufträge; Verlaufseinträge haben je Ereignisart ein eigenes Symbol; die Kennzahl „Blockiert“ nennt Teile, Geld oder Personal.
- Die Seitenleiste scrollt bei niedrigen Fensterhöhen.

**Zusammengeführt:** Codex hatte nach seinem letzten Push lokal weitergearbeitet, ohne zu committen (`.gitignore` mit `.sites-publish/`, eigenes Favicon, Sprung an den Seitenanfang beim Ansichtswechsel, Text „X von 3 mit aktueller Betriebsbestätigung“, „Erneut prüfen bis …“ auf der Karte, Druckhinweis mit Tafel). Diese Änderungen sind in `claude/waterlink-mvp` übernommen. Wo beide dasselbe gebaut hatten, gilt eine Fassung: Codex' Wortlaut für Karte und Druckhinweis, dazu der Hinweis „Gültigkeit abgelaufen“ für veraltete Bestätigungen; der Druckhinweis steht im Kopf des Statusblatts.

## Als Nächstes

1. Lokal mit installierten Abhängigkeiten `npm run typecheck`, `npm run build` und `npm run test:integration` gegen den echten Worker ausführen. Die Änderungen dieses Nachtrags wurden nicht mit `tsc` geprüft.
2. Private Sites-Bereitstellung durchführen und dort Anmeldung, Datenbank und Ablauf prüfen. Das Sites-Projekt ist bereits registriert; es gibt noch keine bestätigte Live-Bereitstellung. Kein zweites Projekt anlegen.
3. Finale Screenshots aus dem echten Build, Demo-Link und getesteten Stand dokumentieren.
4. Vor der Demo: Bestätigungen und Zugangsangaben im Beispieldatensatz altern nach 12 Stunden. Kurz vor dem Pitch die Demo zurücksetzen.

## Bewusste Grenzen

Die zwölf Stunden Gültigkeit sind ein Demo-Parameter. Rollenwechsel ist eine Demo-Funktion, keine fertige lokale Benutzerverwaltung. Keine SMS, Hardware, Sprach-KI oder reale Pilotdaten. Keine Aussagen über eingesparte Wege oder Reparaturzeiten ohne Feldprüfung. Das ursprüngliche Konzept ist archiviert; einige vorgeschlagene Details gehen über diesen Zwischenstand hinaus.

## Ablage

GitHub: `OsmanTuerkmen/WaterLink`, Branch `codex/waterlink-mvp`. Lokale Zugangstoken, Datenbankdateien, Sitzungen, Abhängigkeiten und erzeugte Build-Dateien werden nicht versioniert. Die Sites-Projektkennung in `web/.openai/hosting.json` ist eine nicht geheime Projektzuordnung.
