# WaterLink in drei Minuten

Alle Personen, Meldungen, Bestätigungen und Wegangaben sind simuliert. Die Orte sind fiktiv oder stammen aus WPdx-Erhebungen; deren Status ist historisch. Der Prototyp wurde nicht in Kenia validiert. „Funktioniert“ beschreibt den Betrieb, nicht die Trinkwasserqualität.

## Vorbereitung

1. Hauptansicht öffnen und für die Demo anmelden. Die Rollen sind simuliert; die erlaubten Aktionen werden trotzdem auf dem Server geprüft.
2. Unter **Demo** die Rolle **Koordination** wählen und die Beispieldaten zurücksetzen. Bei echten Regionsdaten: Die simulierte Demo-Bestätigung von A und B gilt 12 Stunden, also kurz vor dem Pitch zurücksetzen.
3. **Öffentliche Anzeige öffnen** auswählen. Dieses zweite Fenster als öffentliche Anzeige sichtbar lassen. Alternativ dieselbe URL mit `?view=display` auf einem zweiten Gerät öffnen. Die private bereitgestellte Demo verlangt auf beiden Geräten den berechtigten ChatGPT-Zugang.
4. Eine stabile Verbindung sicherstellen. Der lokale Entwicklungsserver ist absichtlich nur auf demselben Rechner erreichbar; zwei Geräte verwenden die bereitgestellte Demo.

## Ablauf

| Zeit | Handlung | Aussage |
|---|---|---|
| 0:00–0:25 | Öffentliche Anzeige zeigen. | „Bevor Menschen Wasser holen, sehen sie hier, wann der Betrieb ihrer Wasserstelle zuletzt bestätigt wurde. Dafür braucht nicht jeder Haushalt ein Handy.“ |
| 0:25–1:00 | In der Hauptansicht Betreiberrolle wählen und bei Wasserstelle A einen Ausfall melden. | „Eine geprüfte Meldung aktualisiert die Anzeige und legt einen Reparaturauftrag an. Eine Alternative erscheint nur mit passenden Angaben.“ |
| 1:00–1:35 | Technikerrolle wählen, Auftrag übernehmen und Bearbeitung starten. | „Jetzt ist sichtbar, wer sich kümmert. Fehlende Ersatzteile oder Finanzierung können als Blockierung dokumentiert werden.“ |
| 1:35–2:05 | Reparatur dokumentieren. | „Eine gemeldete Reparatur ist noch keine bestätigte Wiederherstellung. Die öffentliche Anzeige bleibt vorsichtig.“ |
| 2:05–2:35 | Betreiberrolle wählen, Funktion vor Ort ausdrücklich als getestet bestätigen. | „Erst diese Bestätigung stellt den Betrieb wieder her und schließt den Auftrag.“ |
| 2:35–3:00 | In Demo einen veralteten Stand oder die Verbindungssimulation zeigen. | „Alte Informationen bleiben nicht unbegrenzt grün. Wir zeigen Unsicherheit offen.“ |

**Optionaler Zusatz (ca. 30 s), echte Sensordaten:** Unter **Demo-Werkzeuge** die Wiedergabe „Handpumpe Tiwi – Mshikeni, Kwale“ abspielen. Ab KW 13/2014 fällt die Fördermenge auf null, ab der zweiten Woche erscheint der Sensorhinweis. Aussage: „Das sind echte Daten einer Pumpe in Kenia. Ein Sensor kann einen Ausfall vermuten, aber nicht bestätigen. WaterLink macht daraus ‚Prüfung nötig‘, die Betreiberin prüft, und ab da läuft unser Ablauf.“ Optional als Koordination **Hinweis auf A übertragen** und die Tafel zeigen.

Die Verbindungssimulation ist ein ausdrücklich markierter UI-Test. Sie unterbricht keine reale Netzverbindung und verändert keine Messwerte. Für eine echte Unterbrechung kann im Browser die Verbindung offline geschaltet werden.

## Grenzen offen benennen

- Die öffentliche Anzeige erreicht nicht automatisch alle Haushalte. Ein geeigneter Standort und lokale Betreuung fehlen noch.
- Die 12-Stunden-Frist ist ein konfigurierbarer Demo-Testparameter, keine geprüfte Regel für den Feldbetrieb.
- Software schafft kein Reparaturbudget, keine Ersatzteile und kein Personal.
- Kein Live-Sensor, kein SMS-Versand und kein KI-Dienst. Die Sensorwiedergabe nutzt echte, aber historische Daten von 2014. Manuelle Formulare bilden den gesamten Kernablauf ab.
- Die Betreiber-, Technik- und Koordinationsrollen dienen einer privaten Demonstration. Vor einem Feldpilot sind echte, zu Wasserstellen zugeordnete Konten und lokale Zuständigkeiten erforderlich.
- Eine konkrete Pilotregion, Sprache und lokale Wege-/Zugangsprüfung stehen aus. Die Demo-Sprache ist Deutsch.

## Ersatz bei Stromausfall einer späteren Feldanzeige

Eine benannte Person betreut eine Schreibtafel am gleichen Ort. Sie trägt nur persönlich geprüfte oder von der zuständigen Betreiberperson bestätigte Zustände mit Quelle, Prüfzeit und Ablaufzeit ein. Ohne gültige Bestätigung lautet die Anzeige **„Status unbekannt“**. Die Tafel, Erreichbarkeit der Betreuung und der Zeitpunkt vor der Wegeentscheidung sind im Pilot zu testen.
