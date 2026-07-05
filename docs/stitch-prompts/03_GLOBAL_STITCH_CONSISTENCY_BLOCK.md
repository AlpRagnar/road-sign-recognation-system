# 03 — Global Stitch Consistency Block

Paste this block into **every** page prompt (it is already embedded in each `pages/*.md`). It carries the shared design language so any prompt works standalone in Google Stitch.

---

**GLOBAL DESIGN CONSISTENCY (Traffic Sign Mapping — road-asset & AI operations platform)**

Product: a serious geospatial road-sign inventory and AI-operations platform for municipalities, road authorities, and infrastructure/research teams. It must feel modern, professional, data-dense, trustworthy, map-centric, and field-ready — like engineering operations software, NOT a generic SaaS, fintech, CRM, crypto, or startup dashboard.

Shell: left sidebar 240px, deep slate navy (#0F172A), light-slate item text, active item = blue (#1D4ED8) fill white text; brand lockup top ("Traffic Sign Mapping", a map-pin-with-sign logo — do NOT use "MVP"); user email + role chip + Sign out at the bottom. Content area on a cool off-white background (#F5F7FA) with a sticky white page header (title 20–22px/600 + one-line description left, primary actions right). On mobile (<768px) the sidebar becomes a hamburger drawer over a scrim.

Colour: background #F5F7FA; cards white with 1px #E2E8F0 borders (prefer borders over shadows); primary blue #1D4ED8; secondary/geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected map marker amber #F59E0B; focus ring #2563EB.

Status badges (pill, dot + Title-Case label, used everywhere a status appears — never raw snake_case): Pending (amber), Auto verified (sky), Manually verified (green), Rejected (red), Duplicate (violet), Low confidence (orange); device/service: Active (green), Inactive (grey), Offline (red), Healthy (green), Degraded (amber), Unavailable (red).

Typography: Inter (grotesque sans); monospace (JetBrains/Plex Mono) for coordinates, IDs, ms, timers, bbox. Page title 20–22px/600; section heading 15–16px/600; body 14px; table cells 13px with tabular numerals; labels 12px/500; KPI value 22–26px/600 (compact, never giant).

Spacing: compact 4px scale; page padding 24px (16 tablet, 12–16 mobile); card padding 16px; table rows 40px; sticky table headers. Avoid excessive whitespace and oversized cards. Radius 8px (6px badges, 10px modals). Icons: 2px line style, 20–24px.

Components: compact KPI tiles; dense tables with one primary row action + a "⋯" overflow menu and separated destructive actions; styled selects and date-range filters (not raw browser date inputs); segmented controls; underline tabs; right slide-in detail panels; modal confirmations that spell out destructive consequences; toasts; skeleton loaders; empty/error states with one clear sentence + a next action.

Maps (Leaflet/OSM look) get visual priority where present: blue sign pins, blue count clusters, amber selected marker, a density legend, and a top filter toolbar + top-right counter.

Responsive: ≥768px sidebar visible + dense tables; <768px sidebar drawer, tables become cards, right panels become bottom sheets, filters collapse into a drawer, primary actions become a sticky bottom bar with safe-area padding.

Accessibility: WCAG AA contrast; ≥44px touch targets; visible focus rings; status conveyed by label+shape, not colour alone; labelled inputs and icon buttons; focus-trapped modals.

Avoid: glassmorphism, neon, decorative gradients, giant hero cards, huge empty space, stock 3D/illustrations, fake logos, invented statistics, rainbow chart palettes.

---

*(~430 words. Keep this verbatim at the top or bottom of each page prompt; the page-specific instructions always take precedence for layout and content.)*
