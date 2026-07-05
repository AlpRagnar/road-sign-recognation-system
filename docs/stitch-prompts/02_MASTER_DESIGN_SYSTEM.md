# 02 — Master Design System

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
