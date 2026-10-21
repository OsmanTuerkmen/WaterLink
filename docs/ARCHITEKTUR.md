# Technische Entscheidungen

## Gemeinsamer Datenstand

Die Anwendung verwendet React und TypeScript mit dem Vinext/Sites-Starter. Ein Cloudflare Worker stellt Oberfläche und API bereit. Cloudflare D1 speichert die Demonstrationsdaten serverseitig; lokal verwendet der Starter eine persistente D1-Emulation. Browserfenster lesen dieselbe API alle drei Sekunden.

Dies ersetzt den ursprünglich vorgeschlagenen Supabase-Dienst. Die ursprüngliche Sites-Demonstration benötigt dadurch keinen separaten Backend-Anbieter; die zusätzliche Cloudflare-Bereitstellung braucht einen eigenen Cloudflare-Kontozugang. Die Datenbankregeln liegen vollständig im Repository.

## Ein konsistenter Vorgang

Der kleine Demo-Datensatz besteht aus Wasserstellen, Aufträgen, Ereignissen und einer Revision. Er wird als ein zusammenhängender Datensatz gespeichert. Ein Update gelingt nur, wenn die gelesene Revision noch aktuell ist. Gleichzeitig eintreffende Änderungen können sich dadurch nicht unbemerkt überschreiben; die unterlegene Anfrage erhält HTTP 409 und muss den aktuellen Stand laden.

Die Geschäftsregeln in `web/lib/domain.ts` sind unabhängig vom Webframework testbar. Ein Reparaturbericht verändert den Betriebszustand nicht. Ein ausdrücklicher Funktionstest ist ein eigener Vorgang. Die Ereignisse werden mit der Zustandsänderung atomar gespeichert. Wiederholte Ausfallmeldungen desselben laufenden Vorfalls erzeugen keine weiteren offenen Aufträge.

Für die kleine Demo ist dieser Aufbau absichtlich einfach. Vor größerem Betrieb sind normalisierte Tabellen, Archivierung, eine vollständige Zuständigkeitsverwaltung und ein abgestimmtes Betriebskonzept nötig.

## Anmeldung: Sites oder Zugangscode

`web/lib/access.ts` entscheidet, wer Daten ändern darf. Ohne weitere Einstellung gilt die Anmeldung der Sites-Plattform über deren vertrauenswürdige Header. Mit `WATERLINK_AUTH=code` (die Cloudflare-Bereitstellung, siehe [Bereitstellung](BEREITSTELLUNG.md)) werden diese Header ignoriert, weil sie außerhalb von Sites jeder Besucher setzen könnte. Dann gilt nur ein HttpOnly-Cookie (`SameSite=Strict`, `Secure`), das `POST /api/access` gegen den geheimen `DEMO_ACCESS_CODE` ausgibt. Das Cookie hat die Form `v2.<Ablaufzeit>.<HMAC>`: Der Ablaufzeitpunkt (30 Tage) ist mit dem Code signiert und wird bei jeder Anfrage auf dem Server geprüft. Verlängerte, veränderte oder ältere Cookies werden abgewiesen; ein neuer Code macht alle bisherigen Cookies ungültig. Die Regeln liegen ohne Plattformabhängigkeit in `web/lib/access-token.ts`.

**Begrenzung der Anmeldeversuche** (`web/lib/access-limit.ts`): Jeder Versuch wird in D1 atomar gezählt, *bevor* der Code geprüft wird, damit parallele Anfragen die Grenze nicht umgehen. Grenzen: 10 Versuche pro Client in 15 Minuten (Schlüssel: gekürzter SHA-256 der von Cloudflare gesetzten IP, keine Klartext-IP) und 100 Versuche insgesamt pro Stunde. Darüber antwortet der Server mit 429 und `Retry-After`, auch für den richtigen Code. Ein richtiger Code setzt nur den eigenen Zähler zurück. Bestehende gültige Cookies funktionieren während einer Sperre weiter; die globale Grenze kann neue Anmeldungen aber bis zu einer Stunde blockieren, wenn jemand massenhaft rät (bewusster Kompromiss für eine Demo). Die Tabelle `access_attempts` wird bei Bedarf mit `CREATE TABLE IF NOT EXISTS` angelegt und braucht keine Migration; alte Einträge werden beim nächsten Versuch gelöscht. `GET /api/access` meldet den Modus; die Oberfläche zeigt entsprechend den Plattform-Link oder ein Codefeld. Lesen (`GET /api/waterlink`) braucht in beiden Fällen keine Anmeldung.

## Rollen und Demo-Zugang

Die Cloudflare-Demo ist öffentlich lesbar; Änderungen verlangen den Demo-Code. Die optionale Sites-Bereitstellung wäre privat mit Plattformanmeldung. Eine angemeldete Person darf für die Demo zwischen drei fiktiven Rollen wechseln. Der Server stellt dafür kurzlebige, zufällige Sitzungstoken aus und speichert nur deren Hash. Bei jeder Änderung werden Plattformidentität, Sitzung, Rolle, Übergang und gegebenenfalls Auftragszuordnung geprüft. Ein frei mitgeschicktes Rollenfeld reicht nicht.

Das beweist technische Trennung der Aktionen, aber keine echten lokalen Berechtigungen. Der Rollenwechsel ist eine gekennzeichnete Demonstrationsfunktion und darf nicht unverändert als öffentliche Pilotanwendung betrieben werden.

## Oberfläche (Redesign, Weiterarbeit auf `codex/waterlink-review`)

Die Oberfläche ist auf Englisch und in fünf Ansichten getrennt, alle in `web/components/waterlink/`:

| Ansicht | Adresse | Für wen |
|---|---|---|
| Status | `/#status` | Haushalte: Statuszeilen, Alternative, Karte, weitere erfasste Stellen |
| Öffentliche Tafel | `/?view=display` | Laden oder Treffpunkt, aus einigen Metern lesbar |
| Field app | `/#field/operator`, `/#field/technician` | Betreiberin und Techniker am Handy: ein Schritt pro Bildschirm |
| SMS | `/#sms` | Tastenhandy ohne Internet: simulierte SMS für Haushalte und Betreiberin |
| Coordination | `/#coordination/overview`, `/history`, `/demo` | Karte aller Stellen, offene Aufträge mit Hindernissen, Verlauf, Demo-Werkzeuge |
| Pitch-Bühne | `/?view=stage` | Beide Handys und die Tafel auf einem Bildschirm |

`store.tsx` hält den gemeinsamen Datenstand (Abfrage alle drei Sekunden, solange der Tab sichtbar ist; Lesekopie im Browser) und für jede Demo-Rolle eine eigene Sitzung. Eine Rolle bekommt ihre Sitzung beim ersten Handeln; so kann die Bühne Betreiberin, Techniker und Koordination gleichzeitig zeigen. Schreibvorgänge laufen nacheinander und tragen weiter die erwartete Revision und eine Anfragekennung.

Abfrage und Startdaten: `GET /api/waterlink?since=<Revision>` antwortet mit `{ unchanged: true, … }` (rund 400 Byte), wenn der Bildschirm die aktuelle Revision schon hat; sonst kommt der ganze Zustand (rund 47 KB). Wurde der Demo-Zustand vier Stunden lang nicht angefasst (kein Ereignis), setzt `lib/store.ts` ihn beim nächsten Lesen mit frischen simulierten Bestätigungen neu an (Revision + 1, ein Hinweis im Verlauf). Ohne das stünde die Live-Seite nach 12 Stunden Stillstand auf „Confirmation expired“. Der Zustand liegt weiter als eine Zeile in D1; Schreibzugriffe prüfen die erwartete Revision (siehe `tests/store.test.ts`).

Gestaltung: Kanister-Gelb als Rahmen, Deckel-Blau für Aktionen, vier Statusfarben, immer zusammen mit Wort und Symbol. Das Statuszeichen ist ein Kanister, dessen Wasserstand genau den Rest der 12-Stunden-Gültigkeit zeigt. Schriften: Archivo und Atkinson Hyperlegible Next, lokal eingebunden über Fontsource (OFL). Gestaltungsregeln stehen in `DESIGN.md`, Produktgrundlagen in `PRODUCT.md`.

Die SMS-Simulation steckt in `web/lib/sms.ts` (reine Funktionen, getestet in `tests/sms.test.ts`): `STATUS`, ein Buchstabe oder `HELP` liefern eine Antwort aus dem zuletzt geladenen Stand, möglichst in einer SMS (160 Zeichen). `DOWN A …`, `OK A …` und `FAIL A …` werden für die registrierte Betreiberin in die normalen Befehle übersetzt und laufen über denselben Server mit denselben Regeln; ein „OK“ vor der Reparaturmeldung wird abgelehnt. Swahili-Stichwörter `HALI` und `MSAADA` werden verstanden. Es ist kein SMS-Anbieter angeschlossen; nichts verlässt die Seite außer den Befehlen der Betreiberin an den eigenen Server.

Die öffentliche Tafel hält den Bildschirm wach (Screen Wake Lock, wo der Browser es kann) und hat einen Vollbild-Knopf. Ohne Verbindung zeigt sie alle Stellen als „Unclear“ mit einem roten Hinweis und lässt die einzelnen Alternativen weg. Die Pitch-Bühne zeigt ab 1700 px Breite Tafel und SMS-Handy nebeneinander, darunter per Umschalter.

Die Karte (`map.tsx`) wird als SVG aus den WPdx-Koordinaten und Straßen aus OpenStreetMap gezeichnet, ohne Kartenkacheln und ohne Netzzugriff. `web/scripts/import-osm.mjs` lädt Straßen, Bäche und benannte Orte im Umkreis der Region über die Overpass-API und schreibt `web/data/osm-area.json` (ODbL, Namensnennung „© OpenStreetMap contributors“). Liegen zwei Stellen am selben Punkt (A und C in Busia), werden die Marker mit einer Hinweislinie auseinandergezogen. Gerade Linien sind keine Wege.

## Aktualität und Alternativen

Bestätigungszeit, Synchronisationszeit und Auftragsfortschritt sind getrennt. Die Oberfläche berücksichtigt die Serverzeit, zeigt Unsicherheit bei fehlender Verbindung und lässt die gespeicherte Bestätigung weiter altern. Der letzte geladene Datensatz ist nur eine lokale Lesekopie; fehlgeschlagene Schreibvorgänge werden nicht als erfolgreich dargestellt.

Die vorläufige Gültigkeit von Status- und Zugangsbestätigungen beträgt zwölf Stunden. Alternatives Wasserholen setzt eine frische, konfliktfreie Betriebsbestätigung, geprüfte Wege-/Zugangsangaben sowie passende Öffnungszeiten einschließlich Gehzeit voraus. Die Demo verwendet für die Öffnungszeiten `Africa/Nairobi`.

## Echte Wasserstellen aus Kenia (WPdx)

Die Orte können aus der Water Point Data Exchange (WPdx) kommen, einer offenen Sammlung von Erhebungen zu Wasserstellen (Lizenz CC BY 4.0). `web/scripts/import-wpdx.mjs` lädt die Einträge eines Countys, wählt eine kompakte Nachbarschaft um eine zuletzt als funktionierend erhobene Stelle und schreibt `web/data/region.json`. Die Datei wird versioniert, damit Build und Bereitstellung keinen Netzzugriff brauchen. Enthält sie `null`, verwendet die App weiter die drei fiktiven Wasserstellen.

Erhebungsdaten sind historisch. Sie werden als „Erhebung MM.JJJJ: funktionierte damals“ angezeigt und erzeugen nie einen aktuellen Betriebszustand; jede erfasste Stelle startet als „unbestätigt“. Für den Demo-Ablauf erhalten die drei Stellen A, B und C eine ausdrücklich als simuliert gekennzeichnete Bestätigung beziehungsweise Weg-/Zugangsangabe. Gehzeiten sind aus der Luftlinie geschätzt (Faktor 1,3, 4,5 km/h) und so beschriftet. Für andere Stellen zeigt die Karte höchstens die nächsten erfassten Stellen nach Luftlinie, ausdrücklich ohne Empfehlung. Eine Meldung oder Bestätigung zu einer erfassten Stelle nimmt sie in die Betreuung auf.

Die Regionsdaten werden beim Laden erneut geprüft; fehlerhafte Einträge werden verworfen. Die importierte Nachbarschaft ist auf höchstens 400 Stellen begrenzt (Standard 60), weil der Demo-Datensatz weiterhin als ein zusammenhängender Datensatz gespeichert und alle drei Sekunden abgefragt wird. Eine landesweite Darstellung bräuchte normalisierte Tabellen, serverseitige Filter und eine Karte.

## Sensordaten als Wiedergabe (Kwale)

`web/scripts/import-kwale.mjs` lädt echte wöchentliche Fördermengen von Smart Handpumps in Kwale (openwashdata/waterpumpkwale, CC BY 4.0, auf einen Commit festgelegt) und schreibt `web/data/kwale-sensors.json`: standardmäßig die Pumpe „Tiwi – Mshikeni“ mit drei Nachbarpumpen für 2014. Die Demo-Werkzeuge spielen den Verlauf ab. `web/lib/sensor.ts` erkennt einen Hinweis erst nach zwei Wochen in Folge unter 10 % des üblichen Werts; fehlende Werte mit unbekannter Ursache gelten nie als Ausfall.

Ein Sensorhinweis ist nie ein Betriebszustand. Das Demo-Szenario „sensor“ setzt bei Wasserstelle A nur `sensorAlert`; die Anzeige zeigt „Unklar – Sensorhinweis“, es entsteht kein Auftrag. Erst eine Meldung oder Prüfung vor Ort löst den Hinweis auf. Die Daten sind historisch und werden nie als Live-Zustand dargestellt.

## Bewusst nicht angeschlossen

Keine SMS, Live-Sensorik, KI-Sprachverarbeitung, Bezahlung oder Live-Kartendienst. Die Störungsbeschreibung kann optional über die Spracherkennung des Browsers diktiert werden; der Status wird dabei nie automatisch gesetzt. Diese Integrationen werden auch nicht als funktionierend dargestellt. Der manuelle Kernablauf ist unabhängig davon vollständig nutzbar.

## SMS-Verlässlichkeit (Codex-Review)

SMS bleibt eine Browser-Simulation. Abfragen ohne Live-Verbindung liefern UNCLEAR und keine bestätigte Alternative. Meldungen benötigen eine Beschreibung; OK/FAIL/PARTLY zusätzlich eine ausdrückliche Vor-Ort-Testbestätigung in einer Vorschau. Der Text wird nicht als Testnachweis erfunden. Das Zustandsmodell und die Rollenprüfung auf dem Server bleiben maßgeblich. Die SMS-Ansicht bietet denselben Anmeldeweg wie die Field app.
