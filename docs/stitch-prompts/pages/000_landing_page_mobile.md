PAGE NAME: Public Landing Page — Mobile
ROUTE: / (public marketing entry, mobile)
USER ROLE: Public
SCREEN TYPE: Marketing landing page (mobile, single column, long scroll)
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
The mobile version of the landing page. Same message and identity as 000_landing_page.md, restructured for a phone: single column, thumb-friendly CTAs, and product previews that stay legible at small width.

USER'S MAIN TASK
Quickly grasp the capture → detect → group → review → maintain story and tap "Sign In" or "View the Platform".

VISUAL PRIORITY
Hero headline + one product preview (the sign map) above the fold, then the 5-step workflow. Keep it tight; no giant empty hero.

LAYOUT
Single column, 16px side padding. Sticky compact top bar. A sticky bottom CTA bar with "Sign In" (secondary) + "View the Platform" (primary).

PAGE HEADER (sticky, compact, white)
- Left: logo + "Traffic Sign Mapping".
- Right: hamburger menu button (opens a full-screen menu: Product, Workflow, Features, Security, Research, Sign In).

MAIN CONTENT AREAS (stacked)
1. HERO — headline "Turn smartphone road imagery into an auditable traffic-sign inventory." One-sentence subheading. Full-width realistic Sign Map preview (blue markers + one cluster "3", amber selected marker) with a compact "Road Work · Manually verified" chip. Two full-width CTAs.
2. TRUST STRIP — 2×3 grid of small chips (Browser-based collection, Private image storage, AI-assisted classification, Geospatial de-duplication, Human-in-the-loop review, Audit-ready records).
3. HOW IT WORKS — vertical numbered steps connected by a dashed road line: Capture → Detect → Group → Review → Maintain, each with icon + title + one line.
4. PRODUCT MODULES — vertical list of module cards (small thumbnail + title + one line): Mobile field collection; Inventory map; Detection review; Device operations; AI monitoring; Analytics; Secure media governance.
5. SHOWCASE — stacked: Sign Map preview, then Dashboard KPI strip preview.
6. AI ARCHITECTURE — vertical flow (top→bottom): Smartphone Browser → Next.js Server → Private Storage → FastAPI Adapter → Triton Detection + Classification → Inventory Records.
7. SECURITY — single-column list with shield icons (private storage, signed URLs, server-side secrets, role-based access, audit logs, admin-only destructive actions).
8. USER ROLES — three stacked role cards (Field user, Administrator, Researcher / authority stakeholder).
9. RESEARCH & VALIDATION — short honest paragraph + Aalborg University attribution; no invented accuracy.
10. FINAL CTA — stacked buttons: Sign In, Explore the Platform, Contact the Project, View Research.
11. FOOTER — logo + links stacked in collapsible groups; attribution line.

EXACT COMPONENTS: sticky top bar + hamburger menu, hero with map preview, chip grid, vertical numbered workflow, module list, stacked showcase, vertical architecture flow, security list, role cards, research block, stacked CTAs, footer, sticky bottom CTA bar.
EXACT FIELDS AND LABELS: same labels as 000_landing_page.md.
PRIMARY ACTIONS: "View the Platform" (sticky bottom, primary).
SECONDARY ACTIONS: "Sign In" (sticky bottom), menu links.
DESTRUCTIVE ACTIONS: none. FILTERS: none.
TABLE OR CARD CONTENT: module + role cards, stacked.
MAP BEHAVIOR: static full-width map preview; not interactive.
DETAIL PANEL BEHAVIOR: a small static sign chip only.
LOADING/EMPTY/ERROR/PERMISSION/CONFIRMATION STATE: n/a (public static).
MOBILE BEHAVIOR: this IS the mobile spec — single column; 44px+ tap targets; sticky bottom CTA with safe-area padding; menu is a full-screen overlay; previews scale to width and remain legible; no horizontal scroll anywhere.
TABLET BEHAVIOR: at ~600–768px the module list may go 2-up; otherwise as mobile.
DESKTOP BEHAVIOR: use 000_landing_page.md.

REALISTIC EXAMPLE DATA
Same as desktop: signs "Road Work", "Maximum Speed Limit 60", "No Entry", "School Zone"; KPIs Traffic signs 39, Detections today 17, Active devices 3; Aalborg basemap; friendly class names only.

CONSISTENCY RULES
Identical palette, typography, status badges, and identity to the desktop landing and the app. The product previews match the real app UI.

ELEMENTS TO AVOID
Scaled-down desktop layout, tiny unreadable table previews, cartoon/3D/neon art, fake logos, invented statistics, giant empty hero, marketing clichés.

FINAL STITCH INSTRUCTION
Design the mobile (390px) public landing page for a geospatial traffic-sign inventory & AI-operations platform: single column, sticky bottom CTA, realistic map/dashboard previews, exact palette and status language below — tight and credible, never a scaled desktop page.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
