---
version: 1
slug: "web-app-page-tsx"
primary_target: "web/app/page.tsx"
related_targets: []
---

Scope: the whole WaterLink web app (web/app/page.tsx and its views). Visitor mode: Operate. Four views share one world: Status (households), public Board (?view=display), Field app (operator and technician, phone-first), Coordination (desk: map, jobs, history, demo tools), plus a Stage view (?view=stage) for the three-minute pitch. All UI text English.

Audience and job: households decide before walking whether their water point works and where else to go; operators report and confirm on site; technicians claim and repair; coordination sees bottlenecks; the jury follows the story in three minutes.

Constraints: domain rules in web/lib/domain.ts stay; status never by colour alone; simulated and historical data labelled once, clearly; "working" is never a water-quality claim.

## Direction contract

THESIS: The yellow 20-litre jerrycan every household carries becomes the colour of the information before the walk. Refuses the category default: a white admin dashboard with a dark sidebar, blue accents and identical cards.

OWN-WORLD: Jerrycan yellow owns the shell (top bar, board header, stage frame); cap blue carries actions and links; ink text on white rows over a warm stone ground taken from the concrete apron around a pump. Four status colours only (green working, burnt orange limited, red down, stone grey unclear), always with word and drawn symbol. One heavy semi-condensed grotesk for display and numerals, one hyperlegible face for text. Rows and coupons, not card grids.

STORY: The visitor sees at once which water point works, since when it was confirmed, and where to go instead. Field staff tap through one step per screen. Repairs read as a stamped sequence where nothing disappears. The jury watches one tap on a phone change the public board.

FIRST VIEWPORT: Status view. Yellow top bar: wordmark left, view tabs centre (Status, Field app, Coordination), connection state right. Below, the question "Does our water point work today?" at display scale with a one-line summary. Main column: three large status rows (letter, name, status word and symbol, instruction, confirmation time with the jerrycan meter, walking time, alternative line). Right column on desktop: the neighbourhood map drawn from real coordinates with the same status marks. Primary action per row: "Details & directions"; field actions live in the Field app.

FORM: Grounded candidate 3 of 7, "the yellow jerrycan", seed key 672276ab. Signature move: the jerrycan meter, a small jerrycan whose water level drains exactly in proportion to the 12-hour validity left on a confirmation, labelled with the hours left; empty means "Unclear". Raises: total palette discipline (Ikeda), one mark at every scale (Emigre), length is exact time (Labanotation), board on whole cells (Crouwel), stamped steps that never disappear (ticket wallet, kept line).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
