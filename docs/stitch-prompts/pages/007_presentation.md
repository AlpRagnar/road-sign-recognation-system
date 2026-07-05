PAGE NAME: Presentation (guided demo)
ROUTE: /presentation
USER ROLE: Field user + Administrator (some steps admin-only)
SCREEN TYPE: Guided walkthrough of numbered step cards
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1024px, 768px, 390px

PAGE PURPOSE
A guided demo flow that opens each part of the product in order, with presentation mode on. Reads as a numbered path, not a flat list.

USER'S MAIN TASK
Open each step in sequence to demo the platform.

VISUAL PRIORITY
The numbered, connected step sequence.

LAYOUT
App shell. Header + an admin-only "Demo tools" link, then a vertical numbered step rail (or a 2-column numbered grid) connected by a thin dashed road line.

PAGE HEADER
- Title "Presentation", description "Guided demo flow. Open each step in order; presentation mode is on."
- Right (ADMIN only): link "Demo tools" (to /admin/demo).

STEP CARDS (numbered 1–7; each has a number chip, title, one-line blurb, and an "Open →" link; all links carry presentation mode)
1. "System Overview" — "KPI cards, verification breakdown, top sign types, and recent detections."
2. "Start Detection" — "Select a device, capture camera frames + GPS, and run AI detection (mock or external)."
3. "Traffic Sign Map" — "Optimized sign inventory with marker / cluster / density modes and a detail panel."
4. "Live Device Map" — "Last-known device locations updated by polling."
5. "AI Integration Health" (ADMIN) — "Health check, model-contract self-test, and AI failure analytics."
6. "Analytics" (ADMIN) — "Daily metric snapshots, trend bars, and snapshot-coverage warnings."
7. "Storage Governance" (ADMIN) — "Quarantine-first cleanup and reconciliation run history — nothing auto-deletes."
Admin-only steps carry a small "Admin" tag; hide them for field users.

PRESENTATION BADGE (global overlay)
- When presentation mode is on (query param), a fixed top-right badge "Presentation Mode" with a pulsing dot and an "Exit" control that leaves presentation mode (stays on the current page). Style it with the app's status language (a calm live indicator, not neon).

EXACT COMPONENTS: numbered step rail/grid, step cards with "Open →", admin tag, presentation badge with Exit, header "Demo tools" link.
EXACT FIELDS AND LABELS: title/description as above; the seven step titles + blurbs verbatim; "Open →"; "Presentation Mode"; "Exit"; "Demo tools".
PRIMARY ACTIONS: "Open →" per step (in order).
SECONDARY ACTIONS: "Exit" presentation mode; "Demo tools".
DESTRUCTIVE ACTIONS: none.
FILTERS: none. TABLE/MAP/DETAIL: none.
LOADING STATE: n/a (static links).
EMPTY STATE: n/a.
ERROR STATE: n/a.
PERMISSION STATE: field users see steps 1–4 only; admins see all seven; the "Demo tools" header link is admin-only.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR (390px): steps stack as a single vertical numbered list connected by the dashed line; the presentation badge sits top-right respecting the safe area; "Open →" is a full-width tap target.
TABLET BEHAVIOR (768px): two-column numbered grid or single column.
DESKTOP BEHAVIOR: numbered rail/grid with the connecting dashed road line.

REALISTIC EXAMPLE DATA
Use the seven steps exactly as listed. Badge "Presentation Mode · Exit".

CONSISTENCY RULES
Admin steps clearly tagged; badge uses the shared live/status language; numbered path emphasises order.

ELEMENTS TO AVOID
A flat unnumbered card list; a neon badge; oversized generic marketing cards.

FINAL STITCH INSTRUCTION
Design a guided "Presentation" walkthrough: seven numbered step cards (System Overview → Storage Governance) connected by a thin dashed road line, admin-only steps tagged, each with an "Open →" link, plus a fixed "Presentation Mode · Exit" badge — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
