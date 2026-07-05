PAGE NAME: Devices — Mobile
ROUTE: /devices (mobile)
USER ROLE: Field user + Administrator
SCREEN TYPE: Card list + register/edit bottom sheet
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile management of the user's own devices. The desktop table becomes a card list; register/edit is a bottom sheet.

USER'S MAIN TASK
Register a device or edit a device before starting a session.

VISUAL PRIORITY
The device card list + a sticky "Register device" primary button.

MOBILE INFORMATION ORDER
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. Page header: "Devices" + short description.
3. Device CARD LIST (table → cards): each card shows device name (bold), Type, a Status BADGE (Active/Inactive), Detections count, Last seen, Identifier (mono, small). Card actions: "Edit" (opens sheet); for admins a small "⋯" menu adds "Deactivate".
4. STICKY bottom bar: "Register device" primary button (safe-area padding).

REGISTER / EDIT BOTTOM SHEET
- Rounded-top sheet + drag handle. Register: "Device name *", "Device type *" (segmented or select of the five types), "Identifier (optional)". Submit "Create device". Edit: "Device name", "Device type"; STATUS control only for admins. Submit "Save changes". Fields full-width, ≥44px.

TABLE-TO-CARD CONVERSION: the 8-column table collapses to a two-line card (title + status/detections row, meta row).
MOBILE FILTER DRAWERS: none needed (few devices).
SAFE-AREA PADDING: sticky Register bar + sheet respect the safe area.
SCROLL REGIONS: page scrolls the card list; sheet scrolls internally.
ERROR-MESSAGE PLACEMENT: inline red banner under the header (e.g., identifier conflict).
SESSION CONTROL PLACEMENT: n/a.

EXACT FIELDS AND LABELS: "Devices", "Register device", card fields (Type, Status, Detections, Last seen, Identifier), form labels "Device name *", "Device type *", "Identifier (optional)", "Create device", "Save changes", tooltip "Status is managed by an administrator", empty "You have no devices yet. Click 'Register device' to add one.".
PRIMARY ACTIONS: "Register device" (sticky), "Create device"/"Save changes".
SECONDARY ACTIONS: "Edit".
DESTRUCTIVE ACTIONS: "Deactivate" (admin only) with a confirmation.
FILTERS: none.
LOADING STATE: "Loading devices…" skeleton cards.
EMPTY STATE: empty message + prominent Register button.
ERROR STATE: inline red banner.
PERMISSION STATE: field users see status as a read-only badge (no status control, no Deactivate).
CONFIRMATION STATE: Deactivate confirmation (admin only).
DESKTOP/TABLET BEHAVIOR: use 006_devices.md.

REALISTIC EXAMPLE DATA
Cards: "Field Phone – Surveyor · mobile_phone · Active · 34 detections · DEMO-1002"; "IoT Node – Bridge · custom_iot_device · Inactive · DEMO-1004".

CONSISTENCY RULES
Status badges match the app; admin-only controls gated; identifiers mono.

ELEMENTS TO AVOID
A horizontally scrolling desktop table on mobile; a status control for field users; Register buried in the scroll.

FINAL STITCH INSTRUCTION
Design the 390px mobile Devices page: a device card list (name, type, status badge, detections, last seen, identifier) with a sticky "Register device" button and a register/edit bottom sheet where status is admin-only — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
