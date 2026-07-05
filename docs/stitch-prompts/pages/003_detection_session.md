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
