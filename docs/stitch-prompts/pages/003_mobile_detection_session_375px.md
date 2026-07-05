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
