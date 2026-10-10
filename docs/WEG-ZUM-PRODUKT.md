# Vom Prototyp zum echten Produkt

Spickzettel für Jury-Fragen wie „Was fehlt noch?“ und „Wie würde das in Kenia funktionieren?“. Kennzeichnung wie im Konzept: **belegt**, **Annahme**, **Entscheidung**.

## Kurzantwort für die Bühne

> „Die Software für den ganzen Ablauf steht: Meldung, öffentliche Anzeige, Reparatur und bestätigte Wiederherstellung. Was fehlt, ist vor allem nicht Technik, sondern ein Partner vor Ort: eine Organisation, die Wasserstellen betreut, Menschen, die den Status bestätigen, und ein Ort für die Anzeige. Mit so einem Partner würden wir klein starten – wenige Wasserstellen, eine Anzeige, Bestätigungen per SMS – und messen, ob weniger Menschen umsonst losgehen.“

## Was heute echt ist und was simuliert

| Teil | Stand im Prototyp |
|---|---|
| Ablauf Meldung → Auftrag → Reparatur → Funktionsprüfung | Echt umgesetzt, serverseitig geprüft, mit Verlauf |
| Öffentliche Statustafel und mobile Ansicht | Echt umgesetzt, aktualisiert sich automatisch |
| Regeln für Unsicherheit (12-Stunden-Frist, veraltet, widersprüchlich, offline) | Echt umgesetzt; die Frist ist ein Demo-Wert |
| Orte der Wasserstellen | Echte Erhebungen aus der Water Point Data Exchange (Busia), Zustand dort historisch |
| Sensordaten | Echte historische Daten von Smart Handpumps in Kwale (2014), als Wiedergabe, nicht live |
| Personen, Bestätigungen, Wege, Öffnungszeiten | Simuliert und so gekennzeichnet |
| SMS, Live-Sensoren, KI-Dienst, echte Konten | Nicht angeschlossen |

## Was zum echten Produkt fehlt

### 1. Ein Betreiberpartner (wichtigster Punkt)

- Eine verantwortliche Organisation, zum Beispiel Wasserbehörde des Countys, Wasserversorger, NGO oder ein Wartungsdienst nach dem FundiFix-Modell.
- Pro Wasserstelle eine benannte Person, die den Zustand bestätigt, und erreichbare Techniker.
- Geld, Ersatzteile und Personal für Reparaturen. **Belegt** ist, dass Kosten und Reparaturdauer große Probleme sind (UNICEF). WaterLink macht Engpässe sichtbar, beschafft sie aber nicht.

### 2. Zugang für Haushalte ohne Smartphone

- Ein Standort für die Anzeige, an dem Menschen vor dem Wasserweg vorbeikommen, mit Strom (etwa Solar), Verbindung und einer Person, die sich kümmert. **Annahme**, die vor Ort zu prüfen ist.
- Ersatz bei Strom- oder Verbindungsausfall: eine betreute Tafel mit Prüfzeit; ohne gültige Bestätigung steht dort „unklar“.
- SMS oder USSD für einfache Handys, sowohl zum Abfragen als auch für Bestätigungen durch Betreiber. Dafür braucht es einen SMS-Anbieter in Kenia und laufendes Budget.
- Sprache: Swahili und je nach Region eine lokale Sprache, mit Menschen vor Ort auf Verständlichkeit getestet.

### 3. Verlässliche Statusquellen

- Hauptquelle bleibt die Bestätigung durch einen Menschen vor Ort, bei einfachen Handys per SMS mit kurzem Code.
- Sensoren an Pumpen sind optional und liefern nur Hinweise zur Prüfung. Solche Systeme gibt es schon: In Kwale und Kitui sank die durchschnittliche Reparaturzeit laut Projektberichten mit Sensordaten und Wartungsdienst von 27 auf 3 Tage (**belegt** für dieses Projekt, nicht übertragbar ohne Prüfung). Eine Kooperation wäre sinnvoller als eigene Hardware.
- Erhebungsdaten wie WPdx dienen als Startbestand der Orte, nie als aktueller Zustand.

### 4. Technik für den Feldbetrieb

- Echte Konten: Wer darf welche Wasserstelle bestätigen? Anmeldung, die auch mit einfachem Handy funktioniert.
- SMS-Eingang und -Versand, Warteschlange für schlechte Verbindungen.
- Datenbank mit getrennten Tabellen statt eines Demo-Datensatzes, Karte für viele Wasserstellen.
- Anzeige, die offline den letzten Stand mit Uhrzeit zeigt und bei Ablauf auf „unklar“ wechselt (im Prototyp vorhanden, aber nicht auf Feldhardware getestet).
- Datenschutz nach dem kenianischen Data Protection Act 2019, Betrieb, Backups und Überwachung.

### 5. Nachweis, dass es hilft

- Gespräche mit Haushalten, auch ohne eigenes Telefon: Wie entscheiden sie heute, wohin sie gehen?
- Gemeinsames Gespräch mit Betreiber, Technikern und Organisation über zwei bis drei echte Ausfälle: Wo ging Zeit verloren – Information, Freigabe, Geld, Teile oder Personal?
- Test der Anzeige am echten Standort: Wird sie gesehen und verstanden? Wird „funktioniert“ mit „sauberes Wasser“ verwechselt?
- Messen: Anteil der Haushalte mit Information vor dem Aufbruch, Fehlwege, Anteil frischer Bestätigungen, Zeit bis Übernahme und bis bestätigter Reparatur. Zuerst Ausgangswerte erheben, dann Ziele vereinbaren.

## Realistischer Weg (Entscheidung, Zeiten offen)

1. **Nach dem Hackathon:** Kontakt zu einem möglichen Partner (County, NGO, Wartungsdienst, Smart-Handpump-Team in Oxford) und die Gespräche aus Abschnitt 5.
2. **Kleiner Pilot:** eine Nachbarschaft, wenige Wasserstellen, eine Anzeige, Bestätigung per SMS, eine verantwortliche Organisation. Ausgangswerte vorher erheben.
3. **Auswerten und anpassen:** Erst wenn Haushalte die Information nutzen und Bestätigungen zuverlässig kommen, ausbauen – mehr Wasserstellen, SMS-Abfrage, Sensoranbindung über Partner.

## Kosten und wer zahlt (Hypothese)

Laufende Kosten entstehen vor allem durch Menschen (Bestätigungen, Betreuung der Anzeige), SMS, Anzeigegerät mit Strom und Verbindung sowie Hosting. Zahlen könnten Wasserversorger, County oder NGOs, die ohnehin für den Betrieb verantwortlich sind. Nachfrage und Zahlungsbereitschaft sind **unbestätigt**.

## Häufige Fragen

**Warum nicht einfach Sensoren?** Sensoren erkennen, dass eine Pumpe nicht genutzt wird, aber nicht warum, und sie informieren keine Haushalte. Pumpenmonitoring gibt es bereits. WaterLink ergänzt den Teil danach: öffentliche Information, Alternative, Zuständigkeit und bestätigte Reparatur. Sensorhinweise können einfließen, ersetzen aber keine Prüfung vor Ort.

**Was, wenn niemand bestätigt?** Dann zeigt WaterLink „unklar“, nie einen alten grünen Status. Ob Betreiber zuverlässig bestätigen, ist eine der kritischsten Annahmen und muss im Pilot gemessen werden.

**Ist das Wasser dann sauber?** „Funktioniert“ heißt nur: Wasser kann entnommen werden. WaterLink macht keine Aussage zur Trinkwasserqualität.

**Hilft das, wenn das eigentliche Problem Geld oder Ersatzteile sind?** Nicht direkt. Blockierungen wie „Ersatzteile fehlen“ werden aber sichtbar und auswertbar, das kann Finanzierungsentscheidungen unterstützen. Software allein löst diese strukturellen Probleme nicht.

**Warum KI?** Optional: Eine Sprachnachricht kann als Textentwurf erfasst werden, den die Betreiberin prüft. KI setzt nie selbst einen Status und erfindet keine Reparaturen. Der Ablauf funktioniert ohne KI.

## Quellen

- [UNICEF: Smart Pumps](https://www.unicef.org/innovation/smart-pumps)
- [UKRI: Smart Handpump data helps deliver reliable drinking water](https://www.ukri.org/about-us/how-we-are-doing/research-outcomes-and-impact/smart-handpumps-securing-safe-water-supplies/)
- [SDSN TReNDS: Handpump data improves water access](https://www.sdsntrends.org/research/2018/11/27/case-study-smart-handpump-project?locale=en)
- [openwashdata/waterpumpkwale](https://github.com/openwashdata/waterpumpkwale) (CC BY 4.0, doi:10.5281/zenodo.8399886)
- [Water Point Data Exchange](https://www.waterpointdata.org/) (CC BY 4.0)
- [Communications Authority of Kenya, 2025](https://www.ca.go.ke/urban-rural-digital-divide-hinders-ict-uptake-joint-ca-and-knbs-survey-shows)
