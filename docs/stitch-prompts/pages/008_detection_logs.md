PAGE NAME: Detection Logs
ROUTE: /admin/logs
USER ROLE: Administrator
SCREEN TYPE: Read-only audit table
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px, 390px

PAGE PURPOSE
An immutable, read-only log of the latest raw AI detection events for audit/inspection. It must be visually distinguishable from the actionable Detection Review page — no row actions here.

USER'S MAIN TASK
Scan recent raw detections and open one for detail.

VISUAL PRIORITY
A dense, scannable, read-only table with a clear "audit log / read-only" signal.

LAYOUT
App shell. Header + a small "Read-only · latest 200" chip, then a dense table filling the width.

PAGE HEADER
- Title "Detection Logs", description "Raw AI detection events (latest 200)."
- A muted "Read-only" chip near the title to distinguish from Detection Review.

TABLE COLUMNS (in order)
Class (friendly name) · Conf. (% with a tiny meter) · User · Device · Lat (mono) · Lng (mono) · Acc. ("{n}m") · AI ms (mono) · Status (BADGE) · Time (datetime) · Image ("view" link or —).
- Sticky header; hover highlight; frozen Class column when the table scrolls horizontally. Row click opens detection detail. No Verify/Reject/etc. here.

EXACT COMPONENTS: read-only chip, dense table, status badges, "view" image link.
EXACT FIELDS AND LABELS: "Detection Logs", "Raw AI detection events (latest 200).", columns Class, Conf., User, Device, Lat, Lng, Acc., AI ms, Status, Time, Image; "view"; empty "No detection events yet.".
PRIMARY ACTIONS: open a row → detection detail.
SECONDARY ACTIONS: "view" image link.
DESTRUCTIVE ACTIONS: none (read-only).
FILTERS: none currently (latest 200); optionally a status filter chip may be added but keep it read-only.
TABLE OR CARD CONTENT: the detection rows.
MAP/DETAIL PANEL: none.
LOADING STATE: skeleton rows.
EMPTY STATE: "No detection events yet.".
ERROR STATE: inline red banner "Couldn't load detection logs" + Retry.
PERMISSION STATE: admin-only; non-admins are redirected away.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR (390px): the 11-column table becomes a compact CARD LIST — each card: Class (bold) + Status badge + Confidence meter on the top row; Device · User on the second; Lat/Lng (mono) + AI ms + Time as small meta; an "Image" link if present. Cards are read-only; tap opens detail.
TABLET BEHAVIOR (768px): table scrolls horizontally inside its card with a frozen Class column.
DESKTOP BEHAVIOR: full dense read-only table, sticky header.

REALISTIC EXAMPLE DATA
Rows: "Speed Limit 50 · 61% · Demo Admin · Dashcam – Van 7 · 57.04537 · 9.91127 · 12m · 85 · Pending · 6/26/2026, 2:09 AM"; "Road Work · 41% · … · Low confidence"; "No Entry · 90% · … · Manually verified". Friendly names only.

CONSISTENCY RULES
Status as badges; coordinates + ms in mono; clearly labelled read-only so it doesn't look like Detection Review.

ELEMENTS TO AVOID
Row action buttons (this is read-only); a layout identical to Detection Review; page-level horizontal overflow.

FINAL STITCH INSTRUCTION
Design a read-only Detection Logs audit table (Class, Conf. meter, User, Device, Lat, Lng, Acc., AI ms, Status badge, Time, Image link) with a "Read-only · latest 200" signal, a sticky header, a frozen Class column on scroll, and a mobile card list — clearly distinct from the actionable Detection Review — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
