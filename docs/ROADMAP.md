# Roadmap: was offen ist und was noch möglich wäre

Stand: **22. Oktober 2026**. Dies ist die maßgebliche Liste der offenen Punkte. Der [Arbeitsstand](ZWISCHENSTAND.md) sagt, was zuletzt geprüft wurde; hier steht, was noch zu tun ist. Wer eine Aufgabe erledigt, setzt sie hier auf „erledigt“ oder entfernt sie.

Kennzeichnung wie im Konzept: **belegt** (Quelle oder Messung), **Annahme** (ungeprüft), **Entscheidung** (so vorgeschlagen).

## 1. Offene Aufgaben

| Prio | Aufgabe | Fertig, wenn … |
|---|---|---|
| P1 | **Kiswahili von einer Muttersprachlerin oder einem Muttersprachler prüfen lassen.** Die Texte der Tafel (`web/lib/i18n.ts`) sind ein sorgfältiger Entwurf, nicht geprüft. Besonders der Satz „Inafanya kazi inamaanisha maji yanaweza kuchotwa. Haisemi chochote kuhusu usafi wa maji ya kunywa.“ muss stimmen. | Prüfung durch jemanden, der Kiswahili spricht; danach den Hinweis in `i18n.ts` und hier entfernen. |
| P2 | **Gegenprobe auf echten Geräten und auf Papier.** Bisher nur Browser-Emulation (375 px mit Touch) und ein PDF des Druckblatts. | Ein echtes Handy, ein zweiter Rechner und ein Papierausdruck zeigen dasselbe wie die Emulation. |
| P2 | **Mit echter Hilfstechnik prüfen.** Die automatische Prüfung (axe, WCAG A/AA) findet auf allen zehn Ansichten nichts mehr, aber ein Screenreader (NVDA, VoiceOver, TalkBack) und die Systemeinstellung „Bewegung reduzieren“ sind nur im CSS gelesen, nie live ausprobiert worden. | Ablauf Meldung → Bestätigung ist mit Screenreader bedienbar; die Tafel zeigt „Zeile geändert“ ohne Bewegung. |
| P2 | **WPdx-Daten prüfen.** 60 Datensätze sind nicht automatisch 60 verschiedene, erreichbare Wasserstellen. Mehrfacherfassungen und widersprüchliche Quellenangaben sind nicht untersucht. | Datensätze und eindeutige Standorte sind dokumentiert getrennt; weiterhin keine Aussage über den aktuellen Zustand. |
| P2 | **SMS-Simulation fachlich schärfen.** Die Segmentzählung rechnet nur mit 160 Zeichen; Sonderzeichen erzwingen eine andere Kodierung (UCS-2, 70 Zeichen), und Kosten sind nicht modelliert. | Zählung nach Kodierung oder klar als Schätzung beschriftet; Pflicht zur Vor-Ort-Prüfung bleibt. |
| P3 | **Zugangscode als Cookie-Schlüssel.** Neue Codes bestehen aus drei Wörtern und vier Ziffern (rund 15 Mio. Möglichkeiten, der Code vom 22.10. ebenso), mit der Anmeldebegrenzung ist das für die Demo ausreichend. Er dient aber zugleich als Schlüssel für das Cookie; ein eigenes, langes Cookie-Geheimnis wäre sauberer. | Eigenes Geheimnis für das Cookie; ein Codewechsel meldet weiter alle ab. |
| P3 | **Browser-Kopie mit höherer Revision.** Hat ein Browser einen Stand mit höherer Revision gespeichert als der Server (zum Beispiel nach einer neu angelegten Datenbank), ignoriert er den Serverstand. | Der Client erkennt eine zurückgesetzte Datenbank und übernimmt den Serverstand. |
| P3 | **Entwicklungswerkzeuge mit bekannten Sicherheitsmeldungen.** `npm audit` meldet für die Laufzeit (`--omit=dev`) nichts mehr. Es bleiben 20 Meldungen in Werkzeugen, die nur beim Entwickeln und Bauen laufen (vite-Entwicklungsserver, Miniflare/Wrangler lokal, esbuild über drizzle-kit, Lint-Pakete) und in `vinext` (u. a. ein Bild-Parser, den die App nicht benutzt). Ein Versuch, vinext, vite und das Cloudflare-Plugin auf die gepatchten Versionen zu heben, räumte die Liste nicht auf und wurde zurückgenommen. | Die Plattform (Sites/vinext) zieht die Versionen nach, dann `npm audit fix` und die Tests wiederholen. |
| P3 | **Integrationstest unabhängig vom Dev-Server machen.** `npm run test:integration` braucht die Mock-Anmeldung von `npm run dev`. Gegen `npm start` schlägt er fehl, weil dort die Mock-Anmeldung fehlt und die lokale Laufzeit zusätzlich zeitweise 503 liefert. | Läuft in CI gegen einen Worker, der ohne Handarbeit startet. |

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
- **Mehr Regionen:** Import weiterer Counties aus WPdx (`npm run data:wpdx -- --list`), mit der Prüfung auf Mehrfacherfassungen aus Abschnitt 1.
- **Echte Gehwege** aus einem Routing-Dienst statt Luftlinie mal 1,3.
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
- **Die 12-Stunden-Gültigkeit einer Bestätigung ist ein Demo-Wert**, keine belegte Feldregel.
- **Es gibt keinen Pilotpartner und keine Wirkungszahlen.** Zahlungsbereitschaft ist unbestätigt.

## 4. Offene Entscheidungen

| Frage | Wer |
|---|---|
| Wer betreibt die Live-Seite dauerhaft (Cloudflare-Konto, Zugangscode, Kosten)? | Reczec, Osman |
| Soll zusätzlich eine private Sites-Bereitstellung laufen? Der Code ist dafür vorbereitet. | Osman |
| Swahili und weitere Sprachen: ja, nein, wann? | Team, mit Partner vor Ort |
| Wer ist der erste Partner (County, NGO, Wartungsdienst)? | Team |

