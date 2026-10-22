# E-Mail an das IdeaLAB-Team (Entwurf, auf Englisch, weil die Ausschreibung englisch ist)

**An:** idealab@wu.ac.at (Kontakt laut WU-Seite; falls MyStartupStudio eine andere Adresse nennt, diese nehmen)
**Betreff:** WaterLink – submission for the Zero/One Hackathon (Social Impact): prototype, slides, code

**Anhänge:**
1. `WaterLink_Pitch.pdf` (16 Seiten, Folien)
2. `WaterLink_OnePager.pdf` (eine Seite)
3. `WaterLink_Prototype_Code.zip` (vollständiger Quellcode des Prototyps, Stand der Abgabe). Die Skripte (`.mjs`, `.mts`) tragen eine zusätzliche Endung `.txt`, die Shell-Skripte fehlen: Gmail sperrt sonst den Anhang („aus Sicherheitsgründen gesperrt“). Dieselben Dateien liegen im Repository
4. `WaterLink_Walkthrough.gif` (Ablauf in acht Bildern)
5. `WaterLink_UNICEF_Belege.zip` (die Bildschirmfotos der UNICEF-Seiten, markiert und unmarkiert, und die WPdx-Zahlen)

---

Dear IdeaLAB team,

we are Recep Baş and Osman Türkmen, and we are submitting **WaterLink** to the Zero/One Hackathon (22 October 2026, track Social Impact).

**What it is.** WaterLink answers one question before people set out: "Does our water point work today?" It shows the last confirmed state of every water point, and it turns every outage into a job with a named person that only counts as repaired once the pump has been tested on site. A confirmation expires after 12 hours (a demo value), and an expired point reads "unclear", never an old green.

**How it fits your four criteria**

1. **A good problem solution.** The problem is documented by UNICEF: up to one in three hand pumps does not function at any one time across Africa, and people can be without clean water for at least 2–3 days while they wait for a repair (UNICEF Office of Innovation, "Smart Pumps"); 2.1 billion people still lack safely managed drinking water (WHO/UNICEF JMP report, 25 August 2025). The public data cannot say what works today: of 39,959 Kenyan survey records in the Water Point Data Exchange the newest is from 30 November 2024 and the median is 5.7 years old (our calculation). WaterLink closes exactly that gap. Slides 2 to 6 show it, with screenshots of the UNICEF pages on slides 3 and 4.
2. **A prototype with all the important features.** It is live and works end to end: public board and household view (English, Kiswahili as a labelled draft), report, job, blockers, repair, test on site, history, route and access checks before an alternative is named, SMS simulation, a replay of real 2014 pump data, and a practice mode for anyone without a login. 85 unit tests and 37 browser tests run on every push. Slides 7 to 9.
3. **Numbers that prove the assumptions.** Slide 10 lists each assumption with its number and source and marks what is supported (the data are stale, many pumps are broken, repairs take days, an organised repair service cut downtime from 27 days to under 3 in Kwale and Kitui) and what is still open (will operators confirm often enough, will anyone pay). We claim no impact and have no pilot yet; slide 11 says how we would measure it.
4. **What we learned.** Slide 12: an old green is worse than no answer; repaired is not working; "working" is not "safe"; a dot on the map is not a recommendation; 60 survey records turned out to be 42 places; and we say what is unchecked.

**Links**
- Try the whole story, no login: https://waterlink-demo.waterlink.workers.dev/?view=stage&sandbox=1
- Live demo: https://waterlink-demo.waterlink.workers.dev
- Code and documentation: https://github.com/OsmanTuerkmen/WaterLink (a complete copy of the source is attached; if the link does not open for you, tell us and we will give you access)

**Honest limits.** Places come from real WPdx surveys; people, confirmations, walking routes and opening hours in the demo are simulated and labelled so. SMS, accounts and live sensors are not connected, and there is no pilot partner yet. "Working" means water can be drawn; it says nothing about drinking-water quality.

**IdeaLAB.** If we are selected, we would potentially agree to take part in the IdeaLAB.

Thank you for your time. You can reach us at basreci@gmail.com.

Best regards
Recep Baş and Osman Türkmen
