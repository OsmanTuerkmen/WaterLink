# Bereitstellung

**Live-Demo:** https://waterlink-demo.waterlink.workers.dev

| Adresse | Ansicht |
|---|---|
| `/` | Status für Haushalte |
| `/?view=display` | Öffentliche Tafel (Vollbild-Knopf unten rechts) |
| `/?view=stage` | Pitch-Bühne: beide Handys, Tafel und SMS-Handy |
| `/#field/operator`, `/#field/technician` | Handy-App für Betreiberin und Techniker |
| `/#sms` | Simulierte SMS für Tastenhandys |
| `/#coordination/demo` | Demo-Werkzeuge, Zurücksetzen, Sensor-Wiedergabe |

Stand: Branch `claude/waterlink-redesign`, bereitgestellt am 11. Oktober 2026.

## Wer darf was

- **Ansehen** kann jeder mit dem Link, ohne Anmeldung. Gezeigt werden nur Demo-Daten: echte Orte aus WPdx, simulierte Personen und Bestätigungen.
- **Ändern** (melden, reparieren, bestätigen, Szenarien, zurücksetzen) geht erst nach Eingabe des **Demo-Zugangscodes**. Das Feld erscheint, sobald man eine Aktion versucht. Der Code gilt danach 30 Tage im jeweiligen Browser (signiertes Cookie, Ablauf wird auf dem Server geprüft). Nach der ersten Bereitstellung dieses Stands sind ältere Cookies ungültig: Einmal neu freischalten.
- Der Code liegt **nur lokal** in `web/.env.demo-access` auf dem Rechner, auf dem bereitgestellt wurde (Reczec). Die Datei ist per `.gitignore` vom Repo ausgeschlossen. Den Code im Team nur privat weitergeben, nie ins Repo, in Folien oder in öffentliche Chats.
- Neuer Code: Zeile in `web/.env.demo-access` ändern (mindestens 8 Zeichen) und neu bereitstellen. Alte Cookies werden damit ungültig.

## Technik

- **Cloudflare Workers + D1**, kostenloser Tarif (Free Plan), keine Kreditkarte. Für eine Demo reichen die Freikontingente deutlich (Workers: 100.000 Anfragen pro Tag; D1: 5 Mio. gelesene Zeilen pro Tag). Jedes geöffnete, sichtbare Fenster fragt alle 3 Sekunden ab, das sind rund 29.000 Anfragen pro Fenster und Tag (versteckte Tabs fragen nicht; ohne Änderung ist die Antwort nur rund 400 Byte groß, die Anfragen zählen aber weiter). Für eine mehrstündige Demo mit wenigen Geräten unkritisch, aber eine Tafel nicht tagelang dauerhaft laufen lassen.
- Cloudflare-Konto: das von Reczec. Worker `waterlink-demo`, Datenbank `waterlink-demo`, Subdomain `waterlink.workers.dev`.
- **Zwei Anmeldearten im selben Code** (`web/lib/access.ts`):
  - *Sites* (Standard, Osmans OpenAI-Sites-Projekt): Die Plattform meldet an und setzt vertrauenswürdige Header.
  - *Code* (`WATERLINK_AUTH=code`, diese Cloudflare-Bereitstellung): Die Plattform-Header werden **ignoriert**, weil sie außerhalb von Sites jeder fälschen könnte. Es zählt nur ein signiertes HttpOnly-Cookie, das man mit dem Code bekommt. Anmeldeversuche sind begrenzt (10 pro Client in 15 Minuten, 100 insgesamt pro Stunde, Antwort 429); bestehende Cookies bleiben davon unberührt. Prüfung lokal mit `npm run test:access` (Anleitung im Skript), nie gegen die Live-Seite.
- Geprüft auf der Live-Seite: Seiten laden (200), Datenstand mit 60 Wasserstellen, Code-Modus aktiv, gefälschte Anmelde-Header werden abgewiesen (401). Lokal auf dem Produktions-Build zusätzlich: falscher Code 401, richtiger Code 201, Freischalten im Browser.

## Neu bereitstellen

Im Ordner `web/`:

```sh
npx wrangler login              # einmalig, im Browser bestätigen
npm run deploy:cloudflare
```

Das Skript (`web/scripts/deploy-cloudflare.mjs`) baut die App, sucht oder erstellt die D1-Datenbank, legt fehlende Tabellen an (bestehende Daten bleiben), lädt den Worker hoch und setzt den Zugangscode. Beim ersten Mal erzeugt es den Code und schreibt ihn nach `web/.env.demo-access`.

Wer von einem **anderen Konto** aus bereitstellen will (z. B. Osman): `npx wrangler login` mit dem eigenen Konto, beim ersten Mal unter https://dash.cloudflare.com → Workers & Pages eine workers.dev-Subdomain anlegen, dann `npm run deploy:cloudflare`. Das ergibt eine eigene Adresse und einen eigenen Code.

## Vor dem Pitch (22. Oktober)

1. Live-Seite auf dem Präsentationsrechner öffnen und einmal mit dem Code freischalten.
2. Auf der Bühne **Reset demo**. Die simulierten Bestätigungen gelten 12 Stunden; nach dem Zurücksetzen ist A und B wieder frisch bestätigt. (Nach vier Stunden ohne jede Aktion setzt sich die Demo ab dieser Version selbst neu an; für den Pitch trotzdem zurücksetzen, damit der Verlauf leer ist.)
3. Ablauf nach [Demo-Skript](DEMO.md). Bei Netzproblemen: Folie „Live demo“ mit Screenshot.

## Und Sites?

Die ursprünglich geplante private Sites-Bereitstellung (`web/.openai/hosting.json`) ist weiterhin möglich und braucht Osmans Zugang über Codex. Der Code unterstützt beide Wege; ohne `WATERLINK_AUTH=code` gilt automatisch die Sites-Anmeldung.
