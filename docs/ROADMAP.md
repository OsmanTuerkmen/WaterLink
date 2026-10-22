# Roadmap: was offen ist und was noch möglich wäre

Stand: **22. Oktober 2026**. Dies ist die maßgebliche Liste der offenen Punkte. Der [Arbeitsstand](ZWISCHENSTAND.md) sagt, was zuletzt geprüft wurde; hier steht, was noch zu tun ist. Wer eine Aufgabe erledigt, setzt sie hier auf „erledigt“ oder entfernt sie.

Kennzeichnung wie im Konzept: **belegt** (Quelle oder Messung), **Annahme** (ungeprüft), **Entscheidung** (so vorgeschlagen).

## 1. Offene Aufgaben

| Prio | Aufgabe | Fertig, wenn … |
|---|---|---|
| P1 | **Repository sichtbar machen und Einreichung vorbereiten.** Das Repository ist privat (anonymer Abruf: 404); die Jury sieht den Code nur nach Freigabe. Außerdem Ausprobier-Link statt Zugangscode weitergeben und letzte Probe auf der Live-Seite. | Siehe die Liste in [Menschen](MENSCHEN.md), Abschnitt 1; Osman entscheidet über die Sichtbarkeit. |
| P1 | **Kiswahili von einer Muttersprachlerin oder einem Muttersprachler prüfen lassen.** *(Zurückgestellt am 22.10.: im Moment niemand zur Hand.)* Die Texte der Tafel (`web/lib/i18n.ts`) sind ein sorgfältiger Entwurf; die Tafel selbst weist darauf hin („draft translation“). Vorab wurden sie gegen veröffentlichte Kiswahili-Texte abgeglichen ([Quellenprüfung](KISWAHILI-QUELLENPRUEFUNG.md): sechs Wörter korrigiert, sieben Fragen offen), das ersetzt die Prüfung durch Menschen aber nicht. Besonders der Satz „Inafanya kazi inamaanisha maji yanaweza kuchotwa. Haisemi chochote kuhusu ubora wa maji ya kunywa.“ muss stimmen. Der [Prüfbogen](KISWAHILI-PRUEFBOGEN.md) mit den offenen Fragen ist fertig (erzeugt mit `npm run export:sw`), die Anleitung steht in [Menschen](MENSCHEN.md), Abschnitt 3. | Prüfung durch jemanden, der Kiswahili spricht; danach `draft` in `i18n.ts` auf `null` setzen und diese Zeile entfernen. |
| P2 | **Fünf Menschen ohne Erklärung ausprobieren lassen.** *(Zurückgestellt am 22.10.)* Bisher hat niemand außerhalb des Teams die App benutzt. | Ablauf und Aufgaben in [Menschen](MENSCHEN.md), Abschnitt 2; Stolpersteine, die zwei oder mehr Personen treffen, stehen hier als Aufgaben. |
| P2 | **Gegenprobe auf echten Geräten und auf Papier.** *(Zurückgestellt am 22.10.; zwei Minuten mit dem eigenen Handy am Ausprobier-Link sind trotzdem möglich.)* Bisher nur Browser-Emulation (375 px mit Touch) und ein PDF des Druckblatts. | Tabelle in [Menschen](MENSCHEN.md), Abschnitt 4, ausgefüllt: ein echtes Handy (Android und iPhone), Flugmodus, Sonnenlicht, großer Bildschirm und ein Papierausdruck zeigen dasselbe wie die Emulation. |
| P2 | **Mit echter Hilfstechnik prüfen.** *(Zurückgestellt am 22.10.)* Die automatische Prüfung (axe, WCAG A/AA) findet auf allen zehn Ansichten nichts mehr, aber ein Screenreader (NVDA, VoiceOver, TalkBack) und die Systemeinstellung „Bewegung reduzieren“ sind nur im CSS gelesen, nie live ausprobiert worden. | Letzte Zeilen der Tabelle in [Menschen](MENSCHEN.md), Abschnitt 4: Ablauf Meldung → Bestätigung ist mit Screenreader bedienbar; die Tafel zeigt „Zeile geändert“ ohne Bewegung. |
| P2 | **Eine Fachperson und einen möglichen Partner ansprechen.** Ohne Partner kein Pilot; die beiden Annahmen (12-Stunden-Frist, Weg zuerst prüfen) sind unbestätigt. | Erste Nachricht verschickt und eine Rückmeldung zu Frist und Wegprüfung eingeholt; Vorlage und Liste in [Menschen](MENSCHEN.md), Abschnitt 5. |
| P3 | **Entwicklungswerkzeuge mit bekannten Sicherheitsmeldungen.** `npm audit` meldet für die Laufzeit (`--omit=dev`) nichts. Es bleiben 15 Meldungen (am 22.10. von 20 gesenkt durch vite 8.3.5, Cloudflare-Plugin 1.64, wrangler 4.151 und vinext 1.3.0), alle in Werkzeugen, die nur beim Entwickeln und Bauen laufen: `braces` und `micromatch` über `eslint-config-next` und vinext, ein alter `esbuild` in `drizzle-kit`, `fflate` in einem Bild-Paket von vinext. Für diese Pakete gibt es keine Behebung ohne Rückschritt der Version. | Die Pakete veröffentlichen Fixes; dann `npm audit fix` und die Tests wiederholen. |

## 2. Mögliche Erweiterungen (nicht begonnen)

Sortiert nach Thema, nicht nach Reihenfolge. Was davon sinnvoll ist, hängt von einem Partner und einem Pilot ab (siehe [Weg zum Produkt](WEG-ZUM-PRODUKT.md)).

### Erreichbarkeit für Haushalte
- **Echte SMS oder USSD** über einen Anbieter in Kenia: Abfrage `STATUS`, Bestätigungen durch Betreiber, Absender den Betreibern zuordnen. Die Logik dafür steht in `web/lib/sms.ts`, es fehlt nur der Anschluss.
- **Swahili weiter ausbauen** (und je nach Region eine lokale Sprache): Die öffentliche Tafel gibt es schon auf Kiswahili (Umschalter, `?lang=sw`), Oberfläche, Feld-App und SMS noch nicht. Mit Menschen vor Ort auf Verständlichkeit prüfen. Einige SMS-Stichwörter (`HALI`, `MSAADA`) gibt es schon.
- **Sprachausgabe oder Piktogramme** auf der Tafel für Menschen, die schlecht lesen.
- **Hochkontrast-Ansicht** für grelles Sonnenlicht. Einen Dunkelmodus gibt es bewusst nicht, weil die Tafel draußen und tagsüber gelesen wird.

### Verlässlichkeit im Feld
- **Echte Konten und Rollen pro Wasserstelle** statt des gemeinsamen Demo-Codes: Wer darf wo bestätigen? Anmeldung, die auch mit einfachem Handy geht.
- **Offline-fähige Feld-App** (installierbare Web-App mit Warteschlange): Meldungen und Tests aus Gebieten mit schwachem Netz werden nachgeschickt.
- **Foto bei Meldung und Test**, damit Techniker die Lage vor dem Weg einschätzen können.
- **Ausprobier-Modus ausbauen:** geführte Tour mit Hinweisen („Als Nächstes: Amina meldet …“), ein Sandbox-Zustand, den man zwischen Geräten oder Tabs teilen kann (zum Beispiel über einen Link), und ein Zurücksetzen nach einer Zeit ohne Nutzung.
- **Plausibilitätsprüfung** bei widersprüchlichen Meldungen (zwei Betreiber, ein Sensor).

### Daten und Technik
- **Normalisierte Tabellen statt eines Datensatzes:** getrennte Tabellen für Wasserstellen, Aufträge, Ereignisse und Sitzungen, Archivierung, Seitenweise Abfrage. Der jetzige Aufbau ist für wenige Dutzend Stellen gedacht. Bewusst nicht umgebaut: Eine Umstellung brächte für die Vorführung nichts, verlangt eine Umstellung der Live-Daten und der Revisionsprüfung, und ohne Pilot weiß man nicht, welche Abfragen wirklich gebraucht werden. Bis dahin ist der Zustand auf die letzten 200 Ereignisse begrenzt und die Abfrage schlank (siehe Architektur).
- **Mehr Regionen:** Import weiterer Counties aus WPdx (`npm run data:wpdx -- --list`); der Import führt Mehrfacherfassungen desselben Ortes zusammen.
- **Echte Gehwege** aus einem Routing-Dienst statt Luftlinie mal 1,3. **Angelegte Wasserstellen** erscheinen auf der Karte, wenn man eine Position angibt: eingetippt (Koordinaten aus Google Maps) oder per Tipp auf die Karte, höchstens 15 km vom Treffpunkt. Gebiete außerhalb von Busia fehlen noch (die Karte kennt nur den Busia-Ausschnitt).
- **Weg und Zugang auch durch Betreiber:innen oder die Gemeinde melden lassen** (heute nur Koordination), mit Rückfrage bei widersprüchlichen Meldungen.
- **Sensoranbindung über Partner** (zum Beispiel das Smart-Handpump-Team): Hinweise zur Prüfung, nie ein Status. Die Regel dafür (`web/lib/sensor.ts`) steht schon.
- **KI als Hilfe, nie als Quelle:** Sprachnotiz → Textentwurf, den die Betreiberin prüft; Auffälligkeiten in Sensorreihen früher erkennen. Der Ablauf muss ohne KI funktionieren; KI setzt nie einen Status und erfindet keine Reparatur.

### Koordination und Auswertung
- **Kennzahlen:** Zeit bis zur Übernahme und bis zur bestätigten Reparatur, Anteil frischer Bestätigungen, häufigste Hindernisse (Teile, Geld, Personal). Erst Ausgangswerte erheben, dann Ziele vereinbaren.
- **Benachrichtigungen** an Techniker und Koordination, Export als Tabelle.
- **Ersatzteile und Finanzierung** als eigener Ablauf, wenn ein Hindernis „Teile“ oder „Geld“ lautet. Heute macht WaterLink Engpässe nur sichtbar.

### Betrieb und Qualität
- **Vorschau-Bereitstellung pro Branch**, Fehlerüberwachung, Datensicherung.
- **Datenschutz** nach dem kenianischen Data Protection Act 2019, bevor echte Personen in der Anwendung stehen.
- **Mehrere Organisationen** (Mandantenfähigkeit), falls mehrere Counties oder NGOs dieselbe Installation nutzen.

### Pitch und Pilot
- Folien, Beamer-Test und Zurücksetzen vor der Vorführung (erst nach stabilem App-Ablauf; siehe [Demo-Skript](DEMO.md)).
- **Feldpilot:** Partner, Verantwortlichkeiten, Standort der Anzeige, Sprache, Reparaturmittel. Interviews und Prüfung vor Ort statt erfundener Wirkungszahlen. Gesprächsleitfaden steht in [Weg zum Produkt](WEG-ZUM-PRODUKT.md), Abschnitt 5.

## 3. Bewusste Grenzen

Das ist kein Fehler, sondern Absicht, und darf nicht als „funktioniert schon“ dargestellt werden:

- **Personen, Bestätigungen, Wege und Öffnungszeiten sind simuliert** und überall so gekennzeichnet. Nur die Orte kommen aus echten Erhebungen (WPdx), deren Zustand historisch ist.
- **„Funktioniert“ heißt: Wasser kann entnommen werden.** WaterLink macht nie eine Aussage zur Trinkwasserqualität.
- **SMS, Live-Sensoren, KI-Dienst, Bezahlung und echte Konten sind nicht angeschlossen.**
- **Alle Demo-Nutzer teilen einen Datensatz** und können nach dem Freischalten alle Rollen wählen. Das ist kein Mehrmandanten- und kein Feldbetrieb. Der **Ausprobier-Modus** (ohne Code) ist davon getrennt: Übungsdaten nur im eigenen Browser-Tab, nie auf dem Server, nicht zwischen Tabs oder Geräten geteilt.
- **Die 12-Stunden-Gültigkeit einer Bestätigung ist ein Demo-Wert**, keine belegte Feldregel. Dasselbe gilt für die Prüfung von Weg und Zugang; in einem echten Betrieb gälte sie eher Wochen, bis jemand eine Sperrung meldet.
- **Die 42 Orte sind zusammengeführte Erhebungseinträge.** Einträge verschiedener Erhebungen im Umkreis von 50 m gelten als derselbe Ort (60 Einträge wurden 42 Orte, 16 davon mit weiteren Erhebungen in den Details). Das Maß von 50 m ist eine Annahme. Die Demo-Stellen A, B und C bleiben getrennt, obwohl A und C nur rund 40 m auseinander liegen.
- **Die Position angelegter Wasserstellen ist nicht geprüft.** Sie wird eingetippt oder auf der Karte angetippt und muss innerhalb von 15 km um den Treffpunkt liegen; WaterLink weist auf eine erfasste Stelle im Umkreis von 50 m hin und kennzeichnet die Position als „nicht vor Ort geprüft“. Ob sie am richtigen Ort liegt, kann nur jemand vor Ort sagen. Die Karte zeigt nur den Busia-Ausschnitt.
- **Besuche vor Ort sind in der Demo simuliert.** Wer „Check route and access“ benutzt, bestätigt mit einem Häkchen, dass er den Weg gegangen ist; WaterLink kann das nicht prüfen.
- **Es gibt keinen Pilotpartner und keine Wirkungszahlen.** Zahlungsbereitschaft ist unbestätigt.

## 4. Offene Entscheidungen

| Frage | Wer |
|---|---|
| Wer betreibt die Live-Seite dauerhaft (Cloudflare-Konto, Zugangscode, Kosten)? | Reczec, Osman |
| Soll zusätzlich eine private Sites-Bereitstellung laufen? Der Code ist dafür vorbereitet. | Osman |
| Swahili und weitere Sprachen: ja, nein, wann? | Team, mit Partner vor Ort |
| Wer ist der erste Partner (County, NGO, Wartungsdienst)? | Team |

