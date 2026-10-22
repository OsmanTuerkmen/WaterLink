# Übergabe: was seit dem 10. Oktober passiert ist

> Frühere Übergabe von Claude. Codex arbeitet inzwischen auf codex/waterlink-review. Maßgeblich für die Fortsetzung: [aktueller Stand](../ZWISCHENSTAND.md), [Review](REVIEW_CODEX.md), [nächster Prompt](../NAECHSTER_PROMPT.md).

Für Osman, geschrieben am 11. Oktober 2026. Reczec hat mit Claude auf einem zweiten Rechner weitergearbeitet. Kurzfassung: **neue englische Oberfläche auf eigenem Branch, SMS-Simulation, Pitch-Folien und eine laufende Live-Demo.** Nichts wurde in `main` oder `claude/waterlink-mvp` zusammengeführt; das soll erst passieren, wenn du zugestimmt hast.

## Wo was liegt

| Was | Wo |
|---|---|
| Neuer Stand (hier weiterarbeiten) | Branch `claude/waterlink-redesign` |
| Alter Stand, unverändert bis auf die Busia-Daten | Branch `claude/waterlink-mvp` |
| **Live-Demo** | https://waterlink-demo.waterlink.workers.dev (Details: [Bereitstellung](../BEREITSTELLUNG.md)) |
| Zugangscode für Änderungen in der Live-Demo | bekommst du von Reczec privat (liegt bei ihm in `web/.env.demo-access`, nicht im Repo) |
| Pitch-Folien (Englisch, 11 Folien mit Sprechernotizen) | privates Claude-Artefakt „WaterLink Pitch“ von Reczec; er muss es dir über „Share“ freigeben |
| Laufender Arbeitsstand, offene Aufgaben, Protokoll | [ZWISCHENSTAND.md](../ZWISCHENSTAND.md) |
| Ablauf der 3-Minuten-Demo | [DEMO.md](../DEMO.md) |
| Technik | [ARCHITEKTUR.md](../ARCHITEKTUR.md) |
| Produktgrundlagen und Gestaltungssystem | [`PRODUCT.md`](../../PRODUCT.md), [`DESIGN.md`](../../DESIGN.md) |

## Was sich geändert hat

**Entscheidungen von Reczec (11.10.):**
- Alles in der App auf **Englisch**; Dokumente bleiben Deutsch.
- Echte Busia-Daten (`web/data/region.json`) sind jetzt im Repo, auch auf `claude/waterlink-mvp`.
- Neue Oberfläche im Stil „gelber Kanister“, aus drei Vorschlägen gewählt. Reczec findet sie besser; die Entscheidung, welche Oberfläche bleibt, ist mit dir abzustimmen (Aufgabe 11 im Arbeitsstand).

**Neue Oberfläche** (`web/components/waterlink/`), die Fachregeln in `web/lib/domain.ts` sind unverändert (nur Texte übersetzt):
- Status für Haushalte mit Karte aus echten Koordinaten und OpenStreetMap-Straßen (offline, ohne Kartendienst).
- Öffentliche Tafel; der Kanister neben jeder Uhrzeit zeigt, wie lange die Bestätigung noch gilt (nach 12 Stunden leer, dann „Unclear“).
- Handy-App für Betreiberin (Amina) und Techniker (Daniel): ein Schritt pro Bildschirm, Reparatur als abgestempelte Schrittfolge.
- Simulierte SMS für Tastenhandys (`STATUS`, `A`, `DOWN A …`, `OK A …`), Logik in `web/lib/sms.ts` mit Tests.
- Koordination mit Karte aller 60 Stellen, offenen Aufträgen, Verlauf und Demo-Werkzeugen.
- **Pitch-Bühne** `?view=stage`: beide Handys, Tafel und SMS-Handy live auf einem Bildschirm, mit Ablaufband. Jede Rolle hat dafür eine eigene Sitzung.

**Bereitstellung:** Weil die Sites-Bereitstellung deinen Zugang braucht, läuft die Demo zusätzlich kostenlos auf Cloudflare (Reczecs Konto). Dafür gibt es einen zweiten Anmeldeweg mit Zugangscode; ohne die Einstellung `WATERLINK_AUTH=code` gilt weiterhin die Sites-Anmeldung. Deine Sites-Bereitstellung bleibt also möglich.

## Geprüft (11.10.)

- 43 Unit-Tests (vorher 39; neu: SMS), TypeScript-Prüfung, Produktionsbuild, API-Integrationstest.
- Kompletter Ablauf auf der Bühne durchgeklickt, Ansichten bei 1920 × 1080, 1440 × 900, 1280 × 720 und 390 px (Handy).
- Zwei Runden unabhängige Gestaltungsprüfung, alle Punkte eingearbeitet; Design-Detektor ohne Befund.
- Live-Seite: lädt, Code-Modus aktiv, gefälschte Anmelde-Header werden abgewiesen.

## Was du entscheiden oder tun solltest

1. Redesign ansehen (Live-Link oder Branch auschecken) und entscheiden, ob es die alte Oberfläche ersetzt. Danach kann `claude/waterlink-redesign` zusammengeführt werden.
2. Willst du zusätzlich die private Sites-Bereitstellung? Dann über Codex wie geplant; der Code ist dafür vorbereitet.
3. Teamnamen in die Folien eintragen (Platzhalter `[Team names]`).

## Lokal starten

Wie im README. Neu ist nur: Für die Karte gibt es `web/data/osm-area.json` (Import: `npm run data:osm`). Wenn Port 5173 belegt ist: `npm run dev -- --port 5174`.
