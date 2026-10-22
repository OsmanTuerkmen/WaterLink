# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three groups with different situations, plus the pitch audience. The redesign must serve the jury and stay credible for real users equally (user decision, 11 Oct 2026).

- **Households** in a rural Kenyan neighbourhood (demo region: Marachi East, Busia). They decide before walking whether their water point works today and, if not, where to go instead. Many have no smartphone; around half of rural people own a mobile phone at all (Communications Authority of Kenya, 2023/24). They reach WaterLink through a public status board at a shop or meeting point, or a simple phone.
- **Operators** (one named person per water point) who confirm on site that water can be drawn, report outages and test repairs. Outdoors, on a phone, weak network.
- **Technicians** who claim repair jobs, document progress and blockers (parts, funding, staff) and report a repair.
- **Coordination** (county water office, NGO or maintenance service): overview of outages, jobs, blockers and response times. A possible paying customer; willingness to pay is unvalidated.
- **Hackathon jury** (Zero One Hackathon, WU Vienna, 22 Oct 2026, track Social Impact): must grasp the story in a three-minute demo.

## Product Purpose

WaterLink answers one question before people set out: "Does our water point work today?" It links a public status display for households with the flow from an outage report to an explicitly confirmed repair. Success means fewer wasted walks and visible responsibility for every outage. It does not guarantee current information for everyone or faster repairs.

## Positioning

Pump monitoring already exists. WaterLink covers what comes after: public information for households without smartphones, a reliable alternative, visible responsibility and a repair that only counts once an operator confirms it on site. It shows uncertainty openly: an old green status never looks current.

## Operating Context

- Public board (`?view=display`) readable from a few metres; a supervised chalkboard is the fallback during power cuts.
- Operators and technicians work on phones outdoors; for simple phones an SMS flow is planned but not connected.
- Demo: two windows or devices sharing one server state, polled every 3 seconds. Roles are switchable for the demo only.
- Times are shown in Kenya time (Africa/Nairobi, EAT).

## Capabilities and Constraints

- Implemented and tested: report → job → claim → progress/blockers → repair report → explicit on-site function test; status and job state separate; server-side role checks; history; revision conflict protection.
- Uncertainty rules: a confirmation is valid 12 hours (demo parameter); stale, conflicting, offline and sensor-hint states never show as working.
- Alternatives only when freshly confirmed working, route/access verified and open on arrival. Coordination can add a water point, check its route and access (walking time, directions, opening hours, an explicit "I walked the route" confirmation), mark access as closed, and remove points it added. A new point starts unconfirmed and unchecked.
- Stack: React 19 + TypeScript on Vinext (Cloudflare Worker), D1 storage, Tailwind 4. Business rules in `web/lib/domain.ts` stay; the redesign replaces the frontend.
- **All UI text in English** (user decision, 11 Oct 2026). The one exception is the public board, which can also be shown in Kiswahili (draft translation, not yet reviewed by a native speaker). Further languages are not decided.
- A practice mode (sandbox) lets anyone play the whole flow with practice data on their own device, without a code; the same rules run in the browser and nothing reaches the server.
- Not connected: SMS, live sensors, AI service, payments, real user accounts.

## Brand Commitments

- Name **WaterLink** stays. Logo and visual identity are open for redesign.
- "Working" describes operation only, never drinking-water quality. This note is always visible.
- Simulated and historical data are always labelled as such.

## Evidence on Hand

- `web/data/region.json`: 60 real water points from Water Point Data Exchange surveys in Marachi East, Busia (CC BY 4.0). Survey status is historical, never current.
- `web/data/kwale-sensors.json`: real weekly Smart Handpump volumes, Tiwi – Mshikeni, Kwale 2014 (openwashdata, CC BY 4.0), replayed as a sensor hint.
- No photos, testimonials, field validation, partners or impact numbers exist. Do not invent them. People, confirmations, routes and opening hours are simulated.

## Product Principles

1. One question, one glance: every view answers "can I go there?" before anything else.
2. Honest about uncertainty: unknown is shown as unknown, never as an old green.
3. A repair counts only when confirmed on site.
4. Works for people without smartphones; the phone flow is short enough for SMS.
5. Software shows bottlenecks (money, parts, staff); it does not pretend to solve them.

## Accessibility & Inclusion

- Status never by colour alone: word plus symbol plus colour.
- Large type and plain English on the public board; comprehension at a distance and across literacy levels still needs field testing.
- Touch targets sized for outdoor phone use; must work on slow connections.
