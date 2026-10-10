# Technische Entscheidungen

## Gemeinsamer Datenstand

Die Anwendung verwendet React und TypeScript mit dem Vinext/Sites-Starter. Ein Cloudflare Worker stellt Oberfläche und API bereit. Cloudflare D1 speichert die Demonstrationsdaten serverseitig; lokal verwendet der Starter eine persistente D1-Emulation. Browserfenster lesen dieselbe API alle drei Sekunden.

Dies ersetzt den ursprünglich vorgeschlagenen Supabase-Dienst. Für die private Demonstration sind damit keine zusätzlichen Zugangsdaten zu einem externen Backend nötig. Die Datenbankregeln liegen vollständig im Repository.

## Ein konsistenter Vorgang

Der kleine Demo-Datensatz besteht aus Wasserstellen, Aufträgen, Ereignissen und einer Revision. Er wird als ein zusammenhängender Datensatz gespeichert. Ein Update gelingt nur, wenn die gelesene Revision noch aktuell ist. Gleichzeitig eintreffende Änderungen können sich dadurch nicht unbemerkt überschreiben; die unterlegene Anfrage erhält HTTP 409 und muss den aktuellen Stand laden.

Die Geschäftsregeln in `web/lib/domain.ts` sind unabhängig vom Webframework testbar. Ein Reparaturbericht verändert den Betriebszustand nicht. Ein ausdrücklicher Funktionstest ist ein eigener Vorgang. Die Ereignisse werden mit der Zustandsänderung atomar gespeichert. Wiederholte Ausfallmeldungen desselben laufenden Vorfalls erzeugen keine weiteren offenen Aufträge.

Für die kleine Demo ist dieser Aufbau absichtlich einfach. Vor größerem Betrieb sind normalisierte Tabellen, Archivierung, eine vollständige Zuständigkeitsverwaltung und ein abgestimmtes Betriebskonzept nötig.

## Rollen und private Demo

Die geplante Bereitstellung ist privat; die gehostete Demo ist zum gesicherten Zwischenstand noch nicht bereitgestellt. Sites übernimmt die Anmeldung. Eine angemeldete Person darf für die Demo zwischen drei fiktiven Rollen wechseln. Der Server stellt dafür kurzlebige, zufällige Sitzungstoken aus und speichert nur deren Hash. Bei jeder Änderung werden Plattformidentität, Sitzung, Rolle, Übergang und gegebenenfalls Auftragszuordnung geprüft. Ein frei mitgeschicktes Rollenfeld reicht nicht.

Das beweist technische Trennung der Aktionen, aber keine echten lokalen Berechtigungen. Der Rollenwechsel ist eine gekennzeichnete Demonstrationsfunktion und darf nicht unverändert als öffentliche Pilotanwendung betrieben werden.

## Aktualität und Alternativen

Bestätigungszeit, Synchronisationszeit und Auftragsfortschritt sind getrennt. Die Oberfläche berücksichtigt die Serverzeit, zeigt Unsicherheit bei fehlender Verbindung und lässt die gespeicherte Bestätigung weiter altern. Der letzte geladene Datensatz ist nur eine lokale Lesekopie; fehlgeschlagene Schreibvorgänge werden nicht als erfolgreich dargestellt.

Die vorläufige Gültigkeit von Status- und Zugangsbestätigungen beträgt zwölf Stunden. Alternatives Wasserholen setzt eine frische, konfliktfreie Betriebsbestätigung, geprüfte Wege-/Zugangsangaben sowie passende Öffnungszeiten einschließlich Gehzeit voraus. Die Demo verwendet für die Öffnungszeiten `Africa/Nairobi`.

## Bewusst nicht angeschlossen

Keine SMS, Sensorik, automatische Defekterkennung, KI-Sprachverarbeitung, Bezahlung oder Live-Karte. Diese Integrationen werden auch nicht als funktionierend dargestellt. Der manuelle Kernablauf ist unabhängig davon vollständig nutzbar.
