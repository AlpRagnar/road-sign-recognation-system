PAGE NAME: Admin Devices
ROUTE: /admin/devices
USER ROLE: Administrator
SCREEN TYPE: Paginated inline-editable fleet table
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px, 390px

PAGE PURPOSE
Manage ALL devices across all users. Admins can edit a device's name, type, and active/inactive status inline, filter, and paginate. This is the authoritative fleet view (device status is admin-only here).

USER'S MAIN TASK
Find a device and adjust its name/type/status; scan owner + status + activity.

VISUAL PRIORITY
A dense fleet table with clear inline-edit affordances; Owner and Status are the operational columns.

LAYOUT
App shell. Header, a filter row, then a dense paginated inline-edit table.

PAGE HEADER
- Title "Admin · Devices", description "All devices across users. Edit name, type, or status inline."

FILTERS (one row)
- Search input "Search name or identifier…".
- Type select ("All types" + the five device types).
- Status select ("All statuses" / Active / Inactive).

TABLE COLUMNS (in order)
Name (inline-editable text) · Type (inline select of the five types) · Identifier (mono) · Owner (name or email) · Status (a STATUS BADGE that opens a small change menu Active/Inactive — admin-only power, so make the change deliberate) · Det. (detection count) · Last loc. (lat,lng mono or —) · Last seen (datetime) · Created (date).
- Inline edits save on blur/change with a subtle saving indicator and an undo toast. Sticky header; frozen Name column on horizontal scroll; hover + selected row highlight.

PAGINATION: "Rows [25] · 1–25 of N · Previous · Page 1/K · Next".

EXACT COMPONENTS: filters (search + type + status), inline-edit fleet table, status badge+menu, pagination.
EXACT FIELDS AND LABELS: "Admin · Devices", the description, "Search name or identifier…", "All types", "All statuses", columns Name, Type, Identifier, Owner, Status, Det., Last loc., Last seen, Created, empty "No devices match your filters.".
PRIMARY ACTIONS: inline edit name/type; change status via the badge menu.
SECONDARY ACTIONS: filters; pagination.
DESTRUCTIVE ACTIONS: setting a device Inactive is a powerful admin action — make it deliberate (a small confirm on Inactive), but it is reversible (not a hard delete).
FILTERS: search + type + status.
TABLE OR CARD CONTENT: the fleet rows.
MAP/DETAIL: none (see Device Map for spatial view).
LOADING STATE: "Loading devices…" skeleton rows.
EMPTY STATE: "No devices match your filters." + Clear filters.
ERROR STATE: inline red banner; per-edit failure → toast.
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: a light confirm when switching a device to Inactive.
MOBILE BEHAVIOR (390px): table → device cards (Name + Owner + Status badge on line 1; Type + Det. + Last seen on line 2; Identifier + Last loc. small); edit via a bottom sheet; status change via a menu in the sheet.
TABLET BEHAVIOR (768px): table scrolls horizontally inside its card with a frozen Name column; filters wrap.
DESKTOP BEHAVIOR: full dense inline-edit table.

REALISTIC EXAMPLE DATA
Rows: "Vehicle Cam – Patrol 1 · vehicle_camera · DEMO-1001 · Demo Admin · Active · 41 · 57.0510, 9.9200 · 6/26/2026 · 6/19/2026"; "IoT Node – Bridge · custom_iot_device · DEMO-1004 · Demo Admin · Inactive · 8". Friendly device names as stored.

CONSISTENCY RULES
Status as a badge that opens a change menu; Owner + Status emphasised; identifiers/coords mono; admin-only power is visually deliberate.

ELEMENTS TO AVOID
Ambiguous inline-edit affordances; a status select that looks like an ordinary field for a powerful admin action; a 9-column table overflowing the page (scroll inside the card).

FINAL STITCH INSTRUCTION
Design an admin fleet-management table: filters (search, type, status) over a dense inline-editable table (Name, Type, Identifier, Owner, Status badge-with-change-menu, Det., Last loc., Last seen, Created) with a frozen Name column, deliberate status changes, pagination, and a mobile card+sheet fallback — emphasising Owner and Status — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
