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
