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
