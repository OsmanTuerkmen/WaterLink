# Arbeitsstand WaterLink

Lebendes Dokument: Es wird nach **jedem** Arbeitsschritt aktualisiert. Oben steht immer der aktuelle Stand, unten das Protokoll (neueste Einträge zuerst).

**Zuletzt aktualisiert:** 11. Oktober 2026, ca. 11:50 Uhr (Kenia: EAT) · Branch `claude/waterlink-redesign` (Redesign zum Vergleich mit `claude/waterlink-mvp`)

## Ziel

Bis zum Hackathon am **22. Oktober 2026** (10–22 Uhr, Track Social Impact):

1. Eine private, bereitgestellte Demo, die auf zwei Geräten funktioniert: Arbeitsansicht und öffentliche Statustafel.
2. Ein sicherer Drei-Minuten-Ablauf: Ausfall melden → Tafel zeigt Ausfall und Alternative → Techniker übernimmt und meldet Reparatur → Betreiberin bestätigt Funktion ([Demo-Skript](DEMO.md)).
3. Eine einfache, schöne und gut lesbare Oberfläche.
4. Ehrliche Antworten auf „Was ist echt, was fehlt?“ ([Weg zum Produkt](WEG-ZUM-PRODUKT.md)).

## Aktueller Stand

**Fertig und geprüft**

- **Redesign (dieser Branch):** englische Oberfläche „gelber Kanister“ mit fünf Ansichten: Status für Haushalte, öffentliche Tafel, Handy-App für Betreiberin und Techniker, Koordination, Pitch-Bühne mit beiden Handys und Tafel nebeneinander. Karte aus WPdx-Koordinaten und OpenStreetMap-Straßen. Fachregeln unverändert, nur Texte übersetzt.
- Kompletter manueller Ablauf: Meldung → Auftrag → Übernahme → Fortschritt und Blockierungen → Reparaturmeldung → ausdrückliche Funktionsprüfung. Betriebszustand und Auftragsstand sind getrennt. Rollen werden auf dem Server geprüft.
- Öffentliche Statustafel (`?view=display`): große Zeilen, Status als Wort und Symbol, Bestätigungszeit, Alternative, deutlicher Hinweis bei fehlender Verbindung.
- Arbeitsansicht: Die Frage steht oben, die Karten sind auf das Wesentliche reduziert, Details sind aufklappbar, die Schrift ist größer.
- Unsicherheit: veraltet nach 12 Stunden, widersprüchlich, offline, Sensorhinweis. Ein alter grüner Status wird nie als aktuell gezeigt.
- Echte Orte: 60 Wasserstellen aus WPdx-Erhebungen in Busia (Marachi East), jetzt im Repo (`web/data/region.json`). A und B sind zwei Bohrlöcher, Erhebung 12/2023.
- Echte Sensordaten als Wiedergabe: Handpumpe Tiwi – Mshikeni (Kwale, 2014) mit Ausfallerkennung. Daraus wird nur ein Hinweis zur Prüfung, nie ein Status.
- Diktat der Störungsbeschreibung über die Spracherkennung des Browsers (optional).
- Dokumente: [Konzept](KONZEPT.md), [Architektur](ARCHITEKTUR.md), [Demo-Skript](DEMO.md), [Weg zum Produkt](WEG-ZUM-PRODUKT.md).

**Letzte Prüfungen (11.10.2026, Redesign-Branch)**

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 39 von 39 bestanden |
| `npm run typecheck`, `npm run build` | bestanden |
| `npm run test:integration` gegen lokale Vorschau (Port 5174) | bestanden |
| Kompletter Ablauf auf der Pitch-Bühne (melden, übernehmen, starten, Reparatur melden, bestätigen) | bestanden |
| Ansichten bei 1440 px und 390 px angesehen, zwei Prüfrunden | bestanden, Korrekturen eingearbeitet |
| Design-Detektor (`impeccable detect`) | keine Befunde |

**Davor (11.10.2026, zweiter Rechner, frischer Klon)**

| Prüfung | Ergebnis |
|---|---|
| `npm ci`, `npm test` | 39 von 39 bestanden |
| `npm run typecheck`, `npm run build` | bestanden |
| Dev-Server mit neuer lokaler Datenbank: Arbeitsansicht und Tafel zeigen Busia-Orte | bestanden |

**Davor (10.10.2026, Rechner von Osman)**

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 39 von 39 bestanden |
| `npm run typecheck` | bestanden |
| `npm run build` | bestanden |
| `npm run test:integration` gegen lokale Vorschau | bestanden |
| Kompletter Demo-Ablauf im Browser mit Busia-Daten | bestanden |
| Sensorhinweis → Karte und Tafel zeigen „Unklar · Sensorhinweis“ | bestanden |

## Offene Aufgaben

Priorität: **P1** = nötig für die Hackathon-Demo, **P2** = macht die Demo besser, **P3** = nach dem Hackathon.

| # | Prio | Aufgabe | Wer | Status |
|---|---|---|---|---|
| 1 | P1 | Busia-Daten (`web/data/region.json`) committen, damit die bereitgestellte Demo echte Orte zeigt. | Nutzer entschieden: ja | erledigt |
| 2 | P1 | Private Sites-Bereitstellung durchführen. Das Projekt ist registriert (`web/.openai/hosting.json`), es gibt noch keine bestätigte Live-Bereitstellung. Kein zweites Projekt anlegen. | Claude mit Nutzer | offen |
| 3 | P1 | Auf der Bereitstellung prüfen: Anmeldung, Datenbank, Ablauf auf zwei echten Geräten. | Claude mit Nutzer | offen |
| 4 | P1 | Kurz vor dem Pitch die Demo zurücksetzen: simulierte Bestätigungen altern nach 12 Stunden. | Nutzer am 22.10. | offen |
| 5 | P2 | Diktat in Chrome einmal mit Mikrofon ausprobieren. Ohne gesprochene Eingabe konnte Claude es nicht testen. | Nutzer | offen |
| 6 | P2 | Tafel bei fehlender Verbindung einmal ansehen (Browser offline schalten). Der Code ist geprüft, die Ansicht noch nicht. | Claude | offen |
| 7 | P2 | Seite „Störung melden“ vereinfachen: zwei Schritte statt zwei gleich gewichteter Formulare nebeneinander. | Claude | offen |
| 8 | P2 | Simulierte SMS-Ansicht für Haushalte mit einfachem Handy, klar als nicht angeschlossen gekennzeichnet. | Claude | offen |
| 9 | P2 | Pitch: Folien oder Ablauf, Screenshots aus dem echten Build. | Nutzer und Claude | offen |
| 11 | P1 | Redesign oder alte Oberfläche? Reczec hat sich am 11.10. für das Redesign entschieden; die Arbeit geht auf `claude/waterlink-redesign` weiter. Zusammenführen erst, wenn Osman zugestimmt hat. `claude/waterlink-mvp` bleibt bis dahin unverändert. | Osman bestätigt | teilweise |
| 12 | P2 | Redesign: Bühne auf dem echten Beamer-Format testen (1920 × 1080 und 1280 × 720). | Nutzer | offen |
| 10 | P3 | Partner vor Ort finden (County, NGO, Wartungsdienst, Smart-Handpump-Team in Oxford) und Gespräche führen, siehe [Weg zum Produkt](WEG-ZUM-PRODUKT.md). | Team | offen |

## Bewusste Grenzen

- Personen, Bestätigungen, Wege und Öffnungszeiten sind simuliert und so gekennzeichnet.
- WPdx-Erhebungen und Kwale-Sensordaten sind echt, aber historisch. Sie zeigen nie den heutigen Zustand.
- Die 12-Stunden-Frist ist ein Demo-Parameter. Rollenwechsel ist eine Demo-Funktion, keine Benutzerverwaltung.
- Keine SMS, Live-Sensoren, KI-Dienst oder Bezahlung. Keine Aussagen über eingesparte Wege oder Reparaturzeiten ohne Feldprüfung.
- Software beschafft kein Geld, keine Ersatzteile und kein Personal.

## Protokoll

### 11.10.2026, ca. 12:00 – Weiter auf dem Redesign-Branch

Reczec gefällt das Redesign. Es wird separat auf `claude/waterlink-redesign` weiterentwickelt, ohne Zusammenführung, solange Osman nicht erreichbar ist.

### 11.10.2026, ca. 11:50 – Redesign „gelber Kanister“ (Branch `claude/waterlink-redesign`)

- Auf Wunsch des Nutzers: alles auf Englisch, eigener Stil, sympathisch und leicht bedienbar, auf eigenem Branch zum Vergleich. Stilrichtung aus drei Vorschlägen gewählt: „Der gelbe Kanister“.
- Neue Oberfläche in `web/components/waterlink/` (fünf Ansichten, siehe Architektur). Statuszeichen: Kanister, dessen Wasserstand die verbleibende 12-Stunden-Gültigkeit zeigt. Pitch-Bühne `?view=stage` mit eigener Sitzung je Rolle.
- Fachlogik, Server- und Importtexte ins Englische übersetzt (Regeln unverändert). Busia-Daten mit englischen Texten neu erzeugt. Neu: `web/scripts/import-osm.mjs` und `web/data/osm-area.json` (22 Wege, 3 Märkte, ODbL).
- Schriften Archivo und Atkinson Hyperlegible Next lokal über Fontsource. `PRODUCT.md` und Gestaltungsvertrag unter `.impeccable/` angelegt.
- Bewusst offen: Swahili, echte SMS, Prüfung auf Beamer. Die alte Oberfläche bleibt unverändert auf `claude/waterlink-mvp`.
- Unabhängige Gestaltungsprüfung in zwei Runden (Urteil jeweils „fix“), alle Punkte eingearbeitet: Kartenmarker mit Statussymbol und ohne Überlappung, Alternative schon in der Zusammenfassung oben, schlankerer Kopf auf dem Handy, Handy-App randlos, flache Buchstabenfelder, Tafel nutzt die ganze Höhe, Hinweiszeile in Schwarz statt Link-Blau. Danach erneut geprüft: 39 Tests, Typprüfung, Build, Integrationstest, Design-Detektor ohne Befund. Gestaltungssystem in `DESIGN.md`.

### 11.10.2026, ca. 11:00 – Zweiter Rechner, Busia-Daten im Repo

- Repo auf einem zweiten Rechner (GitHub `Reczec`) geklont; alle Branches gelesen. Keine PRs oder Issues.
- Entscheidung des Nutzers: Busia-Daten committen. `npm run data:wpdx -- --county Busia` ergab dieselbe Nachbarschaft wie am 10.10. (Marachi East, 60 Stellen, A und B Bohrlöcher von 12/2023).
- Befund: npm 12 blockiert die Install-Skripte von `esbuild` und `workerd`; Build und Dev-Server laufen trotzdem.
- Bewusst offen: Integrationstest auf diesem Rechner noch nicht ausgeführt (Port 5173 belegt, Vorschau läuft auf 5174).

### 10.10.2026, ca. 23:45 – Arbeitsstand als lebendes Dokument

Auf Wunsch des Nutzers wird dieses Dokument nach jedem Schritt aktualisiert: Ziel, Stand, offene Aufgaben, Protokoll. Produktionsbuild nach den Oberflächenänderungen geprüft: bestanden.

### 10.10.2026, ca. 23:30 – Echte Sensordaten als Wiedergabe (`a3443ce`)

- Recherche: Es gibt keine öffentliche Live-Quelle für den Betriebszustand von Wasserstellen in Kenia. Die nächstbeste echte Quelle sind historische Smart-Handpump-Daten aus Kwale (openwashdata/waterpumpkwale, CC BY 4.0).
- `web/scripts/import-kwale.mjs` lädt die Daten (festgelegt auf einen Commit) nach `web/data/kwale-sensors.json`. Standard: Tiwi – Mshikeni mit drei Nachbarn, Jahr 2014. Grund: Für diese Pumpe gibt es 2015 praktisch keine Daten.
- `web/lib/sensor.ts`: Ein Hinweis entsteht erst nach zwei Wochen in Folge unter 10 % des üblichen Werts. Fehlende Werte gelten nie als Ausfall. Ausfallwochen zählen nicht in den Vergleichswert.
- Demo-Szenario „sensor“: Wasserstelle A zeigt „Unklar · Sensorhinweis“, es entsteht kein Auftrag. Eine Meldung oder Prüfung vor Ort löst den Hinweis auf.
- Neu: [Weg zum Produkt](WEG-ZUM-PRODUKT.md). Demo-Skript, Architektur und README ergänzt. 5 neue Tests (39).

### 10.10.2026, ca. 23:15 – Einfachere Oberfläche (`64d9df2`)

- Öffentliche Anzeige neu als Statustafel. Vorher war sie eine Kopie der Arbeitsansicht mit 9–11 px Schrift.
- Arbeitsansicht: Werbe-Kopfbereich, Filter und doppelte Infokästen entfernt. Karten zeigen Status, Hinweis, Bestätigungszeit, Gehzeit und Alternative. Größere Schrift überall.
- Diktat für die Störungsbeschreibung. Kein Warnbanner-Blitzen mehr beim Laden. Demo-Abzeichen „Bestätigungen simuliert“ bei echten Orten.
- Kompletter Ablauf im Browser mit Busia-Daten geprüft.

### 10.10.2026, ca. 22:15 – Busia statt Kitui, Statuskorrektur (`c080c67`)

- Befund: Bei Evidence Action Kenya 2023–2024 (18.783 Einträge) steht `status_clean` immer auf „Non-Functional“, `status_id` („Wasser am Erhebungstag?“) aber meist auf „Yes“. Dadurch galt jede Erhebung seit 2022 als defekt.
- Korrektur: Bei einem konstanten `status_clean` und wechselndem `status_id` gilt `status_id`, angezeigt als „Wasser am Erhebungstag: ja/nein“. A und B werden bevorzugt aus Erhebungen der letzten 3 Jahre gewählt (`--recent`).
- Import Busia: A und B sind zwei Bohrlöcher von 12/2023, 200 m voneinander entfernt.

### 10.10.2026, abends – Echte Wasserstellen aus WPdx (`ccdc416`, `6fa3564`)

- `web/scripts/import-wpdx.mjs` lädt ein County aus der Water Point Data Exchange und wählt eine begehbare Nachbarschaft. Ergebnis: `web/data/region.json` mit Quellenangabe.
- A, B und C sind echte erfasste Stellen mit simulierten Bestätigungen. Weitere Stellen stehen in einer durchsuchbaren Liste, heute unbestätigt.
- Erster Versuch mit Kitui ergab eine 64 km entfernte „Alternative“. Seitdem gelten Radius (5 km) und Gehdistanz (3 km).

### 10.10.2026, abends – Prüfung und Korrekturen nach Zwei-Fenster-Test (`89d2eb7`)

- Geprüft: Fachregeltests, Integrationstest, kompletter Ablauf in zwei Browserfenstern, Breiten von 390 bis 1440 px, Druckansicht.
- Behoben: Direktlinks und Zurück-Taste, unlesbare Auftragszahl, Rollentext mit falschem Artikel, vorausgewähltes „Funktioniert“, Gültigkeitsangabe auf Karten, Statusblatt auf eine Seite A4, Alter offener Aufträge, Symbole im Verlauf.
- Lokale, nicht committete Änderungen von Codex zusammengeführt (`76f452c`).

### 10.10.2026 – Erster Zwischenstand (`ae2e42c`, Codex)

React/TypeScript-Oberfläche, Vinext/Cloudflare-Worker-API, persistente D1-Datenhaltung, manueller Kernablauf mit fiktiven Ausgangsdaten. Fachregeln in `web/lib/domain.ts`.

## Ablage

GitHub: `OsmanTuerkmen/WaterLink`, aktueller Branch `claude/waterlink-mvp` (aufbauend auf `codex/waterlink-mvp`). Lokale Zugangstoken, Datenbankdateien, Sitzungen, Abhängigkeiten und Build-Dateien werden nicht versioniert. Die Sites-Projektkennung in `web/.openai/hosting.json` ist eine nicht geheime Projektzuordnung.
