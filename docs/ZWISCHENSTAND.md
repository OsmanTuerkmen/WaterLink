# Arbeitsstand WaterLink

**Zuletzt aktualisiert: 22. Oktober 2026 · Claude · Branch `main`.**

Offene Aufgaben und Ideen stehen in der [Roadmap](ROADMAP.md). Hier steht nur, wie der Stand ist und was zuletzt geprüft wurde. Ältere Berichte und das vollständige Protokoll bis 21.10.2026: [Archiv](archiv/).

## Ziel

Zuerst eine verlässlich funktionierende App: Haushalte sehen den letzten bestätigten Betriebszustand und mögliche Alternativen; Betreiber melden, Techniker bearbeiten und Betreiber bestätigen eine Reparatur ausdrücklich. Danach kommen Pitch und Drei-Minuten-Vorführung. Ein Feldpilot ist noch nicht vereinbart.

## Stand

- **Repository:** Alles liegt auf `main`. Die früheren fünf Branches wurden hineingeführt (reines Vorspulen, kein Commit verloren) und gelöscht; Übersicht und Wiederherstellung in der [Branch-Geschichte](archiv/BRANCH-GESCHICHTE.md).
- **App:** Haushaltsstatus mit Karte, öffentliche Tafel, Feld-App für Betreiberin und Techniker, Koordination, simulierte SMS und Pitch-Bühne sind implementiert. Orte stammen aus echten WPdx-Erhebungen (Busia), historische Sensordaten aus Kwale 2014; Bestätigungen, Personen und Wege sind simuliert und gekennzeichnet.
- **Zugang:** Signiertes Cookie mit serverseitig geprüftem Ablauf, Anmeldeversuche pro Client und global begrenzt; ein gesperrter Client sperrt nicht mehr alle anderen.
- **Demo-Daten:** Nach vier Stunden ohne Aktivität setzt sich die Demo mit frischen simulierten Bestätigungen selbst neu an.
- **Oberfläche:** Alle Bedienelemente bei 375 px mindestens 44 px, eine h1 pro Ansicht, Schrift in rem (Textgröße des Browsers gilt, bis 200 % ohne Überbreite), alle Farben aus Tokens, Kontrast mindestens 4,5:1, Bewegungsreduktion mit ruhigem Ersatzsignal. Regeln in [`DESIGN.md`](../DESIGN.md).
- **Live-Seite:** https://waterlink-demo.waterlink.workers.dev läuft noch auf dem Stand vom 11. Oktober (Commit `2207f2c`). Die Änderungen seither sind dort **nicht** enthalten; bereitstellen geht nur mit Reczecs Cloudflare-Konto ([Bereitstellung](BEREITSTELLUNG.md)).
- **Aufräumen am 22.10.:** Dokumentation neu geordnet (Wegweiser [`docs/README.md`](README.md), Roadmap, Archiv), README für Neueinsteiger neu geschrieben. Ungenutzter Code aus einer UI-Vorlage (`web/components/ui/` und Verwandtes) ist **noch nicht entfernt**; siehe Roadmap, P2.

## Letzte Prüfungen (selbst ausgeführt)

| Prüfung | Datum | Ergebnis |
|---|---|---|
| `npm test` | 22.10.2026, frischer Klon | 62/62 bestanden |
| `npm ci`, `npm run build`, lokale Datenbank anlegen, `npm run dev` (Port 5173) in einem frischen Klon nach der README-Anleitung | 22.10.2026 | bestanden. Zuerst scheiterte das Anlegen der Datenbank mit `SQLITE_CANTOPEN`, weil der Klon in einem zu langen Pfad lag (Windows); im kurzen Pfad funktioniert es, die Anleitung weist darauf hin |
| `npm run test:integration` gegen `npm run dev` im frischen Klon | 22.10.2026 | bestanden |
| `npm run typecheck`, `npm run lint`, `npm run build` | 21.10.2026 (Code seither unverändert) | alle Exit-Code 0 |
| `npm run test:access` gegen `npm run dev` im Code-Modus (lokal, Test-Code) | 21.10.2026 | 11/11 bestanden |
| 375 px (Emulation), 7 Ansichten: Tippflächen, Überschriften, Überbreite bei 100/150/200 % Text | 21.10.2026 | keine Bedienelemente unter 44 px, eine h1, keine Überbreite |
| Kontrast aller Text-/Hintergrundpaare der Farb-Tokens | 21.10.2026 | alle ≥ 4,5:1 |
| **Nicht geprüft** | | Physische Geräte, Screenreader, Bewegungsreduktion im echten Browser, Papierausdruck, erster CI-Lauf auf GitHub, Neuansatz der Demo nach 4 Stunden gegen die echte Datenbank (nur Unit-Test), Live-Seite nach neuer Bereitstellung |

## Protokoll

### 22.10.2026 – Claude: alles auf `main`, Branches gelöscht, Doku geordnet

- Letzter Stand (`claude/waterlink-p1-ui-review`, 6 Commits auf dem früheren Arbeitsbranch) nach `main` vorgespult; die Branches `codex/waterlink-mvp`, `claude/waterlink-mvp`, `claude/waterlink-redesign`, `codex/waterlink-review` und `claude/waterlink-p1-ui-review` gelöscht, nachdem geprüft war, dass jeder Branch-Kopf in `main` enthalten ist.
- Dokumentation: [`docs/README.md`](README.md) als Wegweiser, [Roadmap](ROADMAP.md) mit offenen Aufgaben, Erweiterungsideen, Grenzen und Entscheidungen, Archiv-Ordner mit den früheren Berichten und der Branch-Geschichte, README neu (Kurzfassung auf Englisch, Schnellstart, Ansichten, Befehle, Aufbau, Quellen), `web/README.md` statt der Vorlage, `CLAUDE.md` und Übergabeprompt auf den neuen Stand.
- Gefunden: Die Datenbank-Anleitung scheitert unter Windows in zu langen Pfaden (siehe Prüfungen); im README ergänzt.
- Bewusst offen: Entfernen des ungenutzten Vorlagen-Codes (die Sicherheitsprüfung hat das Massenlöschen blockiert; wartet auf Freigabe), Bereitstellung auf Cloudflare, Lizenz.

### 21.10.2026 – Claude: Tiefenprüfung, P1-Punkte und Oberfläche

- Prüfung mit Impeccable, Security-Review und Ponytail-Audit: kein schwerwiegender Sicherheitsbefund; gefunden wurden die globale Anmeldesperre, die abgelaufenen Live-Bestätigungen, fehlende CI, nicht getestete Kernlogik und mehrere Oberflächenpunkte.
- Behoben: Sperre, frische Demo, Lint (7 → 0), CI-Datei, schlanke Abfrage (`?since=`), Tests für Speicher und Sitzungen (53 → 62), Tippflächen, Textgröße, Farb-Tokens, Kontrast, Bewegungsreduktion. Einzelheiten im [Protokoll bis 21.10.](archiv/PROTOKOLL-bis-21-10-2026.md).
