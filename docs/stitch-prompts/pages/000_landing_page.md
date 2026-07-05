PAGE NAME: Public Landing Page
ROUTE: / (public marketing entry; the app itself redirects authenticated users to /dashboard)
USER ROLE: Public (prospective municipality / road-authority / researcher; also existing users signing in)
SCREEN TYPE: Marketing landing page (long scroll, multi-section)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile handled by 000_landing_page_mobile.md)

PAGE PURPOSE
Explain what the Traffic Sign Mapping platform does and drive the visitor to Sign In or request a platform walkthrough. It must look like the same product as the authenticated app — more polished and explanatory, but never a generic SaaS template. The theme is serious geospatial road-asset management and AI operations.

USER'S MAIN TASK
Understand: what the system does, who it is for, how smartphone field collection → AI detection → geospatial inventory → human review works, and why secure media handling matters — then click "Sign In" or "View the Platform".

VISUAL PRIORITY
1) A credible hero that pairs a strong domain headline with a REAL product preview (the sign inventory map + dashboard), 2) the 5-step workflow, 3) the AI architecture flow. The map/product UI is the star — not illustrations.

LAYOUT
Full-width sections on the #F5F7FA background, max content width ~1200px centered, generous but controlled vertical rhythm (NOT huge empty hero space). Thin road-lane dashed dividers between sections.

PAGE HEADER (sticky top nav, white, 1px bottom border)
- Left: logo (map-pin whose head is a rounded traffic-sign square) + wordmark "Traffic Sign Mapping".
- Center/right nav links: Product · Workflow · Features · Security · Research.
- Right: "Sign In" (secondary button) and "View the Platform" (primary blue button).

MAIN CONTENT AREAS (in order)
1. HERO — Headline (specific, domain): "Turn smartphone road imagery into an auditable, de-duplicated traffic-sign inventory." Subheading: "Field crews capture with a browser. AI detects and classifies signs. The platform groups repeated observations into geospatial inventory records that administrators review on a map." Primary CTA "View the Platform", secondary CTA "Sign In". Right side / below: a realistic product preview — the Sign Map (blue markers + clusters over an Aalborg-style OSM map) with a small floating Sign detail card ("Road Work · Manually verified · 6 detections · 57.054086, 9.891894"). Do NOT use vague copy like "Transform your workflow" or "The future of transportation".
2. TRUST STRIP — one compact row of 6 label chips with line icons: "Browser-based field collection", "Private image storage", "AI-assisted classification", "Geospatial de-duplication", "Human-in-the-loop review", "Audit-ready records". No fake customer logos.
3. HOW IT WORKS — a horizontal 5-step path (numbered, connected by a dashed road line): 1 Capture (camera + GPS in the browser) → 2 Detect (FastAPI + Triton two-stage detection/classification) → 3 Group (confidence & GPS-accuracy weighted grouping into sign records) → 4 Review (verify / reject / mark duplicate on a dashboard) → 5 Maintain (inventory map + analytics + secure media). Each step: icon, title, one sentence.
4. PRODUCT MODULES — a 3×2 grid of module cards, each with a small realistic UI thumbnail + title + one line: Mobile field collection; Traffic-sign inventory map; Detection review; Device operations; AI integration monitoring; Analytics; Secure media governance. (7 modules — use a 4+3 or 3×3 layout.)
5. MAP & DASHBOARD SHOWCASE — a large framed preview pairing the Sign Map (left) and the Dashboard KPIs + verification breakdown (right). Realistic UI, not decorative art. Caption: "One operational picture — inventory on the map, health in the numbers."
6. AI ARCHITECTURE — a clean left-to-right flow diagram (nodes with thin connectors, no neon): Smartphone Browser → Next.js Server → Private Storage → FastAPI Adapter → Triton Detection + Classification → Inventory Records. Small note: "Signed, short-lived media URLs; secrets stay server-side." Do NOT expose any credentials.
7. SECURITY — a 2-column feature list with lock/shield line icons: Private object storage; Short-lived signed media URLs; Server-side secrets; Role-based access (field user vs administrator); Audit logs; Admin-only destructive actions (reference-safe deletion).
8. USER ROLES — three role cards: Field user (mobile capture, own devices, sessions), Administrator (review, devices, users, AI, analytics, storage), Researcher / authority stakeholder (maps, analytics, exports).
9. RESEARCH & VALIDATION — a calm, honest paragraph block: "The platform validates the operational workflow end-to-end. Detector benchmarking and labelled field evaluation are separate research activities." Aalborg University attribution. Do NOT invent accuracy percentages or partnerships.
10. FINAL CTA — centered band: "Sign In", "Explore the Platform", "Contact the Project", "View Research".
11. FOOTER — logo + "Traffic Sign Mapping"; columns: Product/Workflow/Features/Security/Research; a second column: Documentation, Privacy, Terms, Contact, Sign In; attribution line "A research and operations project — Aalborg University".

EXACT COMPONENTS: sticky top nav, hero with real UI preview, trust chip row, numbered 5-step workflow, module card grid, dual UI showcase, architecture flow diagram, security 2-col list, role cards, research block, final CTA band, multi-column footer.
EXACT FIELDS AND LABELS: nav (Product, Workflow, Features, Security, Research, Sign In, View the Platform); workflow steps (Capture, Detect, Group, Review, Maintain); modules as listed; architecture nodes as listed; roles (Field user, Administrator, Researcher / authority stakeholder).
PRIMARY ACTIONS: "View the Platform" (primary), "Sign In".
SECONDARY ACTIONS: nav anchors, "Contact the Project", "View Research".
DESTRUCTIVE ACTIONS: none.
FILTERS: none.
TABLE OR CARD CONTENT: module cards + role cards as above.
MAP BEHAVIOR: hero + showcase use static realistic map previews (blue markers/clusters over an OSM-style basemap); not interactive.
DETAIL PANEL BEHAVIOR: a small static floating "Sign detail" card in the hero for realism.
LOADING STATE: n/a (static marketing); images use a subtle placeholder.
EMPTY STATE: n/a.
ERROR STATE: n/a.
PERMISSION STATE: n/a (public).
CONFIRMATION STATE: n/a.
MOBILE BEHAVIOR: see 000_landing_page_mobile.md (nav collapses to a menu; sections stack; previews scale; CTAs become full-width).
TABLET BEHAVIOR (768px): nav condenses; module grid 2-up; showcase stacks map over dashboard.
DESKTOP BEHAVIOR: as described; content max-width ~1200px; controlled whitespace.

REALISTIC EXAMPLE DATA
Signs: "Road Work", "Maximum Speed Limit 60", "No Entry", "Pedestrian Crossing", "Roundabout", "School Zone". Sign detail: "Road Work · Manually verified · 6 detections · 57.054086, 9.891894". KPIs: Traffic signs 39, Detections today 17, Active devices 3, Active sessions 1, Avg confidence 72%, Avg AI time 178 ms. Location context: Aalborg, Denmark. Class names are the friendly display names (never "Sign 150").

CONSISTENCY RULES
Use the exact palette, sidebar-free public shell, status badge colours, and typography from the global block. The product UI previews must match the authenticated app's real look (blue markers, amber selected marker, status badges, compact cards).

ELEMENTS TO AVOID
Cartoon roads, generic 3D cars, neon AI brains, floating holograms, random city illustrations, fake customer/municipality logos, invented statistics, glassmorphism, giant empty hero space, marketing clichés ("Unlock smarter insights", "The future of transportation").

FINAL STITCH INSTRUCTION
Design a single, polished, credible public landing page for a geospatial traffic-sign inventory and AI-operations platform, using realistic product UI (map + dashboard) rather than illustrations, with the exact palette, typography, and status language below. Keep it dense and professional, not a generic SaaS hero.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
