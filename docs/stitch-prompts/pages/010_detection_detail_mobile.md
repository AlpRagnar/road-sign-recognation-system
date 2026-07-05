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
