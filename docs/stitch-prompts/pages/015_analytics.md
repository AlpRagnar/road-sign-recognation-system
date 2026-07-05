PAGE NAME: Analytics
ROUTE: /admin/analytics
USER ROLE: Administrator
SCREEN TYPE: Metrics snapshots + trend charts + dense table
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px, 390px

PAGE PURPOSE
Show durable daily operational metric snapshots and long-range trends, and let an admin fill snapshot gaps. This is an analytics operations view, not a marketing chart wall.

USER'S MAIN TASK
Read current KPIs, spot trends over recent days, notice snapshot-coverage gaps, and create/refresh snapshots.

VISUAL PRIORITY
1) A coverage warning banner when gaps exist, 2) a compact KPI row, 3) trend charts tied to the semantic palette, 4) the dense snapshot table.

LAYOUT
App shell. Header, a warning banner (conditional), a filter/action row, a KPI row, a chart row, then a dense paginated table.

PAGE HEADER
- Title "Admin · Analytics", description "Daily operational metric snapshots and long-range trends."

WARNING BANNER (conditional, amber)
- "Snapshot coverage warning: {N} day(s) are missing in the selected range · latest missing date: {date}. Threshold is {N} day(s). Use 'Create / refresh today' to fill gaps." Uses the warning colour language.

FILTER / ACTION ROW
- "From" date + "To" date (a styled date-range, not raw browser inputs) · primary "Create / refresh today" · "Refresh a specific date" (date input) + "Refresh date" button.

KPI ROW (6 compact tiles)
- Traffic signs (with "as of {date}" hint) · Detections (total) · Detections 24h · Active devices 24h · AI failure rate (%) · Quarantine pending.

CHART ROW (4 mini charts, accents from the semantic palette)
- Detection events (blue) · Traffic signs (green) · AI failure rate % (red) · Active devices 24h (teal). Add a 1px baseline, light gridlines, and a hover tooltip per bar (the current app has bare bars). Tie each colour to its meaning (failure = destructive red, devices = geo teal).

SNAPSHOT TABLE (dense, one row per day)
- Columns: Date · Signs · Verified · Detections · 24H · Low-conf · Avg conf (%) · Avg AI ms · AI total · AI fail % · Devices 24h · Quar. Sticky header; frozen Date column on scroll; pagination "Rows [25] · 1–7 of 7 · Previous · Page 1/1 · Next".

EXACT COMPONENTS: warning banner, date-range + refresh actions, 6 KPI tiles, 4 mini charts, dense snapshot table, pagination.
EXACT FIELDS AND LABELS: "Admin · Analytics", the description, the warning-banner text pattern, "From", "To", "Create / refresh today", "Refresh a specific date", "Refresh date", KPI labels (Traffic signs, Detections (total), Detections 24h, Active devices 24h, AI failure rate, Quarantine pending), chart titles (Detection events, Traffic signs, AI failure rate %, Active devices 24h), table columns (Date, Signs, Verified, Detections, 24H, Low-conf, Avg conf, Avg AI ms, AI total, AI fail %, Devices 24h, Quar.).
PRIMARY ACTIONS: "Create / refresh today".
SECONDARY ACTIONS: date range; "Refresh date".
DESTRUCTIVE ACTIONS: none.
FILTERS: date range (From/To).
TABLE OR CARD CONTENT: the snapshot rows.
MAP/DETAIL: none.
LOADING STATE: KPI + chart + table skeletons.
EMPTY STATE: no snapshots in range → "No snapshots in this range. Use 'Create / refresh today'." (keep the warning banner logic).
ERROR STATE: inline red banner + Retry; refresh failure → toast.
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: none (refresh is idempotent).
MOBILE BEHAVIOR (390px): warning banner full-width; KPIs 2-up; charts stack (each full-width, horizontally scrollable if needed); the snapshot table becomes a per-day card (Date + key metrics) OR scrolls horizontally inside its card; the date-range/actions stack.
TABLET BEHAVIOR (768px): KPIs 3-up; charts 2-up; table scrolls horizontally with a frozen Date column.
DESKTOP BEHAVIOR: full KPI row + 4 charts + dense table.

REALISTIC EXAMPLE DATA
Warning: "23 day(s) are missing in the selected range · latest missing date: 2026-06-25. Threshold is 2 day(s)." KPIs: Traffic signs 30 (as of 2026-06-24), Detections total 100, Detections 24h 41, Active devices 24h 4, AI failure rate 0%, Quarantine pending 2. Table row: "2026-06-24 · 30 · 13 · 100 · 41 · 4 · 82% · 188 · 41 · 0% · 4 · 2".

CONSISTENCY RULES
Chart accents map to the semantic palette (failure = red, devices = teal, detections = blue, signs = green); KPI tiles compact; warning banner uses the amber warning language.

ELEMENTS TO AVOID
A rainbow chart palette unrelated to meaning; bare charts with no axes/tooltips; oversized KPI tiles; raw browser date inputs.

FINAL STITCH INSTRUCTION
Design an analytics operations page: a conditional amber snapshot-coverage warning banner, a styled date range + "Create / refresh today" action, a compact 6-KPI row, four mini trend charts whose colours map to meaning (detections blue, signs green, AI failure red, devices teal) with axes + tooltips, and a dense daily snapshot table with a frozen Date column and pagination — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
