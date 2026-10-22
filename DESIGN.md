---
name: WaterLink
description: Does our water point work today? The last confirmed state of nearby water points, before the walk.
colors:
  can: "#f5c211"
  can-deep: "#d9a600"
  can-pale: "#fcecb3"
  can-wash: "#fff4c7"
  can-ink: "#3a2c00"
  cap: "#1f4fa8"
  cap-deep: "#173d85"
  cap-tint: "#e4ecfa"
  water: "#4a84e6"
  ink: "#1b1c1e"
  ink-2: "#4c483f"
  ink-3: "#5f5a4f"
  stone: "#ebe7dc"
  stone-2: "#e1dccd"
  stone-3: "#d3ccb9"
  paper: "#ffffff"
  line: "#ddd7c8"
  ok: "#1b7a42"
  ok-tint: "#e1f1e6"
  limit: "#a34700"
  limit-tint: "#fbe9d8"
  limit-text: "#7a3900"
  down: "#c0302a"
  down-tint: "#fae3e1"
  down-text: "#8a1f1b"
  unk: "#66625a"
  unk-tint: "#eeebe4"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 4vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 88"
  headline:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "25px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 88"
  title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.15
    fontVariation: "'wdth' 90"
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.2
    fontVariation: "'wdth' 92"
  numeral:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 92"
rounded:
  sm: "10px"
  md: "12px"
  row: "14px"
  coupon: "16px"
  device: "26px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  gutter: "28px"
components:
  button-primary:
    backgroundColor: "{colors.cap}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.cap-deep}"
  button-quiet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.down}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
    height: "48px"
  button-block:
    height: "56px"
    width: "100%"
  status-chip-ok:
    backgroundColor: "{colors.ok-tint}"
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
    padding: "4px 14px 4px 4px"
  status-chip-limit:
    backgroundColor: "{colors.limit-tint}"
    textColor: "{colors.limit}"
    rounded: "{rounded.pill}"
    padding: "4px 14px 4px 4px"
  status-chip-down:
    backgroundColor: "{colors.down-tint}"
    textColor: "{colors.down}"
    rounded: "{rounded.pill}"
    padding: "4px 14px 4px 4px"
  status-chip-unk:
    backgroundColor: "{colors.unk-tint}"
    textColor: "{colors.unk}"
    rounded: "{rounded.pill}"
    padding: "4px 14px 4px 4px"
  point-row:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.row}"
    padding: "16px 20px 4px"
  point-letter:
    backgroundColor: "{colors.can}"
    textColor: "{colors.can-ink}"
    rounded: "13px"
    size: "56px"
  topbar:
    backgroundColor: "{colors.can}"
    textColor: "{colors.can-ink}"
    height: "66px"
    padding: "8px 28px"
  topnav-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.can}"
    rounded: "{rounded.pill}"
    padding: "9px 18px"
  coupon:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.coupon}"
  coupon-head:
    backgroundColor: "{colors.can-wash}"
    padding: "14px"
  choice:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.coupon}"
    padding: "14px 16px"
    height: "84px"
  input-field:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: WaterLink

## Overview

**Creative North Star: "The Yellow Jerrycan"**

The yellow 20-litre jerrycan every household carries is the colour of the information before the walk. Jerrycan yellow owns the shell (top bar, board header, field-app header, pitch stage frame); cap blue, the colour of the can's screw cap, carries every action and link; ink text sits on white rows laid over a warm stone ground taken from the concrete apron around a pump. The system is a working instrument: dense where staff work, enormous where the public reads from metres away, and always honest about how old a confirmation is.

Information is arranged as rows and coupons, never as card grids. A water point is a long white row with a yellow letter tile; a repair job is a coupon with a dashed tear line and a stamped sequence of steps that never disappear. One mark, the jerrycan, appears at every scale: the wordmark, the validity meter in every row, the board, and the favicon. Status is always told three ways at once: a word, a drawn symbol, and one of four colours.

Motion is rare and authored. The board has one moment (a changed row fills like a can being poured), the meter's water level eases as validity drains, and a completed confirmation settles into place. Everything else is a short state transition (150ms on controls, up to 400ms on the stage script).

**Key Characteristics:**
- Jerrycan yellow shell, cap blue actions, ink on white rows over warm stone.
- Exactly four status colours, each always paired with a word and a drawn symbol.
- One heavy semi-condensed grotesk (Archivo, 800, width 85-92%) for display and numerals; Atkinson Hyperlegible Next for all running text.
- Rows and coupons, not card grids; the yellow letter tile anchors every point.
- The jerrycan mark at every scale, including the CanMeter signature.
- One authored motion per surface; reduced motion removes all movement, and a changed board row keeps a still tint that fades out.

## Colors

A disciplined palette: one warm shell colour, one action colour, warm neutrals, and four status hues with matching tints.

### Primary
- **Jerrycan Yellow** (`can`): the shell. Top bar, board header, field-app header, stage background, point letter tiles, map marker tiles, demo-script numerals, text selection, and the browser theme colour. It is ground, not accent; it carries no status meaning.
- **Drum-Rim Ochre** (`can-deep`): the 3px bottom rule under every yellow header, like the moulded seam of the can.
- **Jerrycan Ink** (`can-ink`): text on yellow, and the base of every warm translucent overlay on the shell (nav track, segmented control) and every shadow.
- **Pale Can** (`can-pale`) and **Can Wash** (`can-wash`): the meter's empty body and major map roads; the demo strip, coupon heads and the confirmation checkbox panel.

### Secondary
- **Cap Blue** (`cap`): every action and link: primary buttons, text links, focus rings, caret, selected map marker, route line, next stamp, checkbox and range accents, operator avatar.
- **Deep Cap** (`cap-deep`): hover for cap-blue actions, and text on Cap Tint.
- **Cap Tint** (`cap-tint`): the "go here instead" alternative line and waiting notes on coupons.
- **Meter Water** (`water`): only the water inside the CanMeter.

### Tertiary (status, four only)
- **Working Green** (`ok` / `ok-tint`): water can be drawn, freshly confirmed. Done stamps, done marks.
- **Burnt Orange Limited** (`limit` / `limit-tint` / `limit-text`): limited supply, warnings, active blockers, simulated scenario on.
- **Down Red** (`down` / `down-tint` / `down-text`): not working, offline connection badge, board offline banner, destructive actions.
- **Stone Grey Unclear** (`unk` / `unk-tint`): unknown, stale or never confirmed. Also the neutral tag and "no alternative" line.

### Neutral
- **Pump-Apron Stone** (`stone`): the page ground everywhere, also quick-reply chips, empty states and the sensor chart bed.
- **Stone 2 / Stone 3** (`stone-2`, `stone-3`): row dividers inside panels, tab tracks; footer rules and scrollbar thumb.
- **Paper** (`paper`): rows, coupons, panels, the map frame, inputs.
- **Ink, Ink 2, Ink 3** (`ink`, `ink-2`, `ink-3`): primary text; secondary text and map labels; meta text, captions, table heads.
- **Line** (`line`): inset hairlines on quiet buttons, inputs, choices, coupons and stamp dots.

### Named Rules
**The Four Colours Rule.** Status uses exactly `ok`, `limit`, `down`, `unk`, never another hue, and never colour alone: every status carries its word and its drawn symbol.

**The Old Green Rule.** A stale, conflicting, offline or sensor-only state never renders in Working Green. Unknown is shown as Stone Grey Unclear.

**The Yellow Is Ground Rule.** Jerrycan Yellow is the shell and the letter tile. It never marks status, never fills a button, and is never used as a warning colour.

**The Cap Carries Action Rule.** Anything tappable that is not destructive is Cap Blue or a quiet paper button; blue is never decoration.

## Typography

**Display Font:** Archivo Variable with width axis (fallback Archivo, system-ui, sans-serif)
**Body Font:** Atkinson Hyperlegible Next Variable (fallback system-ui, sans-serif)

**Character:** A heavy, slightly condensed grotesk that reads like stencilled lettering on a container, paired with a face designed for low-vision legibility, so instructions stay unmistakable outdoors and at a distance.

### Hierarchy
- **Display** (800, clamp(2.3rem, 4vw, 3.5rem), 1.05, width 88%, -0.02em, balanced): the one question per view ("Does our water point work today?"), coordination head. Max about 19ch.
- **Headline** (800, 21-30px, 1.05, width 88%): point names in rows (25px), field step titles (26-27px), panel heads (22-23px).
- **Title** (800, 18-20px, 1.15, width 90%): field point names, coupon heads, choice labels.
- **Body** (400, 17px, 1.5): all running text; 15px secondary (`ink-2`), 13-14px meta (`ink-3`). Notes cap at 75ch.
- **Label** (700, 14-16px, 1.2, width 92%, display face): buttons, nav, tabs, segmented controls.
- **Numeral** (700-800, display face, tabular figures): confirmation times, clocks, counts. Board numerals run at width 85%.
- **Status word** (800, 17px; 14px small, 26px large, width 90%): inside the status chip.

### Named Rules
**The Two Faces Rule.** Archivo speaks (headings, labels, numbers); Atkinson explains (sentences). No third face.

**The Tabular Time Rule.** Every time and count uses tabular figures so a changing clock never shifts the row.

**The Board Em Rule.** The public board sizes everything in `em` from one viewport-scaled root (clamp(13px, 1.2vw, 24px)), so it scales as a whole from stage thumbnail to wall screen.

## Layout

A centred working column (max 1340px, 28px gutters, 36px top padding; 16px gutters under 860px) on the stone ground. The Status view is two columns (1.5fr rows, 1fr sticky map at top 90px) that stack under 1100px. Rows stack with a 12px gap; panel padding is 20-24px. Content inside a row is indented 74px past the letter tile (tile 56px + gap 18px) on desktop and resets to 0 on mobile.

The public board is a vertical stack of full-width rows on a 12-cell grid (letter 1, name 4, state 4, freshness 3), collapsing to 6 cells under 860px and 4 cells under 520px. Rows grow to fill the screen height.

The field app is a phone column (max 440px) beside a short explanation; under 860px it goes edge to edge, rows lose their containers and become divided list items, and the segmented role switch takes a full line.

Spacing steps cluster at 6, 8, 12, 16, 24 and 28px. Touch targets are at least 48px (primary blocks 56px, field actions 52px, choices 84px).

Breakpoints: 1360px (stage), 1100px (stack map), 860px (mobile shell), 520px (small phone). Print produces one A4 status sheet with black outlines.

## Elevation & Depth

Mostly flat paper on stone. Depth is one soft, warm lift under rows and panels, inset hairlines for interactive containers, and deep drop shadows reserved for the device frames on the pitch stage and the framed field app. All shadows are tinted with Jerrycan Ink, never grey-black.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 1px 0 rgba(58, 44, 0, 0.06), 0 10px 24px -18px rgba(58, 44, 0, 0.45)`): point rows, board rows, map, coordination and demo panels.
- **Highlight ring** (`box-shadow: 0 0 0 2.5px var(--ink), lift`): the row matching the hovered map marker.
- **Inset hairline** (`box-shadow: inset 0 0 0 1.5px var(--line)`, 2px on choices and textareas): quiet buttons, inputs, coupons, field rows; hover darkens to `ink-3`, focus to `cap`, selection to 3px of the status colour.
- **Device** (`box-shadow: 0 30px 60px -36px rgba(58, 44, 0, .55), 0 0 0 1px rgba(58, 44, 0, .06)`; stage: `0 34px 60px -32px rgba(58, 44, 0, .7)`): the field-app frame and stage phones/screen only.

### Named Rules
**The Warm Shadow Rule.** Every shadow is Jerrycan Ink at low alpha. Inputs and selectable containers use inset rings, not drop shadows.

## Shapes

Soft, moulded corners like a plastic container: 10-12px on buttons and inputs, 14px on rows and panels, 16px on coupons and choices, 26-42px on device frames. Pills (999px) for status chips, tags, nav tracks, tabs, segmented controls and quick-reply chips. Circles for status symbols, avatars, stamp dots and timeline dots. Letter tiles are rounded squares (13px on 56px).

Dashed lines mean "torn or provisional": the coupon tear line under a coupon head, the divider above row details, and the empty CanMeter outline. Solid 3px ochre rules close every yellow header.

### Named Rules
**The One Silhouette Rule.** The jerrycan geometry (one body path, one handle path, a rotated cap rectangle) is shared by the mark and the meter at every size; never redraw a second can.

## Components

### Buttons
Tactile and plain: a 1px press, no lift on hover.
- **Shape:** gently rounded (12px; 10px small).
- **Primary:** Cap Blue fill, white label in the display face (700, 16px, width 92%), 48px min height, 10px 18px padding, 8px icon gap.
- **Hover / Focus:** Deep Cap on hover; focus is a 3px Cap Blue outline offset 3px (global); active translates 1px down; disabled at 42% opacity.
- **Quiet:** paper with a 1.5px inset `line` ring that darkens to `ink-3` on hover.
- **Danger / Danger soft:** Down Red fill with white text; or Down Tint with red text.
- **Block / Small:** full width at 56px and 18px; or 36px and 14px.
- **Link:** Cap Blue, bold, underlined (1.5px, offset 3px).

### Status Chip (signature)
A pill in the status tint with a filled circle of the status colour holding a white lucide symbol (check, triangle alert, X, circle help; activity for sensor hints, wifi-off for no connection) and the status word in heavy display type. Three sizes: sm (24px symbol), md (32px), lg (48px). The map badge and board icon repeat the same symbol-in-circle.

### CanMeter (signature)
A small jerrycan whose blue water level drains in exact proportion to the 12-hour validity left on a confirmation, labelled with the hours left. Full right after an on-site confirmation; empty (dashed `ink-3` outline, pale body) means Unclear. The level eases over 1.4s on `cubic-bezier(0.16, 1, 0.3, 1)`. It sits beside the confirmation time in every row and on the board.

### Point Row
- **Corner Style:** 14px.
- **Background:** Paper on Stone, Lift shadow.
- **Layout:** yellow letter tile (56px, 30px heavy letter) left; name and location; status chip with one-line instruction; confirmation time plus CanMeter right; walking time top right. Alternatives appear as a Cap Tint line ("go to B instead"), or Stone Grey when none qualifies. Details open beneath a dashed rule as a definition list.

### Board Row
The same anatomy on whole grid cells, sized in em, with a 4.2em status circle and the status word in its colour at 2.5em. **Pour motion:** when a row's status changes, a layer of the status colour at 20% rises from the bottom over 2.4s and fades, the board's single authored moment.

### Board Tools
Under the board's notes: the QR code to the SMS view (a black-on-white SVG on a hairline ring, 6.2em, with a one-line bold caption) and a two-button language switch in a pill (min height 44px; the pressed button is ink with can-yellow text). Only on the full board, never on the stage's small copy. The board element carries the chosen `lang`.

### Sandbox Bar and Try Button
A full-width band in Cap Tint with Cap Deep text (8.6:1) under the top bar, or at the top of the stage: a flask icon, one plain sentence that says practice data on this device only, and two quiet small buttons (Reset practice data, Leave sandbox). The entry is a small primary button, "Try it yourself", in the demo strip and the stage header. Small buttons are 44px tall on touch screens.

### Route Check and Add-Point Forms
Under a point in the coordination list: one line of text with a small footprint icon says whether route and access are checked (green ink when valid, until when) and a small quiet button opens the form. The form is a stone panel with white inset-ring inputs (44px tall, Cap Blue ring on focus), labels above the fields in bold, an opening-hours group (an "Open all day" checkbox or two time fields) and the can-wash check "I walked the route ..." before the primary Save button; a quiet second button withdraws access. The Add-a-water-point form is the same panel.

### Repair Coupon (signature)
Paper with an inset hairline, 16px corners. Head in Can Wash with a 2px dashed ochre tear line. Below, a stamped sequence: 26px dots joined by 2px connectors; done stamps fill Working Green with a white check and keep their time; the next stamp has a 3px Cap Blue ring and blue label. Steps never disappear. Closed coupons drop to 72% opacity with a green closed note.

### Choices (field steps)
Full-width 84px paper tiles with a 2px inset ring, a 50px tinted status circle and a heavy label; selected fills the status tint with a 3px ring in the status colour. One step per screen, with "Step n of m" counter and a back icon button.

### Chips and Tags
- **Tag:** small pill (13px bold) in a status tint with status text.
- **Quick replies / blockers:** stone pills (14.5px bold) that hover to `stone-2`; an active blocker turns Limited tint.

### Inputs / Fields
- **Style:** paper, 12px radius (11px for search), no border, 1.5-2px inset `line` ring.
- **Focus:** the ring becomes Cap Blue at 2-2.5px.
- **Checkbox panel:** Can Wash panel, 24px checkbox with Cap Blue accent.

### Navigation
- **Top bar:** sticky, Jerrycan Yellow with the 3px ochre rule, 66px. Wordmark (CanMark + 25px heavy "WaterLink") left, pill nav centre, region and connection pill right.
- **Nav:** pill track in Jerrycan Ink at 9%; links 16px display 700 in `can-ink`; active is an Ink pill with yellow text. Under 860px the nav drops to a full-width second line.
- **Tabs (coordination):** the same pattern on a `stone-2` track.
- **Connection pill:** white at 60% on yellow; offline becomes Down Red with white text.

## Do's and Don'ts

### Do:
- **Do** keep the shell Jerrycan Yellow with the 3px ochre rule, and put content on Paper rows over Stone.
- **Do** show every status as word + drawn symbol + one of the four status colours.
- **Do** pair every confirmation time with the CanMeter and use tabular figures.
- **Do** use Cap Blue for every non-destructive action and link, with the 3px Cap Blue focus outline.
- **Do** arrange points as rows with the yellow letter tile, and repairs as coupons with stamped steps.
- **Do** keep touch targets at 48px or more and the public board sized in em from one root. Map tiles stay at least 46px on screen, however small the map is drawn.
- **Do** set type in rem so the browser's text size applies, and take every colour in a rule from a token (the ink and tint pairs for status text included). Printing is the one exception and stays black on white.
- **Do** tint all shadows with Jerrycan Ink (`rgba(58, 44, 0, …)`).

### Don't:
- **Don't** add a fifth status colour or use yellow, blue or green decoratively for state.
- **Don't** show a stale, offline or sensor-only state in Working Green.
- **Don't** lay points out as a grid of identical cards or build a white dashboard with a dark sidebar.
- **Don't** introduce a third typeface or set running text in Archivo.
- **Don't** add motion beyond the pour, the meter level, the settle mark and short state transitions (150-400ms); reduced motion removes the movement and leaves only the still tint on a changed board row.
- **Don't** remove a completed stamp from a coupon.
