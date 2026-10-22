# WaterLink

**Funktioniert unsere Wasserstelle heute?**

> **In short (English):** WaterLink tells households in rural Kenya whether their water point works *today* and where to go instead, and it tracks every outage from the first report to a repair that only counts once an operator has tested it on site. Old "green" statuses expire after 12 hours and turn into "unclear", never into a false promise. It is a hackathon prototype: the places are real survey data, the people, confirmations and routes are simulated and labelled as such. "Working" means water can be drawn, never that it is safe to drink.

**Live-Demo:** https://waterlink-demo.waterlink.workers.dev · Pitch-Bühne: [`/?view=stage`](https://waterlink-demo.waterlink.workers.dev/?view=stage) · Ansehen ist offen, Ändern im gemeinsamen Demo nur mit Demo-Zugangscode ([Bereitstellung](docs/BEREITSTELLUNG.md)).

**▶ Ohne Code und ohne Installation selbst ausprobieren:** [https://waterlink-demo.waterlink.workers.dev/?view=stage&sandbox=1](https://waterlink-demo.waterlink.workers.dev/?view=stage&sandbox=1). Das ist der **Ausprobier-Modus**: Du spielst den ganzen Ablauf (Meldung, Reparatur, Test vor Ort) mit Übungsdaten durch. Alles passiert nur auf deinem Gerät, nichts wird gespeichert, und niemand sonst sieht es. Die Live-Seite wurde am 22. Oktober 2026 mit dem Stand dieses Repositorys bereitgestellt.

## Worum geht es?

In ländlichen Gegenden holen viele Familien ihr Wasser an einer Handpumpe oder einem Brunnen. Ist die Stelle kaputt, merkt man das erst nach dem langen Weg dorthin, und eine Reparaturmeldung verschwindet oft, ohne dass jemand zuständig ist.

WaterLink beantwortet vor dem Aufbruch eine Frage: **„Funktioniert unsere Wasserstelle heute? Und wenn nicht, wo gehe ich stattdessen hin?“**

1. **Haushalte** sehen den Zustand auf einer öffentlichen Tafel (zum Beispiel in einem Laden) oder per SMS: Wort, Symbol und Farbe, dazu die Zeit der letzten Bestätigung und, wenn nötig, eine geprüfte Alternative.
2. **Betreiber:innen** (eine feste Person pro Wasserstelle) melden Ausfälle und bestätigen vor Ort.
3. **Techniker** übernehmen den entstandenen Auftrag, dokumentieren Fortschritt und Hindernisse (Teile, Geld, Personal) und melden die Reparatur.
4. **Eine Reparatur zählt erst, wenn die Betreiberin sie vor Ort getestet und ausdrücklich bestätigt hat.** „Repariert“ allein macht eine Wasserstelle nie grün.
5. **Unsicherheit bleibt sichtbar:** Eine Bestätigung gilt 12 Stunden (Demo-Wert). Danach, bei widersprüchlichen Meldungen oder ohne Verbindung steht dort „unklar“.

Mehr dazu: [Produktgrundlagen](PRODUCT.md) (Englisch), [Demo in drei Minuten](docs/DEMO.md) und [Vom Prototyp zum Produkt](docs/WEG-ZUM-PRODUKT.md).

## Was ist echt, was ist simuliert?

| Teil | Stand |
|---|---|
| Ablauf Meldung → Auftrag → Reparatur → Funktionstest, Rollenprüfung, Verlauf | Umgesetzt und getestet |
| Weg, Zugang und Öffnungszeiten prüfen (erst danach nennt WaterLink eine Wasserstelle als Alternative), Wasserstellen anlegen und entfernen | Umgesetzt und getestet; die Besuche vor Ort sind in der Demo simuliert |
| Orte der Wasserstellen | **Echt:** 60 Einträge aus Erhebungen der Water Point Data Exchange in Busia, Kenia. Der Zustand darin ist historisch und nie ein aktueller Status. |
| Sensordaten | **Echt, aber alt:** wöchentliche Fördermengen einer Handpumpe in Kwale aus dem Jahr 2014, als Wiedergabe. Sie liefern nur einen Hinweis zur Prüfung, nie einen Status. |
| Personen, Bestätigungen, Wege, Öffnungszeiten | **Simuliert** und überall gekennzeichnet |
| SMS, Live-Sensoren, KI-Dienst, Bezahlung, echte Konten | **Nicht angeschlossen** |

Es gibt keinen Pilotpartner und keine Wirkungszahlen. Die ganze Liste der Grenzen steht in der [Roadmap](docs/ROADMAP.md#3-bewusste-grenzen).

## Selbst ausprobieren

**Am schnellsten, ohne Installation:** den [Ausprobier-Modus auf der Live-Seite](https://waterlink-demo.waterlink.workers.dev/?view=stage&sandbox=1) öffnen. Auf jeder Seite der App gibt es außerdem oben den Knopf **Try it yourself**; wer in der Feld-App etwas ändern will und keinen Code hat, bekommt dort ebenfalls den Weg in den Ausprobier-Modus angeboten. Die Übungsdaten liegen nur in diesem Browser-Tab (**Reset practice data** setzt sie zurück, **Leave sandbox** verlässt den Modus). Ein zweiter Tab, etwa die öffentliche Tafel, zeigt weiter das gemeinsame Demo; die ganze Geschichte mit Tafel auf einem Bildschirm zeigt die Pitch-Bühne.

**Auf dem eigenen Rechner**, mit allen Daten lokal:

Voraussetzung: [Node.js](https://nodejs.org) ab Version 22.13 (enthält npm). Die Schritte unten wurden am 22. Oktober 2026 in einem frischen Klon geprüft (Windows, Node 24): Installation, Build, Datenbank, Start, `npm test` (62 von 62) und der API-Test laufen durch.

```sh
git clone https://github.com/OsmanTuerkmen/WaterLink.git
cd WaterLink/web
npm ci
npm run build
```

Die lokale Datenbank einmalig anlegen (sie liegt danach in `web/.wrangler/state` und ist eine Emulation, es wird nichts ins Netz geschickt):

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_salty_kingpin.sql
```

Starten:

```sh
npm run dev
```

Dann im Browser **http://localhost:5173** öffnen (ist der Port belegt, steht der richtige in der Ausgabe; mit `npm run dev -- --port 5174` wählst du einen). Lesen geht sofort. Zum **Ändern** (melden, reparieren, bestätigen) musst du lokal angemeldet sein: Öffne einmal [http://localhost:5173/signin-with-chatgpt?return_to=/](http://localhost:5173/signin-with-chatgpt?return_to=/). Das ist eine simulierte Anmeldung, die nur lokal funktioniert.

Wenn etwas nicht klappt:

- **Fehler `SQLITE_CANTOPEN` beim Anlegen der Datenbank (Windows):** Der Ordner liegt in einem zu langen Pfad. Das Repository in einen kurzen Pfad klonen, zum Beispiel `C:\dev\WaterLink`.
- **Warnungen `npm warn install-scripts` bei `npm ci`:** harmlos, Build und Start laufen trotzdem.
- **`npm` wird in PowerShell nicht gefunden oder blockiert:** `npm.cmd` verwenden.
- **Beim ersten Aufruf einer Ansicht bleibt die Seite kurz leer:** Der Entwicklungsserver übersetzt beim ersten Mal; nach einigen Sekunden erscheint sie.

### Die Ansichten

| Adresse | Ansicht |
|---|---|
| `/#status` | Status für Haushalte mit Karte |
| `/?view=display` | Öffentliche Tafel, aus einigen Metern lesbar (Vollbild-Knopf unten rechts), mit Sprachumschalter und QR-Code zur SMS-Ansicht. Auf Kiswahili: `/?view=display&lang=sw` |
| `/#field/operator`, `/#field/technician` | Handy-App für Betreiberin und Techniker, ein Schritt pro Bildschirm |
| `/#sms` | Simulierte SMS für Tastenhandys (`STATUS`, `A`, `DOWN A …`, `OK A …`) |
| `/#coordination/overview` | Koordination: Karte, offene Aufträge, Verlauf, Demo-Werkzeuge |
| `/?view=stage` | Pitch-Bühne: beide Handys, Tafel und SMS-Handy live nebeneinander |

### Der kürzeste Rundgang (zwei Minuten)

1. Öffne `/?view=stage` (und melde dich wie oben beschrieben an).
2. Folge den Schritten oben auf der Bühne: Amina meldet, dass Wasserstelle A kein Wasser hat → die Tafel zeigt den Ausfall und Alternative B → Daniel übernimmt und meldet die Reparatur → die Tafel bleibt auf „Not working“ → erst Aminas Funktionstest macht sie wieder grün.
3. Unter **Coordination → Overview** kannst du eine **eigene Wasserstelle anlegen** und ihren **Weg prüfen**: Erst danach nennt WaterLink sie als Alternative, wenn eine andere ausfällt.
4. **Reset demo** setzt alles zurück. Unter `/#coordination/demo` gibt es Sonderfälle: abgelaufene Bestätigung, widersprüchliche Meldungen, keine Alternative, Sensorhinweis.

Mit „Cut the connection in this window“ in den Demo-Werkzeugen siehst du, wie ein Fenster bei fehlender Verbindung alles auf „Unclear“ setzt und keine Alternative mehr nennt.

## Befehle

Alle im Ordner `web/`:

| Befehl | Was er tut |
|---|---|
| `npm run dev` | Entwicklungsserver mit Neuladen (Port 5173) |
| `npm run build` | Produktions-Build |
| `npm start` | Gebauten Stand lokal über Wrangler starten (ohne simulierte Anmeldung) |
| `npm test` | 81 Unit-Tests (Fachregeln, Speicher, Sitzungen, Zugang, SMS, Sensor, Region, Sprachtexte, QR-Code, Ausprobier-Modus) |
| `npm run typecheck` | TypeScript-Prüfung |
| `npm run lint` | Code-Stil und Fehlerprüfung |
| `npm run test:e2e` | 33 Browser-Tests mit dem installierten Chrome (startet selbst einen lokalen Server auf Port 5199): der ganze Ablauf Meldung → Reparatur → Test auf zwei Fenstern, Offline-Verhalten, Seite ohne JavaScript, Sprachumschalter, Ausprobier-Modus, Barrierefreiheit (axe) auf allen Ansichten, Handybreite und Druckblatt |
| `npm run test:integration` | API-Ablauf gegen einen **lokalen** `npm run dev`-Server (`WATERLINK_BASE_URL=http://127.0.0.1:5173`); setzt nur die Demo-Daten zurück |
| `npm run test:access` | Zugangscode-Modus gegen einen lokalen Server, siehe Kopf von `scripts/check-access.mjs`. Nie gegen die Live-Seite. |
| `npm run data:wpdx -- --list` | Counties aus der Water Point Data Exchange auflisten; `-- --county Busia` lädt eine Nachbarschaft nach `data/region.json` |
| `npm run export:sw` | Prüfbogen für die Kiswahili-Übersetzung neu erzeugen (`docs/KISWAHILI-PRUEFBOGEN.md`) |
| `npm run data:osm` | Straßen und Orte für die Karte aus OpenStreetMap laden (`data/osm-area.json`) |
| `npm run deploy:cloudflare` | Kostenlos auf Cloudflare bereitstellen, siehe [Bereitstellung](docs/BEREITSTELLUNG.md) |

Die Prüfungen (einschließlich der Browser-Tests) laufen auch automatisch auf GitHub (`.github/workflows/ci.yml`). Für `npm run test:e2e` muss einmal die lokale Datenbank angelegt sein (siehe oben) und Chrome installiert sein.

## Aufbau des Repositorys

```
WaterLink/
├── README.md, PRODUCT.md, DESIGN.md    Einstieg, Produktgrundlagen, Gestaltungsregeln
├── CLAUDE.md                           Arbeitsregeln für KI-Assistenz in diesem Repo
├── docs/                               Dokumentation, Einstieg: docs/README.md
│   ├── ROADMAP.md                      Offene Aufgaben und mögliche Erweiterungen
│   └── archiv/                         Berichte früherer Arbeitsschritte
├── .github/workflows/ci.yml            Tests, Typprüfung, Lint, Build bei jedem Push
└── web/                                Die Anwendung
    ├── app/                            Seite und API (api/waterlink, api/session, api/access)
    ├── components/waterlink/           Ansichten: Status, Tafel, Feld-App, Koordination, SMS, Bühne, Karte
    ├── lib/                            Fachregeln (domain.ts), Speicher (store.ts), Zugang (access*.ts),
    │                                   Sitzungen (session.ts), SMS (sms.ts), Sensorhinweise (sensor.ts)
    ├── data/                           region.json (60 Wasserstellen), kwale-sensors.json, osm-area.json
    ├── db/, drizzle/                   Datenbankschema und SQL
    ├── scripts/                        Datenimport, Integrations- und Zugangstests, Bereitstellung
    ├── tests/                          Unit-Tests (Node)
    ├── e2e/                            Browser-Tests (Playwright)
    └── build/                          Bausteine der Hosting-Plattform; normalerweise nicht anfassen
```

Die Fachregeln in `web/lib/domain.ts` hängen nicht vom Webframework ab und sind einzeln testbar. Wie alles zusammenspielt, steht in der [Architektur](docs/ARCHITEKTUR.md).

## Daten und Quellen

| Quelle | Verwendung | Lizenz |
|---|---|---|
| [Water Point Data Exchange](https://www.waterpointdata.org/) (WPdx) | Orte der Wasserstellen in `web/data/region.json` | CC BY 4.0 |
| [openwashdata/waterpumpkwale](https://github.com/openwashdata/waterpumpkwale) | Wiedergabe der Pumpendaten in `web/data/kwale-sensors.json` | CC BY 4.0 |
| © OpenStreetMap contributors | Straßen auf der Karte in `web/data/osm-area.json` | ODbL |
| Archivo und Atkinson Hyperlegible Next (über Fontsource) | Schriften, lokal eingebunden | OFL |

Der Code steht unter der [MIT-Lizenz](LICENSE). Die Daten behalten ihre eigenen Lizenzen aus der Tabelle; Dateien in `web/build/` tragen ihre eigene Lizenz (`sites-vite-plugin.LICENSE`).

## Bereitstellen

Kostenlos auf Cloudflare Workers mit D1: im Ordner `web/` einmal `npx wrangler login`, dann `npm run deploy:cloudflare`. Das Skript legt Datenbank und Zugangscode an. Einzelheiten, Grenzen des kostenlosen Tarifs und die Checkliste vor einem Pitch stehen in der [Bereitstellung](docs/BEREITSTELLUNG.md). Den Zugangscode (`web/.env.demo-access`) nie ins Repository, in Folien oder in Chats kopieren.

## Weiterarbeiten

- **Was ist offen, was wäre möglich?** → [Roadmap](docs/ROADMAP.md)
- **Was können nur Menschen tun (Einreichung, Tests mit Menschen, Übersetzung, Partner)?** → [Menschen](docs/MENSCHEN.md)
- **Wo steht was?** → [Dokumentation](docs/README.md)
- **Letzter Stand der Prüfungen** → [Arbeitsstand](docs/ZWISCHENSTAND.md)
- **Mit KI-Assistenz weiterarbeiten** → [CLAUDE.md](CLAUDE.md) und [Nächster Prompt](docs/NAECHSTER_PROMPT.md)
- Oberflächentexte sind Englisch, Dokumente Deutsch. Simulierte und historische Daten werden immer als solche gekennzeichnet, und „funktioniert“ ist nie eine Aussage zur Trinkwasserqualität.
