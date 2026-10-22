# Branch-Geschichte

Bis zum 22. Oktober 2026 gab es sechs Branches. Sie lagen in einer geraden Kette: Jeder enthielt den vorigen vollständig, es gab nie eine Abweichung. Am 22. Oktober wurde der letzte Stand nach `main` übernommen (reines Vorspulen, kein Commit ging verloren) und die übrigen Branches gelöscht. Die Commits stehen in der Historie von `main`.

**Hinweis:** Ebenfalls am 22. Oktober wurde die Historie umgeschrieben, damit die Autorenangaben einheitlich sind. Dabei haben sich die Hashes der Commits geändert, die ein Claude-Autoren- oder Co-Autor-Zeichen trugen und aller danach; die Hashes in diesem Dokument sind die **neuen**. Der Inhalt jedes Commits (die Dateien) ist unverändert.

| Branch (gelöscht) | Letzter Commit | Tests | Was dazukam |
|---|---|---|---|
| `main` (alter Stand) | `3ac8228` | 0 | Konzept und Plan, noch kein Code |
| `codex/waterlink-mvp` | `ae2e42c` | 22 | Erster Prototyp: Statusanzeige, Reparaturablauf, Fachregeln, API mit Sitzungen und Datenbank. Oberfläche auf Deutsch in einer Datei. |
| `claude/waterlink-mvp` | `ba79324` | 39 | Echte Wasserstellen aus Busia (WPdx), Wiedergabe echter Sensordaten (Kwale 2014), öffentliche Tafel, Druckblatt, Statusdokument |
| `claude/waterlink-redesign` | `e95d100` | 43 | Neue englische Oberfläche „gelber Kanister“ mit Feld-App, Koordination, simulierter SMS, Pitch-Bühne, Karte, Cloudflare-Eigenbetrieb mit Zugangscode |
| `codex/waterlink-review` | `ce088ce` | 53 | Review und Korrekturen: SMS-Verlässlichkeit, Zugang mit signiertem Ablauf und atomarer Begrenzung, Tippflächen, Druckblatt |
| `claude/waterlink-p1-ui-review` | `860ec65` | 62 | Sperr-Fix, frische Demo nach 4 Stunden, schlanke Abfrage, Store-Tests, Lint sauber, CI, Oberflächen-Korrekturen |

Vollständige Hashes:

```
3ac82281932c7cc51330bd12181b506493f0b421  main (alter Stand)
ae2e42c0bdf2083ab7106ffcc2d5ce71789b0fab  codex/waterlink-mvp
ba79324a3781f75e04bfe229001f181b76e56014  claude/waterlink-mvp
e95d1000793f1744b1016ae9fce828275c6ffa14  claude/waterlink-redesign
ce088ce5cad9f8c05f007e0f1b75684e36c320eb  codex/waterlink-review
860ec65e7cf9265cfb554a8eb50ec6407b4df4fe  claude/waterlink-p1-ui-review
```

Einen alten Stand ansehen oder einen Branch wiederherstellen (ohne etwas zu verändern):

```sh
git branch alter-stand e95d1000793f1744b1016ae9fce828275c6ffa14   # lokal anlegen
git switch alter-stand
```

Die Arbeitsberichte der einzelnen Etappen stehen in diesem Ordner: [Historie bis Claude](HISTORIE_BIS_CLAUDE.md), [Review von Codex](REVIEW_CODEX.md), [Übergabe an Osman](UEBERGABE.md) und das [Protokoll bis 21.10.2026](PROTOKOLL-bis-21-10-2026.md).
