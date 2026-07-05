PAGE NAME: Dashboard
ROUTE: /dashboard
USER ROLE: Field user + Administrator (same page; admins see an extra source note)
SCREEN TYPE: Operational overview (authenticated app shell)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px, 390px

PAGE PURPOSE
Give an at-a-glance operational picture of the traffic-sign inventory and field activity, and provide a fast entry point into a detection session. This is an OPERATIONS COCKPIT, not a stat wall — keep it compact and dense.

USER'S MAIN TASK
Read current operational status (inventory size, today's detections, active devices/sessions, average confidence and AI latency), scan the verification mix and top sign types, glance at recent detections, and start a session.

VISUAL PRIORITY
1) A compact KPI strip, 2) the verification breakdown + top sign types, 3) recent detections. Make "Active sessions" and "Active devices" feel operationally live. Reduce the oversized-card whitespace of the current design.

LAYOUT
Standard app shell (240px navy sidebar + white sticky page header). Content: a 4-up compact KPI strip (wraps to 2 rows), then a two-column region (left: Verification breakdown; right: Top detected sign types), then a full-width Recent detections table.

PAGE HEADER
- Title "Dashboard", description "Welcome, {full name}." (e.g., "Welcome, Demo Admin.").
- Right: primary button "Start detection" (links to the detection session).
- Small muted tag on the right of the header for admins: "Metrics source: DB RPC" (or "JS fallback"). Do NOT put this in the footer.

MAIN CONTENT AREAS
1. KPI STRIP — 8 compact tiles (label 12px muted, value 22–26px tabular, optional hint): "Traffic signs" (hint "Optimized inventory"), "Detections today", "Active devices", "Active sessions", "Last 24 hours" (hint "Detection events"), "Last 7 days" (hint "Detection events"), "Avg confidence" (% or —, hint "All events"), "Avg AI time" ("178 ms" or —, hint "All events"). Give "Active sessions" and "Active devices" a subtle live accent (small pulse dot) since they represent current field activity.
2. VERIFICATION BREAKDOWN — a compact horizontal bar list for the six statuses IN THIS ORDER with counts: Pending, Auto verified, Manually verified, Rejected, Duplicate, Low confidence. Each row: status badge/label + a thin bar + right-aligned count. Bars use the SEMANTIC status colour of each row (not all-blue).
3. TOP DETECTED SIGN TYPES — a compact horizontal bar list (up to 6) of friendly sign names with counts (e.g., No Entry 20, Speed Limit 30 18, Road Work 15, Yield 14, Stop 12, School Zone 12). Bars in a single green accent. Empty: "No traffic signs yet."
4. RECENT DETECTIONS — a dense table (not airy rows): columns Class (friendly name), Confidence (% with a tiny meter), Time (localized). 8 rows. Empty: "No detections yet. Start a detection session to populate data."

EXACT COMPONENTS: compact KPI tiles, semantic-coloured verification bars, top-sign-types bars, dense recent-detections table, header primary button.
EXACT FIELDS AND LABELS: KPI labels + hints exactly as above; verification statuses as Title-Case badges; "Start detection"; header description "Welcome, {name}.".
PRIMARY ACTIONS: "Start detection" (header).
SECONDARY ACTIONS: clicking a recent detection row opens its detail (/detections/[id]); clicking a KPI can deep-link (e.g., Traffic signs → Sign Map).
DESTRUCTIVE ACTIONS: none.
FILTERS: none on this page.
TABLE OR CARD CONTENT: recent detections (Class / Confidence / Time).
MAP BEHAVIOR: optionally add a small non-interactive inventory mini-map thumbnail in a right-rail card ("Inventory map →" linking to Sign Map) to reinforce the map-centric identity — keep it small and secondary.
DETAIL PANEL BEHAVIOR: none (rows deep-link).
LOADING STATE: KPI tiles + bars + table show shimmer skeletons matching their final shapes.
EMPTY STATE: use the exact empty copy for top sign types and recent detections.
ERROR STATE: if metrics fail, show a slim inline red banner "Couldn't load dashboard metrics" with a Retry link; keep the shell intact.
PERMISSION STATE: field users see the same page WITHOUT the admin source tag and without any admin-only note.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR (390px): KPI tiles become a 2-up grid (or a horizontal scroll strip of compact tiles); verification + top types stack full-width; recent detections becomes a card list (Class + status/confidence + time); "Start detection" becomes a sticky bottom primary button.
TABLET BEHAVIOR (768px): KPIs 2-up; the two mid panels stack; table scrolls horizontally if needed.
DESKTOP BEHAVIOR: 4-up KPIs, two-column mid region, full-width table; controlled whitespace, no oversized cards.

REALISTIC EXAMPLE DATA
KPIs: Traffic signs 39, Detections today 17, Active devices 3, Active sessions 1, Last 24 hours 31, Last 7 days 120, Avg confidence 72%, Avg AI time 178 ms. Verification: Pending 90, Auto verified 0, Manually verified 12, Rejected 9, Duplicate 0, Low confidence 9. Top types: No Entry 20, Speed Limit 30 18, Road Work 15, Yield 14, Stop 12, School Zone 12. Recent: "Speed Limit 50 · 61% · 6/26/2026, 1:01 AM", "Stop · 67% · 6/26/2026, 12:39 AM", "No Entry · 57%", "School Zone · 91%", "Roundabout · 65%", "Parking · 70%". Friendly class names only.

CONSISTENCY RULES
Status badges/bar colours use the semantic palette below; KPI tiles are compact; recent-detections statuses (where shown) use the same badges as every other table.

ELEMENTS TO AVOID
Oversized KPI cards with huge numbers and empty padding; giant headings; a stat-wall feel; putting the metrics-source note in a tiny footer; all-blue verification bars.

FINAL STITCH INSTRUCTION
Design a compact operations dashboard for a road-sign inventory platform: a dense 4-up KPI strip with live accents on active sessions/devices, a semantic-coloured verification breakdown, a top-sign-types bar list, and a dense recent-detections table, plus a small inventory mini-map link — using the exact palette and status language below. Avoid oversized cards and empty space.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
