# Was nur Menschen tun können

Die App ist fertig, soweit Code reicht. Was jetzt bleibt, braucht Menschen, Geräte oder Gespräche. Diese Seite sagt, **was**, **wer** (Vorschlag), **wie lange** und **woran man merkt, dass es erledigt ist**. Die Aufgaben stehen auch in der [Roadmap](ROADMAP.md); hier steht die Anleitung dazu. Wer eine Aufgabe erledigt, trägt das Ergebnis in den [Arbeitsstand](ZWISCHENSTAND.md) ein und hakt sie in der Roadmap ab.

| # | Was | Wer (Vorschlag) | Dauer | Wirkung |
|---|---|---|---|---|
| 1 | [Vor der Einreichung](#1-vor-der-einreichung-eine-stunde) | Osman und Reczec | 1 h | ohne das sieht die Jury den Code nicht |
| 2 | [Fünf Menschen ausprobieren lassen](#2-fünf-menschen-probieren-es-ohne-erklärung-aus) | Reczec | 1 Nachmittag | findet, was wir selbst nicht mehr sehen |
| 3 | [Kiswahili prüfen lassen](#3-kiswahili-prüfen-lassen) | jemand mit Muttersprache | 30 min | nimmt den Entwurfshinweis von der Tafel |
| 4 | [Echte Geräte, Papier, Screenreader](#4-echte-geräte-papier-und-screenreader) | Reczec, Osman | 1–2 h | die Emulation ersetzt das nicht |
| 5 | [Fachleute und Partner ansprechen](#5-fachleute-und-partner-ansprechen) | Reczec | laufend | ohne Partner kein Pilot |
| 6 | [Übergabe und Betrieb klären](#6-übergabe-und-betrieb-klären) | Osman und Reczec | 30 min | wem gehört die Live-Seite? |

## 1. Vor der Einreichung (eine Stunde)

- [ ] **Repository sichtbar machen.** Stand am 22.10.2026: ein anonymer Abruf von `github.com/OsmanTuerkmen/WaterLink` liefert 404, das Repository ist also **privat**. Die Jury sieht den Code nur, wenn Osman es öffentlich stellt (GitHub → Settings → General → Danger Zone → *Change visibility*) oder die Jury einlädt. Geprüft: Im Repository und in seiner ganzen Historie liegt kein Zugangscode und keine Schlüsseldatei (`.env*` und `.dev.vars*` sind ausgeschlossen); der aktuelle Code wurde gegen alle Commits gesucht, ohne Fund. Die MIT-Lizenz liegt bei; Daten haben eigene Lizenzen (WPdx CC BY 4.0, Straßen © OpenStreetMap), die stehen im README.
- [ ] **Der Jury den Ausprobier-Link geben, nicht den Zugangscode:** `https://waterlink-demo.waterlink.workers.dev/?view=stage&sandbox=1`. Dort läuft die ganze Geschichte (Meldung → Übernahme → Reparatur → Test) mit Übungsdaten im eigenen Browser, ohne Code. Der Zugangscode bleibt im Team.
- [ ] **Letzte Probe auf der Live-Seite**, nicht auf dem eigenen Rechner: Startseite lädt, Ausprobier-Link öffnet, Tafel (`/?view=display`) zeigt Wasserstellen, QR-Code ist sichtbar. Mit einem Handy im mobilen Netz, nicht im WLAN des Teams.
- [ ] **Die Grenzen im Einreichungstext nennen** (ein Satz genügt): Personen, Bestätigungen und Wege sind simuliert; Orte stammen aus WPdx; „funktioniert“ sagt nichts über die Wasserqualität; kein Pilotpartner. Das schützt vor Fragen, die man nicht beantworten kann, und es stimmt.
- [ ] **Optional ein Video von 60 bis 90 Sekunden** (Bildschirmaufnahme der Bühne, Ablauf aus der [Demo](DEMO.md)), falls die Einreichung eines erlaubt. Wer nicht live vorführt, ist damit am besten vertreten.
- [ ] **Frist und Formular:** Abgabeschluss und Pflichtfelder aus der Ausschreibung hier eintragen: ______ (steht nicht im Repository).

## 2. Fünf Menschen probieren es ohne Erklärung aus

Das ist der wertvollste Test, der noch fehlt, und er kostet nur Zeit. Erfahrungsgemäß zeigen schon fünf Personen die meisten Stolpersteine.

**Ablauf (je zehn Minuten, am besten Menschen, die WaterLink nicht kennen):**

1. Handy oder Laptop geben, den Ausprobier-Link öffnen, **nichts erklären**. Bitten, laut zu denken.
2. Aufgabe 1: „Du willst Wasser holen. Funktioniert Borehole A heute?“
3. Aufgabe 2: „Borehole A gibt kein Wasser mehr. Melde das.“
4. Aufgabe 3 (Rolle Techniker): „Übernimm den Auftrag und melde ihn repariert.“
5. Aufgabe 4: „Wohin würdest du jetzt gehen, und warum?“
6. Frage zum Schluss: „Was bedeutet *Working*?“ Wenn jemand „das Wasser ist sauber“ antwortet, ist das ein Befund: die Sicherheitszeile ist dann zu leise.

**Aufschreiben:** Wo gezögert wurde, welche Wörter nicht verstanden wurden, was angetippt wurde, ohne dass etwas geschah. Nicht erklären, nicht verteidigen. Ergebnisse als kurze Liste in den Arbeitsstand; Dinge, die zwei oder mehr Personen stolpern ließen, kommen in die Roadmap (P2).

## 3. Kiswahili prüfen lassen

Die Tafel gibt es auf Kiswahili, aber die Texte sind ein Entwurf (die Tafel sagt das selbst). Vorab sind sie gegen veröffentlichte Kiswahili-Texte abgeglichen und danach verbessert worden ([Quellenprüfung](KISWAHILI-QUELLENPRUEFUNG.md)); eine Muttersprachlerin oder ein Muttersprachler hat sie noch nicht gesehen. Besonders wichtig ist der Satz, dass „Working“ nichts über die Wasserqualität aussagt.

1. Eine Person finden, die Kiswahili als Muttersprache oder sehr gut spricht (Bekannte, Hochschule, Teilnehmende des Hackathons, Diaspora-Gruppen, Freiwillige vor Ort). Wenn möglich jemand aus Westkenia, weil dort Busia liegt.
2. Ihr den **[Prüfbogen](KISWAHILI-PRUEFBOGEN.md)** geben (englische Anleitung, sieben offene Fragen, alle Tafeltexte Englisch/Kiswahili nebeneinander). Das dauert rund 30 Minuten. Gerne zusätzlich die Tafel selbst zeigen: `/?view=display&lang=sw`.
3. Die Korrekturen einarbeiten; die Schritte stehen am Ende des Prüfbogens (`draft: null` setzen, Test anpassen, `npm run export:sw`).
4. Name und Datum der Prüfung in den Arbeitsstand schreiben. **Bis dahin nirgends als „geprüft“ bezeichnen.**

Der Prüfbogen wird aus dem Code erzeugt (`npm run export:sw`); ein Test schlägt an, wenn er nicht mehr zu den Texten passt.

## 4. Echte Geräte, Papier und Screenreader

Bisher wurde nur emuliert (Chrome mit 375 px und Touch, ein PDF des Druckblatts, automatische Prüfung mit axe). Das fängt viel, aber nicht alles. Tabelle ausfüllen, Abweichungen in die Roadmap.

| Gerät oder Mittel | Was tun | Erwartet | Ergebnis |
|---|---|---|---|
| Android-Handy, Chrome | Ausprobier-Link öffnen, ganze Geschichte spielen | alles bedienbar, nichts schneidet ab, Tasten gut zu treffen | |
| iPhone, Safari | dasselbe; zusätzlich Tafel `/?view=display` | wie oben; Schrift und Layout stimmen | |
| Handy, Koordination | Ausprobier-Link, Koordination: **Add a water point** → **Pick on the map** → auf die Karte tippen | die Seite springt zur Karte und zurück zum Formular, die Position steht im Feld, das Fadenkreuz liegt dort, wo getippt wurde | |
| Schwaches Handy oder Netz (Chrome: Entwicklertools → Network „Slow 4G“, CPU „4× slowdown“) | Statusseite laden | Wasserstellen erscheinen schon, bevor alle Skripte da sind | |
| Flugmodus | Tafel offen lassen, Flugmodus an, später aus | „No connection …“ mit Uhrzeit; nach der Rückkehr aktualisiert sich die Tafel | |
| Draußen im Sonnenlicht | Tafel am Handy oder Laptop ansehen | Status und Überschrift gut lesbar; sonst Roadmap „Hochkontrast“ vorziehen | |
| Großer Bildschirm oder Fernseher | Tafel im Vollbild, aus 3 bis 5 m ansehen | Status in jeder Zeile aus der Entfernung lesbar | |
| Papier | Statusseite → **Print sheet**, A4, einmal in Farbe und einmal schwarzweiß | eine Seite; Status ohne Farbe erkennbar (Symbol und Wort) | |
| QR-Code | vom Bildschirm und vom Ausdruck mit der Handykamera scannen | öffnet die SMS-Ansicht | |
| Screenreader: NVDA (Windows, kostenlos) mit Chrome | Statusseite, dann Meldung senden | Überschrift, jede Wasserstelle samt Status wird vorgelesen; Felder haben Namen; Ergebnis („Report sent“) wird angesagt | |
| Screenreader: VoiceOver (iPhone) oder TalkBack (Android) | dasselbe auf dem Handy | wie oben | |
| Systemeinstellung „Bewegung reduzieren“ an | Tafel offen lassen, Status ändern | die Zeile wird markiert („Zeile geändert“), ohne Animation | |

## 5. Fachleute und Partner ansprechen

Software allein macht keinen Pilot. Der erste Schritt ist ein Gespräch, kein Vertrag. Fragen und Ablauf stehen in [Weg zum Produkt](WEG-ZUM-PRODUKT.md), Abschnitt 5. Hier die Praxis:

**Wen ansprechen (Arten, keine geprüften Adressen):** die Wasserabteilung des Countys (für Busia), Wasserversorger und Wartungsdienste im Land, NGOs, die Wasserstellen betreuen, das Team der Water Point Data Exchange (Quelle unserer Orte), das Smart-Handpump-Team in Oxford (Quelle der Sensordaten). Auch eine einzelne Fachperson aus dem Wasserbereich, die zehn Minuten kritisiert, hilft: Sind 12 Stunden eine sinnvolle Frist? Reicht „Weg zuerst prüfen, dann als Alternative nennen“?

**Entwurf für die erste Nachricht (Englisch, anpassen):**

> Hello [name], we are a small team and built WaterLink, a prototype that shows people whether their water point works today, and that tracks a repair from the first report to a confirmed test. The places come from WPdx (Busia); people, confirmations and routes in the demo are simulated, and we have not tested it in Kenya. We would value 15 minutes of your view on one question: [your question]. You can try it without a login here: [link]. Thank you for your time.

**Was mitbringen:** das Druckblatt (Print sheet), den QR-Code, den Ausprobier-Link, die Grenzen in zwei Sätzen. Nichts versprechen, was die Software nicht tut (vor allem keine Aussage zur Wasserqualität).

**SMS und Konten (später, mit Partner):** ein SMS-Anbieter in Kenia (zum Beispiel Africa’s Talking, nicht geprüft) für echte `STATUS`-Abfragen, Konten pro Wasserstelle, normalisierte Datenbank. Die Logik für SMS steht in `web/lib/sms.ts`; es fehlt der Anschluss und ein Partner, der Bestätigungen leistet.

## 6. Übergabe und Betrieb klären

- Wem gehört die Live-Seite? Sie läuft im Cloudflare-Konto von Reczec. Wer soll sie dauerhaft betreiben, und wer kennt den Zugangscode (liegt nur lokal in `web/.env.demo-access`)? Siehe [Bereitstellung](BEREITSTELLUNG.md).
- Nach der Einreichung: soll die Live-Seite weiterlaufen, und wie lange? Die Demo setzt sich nach vier Stunden Stille selbst zurück; Kosten und Grenzen des Cloudflare-Tarifs im Konto nachsehen.
- Wer pflegt das Repository weiter, wenn es öffentlich ist (Fragen, Hinweise)?
