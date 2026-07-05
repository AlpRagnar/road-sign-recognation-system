# Stitch Prompt Pack — Traffic Sign Mapping

A single consolidated document containing everything needed to redesign the platform in Google Stitch, page by page. Individual files still exist under `docs/stitch-prompts/` and `docs/stitch-prompts/pages/`; this pack collects them for convenience. Generate ONE page prompt at a time (see the Execution Order at the end).

## 1. Project summary

Traffic Sign Mapping is a serious geospatial road-asset and AI-operations platform: smartphone browser-based field collection (camera + GPS) → private Supabase Storage + signed media → FastAPI + NVIDIA Triton two-stage detection/classification → grouped, de-duplicated traffic-sign inventory records → human-in-the-loop administrative review on maps, tables, and analytics. Roles: field user and administrator. It must support both information-dense desktop operations and outdoor mobile field usage.

Scope of this pack: 17 existing user-facing routes + 1 new public landing page = 18 unique pages, delivered as 25 Stitch prompt files (18 primary + 7 mobile-specific). The design language is defined once (below) and repeated in every page prompt so each is independently pasteable. Do NOT create a generic SaaS/fintech/CRM/crypto dashboard; prioritise operational clarity, map readability, data density, mobile usability, and professional hierarchy.

Contents: (2) Master design system, (3) Global consistency block, (4) All page prompts, (5) Landing page prompts (included with the page prompts), (6) Execution order. See also `00_PAGE_INVENTORY.md` and `01_CURRENT_UI_UX_AUDIT.md`.

---

## 2. Master design system

One shared visual language for the entire Traffic Sign Mapping platform. Every page prompt references these decisions. This is a **design specification for Google Stitch**, not implementation code.

---

## Product character

**"Roadscope" operations aesthetic** — a serious geospatial road-asset and AI-operations platform for municipalities, road authorities, and infrastructure/research teams. It must read as: road infrastructure, geographic intelligence, operational reliability, AI-assisted review, engineering precision, secure field-data management.

Feels: modern, professional, data-driven, trustworthy, compact, map-centric, field-ready, administratively efficient.
Never: playful, consumer-social, fintech, gaming, sci-fi, marketing-heavy, decorative.

---

## Brand direction

- **Product name treatment:** "Traffic Sign Mapping" in a semibold grotesque; may abbreviate to a compact wordmark **"TSM"** in a rounded square tile. **Retire the "MVP dashboard" subtitle.** Optional subtitle: "Road-Sign Inventory Platform".
- **Logo concept:** a map pin whose head is a rounded traffic-sign square (a small pictographic sign inside a pin), or a location pin overlaid on a road-lane chevron. Flat, single-weight, 2px stroke, no gradients.
- **Icon style:** line icons, 1.75–2px stroke, 20–24px, rounded joins (Lucide/Feather family). Consistent stroke weight everywhere.
- **Visual motifs:** thin road-lane dashes as dividers/accents; subtle contour/topographic hairlines in empty marketing areas only; rounded-square traffic-sign chips for class names. Use sparingly — operational screens stay clean.
- **Level of formality:** high. Engineering-grade, calm, confident.

---

## Colour system

Use these exact tokens. Neutrals are a cool slate scale; the brand is a confident infrastructure blue; a secondary teal signals "geo/map".

### Core UI tokens
| Token | Value | Use |
|-------|-------|-----|
| `--bg-app` | `#F5F7FA` | Application background (cool off-white) |
| `--bg-sidebar` | `#0F172A` | Sidebar (deep slate navy) — dark rail for contrast |
| `--sidebar-text` | `#CBD5E1` | Sidebar item text |
| `--sidebar-active-bg` | `#1D4ED8` | Active nav item background |
| `--sidebar-active-text` | `#FFFFFF` | Active nav item text |
| `--bg-topbar` | `#FFFFFF` | Top bar / page header background |
| `--bg-card` | `#FFFFFF` | Cards, panels, tables |
| `--bg-subtle` | `#F1F5F9` | Table header, hover, muted fills |
| `--border` | `#E2E8F0` | Default 1px borders |
| `--border-strong` | `#CBD5E1` | Emphasised borders, inputs |
| `--primary` | `#1D4ED8` | Primary action (infrastructure blue) |
| `--primary-hover` | `#1E40AF` | Primary hover |
| `--secondary` | `#0D9488` | Secondary/geo action (teal) |
| `--neutral-action` | `#475569` | Neutral/tertiary action |
| `--focus-ring` | `#2563EB` | 2px focus ring @ 40% + 2px offset |
| `--selected-row` | `#EFF6FF` | Selected table row (pale blue) |
| `--selected-marker` | `#F59E0B` | Selected map marker (amber) — stands out vs blue markers |
| `--text` | `#0F172A` | Primary text |
| `--text-muted` | `#64748B` | Muted/metadata text |
| `--text-faint` | `#94A3B8` | Placeholder, disabled |
| `--danger` | `#DC2626` | Destructive action |
| `--danger-hover` | `#B91C1C` | Destructive hover |
| `--danger-bg` | `#FEF2F2` | Danger zone/background |
| `--warning-bg` | `#FEFCE8` | Warning banners (amber wash) |
| `--warning-text` | `#92400E` | Warning banner text |

### Semantic status colours (badges — text + fill + dot)
Review/validation statuses (used in tables, panels, badges — must be consistent everywhere):
| Status | Dot/Text | Badge fill |
|--------|----------|-----------|
| `pending` | `#B45309` (amber-700) | `#FEF3C7` |
| `auto_verified` | `#0369A1` (sky-700) | `#E0F2FE` |
| `manually_verified` | `#15803D` (green-700) | `#DCFCE7` |
| `rejected` | `#B91C1C` (red-700) | `#FEE2E2` |
| `duplicate` | `#6D28D9` (violet-700) | `#EDE9FE` |
| `low_confidence` | `#C2410C` (orange-700) | `#FFEDD5` |

Device / service states:
| State | Dot/Text | Fill |
|-------|----------|------|
| `active` | `#15803D` | `#DCFCE7` |
| `inactive` | `#475569` | `#E2E8F0` |
| `offline` / stale | `#B91C1C` | `#FEE2E2` |
| `healthy` / `mock-ready` / `reachable` | `#15803D` | `#DCFCE7` |
| `degraded` / `misconfigured` | `#B45309` | `#FEF3C7` |
| `unavailable` / `unreachable` | `#B91C1C` | `#FEE2E2` |

Display each status label in **Title Case with a spaced word** ("Manually verified", "Low confidence") — never raw `snake_case`.

Chart accents: reuse status/brand colours — detections = `--primary` blue, signs = `#16A34A` green, failure rate = `--danger` red, devices = `--secondary` teal. No arbitrary purple/rainbow unless it maps to a status (e.g., duplicate = violet).

---

## Typography

- **Primary font:** Inter (or a neutral grotesque: Söhne/IBM Plex Sans). Weights 400/500/600/700.
- **Monospace:** JetBrains Mono / IBM Plex Mono — for coordinates, IDs, timers, ms values, bbox.

| Role | Size / weight | Notes |
|------|---------------|-------|
| Page title | 20–22px / 600 | In page header |
| Section heading | 15–16px / 600 | Card/section titles |
| Subsection heading | 13px / 600 uppercase, +2% tracking | Sub-labels |
| Body | 14px / 400 | Paragraphs |
| Table cell | 13px / 400 (numbers tabular) | Dense rows |
| Label | 12px / 500 | Field labels, muted |
| Metadata | 12px / 400 muted | Timestamps, hints |
| KPI value | 22–26px / 600 (tabular) | Compact, not giant |
| Button | 13–14px / 500 | |
| Map popup | 12–13px | |
| Mobile rules | Title 18px, body 15px, table→cards 14px, min tap text 14px | Never below 12px on mobile |

Numbers (coordinates, confidence, ms, IDs, timers) use tabular/mono figures for column alignment.

---

## Spacing system (compact — avoid excess whitespace)

4px base scale: `2,4,8,12,16,20,24,32`.
- **Page padding:** 24px desktop / 16px tablet / 12–16px mobile.
- **Card padding:** 16px (compact 12px for dense tiles).
- **Table row height:** 40px desktop, 44px mobile (touch); header 36px.
- **Form spacing:** 12px between fields, 6px label→control.
- **Panel gaps / grid gaps:** 16px desktop, 12px mobile.
- **Sidebar:** 240px wide, item height 36px, 6px vertical rhythm, 12px horizontal padding.
- **KPI tiles:** min-height ~84px (NOT 140px+), 12–16px padding.

---

## Shape & elevation

- **Border radius:** 8px cards/inputs/buttons; 6px badges/chips; 10px modals/side panels; 9999px status dots and segmented pills.
- **Border style:** 1px `--border`; inputs `--border-strong` on focus with `--focus-ring`.
- **Card shadow:** none or `0 1px 2px rgba(15,23,42,.04)` + 1px border (prefer borders over shadows for an engineering feel).
- **Popup shadow:** `0 4px 12px rgba(15,23,42,.12)`.
- **Modal depth:** overlay `rgba(15,23,42,.45)`, modal `0 12px 32px rgba(15,23,42,.18)`.
- **Table separation:** 1px row dividers, subtle header fill `--bg-subtle`, sticky header.
- **Sticky elements:** page header, table headers, mobile bottom action bars, map filter toolbar.

---

## Application shell

- **Desktop sidebar (≥768px):** fixed 240px dark rail (`--bg-sidebar`), brand lockup top, grouped nav (General items, then an "Admin" subheading before admin-only items), user block bottom (email, role chip, Sign out). Active item = blue fill, white text.
- **Collapsed sidebar (compact desktop / toggle):** 64px icon-only rail with tooltips on hover.
- **Top bar / page header:** white, sticky; page title + one-line description on the left, page-level primary action(s) on the right (e.g., "Start detection", "Export events CSV"). Optional metrics-source/mode tag.
- **Breadcrumb:** only on detail templates (e.g., "Detection Review / Detection detail").
- **Right-side panels:** 320–360px slide-in for detail (Sign detail), with a subtle connecting highlight to the selected item.
- **Map overlays:** filter toolbar top, legend bottom-left, zoom controls top-left, counter top-right.
- **Mobile navigation drawer (<768px):** hamburger in a compact white top bar reading "Traffic Sign Mapping"; drawer slides from left over a scrim; closes on route change; same nav list.
- **Mobile sticky actions:** primary page action (Start/Stop, Save) in a sticky bottom bar with safe-area padding.

---

## Shared components (visual + interaction rules)

- **KPI cards:** compact tile — small label (12px muted) top, value (22–26px tabular) below, optional hint/delta (12px). Border, no heavy shadow. Group in a 4-up strip that wraps to 2-up (tablet) / 1–2-up (mobile).
- **Data tables:** 13px cells, 40px rows, sticky `--bg-subtle` header, hover `--bg-subtle`, selected row `--selected-row`, right-aligned numerics (tabular), a frozen first column when wide, horizontal scroll inside the card (never page-level overflow). Row actions: one primary + an overflow "⋯" menu; destructive actions separated.
- **Status badges:** pill, 6px radius, dot + Title-Case label, colours from the semantic table. Same badge everywhere a status appears.
- **Search fields:** 36px, leading search icon, placeholder from the real page (e.g., "Search class name…").
- **Dropdown filters:** 36px select with label chip; consistent across pages; first option is the "All …" reset.
- **Date filters:** styled date-range control (not raw browser `dd.mm.yyyy`); presets where useful.
- **Segmented controls:** pill group (e.g., Markers · Clustered · Density) — active = filled, others = ghost.
- **Tabs:** underline tabs for in-page sections (e.g., AI Integration: Connectivity · Self-test · Activity & logs).
- **Pagination:** right-aligned "Rows [25] · 1–25 of 120 · Previous · Page 1/5 · Next".
- **Primary button:** blue fill, white text, 8px radius, 13–14px/500.
- **Secondary button:** white fill, `--border-strong`, `--text`.
- **Destructive button:** red outline default; solid red only in a confirmed danger zone; always separated from routine actions.
- **Icon-only buttons:** 36px square, tooltip, used for overflow "⋯", close "✕", map controls.
- **Confirmation dialogs:** modal with title, plain-language consequence, the affected entity, a red confirm + a neutral cancel; destructive confirm text spells out what is permanently deleted (e.g., the Delete-frame dialog).
- **Side panels:** slide-in from right; header + close; scrollable body; sticky footer actions.
- **Bottom sheets (mobile):** rounded top, drag handle, scrollable; used for detail panels + action menus.
- **Tooltips:** dark slate, 12px, 6px radius, for icon buttons and truncated cells.
- **Toasts:** bottom-right desktop / bottom-center mobile; success green, error red, 4s auto-dismiss.
- **Loading skeletons:** shimmer blocks matching final layout (KPI tiles, table rows, map placeholder "Loading map…").
- **Empty states:** small line icon + one sentence (use the real copy, e.g., "No detections yet this session."), plus a primary next action where relevant.
- **Error states:** inline red banner (`--danger-bg`) with the message; retry where relevant; never a raw stack.
- **Image previews:** 16:9 or natural ratio in a slate frame; "No image captured" / "Image failed to load (the signed URL may have expired)." with a "Refresh image" button.
- **Bounding-box overlays:** 2px emerald rectangle with a small "detection" label; scales with the rendered image.
- **Maps:** OpenStreetMap tiles via Leaflet look; clean, high-contrast; markers = brand-blue pins; clusters = blue circle with white count; selected = amber; density = graduated heat scale with a legend.
- **Map markers:** sign markers (blue pin) vs device markers (distinct — e.g., rounded square/diamond, coloured by device status).
- **Map legends:** compact bottom-left card; density scale swatches; device-status key.
- **Charts:** minimal bar/area with a 1px baseline, light gridlines, hover tooltip, accents from the palette; no 3D, no heavy gradients.
- **Camera previews:** 16:9 (or 4:3) rounded slate frame, "Streaming"/"Idle" status, "Last frame sent: {time}".
- **GPS indicators:** dot + label (Granted/Denied/Unknown), lat/long/accuracy/speed in mono; error text (e.g., "Timeout expired") in red.
- **Session timers:** large mono MM:SS with "Active/Stopped · N frames sent".
- **AI health indicators:** one shared health chip (Healthy / Degraded / Unavailable) mapping to the real statuses (mock-ready, healthy, reachable, unreachable, misconfigured).

---

## Responsive behaviour (exact)

- **1440px:** full 3-zone layouts (sidebar 240 + content + optional 320–360 right panel); 4-up KPI strips; full tables.
- **1280px:** same; right panels may narrow to 300px; tables keep all columns with internal scroll.
- **1024px (compact desktop):** sidebar may collapse to the 64px icon rail; KPI strips 4→2 rows; right detail panels overlay instead of push.
- **768px (tablet):** sidebar becomes the hamburger drawer; KPIs 2-up; tables scroll horizontally inside their card with a frozen first column; filters may collapse into a "Filters" button; page headers stack (title above actions).
- **430 / 390 / 375px (mobile):** single column; **tables convert to cards** (Detection Review, Detection Logs, Admin Devices, Devices, Users); **detail panels become bottom sheets** (Sign detail); **filters collapse into a bottom drawer**; **primary buttons become a sticky bottom action bar** (icon+label where space is tight); page headers stack; the camera and map fill the width; safe-area padding on sticky bars. Sticky: mobile top bar, table card headers, bottom action bar. The map remains full-width with overlay controls; the detail bottom sheet is dismissable.

---

## Accessibility

- **Contrast:** WCAG AA — body text ≥ 4.5:1 on its background; badge text meets AA on its fill; sidebar text on navy meets AA.
- **Touch targets:** ≥ 44×44px on mobile for all interactive controls.
- **Keyboard focus:** visible 2px `--focus-ring` with 2px offset on every focusable element; logical tab order; skip-to-content link.
- **Status beyond colour:** every status badge includes a text label and a shape/dot; never colour-only; map markers pair colour with shape and a legend.
- **Form labels:** every input has a visible label or an accessible name; error text is associated with its field.
- **Screen-reader labels:** icon-only buttons have aria-labels ("Open navigation menu", "Close", overflow "More actions"); map markers expose an accessible name.
- **Modal focus:** focus trapped in dialogs/sheets, ESC closes, focus returns to the trigger.

---

## Elements to explicitly avoid
Generic SaaS/fintech/CRM/crypto/e-commerce dashboards; glassmorphism; neon; decorative gradients; oversized hero cards; giant headings; huge empty space; stock 3D cars, cartoon roads, neon AI brains, floating holograms, random city illustrations; fake customer logos; invented statistics/partnerships; rainbow chart palettes unrelated to status meaning.

---

## 3. Global consistency block

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

---

## 4. All page prompts (desktop + mobile, in generation order)


### ▸ 000_landing_page.md

```text
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
```


### ▸ 000_landing_page_mobile.md

```text
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
```


### ▸ 001_login.md

```text
PAGE NAME: Login / Sign In
ROUTE: /login
USER ROLE: Public (field user or administrator authenticating)
SCREEN TYPE: Authentication page (single screen, centered form)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 768px, 390px (mobile behavior described below — no separate file)

PAGE PURPOSE
Let an existing user sign in with email + password. There is NO public self-registration (accounts are provisioned by administrators). Keep authentication logic and messaging exactly as in the app.

USER'S MAIN TASK
Enter email + password and sign in; see a clear error if credentials are wrong.

VISUAL PRIORITY
The sign-in card. On desktop, pair it with a left brand/credibility panel so the page communicates the domain (road-asset operations) without distracting from the form.

LAYOUT
Two-column split on desktop: left = brand/credibility panel (~55%), right = centered sign-in card (~45%) on the app background. On mobile: single centered card only.

PAGE HEADER
No app sidebar (public). Small logo + "Traffic Sign Mapping" at the top of the card.

MAIN CONTENT AREAS
- LEFT PANEL (desktop only): deep slate-navy panel with the logo + wordmark, a one-line positioning statement ("Road-sign inventory and AI operations"), a muted static map texture (blue markers over a subtle OSM-style basemap, low contrast so it never competes with the form), and three small trust lines with line icons: "Private image storage", "Role-based access", "Audit-ready records". No marketing fluff.
- RIGHT CARD: title "Traffic Sign Mapping", subtitle "Sign in to continue"; Email field (type email, placeholder "you@example.com"); Password field (type password, placeholder "••••••••"); primary full-width button "Sign in" (busy label "Signing in…"); an inline error banner appears above/below the button when auth fails (red banner using the Supabase error message text). No "create account" link, no social login.

EXACT COMPONENTS: split layout, brand panel, sign-in card, two labelled inputs, primary button, inline error banner.
EXACT FIELDS AND LABELS: heading "Traffic Sign Mapping"; subtitle "Sign in to continue"; "Email" (placeholder "you@example.com"); "Password" (placeholder "••••••••"); button "Sign in" / "Signing in…".
PRIMARY ACTIONS: "Sign in".
SECONDARY ACTIONS: none. (No "Forgot password" unless it exists — it does not; do not add self-registration.)
DESTRUCTIVE ACTIONS: none. FILTERS: none. TABLE/CARD/MAP/DETAIL: n/a.
LOADING STATE: button shows "Signing in…" and is disabled while authenticating.
EMPTY STATE: n/a.
ERROR STATE: red inline banner with the auth error message (e.g., "Invalid login credentials"); the form stays on /login; fields keep their values.
PERMISSION STATE: n/a (public). Already-authenticated users are redirected to /dashboard by the app.
CONFIRMATION STATE: n/a.
MOBILE BEHAVIOR (390/375px): hide the left brand panel; show only the centered card at ~92% width with 16px padding; inputs and button are full-width, ≥44px tall; the small logo + wordmark sit above the card title; the error banner spans the card width. No horizontal scroll.
TABLET BEHAVIOR (768px): left brand panel may collapse to a slim top brand strip; card centered.
DESKTOP BEHAVIOR: split layout as described; card max-width ~380px; vertically centered.

REALISTIC EXAMPLE DATA
Email "surveyor@aalborg.example", password masked; error example "Invalid login credentials". Left-panel trust lines exactly: "Private image storage", "Role-based access", "Audit-ready records".

CONSISTENCY RULES
Same logo lockup and palette as the app. The brand panel navy matches the sidebar navy (#0F172A). Button = primary blue. Error banner = danger red on #FEF2F2.

ELEMENTS TO AVOID
Giant hero, social-login buttons, "Create account"/self-registration, decorative gradients, glassmorphism, stock office photos, oversized illustration. Keep the form the clear focus.

FINAL STITCH INSTRUCTION
Design a professional two-column sign-in page for a road-asset operations platform: a muted navy brand/credibility panel with a subtle map texture on the left and a compact, centered email/password sign-in card on the right, using the exact palette and typography below. Mobile collapses to the card only. No self-registration.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 002_dashboard.md

```text
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
```


### ▸ 003_detection_session.md

```text
PAGE NAME: Detection Session (desktop)
ROUTE: /detection
USER ROLE: Field user (primary) + Administrator
SCREEN TYPE: Live capture workspace (camera + GPS + session control + live results)
PRIMARY VIEWPORT: 1440px desktop (but the page is mobile-first in real use — see 003_mobile_detection_session_375px.md)
SECONDARY VIEWPORTS: 1280px, 1024px, 768px

PAGE PURPOSE
Let a user select a registered device, grant camera + GPS, run a detection session that captures frames on an interval, and see live detections as they are saved. Backend/model behavior is unchanged — this is only the operator UI.

USER'S MAIN TASK
Pick a device, press Start, watch the camera + GPS + live detections, and Stop when done.

VISUAL PRIORITY
The camera preview is the hero. Session controls (Start/Stop, interval, timer, frames sent) are the second priority and must be immediately reachable. GPS status and live results support the session.

LAYOUT
App shell. Two-column workspace: LEFT (≈62%) large camera preview with live detection chips beneath it; RIGHT (≈38%) a control rail with Device, Session, and Location cards. Do NOT leave the lower half of the page empty — let live results grow to fill the left column.

PAGE HEADER
- Title "Detection Session", description "Capture frames from the camera and GPS, and run AI traffic-sign detection."

MAIN CONTENT AREAS
1. CAMERA PANEL (left, hero) — heading "Camera" with a right-aligned status: "Streaming" (active) or "Idle". A 16:9 rounded slate video frame. Footer line when a frame was sent: "Last frame sent: {time}". Error text in red if the camera fails.
2. LIVE RESULTS (left, under the camera) — heading "Recent results". A responsive list of detection result cards, newest first, each: friendly class name, confidence %, a small status/low-confidence indicator, and a thumbnail with a green bounding-box overlay when available, plus a "View detail" link. Empty: "No detections yet this session." Bound the list to the most recent ~20–30.
3. DEVICE CARD (right) — heading "Device"; a select "Select a device…" listing "{device name} ({device type})". Loading: "Loading your devices…". Empty: "You have no active devices. Register one before starting a session." + link "Go to Devices".
4. SESSION CARD (right) — heading "Session"; sub-line "{Active|Stopped} · {N} frames sent"; a large mono MM:SS timer; "Capture interval" select (1s / 2s / 3s, default 2s); a primary full-width button "Start detection" (busy "Starting…") that becomes a red "Stop detection" while running. Disable Start until a device is selected.
5. LOCATION CARD (right) — heading "Location" with a permission indicator: "Granted" (green dot) / "Denied" / "Unknown". A 2-column grid: Latitude, Longitude (6-dp mono or —), Accuracy ("0.0 m" or —), Speed ("m/s" or —). If geolocation errors, show the error text in red (e.g., "Timeout expired").

EXACT COMPONENTS: camera panel, live result cards, device select, session control card, location card.
EXACT FIELDS AND LABELS: "Camera", "Streaming"/"Idle", "Last frame sent: {time}"; "Recent results", "No detections yet this session."; "Device", "Select a device…", "Loading your devices…", "You have no active devices. Register one before starting a session.", "Go to Devices"; "Session", "{Active|Stopped} · {N} frames sent", "Capture interval" (1s/2s/3s), "Start detection"/"Starting…"/"Stop detection"; "Location", "Granted"/"Denied"/"Unknown", "Latitude", "Longitude", "Accuracy", "Speed".
PRIMARY ACTIONS: "Start detection" / "Stop detection".
SECONDARY ACTIONS: change device, change capture interval, open a result's "View detail".
DESTRUCTIVE ACTIONS: none on this page (Stop just ends the session; it must NOT deactivate the device).
FILTERS: none.
TABLE OR CARD CONTENT: live result cards (class, confidence, status, bbox thumbnail).
MAP BEHAVIOR: none (capture screen).
DETAIL PANEL BEHAVIOR: none; results link out to detection detail.
LOADING STATE: device select shows "Loading your devices…"; camera shows a dark frame with a subtle spinner until the stream is ready; a just-sent frame briefly pulses "Last frame sent".
EMPTY STATE: no devices → the device card empty message + "Go to Devices"; no results yet → "No detections yet this session."
ERROR STATE: camera error text (red) in the camera panel; GPS error text (red) in the location card (e.g., "Timeout expired"); a failed frame/AI error shows a slim red banner above the camera with a plain message (Frame upload failed / AI request failed) without stopping the loop.
PERMISSION STATE: camera denied → the camera frame shows a "Camera permission needed" state with an "Enable camera" affordance; GPS denied → Location shows "Denied" + red error; both are common outdoors and must be legible.
CONFIRMATION STATE: none required to Stop.
MOBILE BEHAVIOR: use 003_mobile_detection_session_375px.md (camera hero, sticky bottom Start/Stop, live results directly under the camera).
TABLET BEHAVIOR (768px): single column — camera + live results on top, then Device/Session/Location cards; keep Start reachable near the top of the controls.
DESKTOP BEHAVIOR: two-column workspace as described; live results fill the left column so the page never looks half-empty.

REALISTIC EXAMPLE DATA
Devices: "Field Phone – Surveyor (mobile_phone)", "Dashcam – Van 7 (dashcam)", "Vehicle Cam – Patrol 1 (vehicle_camera)". GPS: Lat 57.048800, Lng 9.921700, Accuracy 0.0 m, Speed —, permission "Granted". Session: "Active · 12 frames sent", 00:34, interval 2s. Live results: "Maximum Speed Limit 60 · 97%", "No Entry · 88%", "Road Work · 63% (low confidence)". Error example: "Timeout expired".

CONSISTENCY RULES
Timer + coordinates in mono; low-confidence uses the orange status colour; camera/GPS states use the shared status language; the Stop action does not change device status.

ELEMENTS TO AVOID
A half-empty desktop page; burying Start in the middle of the controls; giant empty cards; putting live results far below the fold.

FINAL STITCH INSTRUCTION
Design a live detection-session workspace for field capture: a hero camera preview with live detection result cards beneath it, and a right control rail (Device select, Session card with a mono timer + Start/Stop + capture interval, Location/GPS card), using the exact palette and status language below. Keep Start reachable and let live results fill space — never a half-empty page.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 003_mobile_detection_session_375px.md

```text
PAGE NAME: Detection Session — Mobile (field)
ROUTE: /detection (mobile)
USER ROLE: Field user (primary)
SCREEN TYPE: Outdoor mobile capture workspace
PRIMARY VIEWPORT: 375px mobile
SECONDARY VIEWPORTS: 390px, 430px

PAGE PURPOSE
The real-world use of the detection session: a field user outdoors, one-handed, capturing road scenes. The mobile layout must NOT be a scaled desktop page. Camera first, controls reachable by thumb, live detections visible without scrolling past everything.

USER'S MAIN TASK
Select a device once, press Start (reachable at the bottom), point the phone at signs, watch live detections appear near the camera, press Stop.

VISUAL PRIORITY
1) Camera preview (top, large). 2) A STICKY BOTTOM ACTION BAR with Start/Stop + a compact status (timer · frames · GPS lock). 3) Live detection chips right under the camera. Device/GPS detail are secondary.

MOBILE INFORMATION ORDER (top → bottom)
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. Camera preview (full width, 4:3 or 16:9) with "Streaming"/"Idle" and a small GPS lock chip overlaid top-right (green when GPS granted).
3. Live detection strip directly under the camera: horizontally scrollable chips (newest left) showing friendly class name + confidence + low-confidence colour; tap a chip → detection detail. Empty: "No detections yet this session."
4. A single compact "Session details" area (collapsible): Device select ("Select a device…"), Location grid (Latitude, Longitude, Accuracy, Speed in mono; permission Granted/Denied/Unknown; error e.g. "Timeout expired" in red), and the Capture interval control (1s/2s/3s).
5. STICKY BOTTOM ACTION BAR (always visible, safe-area padding): primary "Start detection" (full-width blue) → becomes red "Stop detection" while running; a compact left cluster shows the mono MM:SS timer + "· {N} frames" + a GPS lock dot. Disable Start until a device is selected (show a hint "Select a device to start").

STICKY CONTROLS: the top bar and the bottom action bar are sticky; the camera stays near the top; the live strip scrolls horizontally, the rest scrolls vertically between them.
BOTTOM SHEETS: tapping "Session details" or the device field can open a bottom sheet (rounded top, drag handle) for device selection and full GPS readout, so the camera stays visible.
CAMERA ASPECT RATIO: 4:3 by default (more vertical road scene) or 16:9; rounded slate frame; never letterbox awkwardly.
TOUCH CONTROLS: all controls ≥44px; Start/Stop is a full-width ≥52px button; interval is a segmented control, not a tiny select.
TABLE-TO-CARD CONVERSION: n/a (this page has no table; live results are chips/cards).
MOBILE FILTER DRAWERS: n/a.
SAFE-AREA PADDING: bottom action bar respects the home-indicator safe area.
SCROLL REGIONS: vertical page scroll for details; horizontal scroll for the live detection strip; camera + bottom bar fixed.
ERROR-MESSAGE PLACEMENT: frame/AI errors appear as a slim red banner directly under the camera (not a modal), so the loop keeps running; GPS error in the Location grid; camera-permission error as a full-frame "Enable camera" state inside the camera area.
SESSION CONTROL PLACEMENT: bottom sticky bar (primary), so Start/Stop is always thumb-reachable regardless of scroll.
HOW MAP CONTENT REMAINS USABLE: n/a (no map on this page).

EXACT FIELDS AND LABELS: "Camera", "Streaming"/"Idle", "Last frame sent: {time}", "No detections yet this session.", "Device", "Select a device…", "You have no active devices. Register one before starting a session." + "Go to Devices", "Session", "{Active|Stopped} · {N} frames sent", "Capture interval" (1s/2s/3s), "Start detection"/"Stop detection", "Location", "Granted"/"Denied"/"Unknown", "Latitude", "Longitude", "Accuracy", "Speed", error "Timeout expired".
PRIMARY ACTIONS: Start/Stop in the sticky bottom bar.
SECONDARY ACTIONS: pick device, set interval, open a detection chip.
DESTRUCTIVE ACTIONS: none (Stop does not deactivate the device).
LOADING STATE: "Loading your devices…" in the device sheet; camera spinner; frame pulse.
EMPTY STATE: "No detections yet this session." under the camera.
ERROR STATE: red banner under the camera for frame/AI errors; GPS/camera permission states as above.
PERMISSION STATE: camera denied → full-frame "Camera permission needed" + "Enable camera"; GPS denied → "Denied" + red error; give these prominence (outdoor use).
CONFIRMATION STATE: none to Stop.
DESKTOP/TABLET BEHAVIOR: use 003_detection_session.md.

REALISTIC EXAMPLE DATA
Device "Field Phone – Surveyor (mobile_phone)"; GPS Lat 57.048800, Lng 9.921700, Accuracy 0.0 m, Speed —, "Granted"; Session "Active · 12 frames sent", 00:34, interval 2s; live chips "Maximum Speed Limit 60 · 97%", "No Entry · 88%", "Road Work · 63%" (orange low-confidence). Friendly names only.

CONSISTENCY RULES
Same palette, status colours, and mono numerics as the app. GPS lock and camera status use the shared status language. Stop ends the session only.

ELEMENTS TO AVOID
A scaled desktop layout; Start buried mid-scroll; live results at the very bottom; tiny non-thumb controls; a modal that blocks the camera during errors.

FINAL STITCH INSTRUCTION
Design the 375px outdoor mobile detection session: camera hero on top with a live detection chip strip directly beneath it, a collapsible session-details area, and a STICKY bottom action bar carrying Start/Stop + a mono timer + frames + GPS lock — thumb-reachable, safe-area aware, using the exact palette and status language below. Not a scaled desktop page.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 004_sign_map.md

```text
PAGE NAME: Sign Map (Traffic Sign Map)
ROUTE: /map/signs
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-bleed interactive map with filter toolbar + slide-in detail panel
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 004_sign_map_mobile_390px.md)

PAGE PURPOSE
Explore the OPTIMIZED, grouped traffic-sign inventory (one marker per fused sign record, not raw detection events) on a map, filter it, and inspect a sign's details. The map is the primary element and should dominate the viewport.

USER'S MAIN TASK
Filter the inventory, read spatial distribution (markers / clusters / density), click a sign to see its details and its latest related detection.

VISUAL PRIORITY
The map. Everything else (filter toolbar, view-mode control, counter, detail panel) frames the map without shrinking it.

LAYOUT
App shell. A compact page header row, then a thin filter toolbar, then the map filling all remaining height. A 320–360px Sign detail panel slides in from the right OVER the map when a marker is selected (map stays visible on the left).

PAGE HEADER
- Title "Traffic Sign Map", description "Optimized sign inventory (grouped detections), not raw events."

FILTER TOOLBAR (one dense sticky row above the map)
- Sign type select: first option "All sign types", then friendly sign names (Maximum Speed Limit 60, No Entry, Road Work, Stop, Yield, School Zone, Roundabout, Parking, Pedestrian Crossing, Speed Limit 30…).
- Status select: "All statuses", "Pending", "Auto verified", "Manually verified", "Rejected", "Duplicate".
- Confidence select: "Any confidence", "≥ 50%", "≥ 75%", "≥ 90%".
- A styled DATE-RANGE control labelled "Last detected" (from / to) — NOT two raw browser date inputs.
- Right side: a segmented control [Markers · Clustered · Density] (default Clustered) + a counter "{N} signs" (e.g., "40 signs"; "Loading…" while loading).

MAP BEHAVIOR
- OSM-style basemap; zoom controls top-left; attribution bottom-right.
- Markers = brand-blue pins. Clusters = blue circles with a white count. Selected sign = amber marker + a subtle highlight ring, visually anchored to the open detail panel.
- Density mode = graduated heat cells with a PERSISTENT LEGEND (bottom-left card) showing the scale: low → high (green → yellow → orange → red bands). This legend must be visible in density mode (the current app hides it).
- Clicking a cluster zooms in; clicking a single marker opens the detail panel.

DETAIL PANEL BEHAVIOR (right slide-in, 320–360px)
- Header "Sign detail" + close "✕".
- Title: the friendly sign name (e.g., "Road Work"). Optional representative thumbnail with a green bbox if available; else "No image captured".
- Rows: Latitude (6-dp mono), Longitude (6-dp mono), Confidence (% or —), Status (a STATUS BADGE, e.g., "Manually verified" — not raw text), Detections (count), Observations (count), First detected (date or —), Last detected (date or —).
- Sub-heading "Latest related event": Class (friendly), Confidence (% or —), GPS accuracy ("{n} m" or —), At (datetime). Link "View latest detection →" (to detection detail). Empty: "No related event visible.".
- Loading "Loading…"; error shows the message text.

EXACT COMPONENTS: filter toolbar (3 selects + date-range + segmented control + counter), Leaflet-style map, blue/amber markers, blue clusters, density legend, right Sign detail panel.
EXACT FIELDS AND LABELS: as listed above (toolbar options, "{N} signs", "Sign detail", row labels, "Latest related event", "View latest detection →", "No related event visible.").
PRIMARY ACTIONS: filter the map; select a marker.
SECONDARY ACTIONS: switch view mode; open "View latest detection →".
DESTRUCTIVE ACTIONS: none (review/delete happen elsewhere).
FILTERS: sign type, status, confidence, last-detected date range (toolbar).
TABLE OR CARD CONTENT: none (map + detail panel).
LOADING STATE: map area shows "Loading map…" placeholder; counter shows "Loading…"; detail panel "Loading…".
EMPTY STATE: filtered to zero → an unobtrusive map overlay chip "No signs match these filters" + a "Reset filters" link; counter "0 signs".
ERROR STATE: if the map data fails, a slim red banner above the map "Couldn't load signs" + Retry; if a signed thumbnail fails in the panel, show "Image failed to load (the signed URL may have expired)." + "Refresh image".
PERMISSION STATE: available to all authenticated users (field + admin); no admin gating.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR: use 004_sign_map_mobile_390px.md (filters → bottom drawer, detail → bottom sheet, map full-width).
TABLET BEHAVIOR (768px): toolbar wraps to two rows or collapses secondary filters into a "Filters" button; detail panel overlays the map (does not push).
DESKTOP BEHAVIOR: as described; map dominates; detail panel overlays from the right.

REALISTIC EXAMPLE DATA
Counter "40 signs". Markers over an Aalborg basemap with clusters "2", "3", "6". Selected sign detail: "Road Work · Manually verified · Confidence 69% · Detections 6 · Observations 1 · 57.054086, 9.891894 · First detected 6/19/2026 · Last detected 6/26/2026". Latest related event: "Road Work · 80% · 10 m · 6/19/2026, 2:12 PM". Friendly names only.

CONSISTENCY RULES
Status shown as a badge (same as every other page). Selected marker amber; density legend always visible in density mode; coordinates in mono.

ELEMENTS TO AVOID
Shrinking the map for oversized panels; raw browser date inputs; hiding the density scale; a detail panel with no visual link to its marker; raw snake_case status.

FINAL STITCH INSTRUCTION
Design a full-bleed traffic-sign inventory map: a dense filter toolbar (sign type, status, confidence, a styled last-detected date range) with a Markers/Clustered/Density segmented control and a "{N} signs" counter, blue markers + blue count clusters + an amber selected marker anchored to a right-hand Sign detail panel (with a status badge and a "Latest related event" section), and a persistent density legend — using the exact palette and status language below. The map dominates the screen.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 004_sign_map_mobile_390px.md

```text
PAGE NAME: Sign Map — Mobile
ROUTE: /map/signs (mobile)
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-screen mobile map + filter drawer + detail bottom sheet
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile view of the grouped traffic-sign inventory map. The map must fill the screen; filters and sign details must not permanently cover it.

USER'S MAIN TASK
Pan/zoom the map, open a filter drawer to narrow results, tap a sign to see its details in a bottom sheet.

VISUAL PRIORITY
The map fills the viewport edge to edge under the compact top bar. Controls float over it.

MOBILE INFORMATION ORDER
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. A thin overlay bar at the top of the map: a "Filters" button (opens the filter drawer), the [Markers · Clustered · Density] segmented control (compact/icon), and a "{N} signs" counter chip.
3. The map (full-width, all remaining height): blue pins, blue count clusters, amber selected marker, density legend as a small collapsible chip bottom-left.
4. A "locate me" button bottom-right (optional).

MOBILE FILTER DRAWER (bottom sheet)
- Opens from "Filters"; rounded top + drag handle; contains: Sign type select ("All sign types" + friendly names), Status select ("All statuses"/Pending/Auto verified/Manually verified/Rejected/Duplicate), Confidence select ("Any confidence"/≥50%/≥75%/≥90%), a styled "Last detected" date-range. Footer: "Apply" (primary) + "Reset". A small badge shows the active-filter count on the "Filters" button.

DETAIL BOTTOM SHEET (on marker tap)
- Rounded-top sheet with drag handle; header "Sign detail" + friendly sign name + close.
- Rows (compact): Status BADGE, Confidence %, Detections, Observations, Latitude/Longitude (mono), First/Last detected.
- "Latest related event": Class, Confidence, GPS accuracy, At + "View latest detection →".
- Optional representative thumbnail with bbox; "No related event visible." when empty.
- The sheet is dismissable (swipe down / close); the selected marker stays amber and centered while the sheet is open (map pans so the marker sits above the sheet).

STICKY CONTROLS: top bar + the map overlay control bar; the bottom sheets are modal-over-map.
CAMERA ASPECT RATIO: n/a.
TOUCH CONTROLS: ≥44px controls; segmented control large enough to tap; markers have a comfortable tap radius.
TABLE-TO-CARD CONVERSION: n/a.
SAFE-AREA PADDING: bottom sheets + floating buttons respect the safe area.
SCROLL REGIONS: the map pans; the drawer/sheet scroll internally.
ERROR-MESSAGE PLACEMENT: a slim red banner slides under the top bar ("Couldn't load signs" + Retry); thumbnail errors inside the sheet.
HOW MAP CONTENT REMAINS USABLE: filters and details are transient sheets, never a permanent panel; the map is always the background; when a sheet is open the map still shows the selected amber marker above it.

EXACT FIELDS AND LABELS: "{N} signs", "Filters", segmented "Markers/Clustered/Density", "Sign detail", row labels (Latitude, Longitude, Confidence, Status, Detections, Observations, First detected, Last detected), "Latest related event", "View latest detection →", "No related event visible.", filter option labels as in 004_sign_map.md.
PRIMARY ACTIONS: open Filters → Apply; tap a marker.
SECONDARY ACTIONS: switch view mode; "View latest detection →".
DESTRUCTIVE ACTIONS: none. FILTERS: in the bottom drawer.
LOADING STATE: "Loading map…" placeholder; counter "Loading…".
EMPTY STATE: "No signs match these filters" overlay chip + "Reset".
ERROR STATE: red banner under the top bar.
PERMISSION STATE: all authenticated users.
CONFIRMATION STATE: none.
DESKTOP/TABLET BEHAVIOR: use 004_sign_map.md.

REALISTIC EXAMPLE DATA
Counter "40 signs"; clusters "2"/"3"/"6"; selected "Road Work · Manually verified · 69% · 6 detections · 57.054086, 9.891894"; latest event "Road Work · 80% · 10 m". Aalborg basemap; friendly names only.

CONSISTENCY RULES
Status badges, amber selected marker, mono coordinates, density legend — same as desktop.

ELEMENTS TO AVOID
A permanent side panel eating the map; raw date inputs; a scaled desktop toolbar; tiny tap targets.

FINAL STITCH INSTRUCTION
Design the 390px mobile traffic-sign map: a full-screen map under a compact top bar with a floating overlay bar (Filters button, Markers/Clustered/Density segmented control, "{N} signs" counter), a bottom-sheet filter drawer, and a bottom-sheet Sign detail (status badge + latest related event) that keeps the map visible — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 005_device_map.md

```text
PAGE NAME: Device Map (Live Device Map)
ROUTE: /map/devices
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-bleed live map of device positions (polling)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 005_device_map_mobile_390px.md)

PAGE PURPOSE
Show the last-known locations of field devices, refreshed by polling, so an operator can see fleet distribution and device health at a glance. Must look clearly DIFFERENT from the sign map (different marker language) so the two maps aren't confused.

USER'S MAIN TASK
See where devices are, which are active vs inactive vs stale/offline, and read a device's details.

VISUAL PRIORITY
The map. Device status must be legible spatially (marker colour/shape), not only inside a popup.

LAYOUT
App shell. Compact header + a thin toolbar, then a full-height map. Device popups open on the map; an optional compact right list of devices can accompany the map on wide screens.

PAGE HEADER
- Title "Live Device Map", description "Last-known device locations, refreshed by polling."

TOOLBAR (thin row above the map)
- Left: a live status chip "Polling every 7s".
- Center: a device STATUS FILTER (All / Active / Inactive / Offline) — a design improvement using the existing status + last-seen data.
- Right: a counter "{N} device(s)" plus "· updated {time}" when refreshed.

MAP BEHAVIOR
- OSM-style basemap; zoom top-left; attribution bottom-right.
- Device markers use a DISTINCT shape from sign pins (e.g., a rounded-square/diamond "device" glyph), COLOUR-CODED by status: Active = green, Inactive = grey, Offline/stale (no recent last_seen) = red. Add a small legend (bottom-left) mapping the three colours. (The current app draws all devices as identical blue pins with text-only status — improve this using the real `status` + `last_seen_at`.)
- Clicking a marker opens a popup.

DEVICE POPUP
- Bold device name; "Type: {device_type}"; "Status: {status}" as a status badge; "Owner: {full name or email or —}"; "Last seen: {datetime or —}". Keep it compact.

OPTIONAL RIGHT LIST (wide desktop only)
- A compact device list card (Name · Type · Status badge · Last seen) that syncs with the map — selecting a row highlights its marker (amber selected), and vice versa.

EXACT COMPONENTS: toolbar (polling chip + status filter + counter), map with colour-coded device markers, legend, device popup, optional synced device list.
EXACT FIELDS AND LABELS: "Live Device Map", "Last-known device locations, refreshed by polling.", "Polling every 7s", "{N} device(s)", "· updated {time}", popup "Type:", "Status:", "Owner:", "Last seen:".
PRIMARY ACTIONS: select a device (map or list).
SECONDARY ACTIONS: filter by status.
DESTRUCTIVE ACTIONS: none (device management is on Devices / Admin Devices).
FILTERS: device status.
TABLE OR CARD CONTENT: optional right device list.
LOADING STATE: "Loading map…" placeholder; counter empty until first poll.
EMPTY STATE: no devices with location → a map overlay chip "No device locations yet" (devices appear once they report a position during a session).
ERROR STATE: polling failure → a slim non-blocking banner "Couldn't refresh device locations — retrying"; keep the last-known markers.
PERMISSION STATE: all authenticated users.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR: use 005_device_map_mobile_390px.md.
TABLET BEHAVIOR (768px): hide the right list; toolbar wraps; popups as bottom sheets.
DESKTOP BEHAVIOR: map dominant; optional synced list on the right for wide screens.

REALISTIC EXAMPLE DATA
Counter "4 device(s) · updated 12:41:07". Devices: "Vehicle Cam – Patrol 1 · vehicle_camera · Active · Demo Admin · Last seen 6/26/2026, 2:18 AM"; "Field Phone – Surveyor · mobile_phone · Active"; "Dashcam – Van 7 · dashcam · Active"; "IoT Node – Bridge · custom_iot_device · Inactive". Aalborg basemap.

CONSISTENCY RULES
Device markers are visually distinct from sign markers; status uses the shared badge/colour language; selected device marker = amber.

ELEMENTS TO AVOID
Identical-to-sign-map blue pins with no status colour; a popup that's the only way to read status; no legend; letting a right list shrink the map.

FINAL STITCH INSTRUCTION
Design a full-bleed live device map: a thin toolbar ("Polling every 7s" chip, an Active/Inactive/Offline status filter, "{N} device(s) · updated {time}" counter), a map with DISTINCT device markers colour-coded by status plus a legend, compact device popups (name, type, status badge, owner, last seen), and an optional synced device list on wide screens — using the exact palette and status language below. Make it clearly different from the sign map.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 005_device_map_mobile_390px.md

```text
PAGE NAME: Device Map — Mobile
ROUTE: /map/devices (mobile)
USER ROLE: Field user + Administrator
SCREEN TYPE: Full-screen mobile device map + detail bottom sheet
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile view of live device positions. Map fills the screen; device details open in a bottom sheet; status is legible from marker colour.

USER'S MAIN TASK
See device distribution and health on the map, tap a device for details.

VISUAL PRIORITY
Full-screen map with colour-coded device markers.

MOBILE INFORMATION ORDER
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. A thin overlay bar on the map: "Polling every 7s" chip (left), a status filter chip (All/Active/Inactive/Offline), and "{N} device(s)" counter (right).
3. The map (full-width, all height): device markers colour-coded by status (Active green, Inactive grey, Offline red), distinct from sign pins; a small legend chip bottom-left; a "locate me" button bottom-right.

DETAIL BOTTOM SHEET (on marker tap)
- Rounded-top sheet + drag handle; device name (bold); Type; Status BADGE; Owner; Last seen; dismissable. The tapped marker stays highlighted (amber ring) and the map pans it above the sheet.

STICKY CONTROLS: top bar + map overlay bar.
CAMERA ASPECT RATIO: n/a.
TOUCH CONTROLS: ≥44px chips; comfortable marker tap radius.
TABLE-TO-CARD CONVERSION: n/a (no table).
MOBILE FILTER DRAWERS: the status filter is a single chip menu (small); no full drawer needed.
SAFE-AREA PADDING: sheet + floating buttons respect the safe area.
SCROLL REGIONS: map pans; sheet scrolls internally.
ERROR-MESSAGE PLACEMENT: a slim non-blocking banner under the top bar ("Couldn't refresh — retrying"); last-known markers stay.
SESSION CONTROL PLACEMENT: n/a.
HOW MAP CONTENT REMAINS USABLE: details are a transient bottom sheet; the map is always the background; legend collapsible.

EXACT FIELDS AND LABELS: "Polling every 7s", "{N} device(s)", "· updated {time}", sheet fields "Type", "Status", "Owner", "Last seen", legend "Active/Inactive/Offline".
PRIMARY ACTIONS: tap a device.
SECONDARY ACTIONS: filter by status.
DESTRUCTIVE ACTIONS: none. FILTERS: status chip.
LOADING STATE: "Loading map…" placeholder.
EMPTY STATE: "No device locations yet" overlay chip.
ERROR STATE: banner under top bar.
PERMISSION STATE: all authenticated users.
CONFIRMATION STATE: none.
DESKTOP/TABLET BEHAVIOR: use 005_device_map.md.

REALISTIC EXAMPLE DATA
Counter "4 device(s) · updated 12:41:07"; markers: Patrol 1 (Active green), Surveyor (Active green), Van 7 (Active green), IoT Node – Bridge (Inactive grey). Sheet: "Vehicle Cam – Patrol 1 · vehicle_camera · Active · Demo Admin · Last seen 6/26/2026, 2:18 AM".

CONSISTENCY RULES
Distinct device markers colour-coded by status; status badges; amber selected; mono timestamps.

ELEMENTS TO AVOID
All-blue identical markers; a permanent panel; scaled desktop toolbar; tiny targets.

FINAL STITCH INSTRUCTION
Design the 390px mobile device map: a full-screen map under a compact top bar with a floating overlay bar ("Polling every 7s", status filter, "{N} device(s)" counter), device markers colour-coded by status with a legend, and a bottom-sheet device detail (status badge, owner, last seen) that keeps the map visible — using the exact palette and status language below. Distinct from the sign map.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 006_devices.md

```text
PAGE NAME: Devices (my devices)
ROUTE: /devices
USER ROLE: Field user + Administrator (manages the current user's OWN devices)
SCREEN TYPE: Table + register/edit form
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 006_devices_mobile.md)

PAGE PURPOSE
Let a user register and manage the field devices they use for detection sessions. Device active/inactive STATUS is admin-only; a field user can register/rename their devices but cannot change status.

USER'S MAIN TASK
Register a device (name + type), see their devices with status and detection counts, and edit permitted fields.

VISUAL PRIORITY
The device table, with a clear "Register device" primary action. The register/edit form is a focused side panel or modal, not a large inline block.

LAYOUT
App shell. Header + a right-aligned "Register device" button, then a dense device table. Register/Edit opens a right slide-in panel.

PAGE HEADER
- Title "Devices", description "Register and manage the field devices you use for detection sessions."
- Right: primary button "Register device".

TABLE COLUMNS (dense)
Name · Type · Identifier (mono) · Status (BADGE: Active green / Inactive grey) · Detections (count) · Last seen (datetime or —) · Created (date) · Actions.
- Actions: "Edit" (opens the panel). For ADMIN only: a "Deactivate" affordance appears; for field users the status is read-only (badge only) with a small tooltip "Status is managed by an administrator".

REGISTER / EDIT PANEL (right slide-in)
- Register: fields "Device name *", "Device type *" (select: mobile_phone, vehicle_camera, dashcam, custom_iot_device, test_device), "Identifier (optional)" (auto-generated if blank). Submit "Create device"; cancel.
- Edit: "Device name", "Device type"; STATUS control shown ONLY for admins (Active/Inactive); field users do not see a status control. Submit "Save changes".

EXACT COMPONENTS: device table, register/edit side panel, status badge, "Register device" button.
EXACT FIELDS AND LABELS: "Devices", "Register and manage the field devices you use for detection sessions.", "Register device", table columns as above, form labels "Device name *", "Device type *", "Identifier (optional)", "Create device", "Save changes", tooltip "Status is managed by an administrator".
PRIMARY ACTIONS: "Register device", "Create device" / "Save changes".
SECONDARY ACTIONS: "Edit".
DESTRUCTIVE ACTIONS: "Deactivate" (ADMIN only) → a confirmation ("Deactivate '{name}'? It will be hidden from new sessions."). Field users have no destructive action here.
FILTERS: none (own devices are few).
TABLE OR CARD CONTENT: the device rows.
MAP/DETAIL PANEL: none.
LOADING STATE: "Loading devices…".
EMPTY STATE: "You have no devices yet. Click 'Register device' to add one." + a prominent primary button.
ERROR STATE: inline red banner with the failure message; identifier-conflict message surfaced clearly.
PERMISSION STATE: field users see status as a read-only badge (no status control, no Deactivate); admins get the status control + Deactivate.
CONFIRMATION STATE: Deactivate confirmation modal (admin only).
MOBILE BEHAVIOR: use 006_devices_mobile.md (cards + register sheet).
TABLET BEHAVIOR (768px): table scrolls horizontally inside its card; Register opens a bottom sheet.
DESKTOP BEHAVIOR: dense table + right register/edit panel.

REALISTIC EXAMPLE DATA
Rows: "Field Phone – Surveyor · mobile_phone · DEMO-1002 · Active · 34 · 6/26/2026 · 6/19/2026"; "Vehicle Cam – Patrol 1 · vehicle_camera · DEMO-1001 · Active · 41"; "Dashcam – Van 7 · dashcam · DEMO-1003 · Active"; "IoT Node – Bridge · custom_iot_device · DEMO-1004 · Inactive".

CONSISTENCY RULES
Status badge matches every other page; admin-only controls are visibly gated; identifiers in mono.

ELEMENTS TO AVOID
A large inline form block pushing the table down; showing a status control to field users; an 8-column table that overflows the page (scroll inside the card).

FINAL STITCH INSTRUCTION
Design a "my devices" management page: a dense device table (Name, Type, Identifier, Status badge, Detections, Last seen, Created, Actions) with a "Register device" primary action opening a right side panel for register/edit, where the status control and Deactivate appear only for administrators — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 006_devices_mobile.md

```text
PAGE NAME: Devices — Mobile
ROUTE: /devices (mobile)
USER ROLE: Field user + Administrator
SCREEN TYPE: Card list + register/edit bottom sheet
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile management of the user's own devices. The desktop table becomes a card list; register/edit is a bottom sheet.

USER'S MAIN TASK
Register a device or edit a device before starting a session.

VISUAL PRIORITY
The device card list + a sticky "Register device" primary button.

MOBILE INFORMATION ORDER
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. Page header: "Devices" + short description.
3. Device CARD LIST (table → cards): each card shows device name (bold), Type, a Status BADGE (Active/Inactive), Detections count, Last seen, Identifier (mono, small). Card actions: "Edit" (opens sheet); for admins a small "⋯" menu adds "Deactivate".
4. STICKY bottom bar: "Register device" primary button (safe-area padding).

REGISTER / EDIT BOTTOM SHEET
- Rounded-top sheet + drag handle. Register: "Device name *", "Device type *" (segmented or select of the five types), "Identifier (optional)". Submit "Create device". Edit: "Device name", "Device type"; STATUS control only for admins. Submit "Save changes". Fields full-width, ≥44px.

TABLE-TO-CARD CONVERSION: the 8-column table collapses to a two-line card (title + status/detections row, meta row).
MOBILE FILTER DRAWERS: none needed (few devices).
SAFE-AREA PADDING: sticky Register bar + sheet respect the safe area.
SCROLL REGIONS: page scrolls the card list; sheet scrolls internally.
ERROR-MESSAGE PLACEMENT: inline red banner under the header (e.g., identifier conflict).
SESSION CONTROL PLACEMENT: n/a.

EXACT FIELDS AND LABELS: "Devices", "Register device", card fields (Type, Status, Detections, Last seen, Identifier), form labels "Device name *", "Device type *", "Identifier (optional)", "Create device", "Save changes", tooltip "Status is managed by an administrator", empty "You have no devices yet. Click 'Register device' to add one.".
PRIMARY ACTIONS: "Register device" (sticky), "Create device"/"Save changes".
SECONDARY ACTIONS: "Edit".
DESTRUCTIVE ACTIONS: "Deactivate" (admin only) with a confirmation.
FILTERS: none.
LOADING STATE: "Loading devices…" skeleton cards.
EMPTY STATE: empty message + prominent Register button.
ERROR STATE: inline red banner.
PERMISSION STATE: field users see status as a read-only badge (no status control, no Deactivate).
CONFIRMATION STATE: Deactivate confirmation (admin only).
DESKTOP/TABLET BEHAVIOR: use 006_devices.md.

REALISTIC EXAMPLE DATA
Cards: "Field Phone – Surveyor · mobile_phone · Active · 34 detections · DEMO-1002"; "IoT Node – Bridge · custom_iot_device · Inactive · DEMO-1004".

CONSISTENCY RULES
Status badges match the app; admin-only controls gated; identifiers mono.

ELEMENTS TO AVOID
A horizontally scrolling desktop table on mobile; a status control for field users; Register buried in the scroll.

FINAL STITCH INSTRUCTION
Design the 390px mobile Devices page: a device card list (name, type, status badge, detections, last seen, identifier) with a sticky "Register device" button and a register/edit bottom sheet where status is admin-only — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 007_presentation.md

```text
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
```


### ▸ 008_detection_logs.md

```text
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
```


### ▸ 009_detection_review.md

```text
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
```


### ▸ 009_detection_review_mobile.md

```text
PAGE NAME: Detection Review — Mobile
ROUTE: /admin/detections (mobile)
USER ROLE: Administrator
SCREEN TYPE: Review card list + bottom-sheet action menu
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile administrator review of detection events. The dense desktop table becomes a scannable card list; row actions move into a bottom-sheet action menu so the destructive Delete frame can't be mis-tapped.

USER'S MAIN TASK
Scan detections, tap one, and apply a review action (verify / reject / duplicate / reset) or delete the frame.

VISUAL PRIORITY
Evidence-rich review cards + a clear action sheet.

MOBILE INFORMATION ORDER
1. Compact top bar: hamburger + "Traffic Sign Mapping".
2. Header "Admin · Detections" + a "⋯" menu holding "Export events CSV" / "Export signs CSV".
3. A sticky filter row: "Search class name…" + a "Status" filter chip ("All statuses"/Pending/Auto verified/Manually verified/Rejected/Duplicate/Low confidence).
4. REVIEW CARD LIST (table → cards): each card = a small thumbnail (with green bbox) left; right side: Class (bold) + Status BADGE on line 1; Confidence meter + Device on line 2; Lat/Lng (mono) + AI ms + Time as small meta. A single "Review" (or "⋯") button opens the action sheet. Tap the card body → detection detail.
5. Pagination footer: "1–25 of 120 · Previous · Next".

ACTION BOTTOM SHEET (per card)
- Rounded-top sheet + drag handle. Primary "Verify" (green). Then "Reject", "Mark duplicate", "Reset to pending", "View details". A clearly SEPARATED destructive section at the bottom (danger-tinted): "Delete frame" (red), which opens the delete-frame confirmation.

DELETE-FRAME CONFIRMATION (modal/sheet)
- "Permanently delete frame" + the full consequence sentence ("This permanently deletes the captured image, every detection produced from the same frame, related observation links, and the storage object. This cannot be undone.") + context (thumbnail, capture time, device, N detections) + red "Delete frame (N)" + "Cancel".

TABLE-TO-CARD CONVERSION: the 12-column table collapses to a 3-line evidence card with a thumbnail.
STICKY CONTROLS: top bar + filter row.
SAFE-AREA PADDING: action sheet + pagination respect the safe area.
SCROLL REGIONS: page scrolls the card list; sheets scroll internally.
ERROR-MESSAGE PLACEMENT: action errors as toasts; a partial-success delete (DB ok / storage failed) shows a warning toast.

EXACT FIELDS AND LABELS: "Admin · Detections", "Search class name…", status options, card fields (Class, Status, Confidence, Device, Lat, Lng, AI ms, Time), actions "Verify"/"Reject"/"Mark duplicate"/"Reset to pending"/"View details"/"Delete frame", "Export events CSV"/"Export signs CSV", pagination, delete consequence sentence, empty "No detection events match your filters.".
PRIMARY ACTIONS: "Verify" (in the action sheet).
SECONDARY ACTIONS: Reject/Duplicate/Reset/View details; exports; filters.
DESTRUCTIVE ACTIONS: "Delete frame" in a separated danger section + modal confirm.
FILTERS: search + status chip.
LOADING STATE: skeleton cards.
EMPTY STATE: "No detection events match your filters." + Clear filters.
ERROR STATE: toasts / inline banner.
PERMISSION STATE: admin-only.
CONFIRMATION STATE: delete-frame modal.
DESKTOP/TABLET BEHAVIOR: use 009_detection_review.md.

REALISTIC EXAMPLE DATA
Card: "Speed Limit 50 · Pending · 61% · Dashcam – Van 7 · 57.04537, 9.91127 · 85 ms · 6/26/2026, 2:09 AM"; "Road Work · Low confidence · 41%". Delete context "3 detections · Field Phone – Surveyor". Friendly names only.

CONSISTENCY RULES
Status badges; one primary + secondary actions + a separated destructive section; delete modal always states the consequence; mono numerics.

ELEMENTS TO AVOID
A horizontally scrolling desktop table; Delete frame adjacent to Verify; plain-text statuses; tiny tap targets.

FINAL STITCH INSTRUCTION
Design the 390px mobile Detection Review: a sticky filter row (search + status chip) over evidence-rich review cards (thumbnail + Class + Status badge + Confidence + meta), a per-card bottom-sheet action menu (primary Verify; Reject/Duplicate/Reset/View details; a separated red Delete frame), and a consequence-spelling delete-frame confirmation — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 010_detection_detail.md

```text
PAGE NAME: Detection Detail
ROUTE: /detections/[id]
USER ROLE: Field user (owner) + Administrator
SCREEN TYPE: Single-record detail (evidence + facts) — dynamic template
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px (mobile: 010_detection_detail_mobile.md)

PAGE PURPOSE
Inspect one detection event: the captured frame with its bounding box, the class/confidence/status, location + device metadata, the raw AI response, and any linked traffic-sign inventory record. Admins can permanently delete the frame.

USER'S MAIN TASK
Look at the evidence (image + bbox + class + confidence) and the facts; admins may verify decisions elsewhere or delete an erroneous frame here.

VISUAL PRIORITY
The captured frame with the bounding-box overlay is the hero. A compact fact sheet supports it. Raw JSON is secondary/collapsible.

LAYOUT
App shell with a breadcrumb ("Detection Review / Detection detail"). Two-column: LEFT (≈60%) the image evidence + collapsible raw AI response; RIGHT (≈40%) a fact sheet + admin actions.

PAGE HEADER
- Title "Detection detail", description "Captured frame, bounding box, metadata, and AI response."
- Right: a "Back to detections" link.

MAIN CONTENT AREAS
1. CAPTURED FRAME (left, hero) — a large image in a slate frame with a 2px emerald bounding-box overlay labelled "detection". States: loading "Loading image…"; missing "No image captured"; expired "Image failed to load (the signed URL may have expired)." + a "Refresh image" button; an "Open original image" link when available.
2. RAW AI RESPONSE (left, collapsible) — a "Show raw AI response JSON" disclosure revealing a dark mono code block. Collapsed by default.
3. FACT SHEET (right) — compact rows: Class name (friendly, prominent) + Class ID (mono, secondary), Confidence (% with a meter), Validation status (BADGE), AI response time ("{n} ms"), Created (datetime); then Location (Latitude, Longitude 6-dp mono, GPS accuracy "{n} m", Heading "{n}°", Speed "{n} m/s"); then Device & user (Device, Device type, Identifier, User).
4. LINKED TRAFFIC SIGN (right, if grouped) — Sign type (friendly), Coordinates, Confidence, Detections, Status badge, and a "View on sign map" link.
5. ADMIN ACTIONS (right, ADMIN only, separated danger zone) — a bordered danger card: a short note distinguishing this from Reject ("Reject only changes the review status and keeps the image; Delete frame permanently removes the frame and its detections."), and a red "Delete frame" button opening the delete-frame confirmation modal (same consequence text + context as Detection Review). On success, return to Detection Review.

EXACT COMPONENTS: bbox image preview, collapsible raw JSON, fact sheet, linked-sign card, admin danger zone with Delete frame, delete modal.
EXACT FIELDS AND LABELS: "Detection detail", the description, "Class name", "Class ID", "Confidence", "Validation status", "AI response time", "Created", "Latitude", "Longitude", "GPS accuracy", "Heading", "Speed", "Device", "Device type", "Identifier", "User", "Sign type", "Coordinates", "Detections", "Status", "View on sign map", "Show raw AI response JSON", "Open original image", "No image captured", "Image failed to load (the signed URL may have expired).", "Refresh image", "Delete frame".
PRIMARY ACTIONS: none routine (this is an inspection page); "Refresh image" if the URL expired.
SECONDARY ACTIONS: "Open original image", "View on sign map", toggle raw JSON.
DESTRUCTIVE ACTIONS: "Delete frame" (ADMIN only) in a separated danger zone + modal confirmation with the full consequence + context.
FILTERS: none.
TABLE/MAP: none (a small static locator could show the point, optional).
DETAIL PANEL: this whole page is the detail.
LOADING STATE: "Loading detection…"; image "Loading image…"; fact-sheet skeleton.
EMPTY STATE: n/a (a record exists) — if not found, "Detection not found" with a back link.
ERROR STATE: "Detection not found" / load error banner; image-expired state as above.
PERMISSION STATE: owner or admin may view; only ADMIN sees the delete danger zone; a non-owner non-admin gets a "You don't have access to this detection" message.
CONFIRMATION STATE: the delete-frame modal.
MOBILE BEHAVIOR: use 010_detection_detail_mobile.md (image first, fact sheet stacked, danger zone last).
TABLET BEHAVIOR (768px): image on top, fact sheet below; raw JSON collapsible.
DESKTOP BEHAVIOR: two-column evidence + facts; danger zone clearly separated.

REALISTIC EXAMPLE DATA
"Maximum Speed Limit 60 · Class ID 150 · Confidence 97% · Manually verified · AI response time 178 ms · Created 6/26/2026, 1:01 AM". Location "57.048800, 9.921700 · 6 m · 210° · 12.4 m/s". Device "Field Phone – Surveyor · mobile_phone · DEMO-1002 · Demo Admin". Linked sign "Maximum Speed Limit 60 · 57.05408, 9.89189 · 69% · 6 detections · Manually verified". Friendly names only.

CONSISTENCY RULES
Image + bbox is the hero; status as a badge; class ID secondary to the friendly name; destructive delete always separated and modal-confirmed with the consequence.

ELEMENTS TO AVOID
Four equal metadata cards competing with the image; the delete button loose among routine controls; raw JSON expanded by default; the class ID shown more prominently than the friendly name.

FINAL STITCH INSTRUCTION
Design a detection-detail page with a large captured-frame image + emerald bounding box as the hero on the left (plus a collapsible raw AI JSON), and a compact fact sheet on the right (friendly class name prominent, class ID secondary, confidence meter, status badge, location, device, linked sign), with an admin-only separated danger zone containing a consequence-confirmed "Delete frame" — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 010_detection_detail_mobile.md

```text
PAGE NAME: Detection Detail — Mobile
ROUTE: /detections/[id] (mobile)
USER ROLE: Field user (owner) + Administrator
SCREEN TYPE: Single-record detail, stacked, image-first
PRIMARY VIEWPORT: 390px mobile
SECONDARY VIEWPORTS: 375px, 430px

PAGE PURPOSE
Mobile inspection of one detection. Image + bounding box lead; facts stack below; the admin delete lives in a clearly separated danger zone at the bottom.

USER'S MAIN TASK
See the evidence and facts; admins may delete an erroneous frame.

VISUAL PRIORITY
The captured frame + bbox at the top, full width.

MOBILE INFORMATION ORDER (top → bottom)
1. Compact top bar: hamburger + "Traffic Sign Mapping"; a back chevron "Back".
2. CAPTURED FRAME (full width) with the emerald bbox overlay + "detection" label. States: "Loading image…", "No image captured", "Image failed to load (the signed URL may have expired)." + "Refresh image", plus "Open original image".
3. HEADER FACTS: friendly class name (large) + a Status BADGE; a Confidence meter; Class ID (mono, small, secondary).
4. FACT SECTIONS (stacked cards): Detection (Validation status, AI response time, Created), Location (Latitude, Longitude, GPS accuracy, Heading, Speed — mono), Device & user (Device, Device type, Identifier, User).
5. LINKED TRAFFIC SIGN (if grouped): Sign type, Coordinates, Confidence, Detections, Status badge, "View on sign map".
6. RAW AI RESPONSE: a collapsed "Show raw AI response JSON" disclosure.
7. ADMIN DANGER ZONE (ADMIN only, last): a bordered danger card with the Reject-vs-Delete note and a red "Delete frame" opening the consequence-confirmed modal/sheet.

TABLE-TO-CARD CONVERSION: fact groups are stacked cards, not a grid.
STICKY CONTROLS: top bar; optionally a sticky "Refresh image" appears only when the image is expired.
CAMERA ASPECT RATIO: the frame renders at its natural ratio inside a slate frame, full width.
SAFE-AREA PADDING: the danger zone + any sticky control respect the safe area.
SCROLL REGIONS: single vertical scroll.
ERROR-MESSAGE PLACEMENT: image-expired state inside the frame; not-found → "Detection not found" + Back; access → "You don't have access to this detection".
SESSION CONTROL PLACEMENT: n/a.
HOW MAP CONTENT REMAINS USABLE: n/a.

EXACT FIELDS AND LABELS: same labels as 010_detection_detail.md ("Class name", "Class ID", "Confidence", "Validation status", "AI response time", "Created", "Latitude", "Longitude", "GPS accuracy", "Heading", "Speed", "Device", "Device type", "Identifier", "User", "Sign type", "Coordinates", "Detections", "Status", "View on sign map", "Show raw AI response JSON", "Open original image", "No image captured", "Image failed to load (the signed URL may have expired).", "Refresh image", "Delete frame").
PRIMARY ACTIONS: none routine; "Refresh image" when expired.
SECONDARY ACTIONS: "Open original image", "View on sign map", toggle JSON.
DESTRUCTIVE ACTIONS: "Delete frame" (ADMIN only) in the bottom danger zone + consequence-confirmed modal.
FILTERS: none.
LOADING STATE: "Loading detection…" + image spinner + skeleton facts.
EMPTY STATE: n/a; not-found handled.
ERROR STATE: not-found / access / image-expired as above.
PERMISSION STATE: owner or admin view; only admin sees the danger zone.
CONFIRMATION STATE: delete-frame modal/sheet.
DESKTOP/TABLET BEHAVIOR: use 010_detection_detail.md.

REALISTIC EXAMPLE DATA
"Maximum Speed Limit 60 · Manually verified · 97% · Class ID 150"; Location "57.048800, 9.921700 · 6 m · 210° · 12.4 m/s"; Device "Field Phone – Surveyor · mobile_phone · Demo Admin"; linked sign "Maximum Speed Limit 60 · 69% · 6 detections". Friendly names only.

CONSISTENCY RULES
Image-first; status badge; friendly name over class ID; separated destructive with consequence text; mono numerics.

ELEMENTS TO AVOID
A scaled 3-column desktop grid; the delete button loose among facts; raw JSON expanded; class ID more prominent than the friendly name.

FINAL STITCH INSTRUCTION
Design the 390px mobile detection detail: full-width captured frame + emerald bbox on top, then friendly class name + status badge + confidence meter (class ID secondary), stacked fact cards (Detection, Location, Device & user), an optional linked-sign card, a collapsed raw-JSON disclosure, and a bottom admin-only danger zone with a consequence-confirmed "Delete frame" — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 011_sign_review.md

```text
PAGE NAME: Sign Review
ROUTE: /admin/review
USER ROLE: Administrator
SCREEN TYPE: Evidence review card list (grouped inventory records)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1024px, 768px, 390px

PAGE PURPOSE
Review the GROUPED traffic-sign inventory records (one per fused sign) and set their verification status: verify, reject, or mark duplicate. Unlike Detection Review (raw events), this operates on the map-facing inventory.

USER'S MAIN TASK
Judge each inventory record from its evidence and apply a verification decision.

VISUAL PRIORITY
Evidence-rich review cards with a clear status badge and an organised action group.

LAYOUT
App shell. Header, an optional status filter, then a list of review cards (one column, or two on wide screens).

PAGE HEADER
- Title "Review", description "Verify, reject, or flag traffic-sign inventory records."
- Optional right filter: a status chip (All / Pending / Auto verified / Manually verified / Rejected / Duplicate).

REVIEW CARDS (one per traffic-sign record)
- Left: a representative thumbnail (with bbox if available) or a small locator chip (mini map dot + coordinates).
- Middle: friendly sign type (prominent); a meta line "{N} detections · {avg}% avg · {lat}, {lng}".
- Right: the current Status BADGE, then an action group: primary "Verify" (→ Manually verified), "Reject", "Mark duplicate". Group them consistently; the busy state disables the row.
- Enrich each card with evidence so the reviewer can decide (the current app shows text only — add the representative thumbnail + location chip).

EXACT COMPONENTS: review cards (thumbnail/locator + sign type + meta + status badge + Verify/Reject/Duplicate), optional status filter.
EXACT FIELDS AND LABELS: "Review", "Verify, reject, or flag traffic-sign inventory records.", meta "{N} detections · {avg}% avg · {lat}, {lng}", actions "Verify", "Reject", "Duplicate", empty "No traffic signs to review yet.".
PRIMARY ACTIONS: "Verify".
SECONDARY ACTIONS: "Reject", "Duplicate"; status filter.
DESTRUCTIVE ACTIONS: none here (permanent sign deletion happens via frame deletion / storage tools, not on this page).
FILTERS: optional status filter.
TABLE OR CARD CONTENT: review cards.
MAP/DETAIL PANEL: an optional small locator per card; a "View on sign map" link.
LOADING STATE: skeleton cards.
EMPTY STATE: "No traffic signs to review yet.".
ERROR STATE: inline red banner + Retry; action failure → toast.
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: none required for verify/reject/duplicate (apply immediately with an undo toast).
MOBILE BEHAVIOR (390px): single-column cards; the action group becomes a compact primary "Verify" + a "⋯" menu (Reject, Mark duplicate); the thumbnail sits on top of the card; status badge visible; tap targets ≥44px.
TABLET BEHAVIOR (768px): one or two columns; actions inline.
DESKTOP BEHAVIOR: card list with evidence + inline action group.

REALISTIC EXAMPLE DATA
Cards: "Road Work · 6 detections · 69% avg · 57.05409, 9.89189 · Manually verified"; "No Entry · 3 detections · 88% avg · Pending"; "Speed Limit 30 · 2 detections · 74% avg · Low confidence". Friendly names only.

CONSISTENCY RULES
One status badge per card; the action group matches Detection Review's pattern (primary Verify + grouped secondary); evidence-rich cards.

ELEMENTS TO AVOID
Text-only cards with no evidence; three equal competing buttons with no primary; raw snake_case status.

FINAL STITCH INSTRUCTION
Design an evidence-rich Sign Review card list for grouped inventory records: each card shows a representative thumbnail/locator, the friendly sign type, a "{N} detections · {avg}% avg · {coords}" meta line, a Status badge, and an action group (primary Verify, then Reject and Mark duplicate) — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 012_admin_devices.md

```text
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
```


### ▸ 013_admin_users.md

```text
PAGE NAME: Admin Users
ROUTE: /admin/users
USER ROLE: Administrator
SCREEN TYPE: Paginated user table + create-user panel + credential dialog
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px, 390px

PAGE PURPOSE
View all profiles, edit a user's display name and role, create a Supabase Auth user, and reset a user's password (shown once). Role changes are sensitive and must be deliberate.

USER'S MAIN TASK
Find a user; adjust name/role; create a user or reset a password when needed.

VISUAL PRIORITY
A clean user table with a ROLE BADGE and a deliberate role-change control; a focused create-user panel.

LAYOUT
App shell. Header, a filter row with a "Create user" toggle, then a paginated table.

PAGE HEADER
- Title "Admin · Users", description "All profiles. Update display name and role. Auth-level user creation is out of scope." (Note: creation via the Admin API IS available through the create form — keep the description as-is unless the team updates it.)

FILTERS / ACTIONS (one row)
- Search input "Search email or name…".
- Role filter select ("All roles" / user / admin).
- Toggle button "Create user" (flips to "Cancel" when the form is open).

CREATE-USER PANEL (side panel or inline card "Create a Supabase Auth user")
- Fields: "Full name", "Email *", "Role *" (user / admin), checkbox "Auto-generate temporary password"; when unchecked, a password input "Min 8 characters". Submit "Create user" (busy "Creating…").

TABLE COLUMNS (in order)
Full name (inline-editable, placeholder "—") · Email · Role (a ROLE BADGE that opens a small "Change role" menu user/admin; disabled for the current user with tooltip "You cannot change your own role") · Created (date) · Actions ("Reset password", busy "Resetting…").

CREDENTIAL DIALOG (one-time, on create or reset)
- On create: title "User created" with rows Email, Full name, Role + the generated password shown once (with a copy affordance and a "shown only once" note).
- On reset: title "Password reset" with row Email + the new password shown once.

EXACT COMPONENTS: filters (search + role) + "Create user" toggle, create-user form, user table with role badge+menu, reset-password action, one-time credential dialog, pagination.
EXACT FIELDS AND LABELS: "Admin · Users", the description, "Search email or name…", "All roles", "Create user"/"Cancel", "Create a Supabase Auth user", "Full name", "Email *", "Role *", "Auto-generate temporary password", "Min 8 characters", "Create user"/"Creating…", columns Full name, Email, Role, Created, Actions, "Reset password"/"Resetting…", "You cannot change your own role", dialog titles "User created" / "Password reset", empty "No users match your filters.".
PRIMARY ACTIONS: "Create user"; inline edit name; change role (deliberate).
SECONDARY ACTIONS: "Reset password"; filters; pagination.
DESTRUCTIVE ACTIONS: none irreversible; "Reset password" is confirmed ("Reset password for {email}?" / self: "Reset YOUR OWN password? You will need the new password to log in next time.").
FILTERS: search + role.
TABLE OR CARD CONTENT: the profile rows.
LOADING STATE: "Loading users…" skeleton rows.
EMPTY STATE: "No users match your filters." + Clear filters.
ERROR STATE: inline red banner; per-action failure → toast.
PERMISSION STATE: admin-only; the current user's role control is disabled with the tooltip.
CONFIRMATION STATE: reset-password confirmations; the one-time credential dialog after create/reset.
MOBILE BEHAVIOR (390px): table → user cards (Full name + Role badge on line 1; Email + Created on line 2; a "⋯" menu with Reset password + Change role); create-user as a bottom sheet; the credential dialog is a centered modal with a copy button.
TABLET BEHAVIOR (768px): table fits or scrolls; create-user as a side panel.
DESKTOP BEHAVIOR: full table + role badge/menu + create-user panel.

REALISTIC EXAMPLE DATA
Rows: "Demo Admin · admin@example.com · admin · 6/18/2026"; "Field Surveyor · surveyor@aalborg.example · user · 6/20/2026". Create example: "New Field User · fielduser@aalborg.example · user". Never display real passwords in examples — show a masked placeholder "••••••••" for the one-time value.

CONSISTENCY RULES
Role as a badge with a deliberate change menu; self-role disabled with the tooltip; the one-time credential dialog clearly states it's shown once; no password is ever persisted or re-shown.

ELEMENTS TO AVOID
An inline role dropdown that's easy to trigger accidentally; showing passwords in plain lists; a self-role control that looks editable.

FINAL STITCH INSTRUCTION
Design an Admin Users page: filters (search + role) with a "Create user" toggle opening a create-user form (Full name, Email, Role, auto-generate-password checkbox), a user table with inline name edit and a Role BADGE that opens a deliberate "Change role" menu (self-role disabled), a "Reset password" action, and a one-time credential dialog with a copy button — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 014_ai_integration.md

```text
PAGE NAME: AI Integration
ROUTE: /admin/ai
USER ROLE: Administrator
SCREEN TYPE: AI operations console (health + self-test + activity/logs), tabbed
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px, 390px

PAGE PURPOSE
Give administrators one place to check AI connectivity, run a model-contract self-test, and observe AI request activity/logs. Surface a single, always-visible health signal.

USER'S MAIN TASK
Answer "is the AI reachable and healthy right now?", validate the contract with a test image, and investigate failures.

VISUAL PRIORITY
A persistent AI HEALTH indicator in the page header, then three clearly separated tools.

LAYOUT
App shell. Header with a health chip, then three panels (as underline TABS or three stacked sections): Connectivity · Self-test · Activity & logs.

PAGE HEADER
- Title "Admin · AI integration", description "Health, model-contract self-test, and AI activity observability."
- Right: a persistent AI health chip mapping the real statuses to one language: Healthy (healthy / mock-ready / reachable = green), Degraded (misconfigured = amber), Unavailable (unreachable = red).

TAB 1 — CONNECTIVITY (AdminAiHealthClient)
- Button "Run health check" (busy "Checking…"). Empty: "Run the check to probe the configured model server. In mock mode no external call is made.".
- Result card "AI integration status" with a status pill (mock-ready / healthy / reachable / unreachable / misconfigured) styled with the shared health colours; rows: Mode, External configured (yes/no), Model host (or —), Timeout ("{ms} ms"), Max retries, Retry backoff ("{ms} ms"), Checked at. (Do NOT invent triton_live/e2e/sign_mid/model_version fields — show only these real fields.)

TAB 2 — SELF-TEST (AdminAiSelfTestClient)
- Card "Model contract self-test", sub "Validates the configured AI server against the expected contract. Does not create any detection records.".
- An image file input (accept image/*) + button "Run with uploaded image" (busy "Running…"); OR a text input "…or existing detection event id" + "Run with existing frame".
- Success meta chips: "mode: … (mock)", "elapsed: … ms", "attempts: …", "model: …", "detections: …", "processing: … ms".
- Failure block "Self-test failed" + message + meta ("category:", "mode:", "attempts:", "elapsed: … ms").
- Result table columns: Class (friendly name) · ID (mono) · Confidence (% + meter) · Bbox (x,y,w,h) (mono).

TAB 3 — ACTIVITY & LOGS (AdminAiLogsClient)
- Window select (Last 1 hour / Last 24 hours / Last 7 days, default 24h) + "Refresh" + a "source: DB RPC" / "source: JS fallback" pill.
- Threshold banners: healthy/warning/no-data lines ("No production AI requests in this window — nothing to evaluate.", "Warning: …", "Healthy: …").
- Stat cards: Total requests, Succeeded, Failed (hint "{n} timeout · {n} invalid"), Mock used, Avg elapsed, Failure rate (hint "of external attempts").
- Time-series card "Request volume & failure rate" (sub "{n} buckets · failed portion shaded") — a small bar/area chart with a shaded failure band.
- Summary line: "Latest success:", "Latest failure:", "Failure breakdown:".
- Log filters: an Action select ("All actions" + AI_REQUEST_STARTED / _SUCCEEDED / _FAILED / _TIMEOUT / AI_RESPONSE_INVALID / AI_MOCK_USED / AI_HEALTH_CHECK_RUN / AI_SELF_TEST_STARTED / _SUCCEEDED / _FAILED) and a Category select ("All categories" + config / timeout / network / http / validation / unknown).
- Log table columns: Time · Action · Category · Status · Attempts · Elapsed · Message · Device. Loading "Loading logs…"; empty "No AI logs in this window.".

EXACT COMPONENTS: header health chip; Connectivity result card; Self-test upload + result table; Activity stat cards + time-series + filtered log table.
EXACT FIELDS AND LABELS: all strings above verbatim.
PRIMARY ACTIONS: "Run health check", "Run with uploaded image"/"Run with existing frame", "Refresh".
SECONDARY ACTIONS: window/action/category filters; tab switching.
DESTRUCTIVE ACTIONS: none (self-test creates no records).
FILTERS: window, action, category.
TABLE OR CARD CONTENT: self-test result table + AI log table + stat cards.
MAP/DETAIL: none.
LOADING STATE: "Checking…", "Running…", "Loading logs…", chart/skeletons.
EMPTY STATE: the health empty message, "No AI logs in this window.", the no-data threshold banner.
ERROR STATE: "Self-test failed" block; connectivity "unreachable/misconfigured" pill; log-load error banner.
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: none.
MOBILE BEHAVIOR (390px): the three tools become vertically stacked collapsible sections (or a top segmented control); stat cards 2-up; the log table becomes a card list (Time + Action + a health/status dot on line 1; Category + Elapsed + Attempts on line 2; Message truncated + Device); the health chip stays in the header.
TABLET BEHAVIOR (768px): tabs or stacked; stat cards 2–3 up; log table scrolls horizontally.
DESKTOP BEHAVIOR: three tabs/sections; a persistent header health chip; wide stat + log layout.

REALISTIC EXAMPLE DATA
Health: "Healthy" (mock-ready). Connectivity: "Mode: auto · External configured: yes · Model host: — · Timeout: 15000 ms · Max retries: 1 · Retry backoff: 500 ms · Checked at: 6/26/2026, 2:20 AM". Self-test result: "Maximum Speed Limit 60 · 150 · 97% · 12,10,50,50". Activity: Total 41, Succeeded 41, Failed 0, Mock used 41, Avg elapsed 178 ms, Failure rate 0%. Log row: "2:09 AM · AI_REQUEST_SUCCEEDED · — · ok · 1 · 178 ms · … · Dashcam – Van 7". Friendly names only.

CONSISTENCY RULES
One health colour language across the chip, connectivity pill, and log banners; self-test uses friendly class names; ms/IDs/bbox in mono. Only show the REAL connectivity fields.

ELEMENTS TO AVOID
Inventing triton_live/e2e/sign_mid/model_version indicators; three different health colour treatments; a decorative time-series with no failure band; a wide log table overflowing the page.

FINAL STITCH INSTRUCTION
Design an AI operations console with a persistent header health chip (Healthy/Degraded/Unavailable) and three tabs — Connectivity (Run health check → status pill + Mode/External configured/Model host/Timeout/Max retries/Retry backoff/Checked at), Self-test (image upload or existing frame → Class/ID/Confidence/Bbox result table), and Activity & logs (window filter, stat cards, a request-volume time-series with a shaded failure band, and a filtered Time/Action/Category/Status/Attempts/Elapsed/Message/Device log table) — using the exact palette and status language below, and only the real fields listed.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 015_analytics.md

```text
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
```


### ▸ 016_admin_storage.md

```text
PAGE NAME: Admin Storage
ROUTE: /admin/storage
USER ROLE: Administrator
SCREEN TYPE: Storage governance console (backfill + reconciliation + quarantine)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px

PAGE PURPOSE
Govern captured-frame storage safely: view image-path backfill status, run quarantine-first reconciliation, and delete truly-orphaned objects only after safeguards. Safe operations must be clearly separated from destructive ones.

USER'S MAIN TASK
Check backfill status, run a (safe) reconciliation scan, review quarantine candidates, and only then delete eligible orphans.

VISUAL PRIORITY
A clear two-zone structure: "Reconciliation (safe, recommended)" vs "Destructive cleanup", with destructive actions in bordered danger zones and modal confirmations.

LAYOUT
App shell. Header, then two sections: "Quarantine reconciliation (recommended)" and "Backfill & legacy tools". Dense tables inside each.

PAGE HEADER
- Title "Admin · Storage", description "Backfill status, quarantine-first reconciliation, and safe orphan cleanup."

SECTION A — QUARANTINE RECONCILIATION (recommended, safe-first)
- A config line (grace period, scan caps, delete batch, prefix) + an amber safe-note: "Reconciliation only records unreferenced objects as pending quarantine candidates. It never deletes anything." + primary "Run reconciliation scan" (busy "Scanning…"). Result notice: "Reconciliation complete: scanned …, found …, added …. Nothing was deleted.".
- "Recent runs" table: Run · Mode · Status · Started · Completed · Scanned · Found · Added · Limited. Empty "No reconciliation runs recorded yet.".
- "Quarantine candidates": search "Search path…" + status filter ("All statuses" + Pending / Ignored / Restored / Deleted, default Pending) + checkbox "Eligible only". Table columns: (checkbox) · Object path (mono) · Size · Detected · Age · Status (BADGE) · Reason · Eligible · Actions. Row actions (pending only): "Ignore", "Restore" (non-pending show —). A DESTRUCTIVE "Delete selected ({n})" (busy "Deleting…") in a bordered danger area with a modal confirm: "This permanently deletes Storage objects. Only eligible, still-unreferenced pending candidates will be deleted.". Notice "Deleted {n}, skipped {n}.". Loading "Loading…"; empty "No quarantine candidates.".

SECTION B — BACKFILL & LEGACY TOOLS
- Card "Image path backfill status": stats Events total · Events w/ path · Events legacy-only · Signs total · Signs w/ path · Signs legacy-only. Loading "Loading…".
- Card "Backfill actions": "Dry run" (busy "Running…") + a DESTRUCTIVE-ish "Apply backfill" (busy "Applying…") with a modal confirm "Apply backfill? This updates image_path columns for matching rows.". Result may append "(capped — run again or use migration 0003 for bulk)".
- Card "Orphaned storage scan": "Scan orphans" (busy "Scanning…") + DESTRUCTIVE "Delete selected ({n})" (busy "Deleting…") with a modal confirm "Delete N orphan object(s)? This is permanent. Each path is re-checked as unreferenced before deletion.". Amber conservative-cleanup note; may append "Scan was limited — not all folders were inspected.".
- Card "Storage security notes": a bullet list (bucket private; signed URLs; refreshable; CSV/logs never store signed URLs; cleanup only under sessions/).

EXACT COMPONENTS: two governance sections, safe-note banners, reconciliation scan + run-history table, quarantine candidates table with Ignore/Restore + danger delete, backfill status stats + dry-run/apply, orphan scan + delete, security notes, modal confirmations.
EXACT FIELDS AND LABELS: all strings above verbatim (section headings "Quarantine reconciliation (recommended)", "Backfill & legacy tools", card titles, button labels, table columns, safe-notes, confirm sentences, notices, empty states).
PRIMARY ACTIONS: "Run reconciliation scan" (safe), "Scan orphans", "Dry run".
SECONDARY ACTIONS: search/filter/eligible-only; "Ignore"/"Restore".
DESTRUCTIVE ACTIONS: "Delete selected" (quarantine + orphans) and "Apply backfill" — each in a bordered danger zone with a modal confirmation stating the consequence + reference-safety copy.
FILTERS: quarantine path search + status + eligible-only.
TABLE OR CARD CONTENT: reconciliation runs + quarantine candidates + backfill stats.
MAP/DETAIL: none.
LOADING STATE: "Scanning…", "Applying…", "Deleting…", "Loading…" per control/table.
EMPTY STATE: "No reconciliation runs recorded yet.", "No quarantine candidates.".
ERROR STATE: inline red banner per action; partial results surfaced (deleted/skipped/rejected counts).
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: modal confirmations for every destructive action, quoting the exact consequence sentences.
MOBILE BEHAVIOR: low priority; sections stack; tables scroll horizontally inside their cards; destructive delete stays modal-confirmed. (No separate mobile file required.)
TABLET BEHAVIOR: two sections stack; tables scroll.
DESKTOP BEHAVIOR: safe reconciliation section first, then backfill/legacy; destructive zones clearly bordered.

REALISTIC EXAMPLE DATA
Backfill stats: "Events total 120 · Events w/ path 118 · Events legacy-only 2 · Signs total 35 · Signs w/ path 34 · Signs legacy-only 1". Reconciliation notice: "scanned 60, found 3, added 2. Nothing was deleted." Quarantine row: "sessions/…/1690-ab12.jpg · 46 KB · 6/20/2026 · 5d · Pending · unreferenced · Eligible". Object paths shown as storage keys only — never signed URLs.

CONSISTENCY RULES
Safe vs destructive zones are visually distinct; every destructive action is modal-confirmed with reference-safety copy; quarantine status uses badges (Pending/Ignored/Restored/Deleted); paths in mono; NEVER show signed URLs or secrets.

ELEMENTS TO AVOID
Destructive delete sitting next to safe scan with the same styling; browser confirm()-style ambiguity (use modals); exposing signed URLs; giant empty cards.

FINAL STITCH INSTRUCTION
Design a storage governance console with a safe "Quarantine reconciliation (recommended)" section (scan + run-history table + candidates table with Ignore/Restore and a bordered danger "Delete selected" modal) and a "Backfill & legacy tools" section (backfill status stats, Dry run / Apply backfill, orphan scan + delete), where every destructive action lives in a bordered danger zone with a consequence-and-reference-safety modal — using the exact palette and status language below. Never display signed URLs.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.
```


### ▸ 017_demo_tools.md

```text
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
```

---

## 5. Execution order

How to generate the pages in Google Stitch so the whole product stays visually consistent. Generate ONE prompt at a time. Every prompt in `pages/` already contains the global consistency block, so each is independently pasteable — but generating in this order lets you carry a visual reference forward and reject drift early.

## Recommended order

| Step | Prompt file to paste | Validate visually | Use as reference for | Must stay consistent |
|------|----------------------|-------------------|----------------------|----------------------|
| 1 | `pages/000_landing_page.md` | Overall visual direction: infrastructure blue, navy accents, real map/dashboard previews, NO generic SaaS hero | Establishes brand colour, type, logo lockup for everything | Palette, logo, type scale |
| 2 | `pages/002_dashboard.md` | The authenticated APP SHELL (240px navy sidebar, sticky white header, active blue nav) + compact KPI tiles + semantic bars | The shell for every authenticated page | Sidebar, header, KPI tile size, status-bar colours |
| 3 | `pages/009_detection_review.md` | The DENSE TABLE + action pattern (primary Verify + "⋯" overflow + separated red Delete frame) + status badges + delete-frame modal | Every table page (logs, admin devices, users, analytics table) | Table density, row height, status badges, action pattern, destructive separation |
| 4 | `pages/004_sign_map.md` | The MAP language (blue pins, blue clusters, amber selected, density legend, filter toolbar, right detail panel) | Device Map + all map screens | Marker/cluster/selected colours, legend, filter toolbar |
| 5 | `pages/003_mobile_detection_session_375px.md` | The FIELD MOBILE pattern (camera hero, sticky bottom action bar, GPS/status chips) | All mobile variants (sticky bottom bar, safe area) | Mobile sticky actions, camera framing, status chips |
| 6 | `pages/010_detection_detail.md` | The DETAIL template (image+bbox hero, fact sheet, collapsible raw JSON, separated admin danger zone) | Sign detail panel, any record detail | Evidence-first hierarchy, badge, danger zone |
| 7 | `pages/014_ai_integration.md` | The OPS-CONSOLE pattern (persistent health chip, tabs, stat cards, time-series, filtered log table) | Analytics + any monitoring view | Health colour language, tabs, stat cards |
| 8 | `pages/015_analytics.md` | Charts tied to the semantic palette (blue/green/red/teal) + dense snapshot table + warning banner | Any future charts | Chart colours = meaning, warning banner |
| 9 | Remaining admin pages: `008_detection_logs`, `011_sign_review`, `012_admin_devices`, `013_admin_users`, `016_admin_storage`, `017_demo_tools`, `007_presentation` | Each reuses shell + table/badge/danger patterns from steps 2–3 | — | Reuse steps 2–3 patterns exactly |
| 10 | General pages: `001_login`, `006_devices` | Login split layout; Devices table + register panel + admin-only status | — | Brand panel navy = sidebar navy; admin-only gating |
| 11 | Shared states: loading skeletons, empty states, error banners, 403/permission, the delete-frame + credential + clear-demo modals | Verify these match across pages | — | One skeleton/empty/error/modal language |
| 12 | Mobile variants: `000_landing_page_mobile`, `004_sign_map_mobile_390px`, `005_device_map_mobile_390px`, `006_devices_mobile`, `009_detection_review_mobile`, `010_detection_detail_mobile` | Verify these are true mobile structures (bottom sheets, drawers, card lists), NOT scaled desktop | — | Bottom sheets, filter drawers, sticky bottom bar, card lists |

## After each generation — keep this consistent
- Sidebar: 240px navy, active item blue, brand lockup (never "MVP").
- Status: the exact 6 review badges + device/service states, Title-Case, dot+label.
- Tables: 40px rows, 13px cells, sticky header, one primary action + "⋯" overflow + separated destructive.
- Maps: blue pins / blue clusters / amber selected / density legend.
- Compact spacing; no oversized cards; no giant empty hero.

## Reject a Stitch output if any of these are true
- It looks like a generic SaaS / fintech / CRM / crypto / startup dashboard.
- Too much empty space; oversized cards; giant headings.
- The map is secondary when it should be primary (Sign Map, Device Map, landing).
- Important actions are hidden, or five equal-weight buttons compete in a table row.
- The destructive action (Delete frame, Delete orphans, Clear demo) is NOT separated or NOT modal-confirmed with a consequence sentence.
- Mobile layout is just a scaled desktop page (no bottom sheets/drawers/sticky bottom bar; tables not converted to cards).
- Colours are inconsistent with the palette; status meanings are unclear or raw `snake_case`.
- Table density is too low (airy rows) for an operations tool.
- Field-session controls are not outdoor-friendly (Start/Stop not thumb-reachable/sticky; tiny GPS text).
- Glassmorphism, neon, decorative gradients, stock 3D/illustrations, fake logos, or invented statistics appear.
- The brand still says "MVP dashboard".

If rejected: re-paste the SAME page prompt, add one line naming the specific violation (e.g., "The Delete frame button must be separated from Verify and open a confirmation modal"), and regenerate.
