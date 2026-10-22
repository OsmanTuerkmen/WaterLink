# Einreichung: Zero/One Hackathon (WU Wien, 22. Oktober 2026)

Alles, was für die Abgabe beim IdeaLAB gebraucht wird. Die Kriterien der Bewertung: eine gute Problemlösung, ein Prototyp mit allen wichtigen Funktionen, Zahlen, die die Annahmen belegen, und was im Coaching gelernt wurde.

| Datei | Inhalt |
|---|---|
| [`WaterLink_Pitch.pdf`](WaterLink_Pitch.pdf) | 16 Folien: Problem, **Bildschirmfotos der UNICEF-Seiten** (Folien 3 und 4, Anhang), Lösung, Ablauf, Prototyp, Zahlen und Quellen, offene Annahmen, Gelerntes, nächste Schritte |
| [`WaterLink_OnePager.pdf`](WaterLink_OnePager.pdf) | Eine A4-Seite mit allem Wichtigen und den Links |
| [`EMAIL.md`](EMAIL.md) | Text der Mail an das IdeaLAB-Team, mit Anhangsliste und dem Satz zur IdeaLAB-Teilnahme |
| [`belege/`](belege/) | Bildschirmfotos der drei UNICEF-Seiten (mit und ohne gelbe Markierung, aufgenommen am 22.10.2026) und die WPdx-Zahlen (`wpdx-kenya-zahlen.json`) |
| `folien/` | Quellen der Folien (HTML, CSS, Bilder). Gestaltung nach [`DESIGN.md`](../../DESIGN.md) |
| `werkzeug/` | Skripte, mit denen alles neu erzeugt wird |

## Woher die Zahlen kommen

- **UNICEF** (Bildschirmfotos): [Smart Pumps](https://www.unicef.org/innovation/smart-pumps) (bis zu ein Drittel der Handpumpen steht still, 2 bis 3 Tage ohne sauberes Wasser, Umfrage in Kyuso, Kenia), [WHO/UNICEF JMP-Bericht 2025](https://data.unicef.org/resources/jmp-report-2025/) (2,1 Milliarden Menschen ohne sicher verwaltetes Trinkwasser), [UNICEF Ost- und Südafrika](https://www.unicef.org/esa/water-and-environment) (viele nicht funktionierende Systeme, vor allem Handpumpen).
- **WPdx, Kenia** (eigene Rechnung, `belege/wpdx-kenya-zahlen.json`): 39.959 Erhebungseinträge, der neueste vom 30.11.2024, Median 5,7 Jahre alt, 67 % älter als 3 Jahre, 21 % beim letzten Besuch nicht funktionierend (Busia: 27 %). Bei Erhebungen, deren Statusfeld konstant ist, wird die Wasserflagge des Besuchstags genommen (`web/scripts/wpdx-lib.mjs`). Ein Eintrag ist ein Besuch, keine Garantie für Vollständigkeit.
- **Die Zahl „48,6 % der Menschen auf dem Land haben ein Handy“** steht in der Veröffentlichung der Communications Authority of Kenya vom 12.08.2025 (Kenya Housing Survey 2023/24).
- **Kwale/Kitui, 27 Tage auf unter 3 Tage:** WASREB 2014 laut REF-2021-Fallstudie und SDSN TReNDS (anderes Projekt, nicht unseres).

## Was bewusst nicht drinsteht

Keine Wirkungszahlen, keine Zeugnisse, keine Aussagen eines Pilotpartners: Es gibt keine. Offene Annahmen (Betreiber bestätigen oft genug, Zahlungsbereitschaft) stehen auf Folie 10 als „Open“.

**Offen für das Team:** Die Folie „What we learned“ (12) beruht auf dem, was beim Bauen, Prüfen und Testen belegt ist. Notizen aus dem Coaching selbst lagen nicht vor; wer sie hat, ergänzt sie in `folien/pitch.html` und baut neu.

## Neu erzeugen

```bash
# in web/: npm run dev   (Server für die Bildschirmfotos der App)
node docs/einreichung/werkzeug/screenshots.cjs     # App-Bildschirmfotos (Ausprobier-Modus)
node docs/einreichung/werkzeug/belege.cjs          # UNICEF-Seiten, öffnet kurz ein Chrome-Fenster
node --experimental-strip-types docs/einreichung/werkzeug/qr.mjs   # QR-Codes, aus web/ heraus
node docs/einreichung/werkzeug/bauen.mjs           # beide PDFs
```
