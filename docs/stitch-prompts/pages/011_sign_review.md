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
