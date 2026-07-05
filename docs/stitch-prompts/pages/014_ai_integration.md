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
