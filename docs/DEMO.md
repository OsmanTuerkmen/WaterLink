<!-- Priorität laut Osman: erst funktionierende App; dieses Skript erst zum Schluss ausarbeiten. -->
# WaterLink in drei Minuten

Alle Personen, Meldungen, Bestätigungen und Wegangaben sind simuliert. Die Orte stammen aus WPdx-Erhebungen in Busia; deren Status ist historisch. Straßen auf der Karte: © OpenStreetMap-Mitwirkende. Der Prototyp wurde nicht in Kenia validiert. „Working“ beschreibt den Betrieb, nicht die Trinkwasserqualität. Die Oberfläche ist auf Englisch (Branch `claude/waterlink-redesign`).

## Vorbereitung

1. Die **Pitch-Bühne** öffnen: https://waterlink-demo.waterlink.workers.dev/?view=stage (oder lokal `/?view=stage`). In der Live-Demo einmal eine Aktion versuchen und den **Demo-Zugangscode** eingeben (privat im Team, siehe [Bereitstellung](BEREITSTELLUNG.md)); danach gilt er 30 Tage in diesem Browser. Sie zeigt Aminas Handy (Betreiberin), Daniels Handy (Techniker) und die öffentliche Tafel nebeneinander, alle live auf demselben Serverstand. Ein zweites Gerät ist nicht nötig.
2. Oben rechts **Reset demo** wählen. Die simulierten Bestätigungen von A und B gelten 12 Stunden, also kurz vor dem Pitch zurücksetzen.
3. Optional die Tafel `/?view=display` auf einem zweiten Bildschirm zeigen. Zum Ansehen braucht sie keinen Code.
4. Stabile Verbindung sicherstellen. Lokal ist der Entwicklungsserver nur auf demselben Rechner erreichbar.

Das Band oben auf der Bühne zeigt die vier Schritte und hebt automatisch den nächsten hervor. Ab 1700 px Breite (z. B. Beamer mit 1920 × 1080) steht rechts zusätzlich das SMS-Handy; bei kleineren Bildschirmen über **Basic phone (SMS)** umschalten. Geprüft bei 1920 × 1080, 1440 × 900 und 1280 × 720.

## Ablauf

| Zeit | Handlung | Aussage |
|---|---|---|
| 0:00–0:25 | Tafel rechts zeigen: A und B „Working“, C „Unclear“. Auf den Kanister zeigen. | „Bevor Menschen losgehen, sehen sie hier, ob ihre Wasserstelle heute bestätigt funktioniert. Der Kanister zeigt, wie frisch die Information ist: Nach 12 Stunden ist er leer, dann steht dort ‚Unclear‘.“ |
| 0:25–1:00 | Amina: bei A **Report a problem** → **No water** → Kurzphrase tippen, „I am at the water point“ anhaken → **Send report**. | „Eine Meldung, drei Klicks. Die Tafel springt sofort um und schickt die Leute zu B. Daniel hat den Auftrag schon auf dem Handy.“ |
| 1:00–1:35 | Daniel: **I'll take this job** → **I'm at the site, start work**. | „Jetzt ist sichtbar, wer sich kümmert. Fehlen Ersatzteile oder Geld, wird das als Hindernis vermerkt.“ |
| 1:35–2:05 | Daniel: **Report repair** → kurze Notiz → **Repaired, ask for test**. | „Eine gemeldete Reparatur ist noch keine funktionierende Wasserstelle. Die Tafel bleibt vorsichtig.“ |
| 2:05–2:35 | Amina: bei A **Test and confirm** → **Works** → Notiz, „I tested it on site“ → **Confirm result**. | „Erst der Test vor Ort macht A wieder grün und schließt den Auftrag.“ |
| 2:35–3:00 | In einem zweiten Fenster unter **Coordination → Demo tools** „Let A's confirmation expire“ oder die Verbindungssimulation zeigen. | „Alte Informationen bleiben nicht grün. Wir zeigen Unsicherheit offen.“ |

**Optionaler Zusatz (ca. 20 s), SMS:** Auf dem SMS-Handy als „Household“ **STATUS** und dann **A** tippen. Aussage: „Wer kein Smartphone hat, schreibt STATUS und bekommt dieselbe Antwort in einer SMS.“ Als „Amina“ funktioniert auch `DOWN A …` und `OK A …` nach denselben Regeln. Im Codex-Review-Branch verlangt OK eine Beschreibung und eine ausdrückliche Bestätigung des Vor-Ort-Tests vor dem Senden; offline liefert STATUS keine aktuelle Zusicherung.

**Optionaler Zusatz (ca. 30 s), echte Sensordaten:** Unter **Coordination → Demo tools** die Wiedergabe „Tiwi – Mshikeni, Kwale“ abspielen. Ab Woche 13/2014 fällt die Fördermenge auf null, ab der zweiten Woche erscheint der Sensorhinweis. Aussage: „Das sind echte Daten einer Pumpe in Kenia. Ein Sensor kann einen Ausfall vermuten, aber nicht bestätigen. WaterLink macht daraus ‚Prüfung nötig‘.“ Optional **Send this hint to water point A** und die Tafel zeigen.

**Für alle, die nicht dabei sind:** Den Ablauf kann jede Person selbst nachspielen, ohne Code: `/?view=stage&sandbox=1` (Ausprobier-Modus, nur auf dem eigenen Gerät). Für eine Vorführung vor Publikum bleibt das gemeinsame Demo mit Code und mehreren Fenstern die bessere Wahl.

**Optionaler Zusatz (ca. 45 s), eigene Wasserstelle und Wegprüfung:** Unter **Coordination → Overview** **Add a water point** (zum Beispiel „School well“, 2 Minuten), danach als Amina auf der Feld-App „Test and confirm“. Meldet man jetzt A als ausgefallen, nennt WaterLink weiter B, **nicht** die neue Stelle: Ihr Weg ist noch nicht geprüft. Erst nach **Check route and access** (Koordination, Häkchen „I walked the route …“) wird sie als nähere Alternative genannt; **Access is closed or blocked** nimmt sie sofort wieder heraus. Aussage: „Eine Empfehlung braucht einen geprüften Weg, nicht nur einen Punkt auf der Karte.“

**Optionaler Zusatz (ca. 15 s), Kiswahili und QR-Code:** Auf der Tafel unten **Kiswahili** wählen: Titel, Status und Hinweise wechseln die Sprache (`/?view=display&lang=sw` ist als Lesezeichen möglich). Daneben der **QR-Code**: Wer ihn mit dem Handy scannt, landet in der SMS-Ansicht. Aussage: „Für Menschen, die die Tafel verstehen wollen und ein Telefon haben.“ Die Übersetzung ist ein Entwurf; nicht als geprüft darstellen.

Die Verbindungssimulation ist ein ausdrücklich markierter UI-Test in einem Fenster. Für eine echte Unterbrechung kann im Browser die Verbindung offline geschaltet werden.

## Grenzen offen benennen

- Die öffentliche Anzeige erreicht nicht automatisch alle Haushalte. Ein geeigneter Standort und lokale Betreuung fehlen noch.
- Die 12-Stunden-Frist ist ein Demo-Parameter, keine geprüfte Regel für den Feldbetrieb.
- Software schafft kein Reparaturbudget, keine Ersatzteile und kein Personal.
- Kein Live-Sensor, kein SMS-Versand, kein KI-Dienst. Die Sensorwiedergabe nutzt echte, aber historische Daten von 2014.
- Die Rollen dienen einer privaten Demonstration. Vor einem Feldpilot sind echte, zu Wasserstellen zugeordnete Konten nötig.
- Konkrete Pilotregion, lokale Sprache (Swahili ist nicht umgesetzt) und Wege-/Zugangsprüfung stehen aus. Gehzeiten sind aus der Luftlinie geschätzt.

## Ersatz bei Stromausfall einer späteren Feldanzeige

Eine benannte Person betreut eine Schreibtafel am gleichen Ort. Sie trägt nur persönlich geprüfte oder von der zuständigen Betreiberperson bestätigte Zustände mit Quelle, Prüfzeit und Ablaufzeit ein. Ohne gültige Bestätigung lautet die Anzeige **„Status unknown“**. Die Statusseite lässt sich außerdem als A4-Blatt drucken (**Print sheet**).
