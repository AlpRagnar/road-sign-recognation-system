PAGE NAME: Device Map (Live Device Map)
ROUTE: /map/devices
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-bleed live map of device positions (polling)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 005_device_map_mobile_390px.md)

PAGE PURPOSE
Show the last-known locations of field devices, refreshed by polling, so an operator can see fleet distribution and device health at a glance. Must look clearly DIFFERENT from the sign map (different marker language) so the two maps aren't confused.

USER'S MAIN TASK
See where devices are, which are active vs inactive vs stale/offline, and read a device's details.

VISUAL PRIORITY
The map. Device status must be legible spatially (marker colour/shape), not only inside a popup.

LAYOUT
App shell. Compact header + a thin toolbar, then a full-height map. Device popups open on the map; an optional compact right list of devices can accompany the map on wide screens.

PAGE HEADER
- Title "Live Device Map", description "Last-known device locations, refreshed by polling."

TOOLBAR (thin row above the map)
- Left: a live status chip "Polling every 7s".
- Center: a device STATUS FILTER (All / Active / Inactive / Offline) — a design improvement using the existing status + last-seen data.
- Right: a counter "{N} device(s)" plus "· updated {time}" when refreshed.

MAP BEHAVIOR
- OSM-style basemap; zoom top-left; attribution bottom-right.
- Device markers use a DISTINCT shape from sign pins (e.g., a rounded-square/diamond "device" glyph), COLOUR-CODED by status: Active = green, Inactive = grey, Offline/stale (no recent last_seen) = red. Add a small legend (bottom-left) mapping the three colours. (The current app draws all devices as identical blue pins with text-only status — improve this using the real `status` + `last_seen_at`.)
- Clicking a marker opens a popup.

DEVICE POPUP
- Bold device name; "Type: {device_type}"; "Status: {status}" as a status badge; "Owner: {full name or email or —}"; "Last seen: {datetime or —}". Keep it compact.

OPTIONAL RIGHT LIST (wide desktop only)
- A compact device list card (Name · Type · Status badge · Last seen) that syncs with the map — selecting a row highlights its marker (amber selected), and vice versa.

EXACT COMPONENTS: toolbar (polling chip + status filter + counter), map with colour-coded device markers, legend, device popup, optional synced device list.
EXACT FIELDS AND LABELS: "Live Device Map", "Last-known device locations, refreshed by polling.", "Polling every 7s", "{N} device(s)", "· updated {time}", popup "Type:", "Status:", "Owner:", "Last seen:".
PRIMARY ACTIONS: select a device (map or list).
SECONDARY ACTIONS: filter by status.
DESTRUCTIVE ACTIONS: none (device management is on Devices / Admin Devices).
FILTERS: device status.
TABLE OR CARD CONTENT: optional right device list.
LOADING STATE: "Loading map…" placeholder; counter empty until first poll.
EMPTY STATE: no devices with location → a map overlay chip "No device locations yet" (devices appear once they report a position during a session).
ERROR STATE: polling failure → a slim non-blocking banner "Couldn't refresh device locations — retrying"; keep the last-known markers.
PERMISSION STATE: all authenticated users.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR: use 005_device_map_mobile_390px.md.
TABLET BEHAVIOR (768px): hide the right list; toolbar wraps; popups as bottom sheets.
DESKTOP BEHAVIOR: map dominant; optional synced list on the right for wide screens.

REALISTIC EXAMPLE DATA
Counter "4 device(s) · updated 12:41:07". Devices: "Vehicle Cam – Patrol 1 · vehicle_camera · Active · Demo Admin · Last seen 6/26/2026, 2:18 AM"; "Field Phone – Surveyor · mobile_phone · Active"; "Dashcam – Van 7 · dashcam · Active"; "IoT Node – Bridge · custom_iot_device · Inactive". Aalborg basemap.

CONSISTENCY RULES
Device markers are visually distinct from sign markers; status uses the shared badge/colour language; selected device marker = amber.

ELEMENTS TO AVOID
Identical-to-sign-map blue pins with no status colour; a popup that's the only way to read status; no legend; letting a right list shrink the map.

FINAL STITCH INSTRUCTION
Design a full-bleed live device map: a thin toolbar ("Polling every 7s" chip, an Active/Inactive/Offline status filter, "{N} device(s) · updated {time}" counter), a map with DISTINCT device markers colour-coded by status plus a legend, compact device popups (name, type, status badge, owner, last seen), and an optional synced device list on wide screens — using the exact palette and status language below. Make it clearly different from the sign map.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
