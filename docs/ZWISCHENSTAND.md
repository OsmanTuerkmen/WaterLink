# Arbeitsstand WaterLink

**Zuletzt aktualisiert: 22. Oktober 2026, nachmittags · Branch `main`.**

Offene Aufgaben und Ideen stehen in der [Roadmap](ROADMAP.md). Hier steht nur, wie der Stand ist und was zuletzt geprüft wurde. Ältere Berichte und das vollständige Protokoll bis 21.10.2026: [Archiv](archiv/).

## Ziel

Zuerst eine verlässlich funktionierende App: Haushalte sehen den letzten bestätigten Betriebszustand und mögliche Alternativen; Betreiber melden, Techniker bearbeiten und Betreiber bestätigen eine Reparatur ausdrücklich. Danach kommen Pitch und Drei-Minuten-Vorführung. Ein Feldpilot ist noch nicht vereinbart.

## Stand

- **Repository:** Alles liegt auf `main`. Die früheren fünf Branches wurden hineingeführt (reines Vorspulen, kein Commit verloren) und gelöscht; Übersicht und Wiederherstellung in der [Branch-Geschichte](archiv/BRANCH-GESCHICHTE.md).
- **App:** Haushaltsstatus mit Karte, öffentliche Tafel, Feld-App für Betreiberin und Techniker, Koordination, simulierte SMS und Pitch-Bühne sind implementiert. Orte stammen aus echten WPdx-Erhebungen (Busia), historische Sensordaten aus Kwale 2014; Bestätigungen, Personen und Wege sind simuliert und gekennzeichnet.
- **Zugang:** Signiertes Cookie mit serverseitig geprüftem Ablauf, Anmeldeversuche pro Client und global begrenzt; ein gesperrter Client sperrt nicht mehr alle anderen.
- **Demo-Daten:** Nach vier Stunden ohne Aktivität setzt sich die Demo mit frischen simulierten Bestätigungen selbst neu an.
- **Erste Ansicht vom Server:** Das HTML enthält schon den aktuellen Stand (auch ohne JavaScript und bei langsamer Verbindung). Eine Seite, deren Skripte nach 30 s nicht starten, lädt sich neu; ohne JavaScript fordert ein Meta-Refresh alle 60 s neues HTML an (Sicherheitsnetz gegen ein „eingefrorenes Grün“).
- **Ausprobier-Modus (Sandbox):** Jeder kann den ganzen Ablauf ohne Zugangscode mit Übungsdaten durchspielen, nur auf dem eigenen Gerät (`/?view=stage&sandbox=1`, Knopf „Try it yourself“, Angebot im Anmeldefeld). Dieselben Regeln laufen im Browser, der Server sieht nichts.
- **Tafel auf Kiswahili und QR-Code:** Umschalter unten auf der Tafel (`?lang=sw`), QR-Code zur SMS-Ansicht. **Die Kiswahili-Texte sind ein Entwurf ohne Prüfung durch Muttersprachler.**
- **Sicherheitsmeldungen der Abhängigkeiten:** `npm audit --omit=dev` meldet nichts mehr (Next 16.4.2, React 19.3.1); 20 Meldungen in Entwicklungswerkzeugen bleiben (Roadmap, P3). Ereignisprotokoll auf 200 Einträge begrenzt.
- **Browser-Tests:** 25 Tests mit Playwright und Chrome (`npm run test:e2e`), auch als CI-Auftrag.
- **Oberfläche:** Alle Bedienelemente bei 375 px mindestens 44 px, eine h1 pro Ansicht, Schrift in rem (Textgröße des Browsers gilt, bis 200 % ohne Überbreite), alle Farben aus Tokens, Kontrast mindestens 4,5:1, Bewegungsreduktion mit ruhigem Ersatzsignal. Regeln in [`DESIGN.md`](../DESIGN.md).
- **Live-Seite:** https://waterlink-demo.waterlink.workers.dev wurde am 22.10. mit dem Stand von `main` neu bereitgestellt (Konto von Reczec, Zugangscode unverändert), siehe [Bereitstellung](BEREITSTELLUNG.md).
- **Aufräumen am 22.10.:** Dokumentation neu geordnet (Wegweiser [`docs/README.md`](README.md), Roadmap, Archiv), README für Neueinsteiger neu geschrieben. Ungenutzter Code aus einer UI-Vorlage (`web/components/ui/` und Verwandtes, 61 Dateien) und 19 Abhängigkeiten sind entfernt (Abhängigkeiten 27 → 8). MIT-Lizenz ergänzt. Das Bereitstellungsskript ändert einen vorhandenen Zugangscode nicht mehr, wenn die lokale Datei fehlt.
- **Autorenangaben:** Die Historie wurde am 22.10. umgeschrieben: Commits mit Claude als Autor oder Co-Autor tragen jetzt Osman (`OsmanTuerkmen`) als Autor beziehungsweise Co-Autor, die Claude-Sitzungslinks in den Commit-Texten sind entfernt. Dateien und Anzahl der Commits sind unverändert, alle Hashes ab dem ersten betroffenen Commit sind neu.

## Letzte Prüfungen (selbst ausgeführt)

| Prüfung | Datum | Ergebnis |
|---|---|---|
| `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` nach dem Entfernen des ungenutzten Codes | 22.10.2026 | 62/62 Tests, Typprüfung, Lint und Build ohne Fehler |
| `npm test` | 22.10.2026, frischer Klon | 62/62 bestanden |
| `npm ci`, `npm run build`, lokale Datenbank anlegen, `npm run dev` (Port 5173) in einem frischen Klon nach der README-Anleitung | 22.10.2026 | bestanden. Zuerst scheiterte das Anlegen der Datenbank mit `SQLITE_CANTOPEN`, weil der Klon in einem zu langen Pfad lag (Windows); im kurzen Pfad funktioniert es, die Anleitung weist darauf hin |
| `npm run test:integration` gegen `npm run dev` im frischen Klon | 22.10.2026 | bestanden |
| `npm run typecheck`, `npm run lint`, `npm run build` | 21.10.2026 (Code seither unverändert) | alle Exit-Code 0 |
| `npm run test:access` gegen `npm run dev` im Code-Modus (lokal, Test-Code) | 21.10.2026 | 11/11 bestanden |
| 375 px (Emulation), 7 Ansichten: Tippflächen, Überschriften, Überbreite bei 100/150/200 % Text | 21.10.2026 | keine Bedienelemente unter 44 px, eine h1, keine Überbreite |
| Kontrast aller Text-/Hintergrundpaare der Farb-Tokens | 21.10.2026 | alle ≥ 4,5:1 |
| `npm test` (nach dem Ausprobier-Modus) | 22.10.2026 abends | 70/70 bestanden (neu: 3 Tests für die Regeln im Ausprobier-Modus) |
| `npm run test:e2e` (nach dem Ausprobier-Modus und der Uhr-Korrektur) | 22.10.2026 abends | 30/30 bestanden; zuvor 29/29 (die Zeile darunter beschreibt die ersten drei) (neu: 3 Tests: ganze Geschichte auf der Bühne ohne Code bei unveränderter Server-Revision; Knopf, Neuladen und Verlassen; Angebot im Anmeldefeld; axe auf der Sandbox-Bühne). Der Test fing einen zu kleinen Knopf (36 px) ab, behoben |
| `npm test` | 22.10.2026 nachmittags | 67/67 bestanden (neu: Ereignisgrenze, Sprachtexte, QR-Code liest sich zurück) |
| `npm run typecheck`, `npm run lint`, `npm run build` | 22.10.2026 nachmittags | alle drei Exit-Code 0 |
| `npm run test:e2e` (neu) | 22.10.2026 nachmittags, lokal | 25/25 bestanden: ganzer Ablauf auf zwei Fenstern (Meldung → Übernahme → Reparatur → Tafel bleibt „Not working“ → Test → „Working“), Offline mit Wiedererholung, Seite ohne JavaScript, Sicherheitsnetz, Sprachumschalter und QR-Code, axe (WCAG A/AA) auf 10 Ansichten ohne Fund, Handybreite ohne Überbreite und ohne Tippfläche unter 44 px auf 9 Ansichten, Druckblatt eine A4-Seite. Frühere Läufe fanden echte Fehler: Karte mit fokussierbaren Markern in einer Bild-Rolle, zu blasser „Full screen“-Knopf, zu kleiner Knopf bei Handybreite |
| `npm run test:integration` (`npm run dev`), `npm run test:access` (Code-Modus, lokal) | 22.10.2026 nachmittags | bestanden, 11/11 |
| `npm run test:e2e` gegen den **Produktions-Build** (`npm start`), nur die Tests ohne Anmeldung (Tafel, Sprache, Ohne-JavaScript, Sicherheitsnetz, axe, Handybreite, Druck) | 22.10.2026 nachmittags | 23/23 bestanden |
| Live-Seite nach der Bereitstellung am Nachmittag (nur lesend, plus Ansicht im Browser) | 22.10.2026 nachmittags | HTML enthält Wasserstellen, Kiswahili-Tafel, Meldungs-Refresh und Neulade-Skript (alle vier Ansichten); `Cache-Control: no-store`; `?since=` liefert „unchanged“; im Browser `data-hydrated=true`, Tafel auf Kiswahili mit QR-Code, keine Konsolenfehler |
| `npm audit --omit=dev` | 22.10.2026 nachmittags | 0 Meldungen (vorher 4, darunter eine kritische zu Next) |
| Produktions-Build lokal gestartet, HTML abgefragt | 22.10.2026 nachmittags | Antwort enthält Wasserstellen, Kiswahili-Tafel, Meldungs-Refresh und Neulade-Skript; `Cache-Control: no-store` |
| Live-Seite nach dem Bereitstellen (nur lesende Anfragen und eine Anfrage mit gefälschten Headern) | 22.10.2026 | Seite 200; `/api/access` meldet Modus „code“; die Demo hat sich beim ersten Lesen selbst neu angesetzt (Revision 1, A und B frisch bestätigt, Hinweis im Verlauf); `?since=1` liefert „unchanged“; gefälschte Header 401. Kein `test:access` gegen die Live-Seite |
| GitHub Actions (CI) auf `main` | 22.10.2026, laut Ansicht auf GitHub | Läufe #1 bis #3 grün (Node 22 und 24: Tests, Typprüfung, Lint, Build); der Lauf nach dem Umschreiben der Historie wurde hier nicht angesehen |
| **Nicht geprüft** | | Physische Geräte, echter Screenreader, Bewegungsreduktion im echten Browser, Papierausdruck, Kiswahili durch Muttersprachler, der CI-Auftrag für die Browser-Tests auf GitHub (auf Ubuntu noch nicht gelaufen; in der Ansicht auf GitHub nachsehen), der Ablauf Melden → Reparieren → Bestätigen auf der Live-Seite mit dem Zugangscode |

## Protokoll

### 22.10.2026, abends – Ausprobier-Modus

- **Anlass:** Das Produkt wird eingereicht und von Beurteilern benutzt, die den Zugangscode nicht haben; ohne Modus könnten sie nur zuschauen.
- **Umsetzung:** `lib/sandbox.ts` (dieselben Regeln, `applyLocal`), `lib/actors.ts` (die drei Personen, vorher in `session.ts`), `resetState` in `domain.ts` (vorher doppelt in `store.ts`), Umschaltung in `store.tsx`, `sandbox.tsx` (Banner, Knopf), Angebot in `signin.tsx`, `?sandbox=1` auf dem Server (erste Ansicht aus den Startdaten, ohne Datenbankzugriff).
- **Bewusste Grenze:** Je Tab, nicht zwischen Tabs oder Geräten geteilt (Roadmap).
- **Gefunden durch einen Lauf der Tests gegen die Live-Seite:** Auf dem lokalen Server bestanden alle Tests, live schlug einer fehl. Ursache: Die Rechneruhr ging hier rund 9 Sekunden hinter der Serveruhr. Die Übungsdaten bekamen Zeitstempel in Serverzeit, nach einem Neuladen galt aber die Geräteuhr, die Einträge lagen „in der Zukunft“ und die Wasserstelle erschien als „unklar“. Behoben: Der Ausprobier-Modus nutzt nur die Geräteuhr. Neuer Test mit einer um 5 Minuten nachgehenden Uhr (scheitert auf dem alten Stand live, besteht auf dem neuen). Lehre: Zeitlogik mit echtem Netz prüfen.
- **Tests gegen die Live-Seite:** `E2E_BASE_URL=<Adresse> npm run test:e2e -- e2e/sandbox.spec.ts e2e/board.spec.ts e2e/quality.spec.ts` führt nur Tests aus, die nichts am gemeinsamen Demo ändern; die anderen verweigern den Lauf gegen einen fremden Server.

### 22.10.2026, nachmittags – Weiterentwicklung: Server-Ansicht, Browser-Tests, Kiswahili, QR-Code

- Sechs Commits auf `main` gepusht (`b45bd28` bis `bd71a85`) und mit `npm run deploy:cloudflare` bereitgestellt (Zugangscode unverändert).
- **Auftrag:** „Technisch noch Besseres“ und die zwei Zusatzfunktionen, weil das Produkt eingereicht und von anderen benutzt wird, nicht live vorgeführt.
- **Erste Ansicht vom Server** (`app/page.tsx` + `app/home.tsx`). Dabei aufgefallen: Ein vom Server gerenderter Stand altert ohne Skript nicht. Daraus das Sicherheitsnetz (Neuladen nach 30 s ohne Start, Meta-Refresh ohne JavaScript). Der Browser-Zwischenspeicher für den Stand (`localStorage`) entfiel, weil das HTML den Stand jetzt selbst mitbringt.
- **Browser-Tests** (`e2e/`, Playwright mit installiertem Chrome, auch in der CI). Sie fanden drei echte Fehler, die behoben sind (siehe Prüfungen). Dabei zeigte sich auch, dass ein Test vor dem Start der Skripte die Verbindung kappte; er wartet jetzt auf `data-hydrated`.
- **Kiswahili und QR-Code** auf der Tafel (`lib/i18n.ts`, `lib/qr.ts`). Übersetzung nach bestem Wissen, **nicht von Muttersprachlern geprüft**; steht in der Roadmap als P1 und im Code-Kommentar.
- **Sicherheitsmeldungen:** `npm audit fix`, Next 16.3.4 → 16.4.2, React 19.2.6 → 19.3.1. Der Versuch, vinext, vite und das Cloudflare-Plugin zu heben, scheiterte zunächst an Abhängigkeiten, räumte danach die Liste nicht auf und wurde zurückgenommen.
- **Nicht umgesetzt:** normalisierte Datenbanktabellen (Begründung in der Roadmap); Ereignisprotokoll stattdessen begrenzt.

### 22.10.2026, mittags (später) – neuer Zugangscode

- Der Code vom 11. Oktober war nicht mehr auffindbar (die Datei lag nur auf dem anderen Rechner). Neuer Code erzeugt (drei Wörter und vier Ziffern, Zufall aus `crypto.randomInt`), in `web/.env.demo-access` auf diesem Rechner gespeichert (von Git ausgeschlossen) und mit `npm run deploy:cloudflare` als Worker-Geheimnis gesetzt. Der Code wurde dabei nirgends ausgegeben.
- Geprüft gegen die Live-Seite: Anmeldung mit dem neuen Code 200, Cookie `v2`, Sitzung als Betreiberin 201. Alle früheren Cookies und der alte Code sind ungültig; wer vorher freigeschaltet war, muss sich neu freischalten.

### 22.10.2026, mittags – Bereitstellung und veröffentlichte Historie

- Die umgeschriebene Historie (31 Commits, Autoren nur `OsmanTuerkmen` und `Recezc`, keine Claude-Zeilen) ist per `--force-with-lease` auf `origin/main` veröffentlicht; auf GitHub gibt es nur noch den Branch `main`.
- Wrangler per Browser mit dem Konto von Reczec angemeldet (die Freigabe hat die Person selbst im Browser erteilt), `npm run deploy:cloudflare` aus `web/` ausgeführt. Das Skript hat den vorhandenen Zugangscode behalten; es gibt auf diesem Rechner keine `web/.env.demo-access`.
- Die Roadmap-Punkte „Live-Seite aktualisieren“ und „Ersten CI-Lauf prüfen“ sind erledigt und entfernt.

### 22.10.2026 – Claude: alles auf `main`, Branches gelöscht, Doku geordnet

- Letzter Stand (`claude/waterlink-p1-ui-review`, 6 Commits auf dem früheren Arbeitsbranch) nach `main` vorgespult; die Branches `codex/waterlink-mvp`, `claude/waterlink-mvp`, `claude/waterlink-redesign`, `codex/waterlink-review` und `claude/waterlink-p1-ui-review` gelöscht, nachdem geprüft war, dass jeder Branch-Kopf in `main` enthalten ist.
- Dokumentation: [`docs/README.md`](README.md) als Wegweiser, [Roadmap](ROADMAP.md) mit offenen Aufgaben, Erweiterungsideen, Grenzen und Entscheidungen, Archiv-Ordner mit den früheren Berichten und der Branch-Geschichte, README neu (Kurzfassung auf Englisch, Schnellstart, Ansichten, Befehle, Aufbau, Quellen), `web/README.md` statt der Vorlage, `CLAUDE.md` und Übergabeprompt auf den neuen Stand.
- Gefunden: Die Datenbank-Anleitung scheitert unter Windows in zu langen Pfaden (siehe Prüfungen); im README ergänzt.
- Danach (mit ausdrücklicher Freigabe): ungenutzten Vorlagen-Code und 19 Abhängigkeiten entfernt, MIT-Lizenz ergänzt, Bereitstellungsskript so geändert, dass ein vorhandener Zugangscode erhalten bleibt, Autorenangaben in der Historie vereinheitlicht (siehe oben; lokale Sicherung des früheren Stands: Branch `backup/vor-umschreiben-22-10`, nur auf diesem Rechner).
- Bereitstellung siehe Eintrag darüber.

### 21.10.2026 – Claude: Tiefenprüfung, P1-Punkte und Oberfläche

- Prüfung mit Impeccable, Security-Review und Ponytail-Audit: kein schwerwiegender Sicherheitsbefund; gefunden wurden die globale Anmeldesperre, die abgelaufenen Live-Bestätigungen, fehlende CI, nicht getestete Kernlogik und mehrere Oberflächenpunkte.
- Behoben: Sperre, frische Demo, Lint (7 → 0), CI-Datei, schlanke Abfrage (`?since=`), Tests für Speicher und Sitzungen (53 → 62), Tippflächen, Textgröße, Farb-Tokens, Kontrast, Bewegungsreduktion. Einzelheiten im [Protokoll bis 21.10.](archiv/PROTOKOLL-bis-21-10-2026.md).
