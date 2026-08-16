# Handoff: TripSafe Tourism Intelligence — console redesign

## Overview
Redesign of the TripSafe authority dashboard (`website_sih`) from the current navy/teal sidebar layout to a charcoal operations console with a two-row top bar. All ten existing views are covered. The data layer does not change: every number, string and score in the design comes from the repo's existing services.

## About the design files
The files in this bundle are **design references written in HTML** — a prototype of the intended look and behaviour, not production code to paste in.

- `TripSafe Console.dc.html` — the full prototype (all ten routes, live Leaflet map, theme + presentation toggles). It uses a component runtime that only exists in the design tool, so **do not port it verbatim**. Read it for layout, spacing, colour and copy.
- `tripsafe-model.js` — a straight port of the repo's `demoData.js` + `intelligenceService.js` + `actionEngine.js` + `mobilityService.js` + `privacyService.js`, with the same function names and outputs. Use it only to confirm which service output feeds which element; **keep the existing `src/services/*` and `src/data/*` in the repo as the source of truth.**

The task: **rebuild `index.html` / `styles.css` / `src/ui.js` in the existing vanilla-JS + template-string architecture** to match this design. No framework, no build step, no new dependencies beyond Leaflet (already present). `src/app.js`, `src/data/*` and `src/services/*` stay as they are apart from the notes under "Behaviour changes".

## Fidelity
**High fidelity.** Exact hex values, type sizes, radii and copy are listed below and are all present in the prototype. Recreate pixel-for-pixel.

## Design tokens

Put these on `:root` in `styles.css`, replacing the current token block.

### Colour
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0c0e0d` | page background, sticky header background |
| `--panel` | `#141816` | every card / panel |
| `--panel2` | `#1b201d` | inner bar tracks, hover row, avatar, selects inside cards |
| `--line` | `rgba(232,236,233,.10)` | every border and rule (1px, hairline) |
| `--text` | `#e8ece9` | primary text |
| `--muted` | `#8d9691` | labels, secondary copy, axis labels |
| `--hi` | `#dde5da` | light sage panel — the one accent surface per screen |
| `--onhi` | `#12150f` | text on `--hi` |
| `--accent` | `#b9cfae` | sage — chart fills, tab/active hairlines, logo ring |
| `--brand` | `#E4572E` | app-theme rust — logo mark, active tab underline |
| `--crit` | `#E4572E` | critical crowd / urgent priority / delay figures |
| `--high` | `#F2C230` | high crowd / high priority |
| `--mod` | `#3FBF74` | moderate crowd / opportunity / positive delta |
| `--low` | `#7f8d85` | low crowd / monitor priority |

There are exactly two surface colours (`--panel` on `--bg`) plus one light panel (`--hi`). No gradients, no shadows, no glow. The current `box-shadow: 0 18px 50px` on `.card` and the `radial-gradient` body background are both removed.

### Typography
- Headings / titles / KPI labels — **Space Grotesk** 600, `letter-spacing:-0.02em`
- Body / labels / table cells — **Archivo** 400–500
- All numerals — **Space Mono** 400, `letter-spacing:-0.03em`

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap">
```

Scale (px): page title `--h1` 27 (presentation mode 40) · panel title 14/15 600 · KPI numeral `--kpi` `clamp(20px,2.1vw,31px)` (presentation `clamp(26px,2.9vw,42px)`) · big secondary numerals 34 · corridor metric 24 · body 12.5–13 line-height 1.5–1.6 · table cell 13 · caption/muted 11–11.5 · uppercase section label 10 with `letter-spacing:.13em` · legend 10.5. Root font-size 13px, `letter-spacing:-0.005em`.

### Geometry
- Radius: cards `--r` 14px · pills, chips, buttons, bar tracks `999px` · bar fills 4px top / 2px bottom · small inner blocks 10px.
- Grid gap 12px everywhere; page padding `26px 30px 60px`; card padding `16–18px`.
- Card borders are always `1px solid var(--line)`. Action cards additionally carry `border-left:3px solid <priority colour>`.
- Uppercase micro-labels sit above their value with a `1px solid var(--line)` top rule and 12px padding — this rule/label pattern is the main structural device; use it instead of nested cards.

## Shell

**Row 1 (sticky, `padding:14px 30px`, `flex-wrap:wrap`, `gap:20px`, bottom hairline):**
logo (26px rounded-8 square, 1px `--brand` ring, 10px `--brand` dot) + "TripSafe" 14/600 with "TOURISM INTELLIGENCE" 9.5px `.14em` uppercase muted beneath · three pill selects (Region, Category, Date range — `--panel` bg, `--line` border, `999px`, `7px 13px`, 12px) · flex spacer · live-feed status (6px `--mod` dot with `0 0 0 3px rgba(169,192,150,.15)` halo + "Live feed · 12 min ago", `white-space:nowrap`) · clock in Space Mono 14px · presentation pill button · operator block (26px circle avatar "KR" + "K. Ramesh" 12px / "Tourism Authority" 10px muted, separated by a left hairline with 16px padding).

**Row 2 — route tabs:** horizontal, `padding:0 30px`, overflow-x auto, each tab `11px 14px 12px`, 12.5px; active = `--text` + 600 + `2px solid var(--brand)` bottom border; inactive = `--muted` + transparent border. Order and labels: Overview · Action centre · Tourism · Crowd · Opportunities · Mobility · Safety · Recommendations · Destinations · Data & privacy. (These map to the existing routes `dashboard, actionCenter, tourism, crowd, opportunities, mobility, safety, recommendations, destinations, privacy`.) The 260px sidebar is deleted.

**Page head (every route):** left — `<h1>` at `--h1` plus a one-line muted blurb (copy per route in the prototype's `routeMeta()`); right — right-aligned wrapping row of hairline chips: `"{n} destinations in view"`, `"{region} · {dateRange}"`, `"{n} open interventions"`.

## Reusable blocks

Build these once and compose each route from them.

1. **KPI strip** — `grid-template-columns:repeat(6,1fr)`, min-height 118px. Card = uppercase 10.5px label / numeral bottom-aligned / 11px delta line. **Card 1 only** uses `--hi` + `--onhi` (the single light panel). Non-numeric values (e.g. `CRITICAL`, a destination name) drop to 20px/17px so they never clip. Source: `kpis()` — Consenting travellers, Total visits, Average dwell, Peak crowd pressure (coloured by level), Most visited, Active advisories.
2. **Map hero** — `1.55fr 1fr` with the signals rail, or full width. Header: title 14/600 + "Circle area scales with aggregated visits · colour shows crowd level" + a four-item crowd legend (8px dots). Body height `--maph` 356px (presentation 420px). Leaflet with `attributionControl:false`, `scrollWheelZoom:false`, CARTO `dark_all` tiles, attribution control hidden in CSS, `.leaflet-container{background:transparent}`, `.leaflet-bar a{background:#141816;color:#e8ece9}`. Markers: `circleMarker`, `radius = 8 + sqrt(visits/maxVisits)*18`, `weight:1.2`, fill opacity `.2` (`.42` when selected), colour by crowd level; tooltip = name / visits / crowd / peak; click selects the destination. Corridors: dashed polylines (`dashArray:"5 6"`, `weight:1.6`, `opacity:.6`) between each corridor's connected places, coloured by `roadPressureLevel`. `fitBounds` with 42px padding.
3. **Signals rail** — panel title + rows separated by top hairlines: uppercase 9.5px tag (`.14em`, coloured: crowd/advisory `--crit`, opportunity `--mod`, else `--muted`) over 12.5px text over 11px muted sub. Source: `keyInsights()` on Overview; capacity ranking on Crowd.
4. **Mobility strip** — panel with `repeat(6,1fr)` of label-over-value cells, each with a top hairline; values 22px (top corridor 13px), delay in `--crit`. Source: `mobilityPressureSummary()`.
5. **Charts** — `1.35fr 1fr`. Left: visits/week, 7 columns 150px tall, value above / bar / day below; peak day bar filled `--hi`, others `--panel2`. Right: intraday, 24 bars 3px gap, bars ≥85% of peak filled `--accent`, rest `--panel2`, axis labels 00/06/12/18/23. Sources: `visitsOverTime`, `hourlyCurve`.
6. **Category bars** — rows of `150px | 1fr | 80px`: label, 8px `--panel2` track with `--accent` fill, right-aligned value. Source: `categoryDistribution()`.
7. **Destination table** — columns `minmax(0,2.2fr) 92px 92px 118px 96px 120px`: Destination (name 13px + "Category · dominant activity" 11px muted) / Visits / Avg dwell / Peak window / Crowd (coloured uppercase) / a route-specific last column. Header row 10px uppercase `.11em` between hairlines; rows 13px 18px with bottom hairline, `--panel2` on hover, `--panel2` when selected, click selects. Last column: Tourism → trend % (`--mod` / `--crit`); Opportunities → `opportunityScore` in `--mod`; Destinations → rating.
8. **Destination detail** — `1fr 1.25fr`. Left is the light `--hi` panel: "DESTINATION HEALTH" label, name 19/600, score 64px Space Mono + "/ 100", 6px progress track (`rgba(0,0,0,.14)`, fill `--onhi`, or `--crit` under 60), then Working / Warning / Opportunity blocks separated by `rgba(0,0,0,.12)` rules. Right: "Why this matters" paragraph card + a 2×2 grid of Crowd management / Mobility / Safety / Nearby alternatives cards. Sources: `destinationHealth()`, `whyThisMatters()`, `destinationRecommendation()`, corridor `recommendation`, risk `suggestedResponse`, `alternatives`.
9. **Corridor card** — `minmax(0,1.5fr) repeat(4,1fr)`: left column = uppercase "<LEVEL> ROAD PRESSURE" in the level colour, corridor name 15/600, "mode · confidence X", inferred-signal pill chips; then four metric cells (Aggregated trips, Average travel vs baseline, Travel delay in `--crit`, Road pressure in the level colour) at 24px; recommendation paragraph spans the full width above a top hairline. Source: `deriveMobilityMetrics()`.
10. **Risk card** — `repeat(3,1fr)`; high-level cards get a `--crit` border and a filled `--crit` pill (text `#12150f`), others `--panel2`/muted. Level pill + peak window, place name 15/600, reason, then "Affected activity" and "Response" blocks under hairlines. Source: `riskSignals` + joined place.
11. **Recommendation card** — `repeat(2,1fr)`; the first card is the light `--hi` panel. Priority pill + place, problem 15.5/600, then `88px | 1fr` label/value rows for Evidence, Action, Objective. Source: `recommendations`.
12. **Priority counters** — `repeat(4,1fr)`; 7px dot + label left, count 34px in the priority colour right. Source: `groupedActions()`.
13. **Intervention simulator** — `270px | 1fr`. Left: title, one-line explanation, scenario `<select>` (`--panel2`, radius 10), "IMPACT TYPE" under a hairline. Right: two columns — Relieved (projected 34px, current struck through, `−x%` in `--crit`, 8px bar) and Absorbed (`+x%` in `--mod`) — then a full-width footer line "N visits shifted per week · <scenario> · requires field validation before deployment". Source: `simulateImpact()`.
14. **Action card** — `118px | minmax(0,1.5fr) | minmax(0,1.1fr)` with the 3px priority left border. Col 1: priority uppercase in its colour, score 30px, "priority score", "Confidence X" under a hairline. Col 2: title 15/600, three hairline chips (category, location, "Requires field validation"), then "EVIDENCE" with up to four `· item` lines. Col 3: "RECOMMENDED ACTION", "EXPECTED IMPACT" under a hairline, and two buttons pinned to the bottom — primary `--hi`/`--onhi` pill "Assign owner", secondary hairline pill "Score detail". Source: `buildActionCenter()`.
15. **Privacy blocks** — 2×2 rule cards from `privacySummary()` (rewritten as title + body pairs), a light `--hi` banner with the threshold numeral at 56px beside an explanatory paragraph, and a feed table (`minmax(0,1.6fr) 130px 130px 150px`: Feed / Records / Freshness / Aggregation, states coloured `--mod` / `--muted` / `--high`).

## Route composition

| Route | Blocks, in order |
|---|---|
| Overview | KPI strip · map + signals rail · mobility strip · charts · priority counters · simulator · top 3 action cards ("Top interventions") |
| Action centre | priority counters · simulator · all action cards ("Intervention queue") |
| Tourism | charts · category bars · destination table (trend column) |
| Crowd | map + capacity rail · action cards filtered to Crowd management + Visitor redistribution |
| Opportunities | destination table (score column, `tourismOpportunities()` order) · action cards filtered to Tourism promotion + Visitor redistribution |
| Mobility | mobility strip · three corridor cards · action cards filtered to Road & traffic / Public transit / Parking & access / Facility improvement |
| Safety | risk cards · action cards filtered to Safety & risk |
| Recommendations | recommendation cards · top 6 action cards ("Explainable ranking") |
| Destinations | full-width map (no rail) · full destination table · destination detail |
| Data & privacy | privacy rule cards · threshold banner · feed table |

Each action list keeps a header line: left title 15/600, right muted note (e.g. "Ranked by priority score", "Field validation required before capacity decisions").

## Interactions & behaviour
- Route tabs, the three filter selects, the scenario select and destination-row/marker selection all re-render through the existing `render()` in `src/app.js`.
- Region and Category filter the joined places; the existing empty-state path stays for filter combinations with no aggregate.
- Selecting a row or a map marker sets `selectedDestination`; the map redraws fill opacity, the table highlights the row with `--panel2`. Do **not** keep the existing `scrollIntoView` call.
- Presentation mode: enlarges `--h1` to 40px, `--kpi` to `clamp(26px,2.9vw,42px)` and the map to 420px. Nothing is hidden.
- Clock in the header updates every 20s; feed age is a static "12 min ago" string until a real freshness value exists.
- Hover: table rows → `--panel2`; primary button → `opacity:.85`; secondary button → `--panel2` background; links/tabs no underline.
- Map: `scrollWheelZoom` off so page scroll works over the map; call `invalidateSize()` shortly after each mount/route change.

## Behaviour changes to the data/service layer
Only two, both cosmetic:
1. Remove the "DEMO DATA — Prototype" pill, the `DATA_SOURCE` / `DATA_SOURCE_DETAIL` chips and the word "demo" from user-visible strings in `demoData.js`, `actionEngine.js`, `mobilityService.js` and `intelligenceService.js` (e.g. "aggregated demo visits" → "aggregated visits", "relative to the demo baseline" → "against baseline"). The console should read as a live monitoring tool. Scores, thresholds and logic are untouched.
2. Action `category` labels are sentence case in the design ("Crowd management", "Road & traffic pressure", "Parking & access", "Safety & risk", "Public transit pressure", "Facility improvement", "Tourism promotion", "Visitor redistribution"). Rename in `actionEngine.js` and update the route filters accordingly.

The privacy copy in `privacyService.js` is rewritten as four title/body pairs — text is in the prototype's `privacyRules`.

## State
Existing `state` in `src/app.js` covers it, minus `presentation` semantics: `route`, `region`, `category`, `dateRange`, `crowd` (optional — the design exposes Region / Category / Date range only), `selectedDestination`, `scenario`, `presentation`. Add `clock`.

## Assets
None. No images, no icon set, no SVG illustrations. The logo is a bordered square plus a dot; the only external resources are the two font families, Leaflet 1.9.4 and CARTO `dark_all` tiles (all already referenced in `index.html`).

## Files in this bundle
- `TripSafe Console.dc.html` — the prototype (design reference only; do not port its runtime)
- `tripsafe-model.js` — ported data + service functions, for cross-checking which service output drives which element
