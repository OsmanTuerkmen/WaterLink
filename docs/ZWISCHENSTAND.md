# Arbeitsstand WaterLink

**Zuletzt aktualisiert: 22. Oktober 2026, abends · Branch `main`.**

Offene Aufgaben und Ideen stehen in der [Roadmap](ROADMAP.md). Hier steht nur, wie der Stand ist und was zuletzt geprüft wurde. Ältere Berichte und das vollständige Protokoll bis 21.10.2026: [Archiv](archiv/).

## Ziel

Zuerst eine verlässlich funktionierende App: Haushalte sehen den letzten bestätigten Betriebszustand und mögliche Alternativen; Betreiber melden, Techniker bearbeiten und Betreiber bestätigen eine Reparatur ausdrücklich. Danach kommen Pitch und Drei-Minuten-Vorführung. Ein Feldpilot ist noch nicht vereinbart.

## Stand

- **Offen für Menschen:** Einreichung, Fünf-Personen-Test, Kiswahili-Prüfung, echte Geräte und Screenreader, Partner: mit Anleitung und Listen in [Menschen](MENSCHEN.md). **Das Repository ist privat** (anonymer Abruf liefert 404); die Jury sieht den Code erst nach Freigabe durch Osman.
- **Repository:** Alles liegt auf `main`. Die früheren fünf Branches wurden hineingeführt (reines Vorspulen, kein Commit verloren) und gelöscht; Übersicht und Wiederherstellung in der [Branch-Geschichte](archiv/BRANCH-GESCHICHTE.md).
- **App:** Haushaltsstatus mit Karte, öffentliche Tafel, Feld-App für Betreiberin und Techniker, Koordination, simulierte SMS und Pitch-Bühne sind implementiert. Orte stammen aus echten WPdx-Erhebungen (Busia), historische Sensordaten aus Kwale 2014; Bestätigungen, Personen und Wege sind simuliert und gekennzeichnet.
- **Zugang:** Signiertes Cookie mit serverseitig geprüftem Ablauf, Anmeldeversuche pro Client und global begrenzt; ein gesperrter Client sperrt nicht mehr alle anderen.
- **Demo-Daten:** Nach vier Stunden ohne Aktivität setzt sich die Demo mit frischen simulierten Bestätigungen selbst neu an.
- **Erste Ansicht vom Server:** Das HTML enthält schon den aktuellen Stand (auch ohne JavaScript und bei langsamer Verbindung). Eine Seite, deren Skripte nach 30 s nicht starten, lädt sich neu; ohne JavaScript fordert ein Meta-Refresh alle 60 s neues HTML an (Sicherheitsnetz gegen ein „eingefrorenes Grün“).
- **Weg und Zugang prüfen, Wasserstellen anlegen:** Koordination kann den Weg einer Stelle prüfen (Gehzeit, Beschreibung, Öffnungszeiten, ausdrückliches „ich bin den Weg gegangen“), Zugang als gesperrt melden und Stellen anlegen oder (angelegte) entfernen. Erst danach nennt WaterLink eine neue Stelle als Alternative. Vorher gab es dafür keinen Befehl; die Alternative hing am Beispieldatensatz. Außerdem: Hinweis auf mögliche Doppelerfassungen im Datensatz, SMS-Teile nach Kodierung, Hinweis „draft translation“ auf der Kiswahili-Tafel, beschriftete Bühne im Ausprobier-Modus.
- **Position angelegter Wasserstellen:** Beim Anlegen kann eine Position (Breite, Länge, wie Google Maps sie kopiert) angegeben werden, höchstens 15 km vom Treffpunkt; die Stelle erscheint dann auf der Karte. Ohne Position bleibt sie nur in der Liste. Der **Prüfbogen für die Kiswahili-Übersetzung** (`docs/KISWAHILI-PRUEFBOGEN.md`) wird mit `npm run export:sw` aus den Tafeltexten erzeugt; ein Test hält ihn aktuell.
- **Ausprobier-Modus (Sandbox):** Jeder kann den ganzen Ablauf ohne Zugangscode mit Übungsdaten durchspielen, nur auf dem eigenen Gerät (`/?view=stage&sandbox=1`, Knopf „Try it yourself“, Angebot im Anmeldefeld). Dieselben Regeln laufen im Browser, der Server sieht nichts.
- **Tafel auf Kiswahili und QR-Code:** Umschalter unten auf der Tafel (`?lang=sw`), QR-Code zur SMS-Ansicht. **Die Kiswahili-Texte sind ein Entwurf ohne Prüfung durch Muttersprachler.**
- **Sicherheitsmeldungen der Abhängigkeiten:** `npm audit --omit=dev` meldet nichts mehr (Next 16.4.2, React 19.3.1); 20 Meldungen in Entwicklungswerkzeugen bleiben (Roadmap, P3). Ereignisprotokoll auf 200 Einträge begrenzt.
- **Browser-Tests:** 33 Tests mit Playwright und Chrome (`npm run test:e2e`), auch als CI-Auftrag.
- **Oberfläche:** Alle Bedienelemente bei 375 px mindestens 44 px, eine h1 pro Ansicht, Schrift in rem (Textgröße des Browsers gilt, bis 200 % ohne Überbreite), alle Farben aus Tokens, Kontrast mindestens 4,5:1, Bewegungsreduktion mit ruhigem Ersatzsignal. Regeln in [`DESIGN.md`](../DESIGN.md).
- **Live-Seite:** https://waterlink-demo.waterlink.workers.dev wurde am 22.10. mit dem Stand `2f43771` bereitgestellt (Konto von Reczec, Zugangscode unverändert), siehe [Bereitstellung](BEREITSTELLUNG.md). Die Kartenposition für angelegte Stellen (`34afc19`) ist **noch nicht live**; dafür `npm run deploy:cloudflare` im Ordner `web/`.
- **Aufräumen am 22.10.:** Dokumentation neu geordnet (Wegweiser [`docs/README.md`](README.md), Roadmap, Archiv), README für Neueinsteiger neu geschrieben. Ungenutzter Code aus einer UI-Vorlage (`web/components/ui/` und Verwandtes, 61 Dateien) und 19 Abhängigkeiten sind entfernt (Abhängigkeiten 27 → 8). MIT-Lizenz ergänzt. Das Bereitstellungsskript ändert einen vorhandenen Zugangscode nicht mehr, wenn die lokale Datei fehlt.
- **Autorenangaben:** Die Historie wurde am 22.10. umgeschrieben: Commits mit Claude als Autor oder Co-Autor tragen jetzt Osman (`OsmanTuerkmen`) als Autor beziehungsweise Co-Autor, die Claude-Sitzungslinks in den Commit-Texten sind entfernt. Dateien und Anzahl der Commits sind unverändert, alle Hashes ab dem ersten betroffenen Commit sind neu.

## Letzte Prüfungen (selbst ausgeführt)

| Prüfung | Datum | Ergebnis |
|---|---|---|
| `npm test` (nach Kartenposition und Prüfbogen) | 22.10.2026 abends | 81/81 bestanden (neu: Position angelegter Stellen, Lesen der Koordinaten, Prüfbogen passt zu den Texten) |
| `npm run typecheck`, `npm run lint`, `npm run build` | 22.10.2026 abends | alle drei Exit-Code 0 |
| `npm run test:e2e` (vollständig, lokal) | 22.10.2026 abends | 33/33 bestanden (neu: angelegte Stelle mit Position erscheint auf der Karte, zu weit entfernte Position wird abgelehnt) |
| `npm run test:integration` (`npm run dev`), `npm run test:access` (Code-Modus, lokal mit Test-Code, danach `.dev.vars` gelöscht) | 22.10.2026 abends | bestanden, 11/11. Der Integrationstest prüft jetzt auch Position und Ablehnung einer zu weit entfernten Stelle |
| Repository und Historie auf Zugangscode und Schlüsseldateien durchsucht (der aktuelle Code gegen alle Commits, ohne ihn auszugeben) | 22.10.2026 abends | kein Fund; `.env*` und `.dev.vars*` sind ausgeschlossen. Anonymer Abruf des Repositorys liefert 404 (privat), die Live-Seite 200 |
| `npm test` (nach Weg-/Zugangsprüfung, Anlegen von Stellen, SMS-Kodierung) | 22.10.2026 abends | 78/78 bestanden |
| `npm run test:e2e` (nach den neuen Funktionen), `npm run lint`, `npm run build` | 22.10.2026 abends | 32/32 bestanden, Lint und Build Exit-Code 0. Neu: Stelle anlegen → bestätigen → Alternative bleibt B, bis der Weg geprüft ist → danach die nähere neue Stelle → Sperre nimmt sie heraus → entfernen; axe auf beiden neuen Formularen |
| Browser-Tests ohne Datenänderung gegen die Live-Seite **nach der Bereitstellung der neuen Funktionen** (Wasserstelle anlegen und Weg prüfen im Ausprobier-Modus, Tafel, Sprache, axe, Handybreite, Druck) | 22.10.2026 abends | 30/30 bestanden; gemeinsamer Zustand unverändert (Revision 12, 60 Wasserstellen, keine Aufträge). Gegen den Produktions-Build lokal ebenfalls 30/30 |
| **Nicht geprüft** | | Physische Geräte, echter Screenreader, Bewegungsreduktion im echten Browser, Papierausdruck, Kiswahili durch Muttersprachler, Ablauf Melden → Reparieren → Bestätigen auf der Live-Seite mit dem Zugangscode, die Kartenposition auf der Live-Seite (noch nicht bereitgestellt) und die CI zu den Commits dieser Einheit (noch nicht angesehen). Anleitung dazu in [Menschen](MENSCHEN.md). |

## Protokoll

### 22.10.2026, abend – Offenes zusammengefasst (`34afc19` und Doku)

- **Kartenposition für angelegte Wasserstellen** (`add_point` mit Breite und Länge, höchstens 15 km vom Treffpunkt, im Formular „Position on the map“); die Lücke „Karte kennt nur Busia“ ist damit für Busia geschlossen, ein Setzen per Tipp auf die Karte bleibt offen.
- **Prüfbogen Kiswahili** aus den echten Tafeltexten erzeugt (`npm run export:sw`), mit Test gegen Abweichungen. Die Prüfung selbst steht weiter aus.
- **Neue Anleitung [Menschen](MENSCHEN.md):** Einreichung, Fünf-Personen-Test mit Aufgaben, Prüfbogen, Tabelle für echte Geräte, Papier und Screenreader, Vorlage für die erste Nachricht an Fachleute, Betriebsfragen. Die Roadmap verweist darauf; veraltete Stellen in Demo, Architektur und README wurden korrigiert.
- **Gefunden:** Das Repository ist privat (anonymer Abruf: 404). Ohne Freigabe sieht die Jury den Code nicht. Entscheidung bei Osman; in der Roadmap als P1. Im Repository und seiner Historie liegt kein Zugangscode.
- **Bewusst nicht gemacht:** keine neue Bereitstellung (die Live-Seite steht auf `2f43771`, die Position fehlt dort noch); keine Übersetzungsprüfung, keine echten Geräte, keine Gespräche (brauchen Menschen).

### 22.10.2026, 14:03 Europe/Vienna – Codex: Kontext für Projektbeschreibung und Einreichung abgeglichen (Basis `d4fcba1`, ohne Commit)

- GitHub abgerufen und Branches, Issues, PRs sowie letzten CI-Lauf geprüft; README, Dokumentationswegweiser, Produkt, Arbeitsstand, Roadmap, Übergabe, Branch-Geschichte, Architektur, Demo und Produktgrenzen gelesen. Änderungen seit dem früheren Review anhand der Historie und zentraler Implementierung nachvollzogen.
- CI-Lauf #11: Node 22, Node 24 und Browser-Tests erfolgreich. Lokale Tests, Build und Live-Prüfungen nicht wiederholt. Ältere Angaben wie „25 Browser-Tests“ im Stand sind durch die neueren Prüfzeilen mit 30 Tests überholt.
- Parallele lokale Entwicklung an `web/lib/domain.ts` und `web/tests/domain.test.ts` erkannt (unter anderem Wege-/Zugangsprüfung, eigene Wasserstellen und Hinweise auf mögliche doppelte Erhebungen). Nicht verändert und nicht als fertig oder bereitgestellt bewertet. Keine Codeänderung, kein Commit, Push, Merge oder Deployment durch Codex.
- Zweck: anschließendes Ausfüllen der Projektangaben anhand belegter Fähigkeiten, mit klarer Trennung zwischen Umsetzung, Simulation und geplanten Erweiterungen. Offene Aufgaben bleiben in der Roadmap.

### 22.10.2026, abends (später) – Funktion vervollständigt

- **Lücke gefunden:** Die Fachregeln kannten keinen Befehl, der Weg, Zugang oder Öffnungszeiten setzt. Alternativen gab es deshalb nur für die fest eingetragene Stelle B. Neu: `verify_access`, `close_access`, `add_point`, `remove_point` (nur Koordination), Oberfläche in der Koordination, Server-Prüfung in `parseCommand`, Ausprobier-Modus automatisch mit.
- **Datenfund:** 22 Paare von Erhebungseinträgen liegen höchstens 50 m auseinander, alle aus verschiedenen Erhebungen (35 von 60 Einträgen beteiligt). Die „60 Wasserstellen“ sind also deutlich weniger verschiedene Orte. Jetzt als Hinweis in den Details, Auflösung in der Roadmap (P3).
- **SMS-Zählung** nach Kodierung (GSM-7, Erweiterungstabelle, UCS-2), mit Test. **Kiswahili-Tafel** sagt selbst, dass die Übersetzung ein Entwurf ist. **Bühne im Ausprobier-Modus** heißt jetzt „Practice mode“ und „Reset practice data“.
- Sieben Commits dieses Tages auf `main` (`b5f98fc` bis `8dc8e38` und der Doku-Nachtrag), mit `npm run deploy:cloudflare` bereitgestellt, Zugangscode unverändert.
- **Nicht umgesetzt:** Prüfung der Übersetzung (braucht Muttersprachler), Koordinaten beim Anlegen (Karte kennt nur Busia), Weg-/Zugangsmeldung durch Betreiber:innen.

### 22.10.2026, abends – Ausprobier-Modus

- **Anlass:** Das Produkt wird eingereicht und von Beurteilern benutzt, die den Zugangscode nicht haben; ohne Modus könnten sie nur zuschauen.
- **Umsetzung:** `lib/sandbox.ts` (dieselben Regeln, `applyLocal`), `lib/actors.ts` (die drei Personen, vorher in `session.ts`), `resetState` in `domain.ts` (vorher doppelt in `store.ts`), Umschaltung in `store.tsx`, `sandbox.tsx` (Banner, Knopf), Angebot in `signin.tsx`, `?sandbox=1` auf dem Server (erste Ansicht aus den Startdaten, ohne Datenbankzugriff).
- **Bewusste Grenze:** Je Tab, nicht zwischen Tabs oder Geräten geteilt (Roadmap).
- **Gefunden durch einen Lauf der Tests gegen die Live-Seite:** Auf dem lokalen Server bestanden alle Tests, live schlug einer fehl. Ursache: Die Rechneruhr ging hier rund 9 Sekunden hinter der Serveruhr. Die Übungsdaten bekamen Zeitstempel in Serverzeit, nach einem Neuladen galt aber die Geräteuhr, die Einträge lagen „in der Zukunft“ und die Wasserstelle erschien als „unklar“. Behoben: Der Ausprobier-Modus nutzt nur die Geräteuhr. Neuer Test mit einer um 5 Minuten nachgehenden Uhr (scheitert auf dem alten Stand live, besteht auf dem neuen). Lehre: Zeitlogik mit echtem Netz prüfen.
- **Tests gegen die Live-Seite:** `E2E_BASE_URL=<Adresse> npm run test:e2e -- e2e/sandbox.spec.ts e2e/board.spec.ts e2e/quality.spec.ts` führt nur Tests aus, die nichts am gemeinsamen Demo ändern; die anderen verweigern den Lauf gegen einen fremden Server.

Ältere Einträge (22.10.2026 nachmittags und früher) und die zugehörigen Prüfzeilen: [Archiv](archiv/PROTOKOLL-22-10-2026-bis-nachmittags.md).
