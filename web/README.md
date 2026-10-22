# WaterLink: die Anwendung (`web/`)

Das ist der Ordner mit dem ganzen Code. Worum es bei WaterLink geht und wie man es startet, steht im [README des Hauptordners](../README.md). Diese Datei erklärt, was in `web/` liegt und was man über die Plattform wissen muss.

**Technik:** React 19 und TypeScript auf [Vinext](https://github.com/cloudflare/vinext) (Next.js-kompatibel, läuft als Cloudflare Worker), Daten in Cloudflare D1 (lokal eine Emulation), Tailwind 4. Node.js ab 22.13.

## Was liegt wo?

| Ordner | Inhalt |
|---|---|
| `app/` | Startseite (`page.tsx` liest auf dem Server den Zustand, `home.tsx` ist der Teil im Browser; alle Ansichten hängen an einem Hash oder `?view=`), Stile (`globals.css`), API-Routen `api/waterlink` (Zustand lesen und ändern), `api/session` (Demo-Rolle), `api/access` (Zugangscode) |
| `components/waterlink/` | Die Ansichten: `status-view`, `board` (Tafel), `field` (Feld-App), `coordination`, `sms`, `stage` (Bühne), `map`; dazu `store.tsx` (gemeinsamer Datenstand im Browser) und kleine Bausteine (`marks`, `format`, `signin`) |
| `lib/` | `domain.ts` (alle Fachregeln, ohne Framework), `store.ts` (Speichern mit Revisionsprüfung, frische Demo nach 4 Stunden), `session.ts`, `access.ts`, `access-token.ts`, `access-limit.ts` (Zugang), `http.ts` (Anfragen prüfen, Fehlerantworten), `sms.ts`, `sensor.ts`, `region.ts`, `i18n.ts` (Tafeltexte Englisch/Kiswahili), `qr.ts` |
| `data/` | `region.json` (60 Wasserstellen aus Busia), `kwale-sensors.json`, `osm-area.json` |
| `db/`, `drizzle/` | Datenbankschema und die SQL-Datei, die die Tabellen anlegt |
| `scripts/` | Datenimport (`import-wpdx`, `import-osm`, `import-kwale`), Tests gegen einen laufenden Server (`check-flow`, `check-access`), Bereitstellung (`deploy-cloudflare`), Starthelfer der Plattform |
| `tests/` | Unit-Tests (`node --test`, ohne weitere Bibliothek, mit echtem SQLite für Speicher und Zugang) |
| `e2e/`, `playwright.config.ts` | Browser-Tests mit Playwright und dem installierten Chrome (`npm run test:e2e`) |
| `build/`, `lib/connector-*`, `scripts/connector-preview/` | Bausteine der Hosting-Plattform (Vite-Plugin, Worker-Einstieg, Vorschau). Normalerweise nicht anfassen. |
| `.openai/hosting.json` | Kennung des Sites-Projekts. **Nicht ändern und nicht neu registrieren.** |

Befehle (`npm run dev`, `npm test` und so weiter) stehen mit Erklärung im [README des Hauptordners](../README.md#befehle).

## Anmeldung: zwei Arten

`lib/access.ts` entscheidet, wer Daten ändern darf (Lesen ist immer offen):

- **Sites** (Standard): Die Plattform meldet Besucher an und setzt die Header `oai-authenticated-user-id` und `oai-authenticated-user-email`. Lokal simuliert `npm run dev` das: Rufe `/signin-with-chatgpt?return_to=/` auf, dann bist du der Testnutzer `local_seedy`; `/signout-with-chatgpt?return_to=/` meldet ab. Diese Pfade gehören der Plattform, eigene Routen dafür gibt es nicht.
- **Code** (`WATERLINK_AUTH=code`, die Cloudflare-Bereitstellung): Die Header werden ignoriert, weil sie außerhalb von Sites jeder fälschen könnte. Es zählt ein signiertes Cookie, das man mit dem geheimen `DEMO_ACCESS_CODE` bekommt. Lokal ausprobieren: Datei `.dev.vars` mit `WATERLINK_AUTH=code` und einem eigenen Test-Code anlegen (sie ist per `.gitignore` ausgeschlossen), danach `npm run test:access`. Die Datei danach löschen.

Einzelheiten und Begründung: [Architektur](../docs/ARCHITEKTUR.md#anmeldung-sites-oder-zugangscode).

## Lokale Datenbank

Die Datenbank wird mit dem Befehl aus dem [README](../README.md#selbst-ausprobieren) einmal angelegt und liegt in `.wrangler/state` (ignoriert, jederzeit löschbar). Eine bereits angelegte Datenbank nicht noch einmal mit `CREATE TABLE` initialisieren. Wer das Schema ändert, erzeugt mit `npm run db:generate` eine neue SQL-Datei und führt sie mit demselben Befehl aus; Wrangler hängt die Versionsordner selbst an (`--persist-to .wrangler/state`, nicht `.wrangler/state/v3`). Die Cloudflare-Bereitstellung legt die Tabellen beim Deployen an, die Tabelle `access_attempts` entsteht bei Bedarf von selbst.

## Gut zu wissen

- `npm run dev` startet auf Port 5173 mit Neuladen. `npm start` startet den gebauten Stand über Wrangler und simuliert **keine** Anmeldung; für `test:integration` deshalb `npm run dev` verwenden.
- `.wrangler/`, `.vinext/`, `.sites-runtime/`, `dist/` und `.env*` sind lokale Laufzeitdateien und nicht im Repository.
- `scripts/sites-env.mjs` hält Wrangler- und Miniflare-Zustand im Projektordner und schaltet deren Telemetrie ab (`WRANGLER_SEND_METRICS=true` schaltet sie ein).
- Ist der npm-Cache nicht beschreibbar, hilft `npm_config_cache=<Pfad>` für die Installation.
- Unter Windows PowerShell `npm.cmd` statt `npm`, falls die Skriptausführung blockiert ist.
