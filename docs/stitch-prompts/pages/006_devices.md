PAGE NAME: Devices (my devices)
ROUTE: /devices
USER ROLE: Field user + Administrator (manages the current user's OWN devices)
SCREEN TYPE: Table + register/edit form
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 006_devices_mobile.md)

PAGE PURPOSE
Let a user register and manage the field devices they use for detection sessions. Device active/inactive STATUS is admin-only; a field user can register/rename their devices but cannot change status.

USER'S MAIN TASK
Register a device (name + type), see their devices with status and detection counts, and edit permitted fields.

VISUAL PRIORITY
The device table, with a clear "Register device" primary action. The register/edit form is a focused side panel or modal, not a large inline block.

LAYOUT
App shell. Header + a right-aligned "Register device" button, then a dense device table. Register/Edit opens a right slide-in panel.

PAGE HEADER
- Title "Devices", description "Register and manage the field devices you use for detection sessions."
- Right: primary button "Register device".

TABLE COLUMNS (dense)
Name · Type · Identifier (mono) · Status (BADGE: Active green / Inactive grey) · Detections (count) · Last seen (datetime or —) · Created (date) · Actions.
- Actions: "Edit" (opens the panel). For ADMIN only: a "Deactivate" affordance appears; for field users the status is read-only (badge only) with a small tooltip "Status is managed by an administrator".

REGISTER / EDIT PANEL (right slide-in)
- Register: fields "Device name *", "Device type *" (select: mobile_phone, vehicle_camera, dashcam, custom_iot_device, test_device), "Identifier (optional)" (auto-generated if blank). Submit "Create device"; cancel.
- Edit: "Device name", "Device type"; STATUS control shown ONLY for admins (Active/Inactive); field users do not see a status control. Submit "Save changes".

EXACT COMPONENTS: device table, register/edit side panel, status badge, "Register device" button.
EXACT FIELDS AND LABELS: "Devices", "Register and manage the field devices you use for detection sessions.", "Register device", table columns as above, form labels "Device name *", "Device type *", "Identifier (optional)", "Create device", "Save changes", tooltip "Status is managed by an administrator".
PRIMARY ACTIONS: "Register device", "Create device" / "Save changes".
SECONDARY ACTIONS: "Edit".
DESTRUCTIVE ACTIONS: "Deactivate" (ADMIN only) → a confirmation ("Deactivate '{name}'? It will be hidden from new sessions."). Field users have no destructive action here.
FILTERS: none (own devices are few).
TABLE OR CARD CONTENT: the device rows.
MAP/DETAIL PANEL: none.
LOADING STATE: "Loading devices…".
EMPTY STATE: "You have no devices yet. Click 'Register device' to add one." + a prominent primary button.
ERROR STATE: inline red banner with the failure message; identifier-conflict message surfaced clearly.
PERMISSION STATE: field users see status as a read-only badge (no status control, no Deactivate); admins get the status control + Deactivate.
CONFIRMATION STATE: Deactivate confirmation modal (admin only).
MOBILE BEHAVIOR: use 006_devices_mobile.md (cards + register sheet).
TABLET BEHAVIOR (768px): table scrolls horizontally inside its card; Register opens a bottom sheet.
DESKTOP BEHAVIOR: dense table + right register/edit panel.

REALISTIC EXAMPLE DATA
Rows: "Field Phone – Surveyor · mobile_phone · DEMO-1002 · Active · 34 · 6/26/2026 · 6/19/2026"; "Vehicle Cam – Patrol 1 · vehicle_camera · DEMO-1001 · Active · 41"; "Dashcam – Van 7 · dashcam · DEMO-1003 · Active"; "IoT Node – Bridge · custom_iot_device · DEMO-1004 · Inactive".

CONSISTENCY RULES
Status badge matches every other page; admin-only controls are visibly gated; identifiers in mono.

ELEMENTS TO AVOID
A large inline form block pushing the table down; showing a status control to field users; an 8-column table that overflows the page (scroll inside the card).

FINAL STITCH INSTRUCTION
Design a "my devices" management page: a dense device table (Name, Type, Identifier, Status badge, Detections, Last seen, Created, Actions) with a "Register device" primary action opening a right side panel for register/edit, where the status control and Deactivate appear only for administrators — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
