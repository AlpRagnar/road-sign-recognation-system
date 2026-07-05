PAGE NAME: Sign Map — Mobile
ROUTE: /map/signs (mobile)
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-screen mobile map + filter drawer + detail bottom sheet
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile view of the grouped traffic-sign inventory map. The map must fill the screen; filters and sign details must not permanently cover it.

USER'S MAIN TASK
Pan/zoom the map, open a filter drawer to narrow results, tap a sign to see its details in a bottom sheet.

VISUAL PRIORITY
The map fills the viewport edge to edge under the compact top bar. Controls float over it.

MOBILE INFORMATION ORDER
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. A thin overlay bar at the top of the map: a "Filters" button (opens the filter drawer), the [Markers · Clustered · Density] segmented control (compact/icon), and a "{N} signs" counter chip.
3. The map (full-width, all remaining height): blue pins, blue count clusters, amber selected marker, density legend as a small collapsible chip bottom-left.
4. A "locate me" button bottom-right (optional).

MOBILE FILTER DRAWER (bottom sheet)
- Opens from "Filters"; rounded top + drag handle; contains: Sign type select ("All sign types" + friendly names), Status select ("All statuses"/Pending/Auto verified/Manually verified/Rejected/Duplicate), Confidence select ("Any confidence"/≥50%/≥75%/≥90%), a styled "Last detected" date-range. Footer: "Apply" (primary) + "Reset". A small badge shows the active-filter count on the "Filters" button.

DETAIL BOTTOM SHEET (on marker tap)
- Rounded-top sheet with drag handle; header "Sign detail" + friendly sign name + close.
- Rows (compact): Status BADGE, Confidence %, Detections, Observations, Latitude/Longitude (mono), First/Last detected.
- "Latest related event": Class, Confidence, GPS accuracy, At + "View latest detection →".
- Optional representative thumbnail with bbox; "No related event visible." when empty.
- The sheet is dismissable (swipe down / close); the selected marker stays amber and centered while the sheet is open (map pans so the marker sits above the sheet).

STICKY CONTROLS: top bar + the map overlay control bar; the bottom sheets are modal-over-map.
CAMERA ASPECT RATIO: n/a.
TOUCH CONTROLS: ≥44px controls; segmented control large enough to tap; markers have a comfortable tap radius.
TABLE-TO-CARD CONVERSION: n/a.
SAFE-AREA PADDING: bottom sheets + floating buttons respect the safe area.
SCROLL REGIONS: the map pans; the drawer/sheet scroll internally.
ERROR-MESSAGE PLACEMENT: a slim red banner slides under the top bar ("Couldn't load signs" + Retry); thumbnail errors inside the sheet.
HOW MAP CONTENT REMAINS USABLE: filters and details are transient sheets, never a permanent panel; the map is always the background; when a sheet is open the map still shows the selected amber marker above it.

EXACT FIELDS AND LABELS: "{N} signs", "Filters", segmented "Markers/Clustered/Density", "Sign detail", row labels (Latitude, Longitude, Confidence, Status, Detections, Observations, First detected, Last detected), "Latest related event", "View latest detection →", "No related event visible.", filter option labels as in 004_sign_map.md.
PRIMARY ACTIONS: open Filters → Apply; tap a marker.
SECONDARY ACTIONS: switch view mode; "View latest detection →".
DESTRUCTIVE ACTIONS: none. FILTERS: in the bottom drawer.
LOADING STATE: "Loading map…" placeholder; counter "Loading…".
EMPTY STATE: "No signs match these filters" overlay chip + "Reset".
ERROR STATE: red banner under the top bar.
PERMISSION STATE: all authenticated users.
CONFIRMATION STATE: none.
DESKTOP/TABLET BEHAVIOR: use 004_sign_map.md.

REALISTIC EXAMPLE DATA
Counter "40 signs"; clusters "2"/"3"/"6"; selected "Road Work · Manually verified · 69% · 6 detections · 57.054086, 9.891894"; latest event "Road Work · 80% · 10 m". Aalborg basemap; friendly names only.

CONSISTENCY RULES
Status badges, amber selected marker, mono coordinates, density legend — same as desktop.

ELEMENTS TO AVOID
A permanent side panel eating the map; raw date inputs; a scaled desktop toolbar; tiny tap targets.

FINAL STITCH INSTRUCTION
Design the 390px mobile traffic-sign map: a full-screen map under a compact top bar with a floating overlay bar (Filters button, Markers/Clustered/Density segmented control, "{N} signs" counter), a bottom-sheet filter drawer, and a bottom-sheet Sign detail (status badge + latest related event) that keeps the map visible — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
