PAGE NAME: Detection Review
ROUTE: /admin/detections
USER ROLE: Administrator
SCREEN TYPE: Dense actionable review table with filters, pagination, and row actions
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 009_detection_review_mobile.md)

PAGE PURPOSE
Let an administrator review raw AI detection events and act on each: verify, reject, mark duplicate, reset to pending, or permanently delete the captured frame. This is the app's densest table and its most action-heavy page — the actions must be organised, not a row of competing buttons (the current design overflows).

USER'S MAIN TASK
Filter/scan detections, judge each by its evidence, and apply a review action quickly; occasionally permanently delete an erroneous frame.

VISUAL PRIORITY
The table + a clean, scannable status column + an organised action pattern (one primary action + an overflow menu + a clearly separated destructive action).

LAYOUT
App shell. Header with export actions, a filter row, then a dense paginated table.

PAGE HEADER
- Title "Admin · Detections", description "Review raw AI detection events: verify, reject, mark duplicate, or reset."
- Right: secondary buttons "Export events CSV" and "Export signs CSV".

FILTERS (one row)
- Search input placeholder "Search class name…".
- Status select "All statuses" + Pending / Auto verified / Manually verified / Rejected / Duplicate / Low confidence.

TABLE COLUMNS (in order; FIX the overflow)
Thumbnail (one small frame image with a green bbox, or a placeholder — MERGE the current redundant FRAME + IMG columns into ONE) · Class (friendly) · Conf. (% + tiny meter) · Device · User · Lat (mono) · Lng (mono) · Acc. · AI ms (mono) · Status (BADGE) · Time · Actions.
- ACTIONS pattern (this is the key fix): a single primary "Verify" button + an overflow "⋯" menu containing "Reject", "Mark duplicate", "Reset to pending", and "View details"; and a SEPARATED destructive "Delete frame" (red, at the far right with a divider/gap so it can't be mis-tapped next to Verify). Never render five equal-weight competing buttons.
- Sticky header; frozen Class column on horizontal scroll; selected/hover row highlight; disable the action that equals the current status (e.g., Verify disabled when already manually_verified).

PAGINATION
- "Rows [25] · 1–25 of 120 · Previous · Page 1/5 · Next" (right-aligned).

DELETE-FRAME CONFIRMATION (modal)
- Title "Permanently delete frame". Body spells out the consequence: "This permanently deletes the captured image, every detection produced from the same frame, related observation links, and the storage object. This cannot be undone." Show context: thumbnail, capture time, device, and the number of detections that will be deleted. Buttons: red "Delete frame (N)" + neutral "Cancel". This is admin-only and destructive.

EXACT COMPONENTS: filters (search + status), dense table, status badges, primary Verify + overflow menu + separated destructive Delete frame, pagination, delete-frame modal, CSV export buttons.
EXACT FIELDS AND LABELS: "Admin · Detections", the description, "Export events CSV", "Export signs CSV", "Search class name…", "All statuses" + statuses, columns as above, actions "Verify"/"Reject"/"Mark duplicate"/"Reset to pending"/"View details"/"Delete frame", pagination text, the delete-frame consequence sentence.
PRIMARY ACTIONS: "Verify" (per row).
SECONDARY ACTIONS: Reject, Mark duplicate, Reset, View details (overflow); Export CSV; filters; pagination.
DESTRUCTIVE ACTIONS: "Delete frame" — separated, red, modal-confirmed with the consequence text + context.
FILTERS: search class name + status select.
TABLE OR CARD CONTENT: the detection rows.
MAP/DETAIL PANEL: none (details on /detections/[id]).
LOADING STATE: skeleton rows.
EMPTY STATE: "No detection events match your filters." + a "Clear filters" link.
ERROR STATE: inline red banner with the failure message; a per-row action error shows a toast; a partial-success delete (DB ok, storage failed) shows a clear warning toast.
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: the delete-frame modal (above). Review actions apply immediately with an undo toast where possible.
MOBILE BEHAVIOR: use 009_detection_review_mobile.md (cards + bottom-sheet action menu).
TABLET BEHAVIOR (768px): table scrolls horizontally inside its card with a frozen Class column; filters wrap.
DESKTOP BEHAVIOR: full dense table; organised actions; sticky header + pagination.

REALISTIC EXAMPLE DATA
Rows: "Speed Limit 50 · 61% · Dashcam – Van 7 · Demo Admin · 57.04537 · 9.91127 · 12m · 85 · Pending · 6/26/2026, 2:09 AM"; "Stop · 68% · … · Manually verified"; "Road Work · 41% · … · Low confidence"; "Roundabout · 76% · … · Rejected". Pagination "1–25 of 120 · Page 1/5". Delete-frame context "3 detections · Field Phone – Surveyor · 6/25/2026, 4:12 AM". Friendly names only.

CONSISTENCY RULES
Status badges everywhere; one primary + overflow + separated destructive; coordinates/ms mono; the delete-frame modal always states the full consequence.

ELEMENTS TO AVOID
Five equal-weight buttons per row; an actions column that overflows/cuts off; separate FRAME and IMG columns both showing "—"; plain-text statuses; a Delete frame button placed right next to Verify.

FINAL STITCH INSTRUCTION
Design the densest admin review table: filters (search class name + status), a dense paginated table with ONE thumbnail column, status BADGES, and an organised action pattern — a primary "Verify", an overflow "⋯" menu (Reject, Mark duplicate, Reset to pending, View details), and a clearly SEPARATED red "Delete frame" with a consequence-spelling confirmation modal — using the exact palette and status language below. Fix the current actions-column overflow.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
