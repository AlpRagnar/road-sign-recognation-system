PAGE NAME: Demo Tools
ROUTE: /admin/demo
USER ROLE: Administrator
SCREEN TYPE: Demo data control panel + counts + quick links + checklist
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1024px, 768px, 390px

PAGE PURPOSE
Seed deterministic demo data for presentations, review the current demo counts, and clear demo-only records. The destructive "Clear" must be clearly separated from the safe "Seed".

USER'S MAIN TASK
Seed/refresh demo data before presenting, verify counts, open key pages, and clear demo data afterwards.

VISUAL PRIORITY
A "Demo data" control card (seed primary; clear in a small danger zone) + a compact counts grid.

LAYOUT
App shell. Header, then: a Demo data control card, a counts grid, a "Key pages" quick-links card, and a "Presentation checklist" card.

PAGE HEADER
- Title "Admin · Demo Tools", description "Seed deterministic demo data, review counts, and clear demo-only records."

DEMO DATA CARD
- Heading "Demo data"; status subtext "Loading…" / "Present · last seeded {datetime}" / "No demo data present".
- Primary "Seed demo data" (or "Refresh demo data" when present; busy "Seeding…"). Seed notice: "Seeded {devices} devices, {sessions} sessions, {events} detections, {signs} signs, {snapshots} snapshots.".
- A small DANGER ZONE: "Clear demo data" (busy "Clearing…"), disabled in presentation mode with tooltip "Disabled in presentation mode". Modal confirm: "Clear ALL demo-marked data? Real user data is not affected.". Notice "Demo data cleared.".

COUNTS GRID (compact tiles, reuse the KPI tile style)
- Devices · Sessions · Detections · Signs · Observations · Location logs · System logs · Snapshots.

KEY PAGES CARD
- Primary link "Open presentation mode →" (to presentation with the flag). Quick links: Dashboard · Detection · Sign Map · Device Map · Admin Detections · Admin AI · Admin Analytics · Admin Storage.

PRESENTATION CHECKLIST CARD
- An ordered list of the 7 checklist items (from "Seed demo data (button above) before presenting." … to "Clear demo data afterwards if needed.").

EXACT COMPONENTS: demo-data control card (seed primary + clear danger zone), counts tiles, key-pages links, checklist.
EXACT FIELDS AND LABELS: "Admin · Demo Tools", the description, "Demo data", "Present · last seeded {datetime}" / "No demo data present", "Seed demo data"/"Refresh demo data"/"Seeding…", the seed notice sentence, "Clear demo data"/"Clearing…", "Disabled in presentation mode", "Clear ALL demo-marked data? Real user data is not affected.", "Demo data cleared.", count labels (Devices, Sessions, Detections, Signs, Observations, Location logs, System logs, Snapshots), "Open presentation mode →", the quick-link labels, the checklist items.
PRIMARY ACTIONS: "Seed demo data" / "Refresh demo data".
SECONDARY ACTIONS: quick links; "Open presentation mode →".
DESTRUCTIVE ACTIONS: "Clear demo data" — in a small danger zone, modal-confirmed, disabled during presentation mode.
FILTERS: none.
TABLE OR CARD CONTENT: counts tiles + quick links + checklist.
MAP/DETAIL: none.
LOADING STATE: "Loading…" status; counts skeleton tiles; buttons show busy labels.
EMPTY STATE: "No demo data present" (seed CTA prominent).
ERROR STATE: inline red banner (seed/clear failure).
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: the clear-demo-data modal; clear disabled + tooltip in presentation mode.
MOBILE BEHAVIOR (390px): sections stack; counts 2-up; the danger zone stays clearly separated; buttons full-width. (No separate mobile file required.)
TABLET BEHAVIOR (768px): counts 4-up; cards stack.
DESKTOP BEHAVIOR: control card + 8-tile counts grid + links + checklist.

REALISTIC EXAMPLE DATA
Status "Present · last seeded 6/26/2026, 1:00 AM". Seed notice "Seeded 4 devices, 6 sessions, 120 detections, 35 signs, 7 snapshots.". Counts: Devices 4, Sessions 6, Detections 120, Signs 35, Observations 120, Location logs 80, System logs 25, Snapshots 7.

CONSISTENCY RULES
Counts tiles reuse the KPI tile style; the destructive Clear is zoned off and modal-confirmed; presentation-mode disabling is explained via tooltip.

ELEMENTS TO AVOID
Clear sitting next to Seed with identical styling; enabling Clear during presentation mode; plain count tiles unlike the rest of the app.

FINAL STITCH INSTRUCTION
Design a Demo Tools admin page: a "Demo data" control card with a primary "Seed/Refresh demo data" and a separated danger-zone "Clear demo data" (modal-confirmed, disabled in presentation mode), a compact 8-tile counts grid reusing the KPI style, a "Key pages" quick-links card, and a "Presentation checklist" — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
