# WaterLink – Funktioniert unsere Wasserstelle heute?

Entscheidungsgrundlage vom **10. Oktober 2026**. Hackathon laut Planung: **22. Oktober 2026, 10–22 Uhr**. Heute entsteht das Konzept; eine Anwendung ist noch nicht implementiert.

**Kennzeichnung:** „Belegt“ bezeichnet Quellenbefunde, „Annahme“ etwas noch Ungeprüftes und „Entscheidung“ einen vorgeschlagenen Produkt- oder Technikansatz. Pilotregion, lokale Zuständigkeiten, Budget und Internet am Demo-Ort sind offen. Es bestehen bislang keine lokalen Kontakte. Codex übernimmt die technische Ausarbeitung und anschließende Umsetzung; der Nutzer muss dafür keine Programmierkenntnisse mitbringen. Laut Nutzer gibt es keine technischen Vorgaben; Teilnahme- und Abgaberegeln sind noch zu prüfen.

## 1. Nutzen und wichtigste Annahmen

**Nutzenversprechen:** WaterLink macht den zuletzt bestätigten Betriebszustand von Wasserstellen vor dem Aufbruch zugänglich und organisiert den Weg von der Ausfallmeldung bis zur bestätigten Wiederherstellung. Das kann vermeidbare Wege reduzieren und Verantwortlichkeiten sichtbar machen. Es garantiert weder aktuelle Informationen für alle Haushalte noch schnellere Reparaturen.

**Drei kritische Annahmen:**

1. **Frühere Information verändert Entscheidungen.** Haushalte erfahren Ausfälle tatsächlich zu spät und können einen Weg verschieben oder eine erreichbare Alternative nutzen. Fehlen Alternativen, bleibt der Nutzen begrenzt.
2. **Ein betreuter Melde- und Reparaturablauf ist möglich.** Betreiber bestätigen Zustände, Techniker übernehmen Aufträge und eine Organisation trägt den Betrieb. Finanzierung, Ersatzteile oder Personal könnten größere Engpässe sein als Koordination. Software ersetzt diese Ressourcen nicht.
3. **Der öffentliche Zugang erreicht Menschen rechtzeitig.** Ein Standort im Wohngebiet wird vor dem Wasserweg passiert, verstanden und zuverlässig betreut. Strom, Verbindung, Sprache, Wartung und tatsächliche Reichweite sind ungeprüft.

**Geschäftshypothese:** Betreiber, Verwaltung oder NGOs könnten zahlen. Nachfrage und Zahlungsbereitschaft sind unbestätigt. Auch die Differenzierung durch den durchgängigen Ablauf aus Meldung, öffentlicher Information, Zuständigkeit und bestätigter Reparatur ist zunächst eine Hypothese; Pumpenmonitoring existiert bereits.

## 2. Kleiner MVP

**Notwendig:**

- Drei eindeutig fiktive Wasserstellen mit Ortsbeschreibung, Öffnungszeiten und Zugangsangaben.
- Öffentliche Browseranzeige und mobile Webansicht derselben Information; Text und Symbole, verständliche Zeitangaben, keine reine Farbcodierung.
- Betreiberformular für Ausfall/eingeschränkten Betrieb; Speichern aktualisiert den Zustand und erzeugt einen Auftrag.
- Techniker übernimmt den Auftrag, dokumentiert Fortschritt und meldet die Reparatur. Ein einfacher Blockierungsgrund macht fehlendes Geld, Ersatzteile oder Personal sichtbar.
- Berechtigte Betreiberperson bestätigt anschließend ausdrücklich einen Funktionstest.
- Zeitgestempelte Ereignisse, Zuständigkeit, veraltete/widersprüchliche Informationen und Verbindungsausfall sichtbar behandeln.
- Zwei Browserfenster oder Geräte mit gemeinsamem gespeichertem Datenstand.

**Optional nach funktionierendem Kern:** Spracheingabe als überprüfbarer KI-Entwurf, Foto, weitere Sprache, klar gekennzeichnete SMS-Simulation. KI darf nichts selbst veröffentlichen oder Reparaturerfolge erfinden. Das Formular funktioniert ohne KI.

**Später:** echte SMS, Feldhardware, Sensoren, native App, Karten/Routing, Ersatzteile/Zahlungen, mehrere Organisationen. Ein großes Organisationsdashboard ist kein MVP-Schwerpunkt.

## 3. Regeln für verlässliche Informationen

**Entscheidung:** Betriebszustand, Informationslage und Auftrag bleiben getrennt.

| Ebene | Werte / Regel |
|---|---|
| Betriebszustand | funktioniert, eingeschränkt, ausgefallen, unbekannt |
| Informationslage | bestätigt um …; veraltet; widersprüchliche Meldungen |
| Verbindung | zuletzt synchronisiert um …; keine aktuelle Verbindung |
| Auftrag | offen → übernommen → in Arbeit → repariert, Bestätigung ausstehend → geschlossen |

Nur der Wasserstelle zugeordnete Betreiber dürfen Zustände bestätigen; gespeichert werden Beobachtungszeit, Eingangszeit und bestätigende Person. Techniker melden eine Reparatur; das schaltet die Wasserstelle nicht auf „funktioniert“. Erst ein dokumentierter Funktionstest durch eine berechtigte Betreiberperson stellt sie wieder auf „funktioniert“ und schließt den Auftrag. Ein fehlgeschlagener Test führt zurück in Bearbeitung. Eine bestätigte Verbesserung auf „eingeschränkt“ lässt den Auftrag offen. Die Rollen sind serverseitig geschützt; öffentliche Ansichten zeigen keine privaten Kontaktdaten.

Für die Demo gilt vorläufig **12 Stunden** als konfigurierbare Gültigkeit einer Bestätigung. Das ist ein Testparameter, keine fachlich belegte Feldregel. Danach lautet die Anzeige beispielsweise: „Aktueller Zustand nicht bestätigt; zuletzt funktionierend am …“. Die alte positive Zusicherung verschwindet. Synchronisation erneuert niemals die Bestätigungszeit.

Widersprüchliche Meldungen erzeugen Klärungsbedarf und eine sichtbare Unsicherheit; „letzter Eintrag gewinnt“ genügt nicht. Eine erneute berechtigte Prüfung löst den Konflikt. Wiederholte Ausfallmeldungen dürfen keinen zweiten offenen Auftrag für denselben Vorfall erzeugen.

**Alternativen:** Im MVP nur frisch als funktionierend bestätigte, konfliktfreie Wasserstellen mit passenden Öffnungszeiten und lokal geprüften Wege- und Zugangsangaben empfehlen. Die Öffnung muss auch zum erwarteten Ankunftszeitpunkt passen, soweit eine belastbare Gehzeit vorliegt. Entfernung allein belegt keine Erreichbarkeit. Ohne verlässliche Angaben: „Keine verlässlich bestätigte Alternative verfügbar.“ Dauerhafter Hinweis: **„Betriebsstatus – keine Aussage zur Trinkwasserqualität.“**

**Ausfall der Anzeige:** Bei fehlender Verbindung erscheint sofort ein Warnhinweis nach erkanntem Abruffehler; die letzte Lesekopie bleibt mit ihren ursprünglichen Zeiten sichtbar und altert weiter. Bei Stromausfall hilft keine Bildschirmwarnung. Vorgeschlagener lokaler Ersatz: benannte Betreuungsperson und Schreibtafel am selben Standort mit Prüfzeit, Ablaufzeit und Quelle; ohne neue Prüfung steht dort „Status unbekannt“. Ein persönlich überbrachter Vor-Ort-Befund kann die Tafel aktualisieren. Dieser Ablauf muss ebenfalls getestet werden.

## 4. Ansichten und Drei-Minuten-Demo

**Ansichten:** öffentliche Statusanzeige; Betreiberformular mit Bestätigungsseite; Techniker-Auftragsliste mit Detailansicht; kleine Organisationsübersicht über offene Ausfälle, Alter und Zuständigkeiten. Keine erfundenen Einwohner- oder Wirkungszahlen.

| Zeit | Handlung und sichtbare Aussage |
|---|---|
| 0:00–0:25 | Fenster A zeigt drei Demo-Wasserstellen. Erläutern: Informationen vor dem Wasserweg, auch an einem öffentlichen Standort. |
| 0:25–1:00 | Betreiberin meldet in Fenster B den Ausfall von A. Fenster A zeigt Ausfall, Bestätigungszeit und die ausreichend frisch bestätigte, geöffnete Alternative B. |
| 1:00–1:35 | Techniker übernimmt den automatisch erzeugten Auftrag; Verantwortlichkeit und Fortschritt werden sichtbar. |
| 1:35–2:05 | Techniker meldet „repariert“. Die öffentliche Anzeige bleibt beim bisherigen Ausfall: Funktionstest ausstehend. |
| 2:05–2:35 | Betreiberin bestätigt den Funktionstest. Anzeige und Auftrag aktualisieren sich getrennt nachvollziehbar. |
| 2:35–3:00 | Vorbereiteter Demo-Fall zeigt eine veraltete Bestätigung oder getrennte Verbindung; Unsicherheit ist sichtbar. Nutzen und Grenzen benennen. |

Alle Ansichten tragen „Demo – Beispieldaten“. Simulierte Nachrichten und nicht angebundene Dienste erhalten eigene Hinweise. Keine echte Hardware erforderlich.

## 5. Vorläufige Architektur

**Entscheidung:** React mit TypeScript als eine responsive Webanwendung; Supabase für PostgreSQL und Authentifizierung. **Annahme:** Eine stabile Internetverbindung ist für die verbundene Demo verfügbar; dies vor der Veranstaltung prüfen. Die Technik ist ein Vorschlag für die Umsetzung durch Codex.

Beide Fenster lesen dieselbe Datenbank. Die Anzeige fragt im Demo-Betrieb alle drei Sekunden neu ab. Das ist leicht vorzuführen; Echtzeit-Abonnements sind zunächst unnötig. Kernobjekte: Wasserstelle, Statusbestätigung, Auftrag und Ereignis.

Geschäftsübergänge laufen serverseitig in Datenbankfunktionen: Meldung, Statusänderung, Auftrag und Ereignis werden zusammen gespeichert. Rollen und Datenbankrichtlinien begrenzen Schreibrechte; keine privilegierten Schlüssel im Browser. Supabase dokumentiert dafür [Datenbankfunktionen](https://supabase.com/docs/guides/database/functions) und [Datenabsicherung](https://supabase.com/docs/guides/database/secure-data).

Eine lokale Lesekopie unterstützt die Anzeige bei Verbindungsproblemen. **Keine Offline-Schreibsynchronisierung:** nicht gespeicherte Meldungen bleiben klar ungesendet; keine falsche Erfolgsmeldung. Die Cloud-Verbindung für den Veranstaltungsort ist noch offen. Einen lokalen Demoersatz erst bei Bedarf festlegen; kein zweites Backend vorsorglich bauen.

## 6. Priorität und Vorbereitung bis 21. Oktober

Wir können das Projekt wie beauftragt jetzt entwickeln. Ob vorab entwickelter Code beim Hackathon eingereicht werden darf, ist separat zu klären; die Veranstaltungsseite beantwortet das nicht. Der Plan ist ein Vorschlag, keine bereits ausgeführte oder automatisch terminierte Arbeit.

| Zeitraum | Priorität / Ergebnis |
|---|---|
| 10.–12.10. | P0: Konzept/MVP festlegen, anschließend Grundgerüst und erste öffentliche Anzeige; Anmeldung, Vorabcode-Regeln und Track prüfen. |
| 13.–15.10. | P0: Vollständiger Ablauf auf zwei Fenstern: melden, Auftrag übernehmen, Reparatur melden, Funktion bestätigen. Kontaktmöglichkeiten zu lokalen Partnern recherchieren. |
| 16.–18.10. | P1: Alterung, Konflikte, Alternativen, Rollen und Verbindungsfehler prüfen; Anzeige mit verfügbaren Testpersonen erproben. |
| 19.–20.10. | P1: Fehler beheben, Demo-Reset und kurzen Pitch fertigstellen. KI nur bei bestandenem Kernablauf ergänzen. |
| 21.10. | P0: Drei-Minuten-Demo proben und Verbindungsplan prüfen. Falls Vorabcode nicht eingereicht werden darf, dient der Prototyp als interne Vorbereitung; die zulässige Arbeit am Veranstaltungstag richtet sich nach den Regeln. |

**Track-Vorschlag:** Social Impact; gegebenenfalls Open, falls freie Ideen im Partnertrack nicht zulässig sind. Energy & Sustainability nur, wenn Solarversorgung substanziell zum Konzept gehört. Die [Veranstaltungsseite](https://www.wu.ac.at/gruenden/unser-angebot/ideate/idealab/zero-one-hackathon) nennt den 12. Oktober als Anmeldeschluss und erlaubt vorhandene Ideen; Zulässigkeit von Vorabcode und freien Ideen im Partnertrack bleiben zu klären.

## 7. Abnahme und spätere Validierung

**Technische Abnahme:**

- Eine Meldung erzeugt genau einen offenen Auftrag; die zweite Ansicht aktualisiert sich bei stabiler Verbindung spätestens nach zwei Polling-Zyklen.
- Reparaturbericht allein verändert den Betriebszustand nicht; berechtigte Bestätigung tut es, mit nachvollziehbarem Ereignis.
- Veraltete, widersprüchliche und offline angezeigte Informationen behalten keine unbedingte positive Zusicherung.
- Unpassende Alternativen werden nicht empfohlen; unberechtigte Änderungen scheitern serverseitig.
- Neuladen erhält Daten; fehlgeschlagenes Speichern meldet keinen Erfolg; der Demo-Reset liefert reproduzierbare Ausgangsdaten.

**Feldtests nach Kontaktaufbau:** Vier bis sechs Haushaltsgespräche, darunter Menschen ohne eigenes Telefon, rekonstruieren konkrete Wasserwege und Informationsentscheidungen. Ein gemeinsames Gespräch mit Betreiber, Techniker und verantwortlicher Organisation rekonstruiert zwei bis drei Ausfälle: Wo lagen Wartezeiten für Information, Freigabe, Geld, Teile und Personal? Ein Anzeigetest am möglichen Standort prüft Reichweite, Verständlichkeit, Aktualitätsangaben und Verwechslung mit Wasserqualität. Kleine Stichproben liefern Hinweise, keine Repräsentativität.

**Messgrößen:** Anteil der befragten Haushalte mit Information vor Aufbruch; korrekt verstandene Fälle je getesteter Statusmeldung; Anteil frischer Bestätigungen; Abweichungen gegenüber Vor-Ort-Prüfungen; Fehlwege wegen nicht betriebsfähiger Wasserstellen je beobachtetem Wasserholvorgang; Zeit bis Verantwortungsübernahme und bestätigter Wiederherstellung. Ausgangswerte zuerst erheben, Zielwerte danach vereinbaren; ein Vorher-Nachher-Vergleich allein belegt keine Kausalität. Vorgeschlagenes Freigabekriterium: keine ungelöste Fehlinterpretation eines veralteten oder widersprüchlichen Status als aktuelle Funktionsbestätigung. Tests ohne lokale Teilnehmende prüfen Bedienbarkeit, belegen aber keine Wirkung in Kenia. Im Organisationsgespräch zusätzlich klären, wer Anzeige, Statuspflege und Reparaturen finanziert und verantwortet.

## 8. Belegte Ausgangspunkte und Grenzen

- [UNICEF: Smart Pumps](https://www.unicef.org/innovation/smart-pumps) beschreibt Handpumpenausfälle sowie Reparaturkosten und -dauer. Die Kyuso-Untersuchung stammt von 2014; keine aktuelle landesweite Statistik.
- [Communications Authority of Kenya](https://www.ca.go.ke/urban-rural-digital-divide-hinders-ict-uptake-joint-ca-and-knbs-survey-shows): Veröffentlichung 2025 mit Daten von 2023/24; Mobiltelefonbesitz 53,7 % insgesamt und 48,6 % im ländlichen Raum, bezogen auf Personen ab drei Jahren. Keine Haushalts-, Erwachsenen- oder Smartphonequote.
- [UNICEF Kenya, 3. August 2026](https://www.unicef.org/kenya/stories/climate-resilient-water-bringing-children-back-school-kenyas-arid-region) berichtet über Wiederherstellung und solare Aufrüstung eines Brunnens in Turkana sowie lange Wasserwege. Das belegt weder fehlende Statusinformation noch mangelhafte Koordination als entscheidenden Engpass.
