PAGE NAME: Sign Map (Traffic Sign Map)
ROUTE: /map/signs
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-bleed interactive map with filter toolbar + slide-in detail panel
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 004_sign_map_mobile_390px.md)

PAGE PURPOSE
Explore the OPTIMIZED, grouped traffic-sign inventory (one marker per fused sign record, not raw detection events) on a map, filter it, and inspect a sign's details. The map is the primary element and should dominate the viewport.

USER'S MAIN TASK
Filter the inventory, read spatial distribution (markers / clusters / density), click a sign to see its details and its latest related detection.

VISUAL PRIORITY
The map. Everything else (filter toolbar, view-mode control, counter, detail panel) frames the map without shrinking it.

LAYOUT
App shell. A compact page header row, then a thin filter toolbar, then the map filling all remaining height. A 320–360px Sign detail panel slides in from the right OVER the map when a marker is selected (map stays visible on the left).

PAGE HEADER
- Title "Traffic Sign Map", description "Optimized sign inventory (grouped detections), not raw events."

FILTER TOOLBAR (one dense sticky row above the map)
- Sign type select: first option "All sign types", then friendly sign names (Maximum Speed Limit 60, No Entry, Road Work, Stop, Yield, School Zone, Roundabout, Parking, Pedestrian Crossing, Speed Limit 30…).
- Status select: "All statuses", "Pending", "Auto verified", "Manually verified", "Rejected", "Duplicate".
- Confidence select: "Any confidence", "≥ 50%", "≥ 75%", "≥ 90%".
- A styled DATE-RANGE control labelled "Last detected" (from / to) — NOT two raw browser date inputs.
- Right side: a segmented control [Markers · Clustered · Density] (default Clustered) + a counter "{N} signs" (e.g., "40 signs"; "Loading…" while loading).

MAP BEHAVIOR
- OSM-style basemap; zoom controls top-left; attribution bottom-right.
- Markers = brand-blue pins. Clusters = blue circles with a white count. Selected sign = amber marker + a subtle highlight ring, visually anchored to the open detail panel.
- Density mode = graduated heat cells with a PERSISTENT LEGEND (bottom-left card) showing the scale: low → high (green → yellow → orange → red bands). This legend must be visible in density mode (the current app hides it).
- Clicking a cluster zooms in; clicking a single marker opens the detail panel.

DETAIL PANEL BEHAVIOR (right slide-in, 320–360px)
- Header "Sign detail" + close "✕".
- Title: the friendly sign name (e.g., "Road Work"). Optional representative thumbnail with a green bbox if available; else "No image captured".
- Rows: Latitude (6-dp mono), Longitude (6-dp mono), Confidence (% or —), Status (a STATUS BADGE, e.g., "Manually verified" — not raw text), Detections (count), Observations (count), First detected (date or —), Last detected (date or —).
- Sub-heading "Latest related event": Class (friendly), Confidence (% or —), GPS accuracy ("{n} m" or —), At (datetime). Link "View latest detection →" (to detection detail). Empty: "No related event visible.".
- Loading "Loading…"; error shows the message text.

EXACT COMPONENTS: filter toolbar (3 selects + date-range + segmented control + counter), Leaflet-style map, blue/amber markers, blue clusters, density legend, right Sign detail panel.
EXACT FIELDS AND LABELS: as listed above (toolbar options, "{N} signs", "Sign detail", row labels, "Latest related event", "View latest detection →", "No related event visible.").
PRIMARY ACTIONS: filter the map; select a marker.
SECONDARY ACTIONS: switch view mode; open "View latest detection →".
DESTRUCTIVE ACTIONS: none (review/delete happen elsewhere).
FILTERS: sign type, status, confidence, last-detected date range (toolbar).
TABLE OR CARD CONTENT: none (map + detail panel).
LOADING STATE: map area shows "Loading map…" placeholder; counter shows "Loading…"; detail panel "Loading…".
EMPTY STATE: filtered to zero → an unobtrusive map overlay chip "No signs match these filters" + a "Reset filters" link; counter "0 signs".
ERROR STATE: if the map data fails, a slim red banner above the map "Couldn't load signs" + Retry; if a signed thumbnail fails in the panel, show "Image failed to load (the signed URL may have expired)." + "Refresh image".
PERMISSION STATE: available to all authenticated users (field + admin); no admin gating.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR: use 004_sign_map_mobile_390px.md (filters → bottom drawer, detail → bottom sheet, map full-width).
TABLET BEHAVIOR (768px): toolbar wraps to two rows or collapses secondary filters into a "Filters" button; detail panel overlays the map (does not push).
DESKTOP BEHAVIOR: as described; map dominates; detail panel overlays from the right.

REALISTIC EXAMPLE DATA
Counter "40 signs". Markers over an Aalborg basemap with clusters "2", "3", "6". Selected sign detail: "Road Work · Manually verified · Confidence 69% · Detections 6 · Observations 1 · 57.054086, 9.891894 · First detected 6/19/2026 · Last detected 6/26/2026". Latest related event: "Road Work · 80% · 10 m · 6/19/2026, 2:12 PM". Friendly names only.

CONSISTENCY RULES
Status shown as a badge (same as every other page). Selected marker amber; density legend always visible in density mode; coordinates in mono.

ELEMENTS TO AVOID
Shrinking the map for oversized panels; raw browser date inputs; hiding the density scale; a detail panel with no visual link to its marker; raw snake_case status.

FINAL STITCH INSTRUCTION
Design a full-bleed traffic-sign inventory map: a dense filter toolbar (sign type, status, confidence, a styled last-detected date range) with a Markers/Clustered/Density segmented control and a "{N} signs" counter, blue markers + blue count clusters + an amber selected marker anchored to a right-hand Sign detail panel (with a status badge and a "Latest related event" section), and a persistent density legend — using the exact palette and status language below. The map dominates the screen.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
