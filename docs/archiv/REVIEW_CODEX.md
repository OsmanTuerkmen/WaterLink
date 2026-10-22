# WaterLink – Review und Weiterarbeit durch Codex

Stand: **11. Oktober 2026**. Eigener Branch: `codex/waterlink-review`, Ausgangspunkt: `claude/waterlink-redesign` bei `2207f2c`.

## Urteil

**Empfehlung:** Mit dem englischen Redesign „gelber Kanister“ weiterarbeiten. Die Rollenansichten trennen Haushaltsinformation und Reparaturarbeit verständlich; die öffentliche Tafel bleibt ein eigener Zugang. Das ist eine Produktbewertung, kein Ergebnis eines Nutzertests vor Ort. Eine Zusammenführung nach `main` ist damit nicht erfolgt oder beschlossen.

**Priorität des Nutzers:** Zuerst eine funktionierende App. Drei-Minuten-Pitch, Folien und Bühnenoptimierung erst danach. Kommunikation und Dokumentation auf Deutsch; die aktuelle englische Oberfläche bleibt als Arbeitsgrundlage erhalten.

## Was tatsächlich geprüft wurde

- Claudes Übergabe, Produktbeschreibung, Arbeitsstand, Bereitstellung und zentrale Client-/Serverdateien gelesen.
- Live-Haushaltsansicht und Bühne unter `https://waterlink-demo.waterlink.workers.dev` geöffnet. Die Seite lädt und kennzeichnet echte Erhebungsorte sowie simulierte Bestätigungen. Keine Änderung an der gemeinsamen Live-Datenbank ausgeführt.
- Neue Abhängigkeiten aus dem Lockfile installiert. **45/45 Tests**, **TypeScript**, **Produktionsbuild** und **API-Integrationstest** auf der lokalen Vorschau bestanden.
- Im Browser: Direktlink zu B öffnet die Meldung für B; SMS-Prüfung vor dem Senden, gesperrte Schaltfläche ohne ausdrückliche Bestätigung, lokale Anmeldung direkt im SMS-Fenster und erfolgreiche Bestätigung danach geprüft.
- Verbindung lokal simuliert unterbrochen: SMS-STATUS antwortet ausdrücklich UNCLEAR und nennt keine bestätigte Alternative.
- Desktop-SMS-Ansicht visuell geprüft, [Screenshot](screenshots/sms-confirmation-review.jpg) gespeichert.
- Ein Test mit 390 px wurde versucht, aber der Browser meldete weiter 1280 px. **Kein neuer mobiler Sichttest bestätigt.** Druck-CSS und Ablaufdatum sind implementiert; eine neue PDF-/Papierprüfung fehlt.

Claudes frühere Prüfergebnisse bleiben als Fremdbericht im [Archiv](HISTORIE_BIS_CLAUDE.md) erhalten. Sie werden nicht als erneut von Codex ausgeführte Tests ausgegeben.

## Befunde und Änderungen

| Befund | Auswirkung | Stand |
|---|---|---|
| SMS-Abfragen ignorierten den Verbindungszustand | Gespeicherte Daten konnten offline weiterhin WORKING melden | Behoben: konservative Offline-Antwort; Regressionstest |
| `OK A` ergänzte automatisch einen angeblichen Vor-Ort-Test | Erfolg konnte ohne Beschreibung und ohne ausdrücklichen Prüfschritt bestätigt werden | Behoben: Beschreibung erforderlich, Vorschau und ausdrückliche Testbestätigung; Regressionstest |
| SMS-Ansicht zeigte keine Anmeldung nach 401 | Erstbenutzer konnten Änderungen dort nicht freischalten | Behoben: gemeinsame Anmeldekomponente in der SMS-Ansicht |
| Direktlink zur Meldung wurde beim ersten Rendern durch Rollen-Initialisierung zurückgesetzt | Falscher Startbildschirm statt ausgewählter Wasserstelle | Behoben: gemeinsame Initialisierung von Rolle und Ziel |
| Druckblatt versteckte die absolute Ablaufzeit in eingeklappten Details | Papier konnte nach Ablauf weiter aktuell wirken | Behoben: absolute Prüf- und Ablaufzeit im Ausdruck; Druckprüfung offen |
| Zugangscode als sichtbarer Klartext, gleiche Feld-ID bei mehreren Anmeldeformularen | Unnötige Sichtbarkeit und mehrdeutige Zuordnung auf der Bühne | Behoben: Passwortfeld, eindeutige IDs |
| Fehlende Sensorwerte wurden mit schwachem Funksignal erklärt | Ursache wurde ohne Beleg behauptet | Behoben: Ursache unbekannt |
| SMS-Erfolg behauptete jedes Mal einen neuen Auftrag | Widerspruch zur gewollten Deduplizierung | Behoben: Auftrag erfasst oder aktualisiert |

Der Reparatur-Zustandsautomat in `web/lib/domain.ts`, gespeicherte Busia-Daten und das Datenbankschema wurden nicht geändert.

## Noch offene technische Befunde

1. **Zugangscode-Cookie:** `web/lib/access.ts` erzeugt einen statischen HMAC des Codes. Die 30 Tage werden nur als Browser-Max-Age gesetzt; serverseitig steckt kein Ablaufdatum im Cookie. Vor längerem oder breiterem Einsatz einen signierten Ablaufzeitpunkt validieren und automatische Tests für Ablauf, Manipulation und Codewechsel ergänzen. Die Verzögerung von 800 ms bei falschem Code ist keine wirksame Begrenzung paralleler Versuche.
   **Nachtrag 11.10.2026 (Claude): lokal behoben.** Signierter, serverseitig geprüfter Ablauf und atomare Begrenzung der Anmeldeversuche in D1, mit Unit- und Ende-zu-Ende-Tests; siehe [Arbeitsstand](../ZWISCHENSTAND.md). Auf der Live-Seite noch nicht bereitgestellt.
2. **SMS ist eine Simulation:** Keine Anbindung an einen Provider, keine echten Absenderzuordnungen. Die Segmentzählung nimmt einfache Zeichenlängen an; GSM-7/UCS-2 und Kosten sind nicht korrekt modelliert. Vor echter Anbindung klären, nicht als fertige SMS-Infrastruktur präsentieren.
3. **Daten und Wege:** 60 importierte WPdx-Datensätze sind kein Nachweis von 60 heute unterschiedlichen, erreichbaren Wasserstellen. Mögliche Mehrfacherfassungen und widersprüchliche Quellattribute prüfen. Geschätzte Gehzeiten, Zugang und Öffnungszeiten sind simuliert. Es gibt weiterhin keinen bestätigten Pilotpartner.
4. **Bedienbarkeit:** Neue mobile Prüfung, Druckprüfung, echte Netzunterbrechung und ein Ablauf auf zwei tatsächlichen Geräten stehen aus. Die 12-Stunden-Regel bleibt ein ungeprüfter Demo-Parameter.
5. **Betrieb:** Alle Demo-Nutzer teilen einen Datensatz und können nach Freischaltung alle Rollen wählen. Das ist absichtlich kein Mehrmandanten-/Feldbetrieb. Hostingkonto, Wartung und Zuständigkeiten müssen vor einem Pilot festgelegt werden.

## Git, lokale Arbeit und Live-Stand

- Cloudflare-Live-Seite bleibt auf Claudes bereitgestelltem Stand. Dieser Review-Branch wurde nicht auf Reczecs Konto bereitgestellt. Ein Demo-Zugangscode ist keine Berechtigung zum Cloudflare-Deployment.
- `main`, `claude/waterlink-mvp` und `claude/waterlink-redesign` werden nicht verändert.
- Vor dem Wechsel lag lokal eine uncommittete deutsche Variante von `web/data/region.json`. Sie ist verlustfrei im Git-Stash mit Nachricht `preserve local Busia data before Codex redesign review 2026-10-11` gesichert. Nicht blind auf den englischen Datenstand anwenden. Die lokale `.claude/`-Konfiguration bleibt unangetastet.
- Zugangscodes, Cookies und Cloudflare-Zugangsdaten gehören weder ins Repo noch in Übergabeprompts. Der im Chat genannte Code wird hier nicht wiederholt.
- Sites-Projektkennung bleibt unverändert in `web/.openai/hosting.json`. Keine zweite Sites-Registrierung anlegen. Eine zusätzliche Sites-Bereitstellung ist momentan kein Arbeitsschwerpunkt.
