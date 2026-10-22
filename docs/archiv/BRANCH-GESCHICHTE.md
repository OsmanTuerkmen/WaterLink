# Branch-Geschichte

Bis zum 22. Oktober 2026 gab es sechs Branches. Sie lagen in einer geraden Kette: Jeder enthielt den vorigen vollständig, es gab nie eine Abweichung. Am 22. Oktober wurde der letzte Stand nach `main` übernommen (reines Vorspulen, kein Commit ging verloren) und die übrigen Branches gelöscht. Die Commits stehen unverändert in der Historie von `main`.

| Branch (gelöscht) | Letzter Commit | Tests | Was dazukam |
|---|---|---|---|
| `main` (alter Stand) | `3ac8228` | 0 | Konzept und Plan, noch kein Code |
| `codex/waterlink-mvp` | `ae2e42c` | 22 | Erster Prototyp: Statusanzeige, Reparaturablauf, Fachregeln, API mit Sitzungen und Datenbank. Oberfläche auf Deutsch in einer Datei. |
| `claude/waterlink-mvp` | `3f8ac54` | 39 | Echte Wasserstellen aus Busia (WPdx), Wiedergabe echter Sensordaten (Kwale 2014), öffentliche Tafel, Druckblatt, Statusdokument |
| `claude/waterlink-redesign` | `2207f2c` | 43 | Neue englische Oberfläche „gelber Kanister“ mit Feld-App, Koordination, simulierter SMS, Pitch-Bühne, Karte, Cloudflare-Eigenbetrieb mit Zugangscode |
| `codex/waterlink-review` | `12ba4a6` | 53 | Review und Korrekturen: SMS-Verlässlichkeit, Zugang mit signiertem Ablauf und atomarer Begrenzung, Tippflächen, Druckblatt |
| `claude/waterlink-p1-ui-review` | `226d6c5` | 62 | Sperr-Fix, frische Demo nach 4 Stunden, schlanke Abfrage, Store-Tests, Lint sauber, CI, Oberflächen-Korrekturen |

Vollständige Hashes:

```
3ac82281932c7cc51330bd12181b506493f0b421  main (alter Stand)
ae2e42c0bdf2083ab7106ffcc2d5ce71789b0fab  codex/waterlink-mvp
3f8ac542053b7bcc782fa3667d56f607750fe256  claude/waterlink-mvp
2207f2c79aa5b6af1ee0b716a74f1276110fbcd3  claude/waterlink-redesign
12ba4a65cf7ef44326a94e8821355194a3bcc0bf  codex/waterlink-review
226d6c53ec2b048c43c3bd17ebb06c26fcb6ca91  claude/waterlink-p1-ui-review
```

Einen alten Stand ansehen oder einen Branch wiederherstellen (ohne etwas zu verändern):

```sh
git branch alter-stand 2207f2c79aa5b6af1ee0b716a74f1276110fbcd3   # lokal anlegen
git switch alter-stand
```

Die Arbeitsberichte der einzelnen Etappen stehen in diesem Ordner: [Historie bis Claude](HISTORIE_BIS_CLAUDE.md), [Review von Codex](REVIEW_CODEX.md), [Übergabe an Osman](UEBERGABE.md) und das [Protokoll bis 21.10.2026](PROTOKOLL-bis-21-10-2026.md).
