PAGE NAME: Device Map — Mobile
ROUTE: /map/devices (mobile)
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-screen mobile device map + detail bottom sheet
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile view of live device positions. Map fills the screen; device details open in a bottom sheet; status is legible from marker colour.

USER'S MAIN TASK
See device distribution and health on the map, tap a device for details.

VISUAL PRIORITY
Full-screen map with colour-coded device markers.

MOBILE INFORMATION ORDER
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. A thin overlay bar on the map: "Polling every 7s" chip (left), a status filter chip (All/Active/Inactive/Offline), and "{N} device(s)" counter (right).
3. The map (full-width, all height): device markers colour-coded by status (Active green, Inactive grey, Offline red), distinct from sign pins; a small legend chip bottom-left; a "locate me" button bottom-right.

DETAIL BOTTOM SHEET (on marker tap)
- Rounded-top sheet + drag handle; device name (bold); Type; Status BADGE; Owner; Last seen; dismissable. The tapped marker stays highlighted (amber ring) and the map pans it above the sheet.

STICKY CONTROLS: top bar + map overlay bar.
CAMERA ASPECT RATIO: n/a.
TOUCH CONTROLS: ≥44px chips; comfortable marker tap radius.
TABLE-TO-CARD CONVERSION: n/a (no table).
MOBILE FILTER DRAWERS: the status filter is a single chip menu (small); no full drawer needed.
SAFE-AREA PADDING: sheet + floating buttons respect the safe area.
SCROLL REGIONS: map pans; sheet scrolls internally.
ERROR-MESSAGE PLACEMENT: a slim non-blocking banner under the top bar ("Couldn't refresh — retrying"); last-known markers stay.
SESSION CONTROL PLACEMENT: n/a.
HOW MAP CONTENT REMAINS USABLE: details are a transient bottom sheet; the map is always the background; legend collapsible.

EXACT FIELDS AND LABELS: "Polling every 7s", "{N} device(s)", "· updated {time}", sheet fields "Type", "Status", "Owner", "Last seen", legend "Active/Inactive/Offline".
PRIMARY ACTIONS: tap a device.
SECONDARY ACTIONS: filter by status.
DESTRUCTIVE ACTIONS: none. FILTERS: status chip.
LOADING STATE: "Loading map…" placeholder.
EMPTY STATE: "No device locations yet" overlay chip.
ERROR STATE: banner under top bar.
PERMISSION STATE: all authenticated users.
CONFIRMATION STATE: none.
DESKTOP/TABLET BEHAVIOR: use 005_device_map.md.

REALISTIC EXAMPLE DATA
Counter "4 device(s) · updated 12:41:07"; markers: Patrol 1 (Active green), Surveyor (Active green), Van 7 (Active green), IoT Node – Bridge (Inactive grey). Sheet: "Vehicle Cam – Patrol 1 · vehicle_camera · Active · Demo Admin · Last seen 6/26/2026, 2:18 AM".

CONSISTENCY RULES
Distinct device markers colour-coded by status; status badges; amber selected; mono timestamps.

ELEMENTS TO AVOID
All-blue identical markers; a permanent panel; scaled desktop toolbar; tiny targets.

FINAL STITCH INSTRUCTION
Design the 390px mobile device map: a full-screen map under a compact top bar with a floating overlay bar ("Polling every 7s", status filter, "{N} device(s)" counter), device markers colour-coded by status with a legend, and a bottom-sheet device detail (status badge, owner, last seen) that keeps the map visible — using the exact palette and status language below. Distinct from the sign map.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
