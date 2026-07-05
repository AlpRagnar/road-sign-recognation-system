# 01 — Current UI/UX Audit

Per-page audit grounded in the source code and the stored screenshots in `public/final-screenshots/` (desktop + `mobile/`). Observations are concrete and actionable; they feed the redesign direction encoded in the Stitch prompts. No code is changed.

## Cross-cutting findings (apply to most pages)
- **Placeholder branding:** the sidebar shows "Traffic Sign Mapping" + subtitle **"MVP dashboard"** and the dashboard footer/screenshots read "MVP dashboard". Retire "MVP" — this is a serious road-asset platform.
- **Status treatment is inconsistent:** the Dashboard renders verification statuses as colored bars, but tables (Detection Review, Detection Logs, Sign detail, Analytics) render the same statuses as **plain lowercase text** (`pending`, `manually_verified`, `low_confidence`). There is no shared status-badge system.
- **Oversized cards / wasted space:** Dashboard KPI cards and the desktop Detection Session leave large empty regions; density is low for an operations tool.
- **Raw browser date inputs** (`dd.mm.yyyy`) appear on Sign Map and Analytics — visually inconsistent with the rest of the UI.
- **Maps are strong** (full-bleed Leaflet) but the relationship between a selected marker and its detail panel is weak, and device markers are all identical blue regardless of status.
- **Tables are dense but overflow horizontally** on smaller widths, and none convert to cards on mobile.

---

Page: Login
Route: `/login`
User role: Public
Current purpose: Email/password sign-in.
Current strengths: Clean centered card; error banner; validation retained; works on mobile.
Current weaknesses: No product framing or credibility cues; generic; title "Traffic Sign Mapping" + "Sign in to continue" only.
Information hierarchy problems: The single card floats on a plain grey field; nothing communicates the product's domain.
Responsive problems: None significant; already centered.
Visual consistency problems: Brand block differs from the app sidebar brand lockup.
Recommended design direction: Split layout — left brand/credibility panel (road-asset motif, muted map texture, security cues: private storage, role-based access), right compact sign-in card. Keep exact fields and the error banner.

Page: Dashboard
Route: `/dashboard`
User role: Field + Admin
Current purpose: Operational overview; entry to a session.
Current strengths: Clear KPI set; verification bars and top-sign-type bars are readable; "Start detection" is a clear primary CTA.
Current weaknesses: 8 KPI cards are oversized with big numbers and lots of padding; "Recent detections" rows are very airy; no map preview on a map-centric product; footer sentence is a weak place for the admin/source note.
Information hierarchy problems: All 8 KPIs carry equal visual weight; the two most operationally important (Active sessions, Active devices) don't stand out; the page reads as a stat wall, not an operations cockpit.
Responsive problems: 4-col KPI grid collapses acceptably, but the panels stack into a very long scroll on mobile.
Visual consistency problems: Verification bars are colored while the same statuses are plain text elsewhere.
Recommended design direction: Compact KPI strip (smaller tiles, mini deltas), a right-rail "Live operations" panel (active sessions/devices + a small inventory mini-map), denser recent-detections table with status badges, and move the metrics-source note into the page header as a subtle tag.

Page: Detection Session
Route: `/detection`
User role: Field (primary) + Admin
Current purpose: Capture camera frames + GPS and run detection.
Current strengths: Large camera preview; clear Device/Session/Location cards; real-time GPS fields; capture-interval control; "Recent results" area.
Current weaknesses: On **desktop** the page leaves ~40% of the viewport empty below the cards. On **mobile** (the real use case) the order is Camera → Device → Session → Location, so the primary **Start detection** button sits in the 3rd card mid-scroll and is not sticky, and "Recent results" is below everything — a field user must scroll to start and scroll again to see detections.
Information hierarchy problems: The primary action competes with secondary device metadata; live results are lowest priority visually despite being the point of a running session.
Responsive problems: Mobile is a stacked scroll, not a field-optimized layout; controls are not thumb-reachable; GPS "Timeout expired" / permission states aren't given prominence.
Visual consistency problems: Session timer is monospace; other numeric metadata is not — no shared numeric/mono rule.
Recommended design direction: Camera hero on top; a **sticky bottom action bar** with Start/Stop + interval + a compact GPS/lock indicator; live detection chips directly under the camera; device selector as a compact top control. See mobile prompt `003_mobile_detection_session_375px.md`.

Page: Sign Map
Route: `/map/signs`
User role: Field + Admin
Current purpose: Explore grouped sign inventory on a map.
Current strengths: Full-bleed map (correct priority); marker + cluster badges; view-mode segmented control (markers/clustered/density); "N signs" counter; slide-in Sign detail panel.
Current weaknesses: Filter bar uses raw date inputs and unlabeled controls; density mode has a meaningful color scale that has **no visible legend**; the selected marker and the detail panel lack a strong visual link (no highlight/anchor).
Information hierarchy problems: Filters and view modes compete on one row; the counter is easy to miss.
Responsive problems: On mobile the filter row crowds; the right detail panel is a fixed 320px overlay rather than a bottom sheet.
Visual consistency problems: Status values inside the detail panel are raw text, not badges.
Recommended design direction: Compact filter toolbar with labeled selects and a styled date-range control; a persistent density legend; highlight the selected marker and connect it to the detail panel; on mobile move filters to a drawer and the detail panel to a bottom sheet. See `004_sign_map_mobile_390px.md`.

Page: Device Map
Route: `/map/devices`
User role: Field + Admin
Current purpose: See last-known device locations (polling every 7s).
Current strengths: Full-bleed map; "Polling every 7s" + device count + "updated {time}"; informative popups (name, type, status, owner, last seen).
Current weaknesses: **All device markers are identical blue** — active/inactive/stale are indistinguishable at a glance; no legend; no status filter.
Information hierarchy problems: Operationally the map should read device health spatially, but status is only visible after clicking a popup.
Responsive problems: Popup content is fine; no mobile-specific affordances.
Visual consistency problems: Uses the same marker as the sign map, so the two maps look identical at a glance.
Recommended design direction: Color/shape-code markers by device status (active/inactive/stale-offline) using the existing `status` + `last_seen_at` fields; add a small legend and a status filter; distinct marker language from the sign map. See `005_device_map_mobile_390px.md`.

Page: Devices
Route: `/devices`
User role: Field + Admin
Current purpose: Register/edit the user's own field devices.
Current strengths: Clear table (Name, Type, Identifier, Status, Detections, Last seen, Created, Actions); inline Register/Edit form; status pill (green/grey).
Current weaknesses: The table overflows on narrow screens; the register/edit form is an inline block rather than a focused modal; status editing is admin-only but the affordance isn't visually explained to field users.
Information hierarchy problems: The primary task (register a device, then start a session) isn't guided.
Responsive problems: 8-column table doesn't convert to cards on mobile.
Visual consistency problems: Status pill exists here but not in other tables.
Recommended design direction: Convert to device cards on mobile; keep a dense table on desktop; move Register/Edit into a right side panel or modal; make "Deactivate/status" visibly admin-only. See `006_devices_mobile.md`.

Page: Presentation
Route: `/presentation`
User role: Field + Admin
Current purpose: Guided demo walkthrough; toggles presentation mode.
Current strengths: Ordered step cards (System Overview → … → Storage Governance) with blurbs and "Open →" links; a fixed "Presentation Mode" badge with Exit.
Current weaknesses: Step cards are generic; the guided sequence isn't visually emphasised as a numbered path.
Information hierarchy problems: Steps read as a flat list, not a walkthrough.
Responsive problems: Minor; cards stack.
Visual consistency problems: Badge styling is standalone.
Recommended design direction: Numbered, connected step rail; admin-only steps clearly tagged; keep the badge but align it to the system's status language.

Page: Detection Logs
Route: `/admin/logs`
User role: Admin
Current purpose: Read-only raw detection events (latest 200).
Current strengths: Dense read-only table (Class, Conf., User, Device, Lat, Lng, Acc., AI ms, Status, Time, Image).
Current weaknesses: Visually near-identical to Detection Review but has no actions — the distinction (read-only log vs actionable review) is unclear; status is plain text; wide table overflows.
Information hierarchy problems: No signal that this is an immutable audit log.
Responsive problems: 11-column table doesn't reflow.
Visual consistency problems: Same table styling as the actionable review table.
Recommended design direction: Label clearly as an audit log (read-only chip, muted actions), status badges, sticky header, horizontal scroll with a frozen Class column; cards on mobile.

Page: Detection Review
Route: `/admin/detections`
User role: Admin
Current purpose: Verify / reject / mark duplicate / reset / delete-frame per detection.
Current strengths: Rich filterable table (Search class name, All statuses); pagination; CSV exports; real row actions.
Current weaknesses: **The actions column overflows** — "View details" + Verify + Reject + Duplicate (+ Reset + Delete frame) are equal-weight and are literally cut off at the right edge in the screenshot; FRAME and IMG columns both render "—" (redundant when no image); statuses are plain text.
Information hierarchy problems: Five competing buttons per row create visual noise and hide the destructive Delete frame; the reviewer can't scan status quickly.
Responsive problems: The widest table in the app; no mobile card conversion.
Visual consistency problems: Status not badged; destructive action not separated.
Recommended design direction: Collapse row actions into a primary Verify + a "More" overflow menu (Reject, Duplicate, Reset) and a clearly separated destructive Delete frame; merge FRAME/IMG into one thumbnail column; status badges; sticky header + frozen Class column; card list on mobile with a bottom-sheet action menu. See `009_detection_review_mobile.md`.

Page: Detection detail
Route: `/detections/[id]`
User role: Field (owner) + Admin
Current purpose: Inspect one detection (frame, bbox, metadata, linked sign) + admin delete.
Current strengths: Image preview with bounding-box overlay; grouped metadata cards (Detection, Location, Device & user, Linked traffic sign); admin "Delete frame".
Current weaknesses: The bbox image is the natural hero but shares equal visual weight with four metadata cards; raw AI response is a collapsible block; the destructive delete sits in an admin card without strong separation.
Information hierarchy problems: The evidence (image + bbox + class + confidence) should dominate; metadata is reference.
Responsive problems: 3-column grid stacks into a long scroll; image should lead on mobile.
Visual consistency problems: Class shown via resolver (good) but status is plain text.
Recommended design direction: Two-column "evidence + facts" layout — large bbox image left, a compact fact sheet right (class badge, confidence meter, status badge, location, device), collapsible raw JSON, and a clearly separated destructive zone. See `010_detection_detail_mobile.md`.

Page: Sign Review
Route: `/admin/review`
User role: Admin
Current purpose: Verify / reject / mark duplicate grouped sign inventory records.
Current strengths: Card-per-record layout (sign type, detection count, avg confidence, coordinates); status pill; Verify/Reject/Duplicate buttons.
Current weaknesses: Cards are text-only (no image evidence or mini-map); status pill and three buttons aren't grouped into a consistent review pattern.
Information hierarchy problems: Reviewer lacks visual evidence to decide; every card looks the same.
Responsive problems: Works on mobile (already cards) but actions crowd on narrow widths.
Visual consistency problems: Its status pill differs from the (absent) table badges.
Recommended design direction: Evidence-rich review cards (representative thumbnail + mini location chip), a single status badge, primary Verify + grouped secondary/duplicate + destructive separated; consistent with Detection Review's action pattern.

Page: Admin Devices
Route: `/admin/devices`
User role: Admin
Current purpose: Manage all devices across users; inline edit name/type/status; filter/search/paginate.
Current strengths: Dense inline-editable table (Name, Type, Identifier, Owner, Status, Det., Last loc., Last seen, Created); status dropdown; filters.
Current weaknesses: Very wide; inline editing affordances are subtle; status changes are powerful (admin-only) but visually ordinary.
Information hierarchy problems: Owner and status are the operational columns but don't stand out.
Responsive problems: 9-column inline-edit table doesn't reflow.
Visual consistency problems: Status shown as a select, not a badge+control.
Recommended design direction: Keep a dense desktop table with clear inline-edit affordances and a status badge that opens a small menu; cards on mobile with an edit sheet; emphasise Owner + Status.

Page: Admin Users
Route: `/admin/users`
User role: Admin
Current purpose: View profiles; inline-edit display name + role; create user; reset password.
Current strengths: Search + role filter; inline name/role editing; Reset password with confirmation; one-time CredentialDialog.
Current weaknesses: Role change via inline dropdown is easy to trigger accidentally; self-role change is disabled but not visually explained; create-user form is an inline toggle.
Information hierarchy problems: The sensitive role control looks like an ordinary field.
Responsive problems: 5-column table is manageable but still a table on mobile.
Visual consistency problems: Role shown as raw select, not a role badge.
Recommended design direction: Role badge + explicit "Change role" menu with confirmation; create-user in a side panel; keep the one-time credential dialog with copy affordance.

Page: AI Integration
Route: `/admin/ai`
User role: Admin
Current purpose: AI health check, model-contract self-test, AI activity/logs observability.
Current strengths: Three real tools — Connectivity (Mode, External configured, Model host, Timeout, Max retries, Retry backoff, Checked at; status pill mock-ready/healthy/reachable/unreachable/misconfigured), Self-test (upload or existing frame → result table Class/ID/Confidence/Bbox), Activity & logs (window 1h/24h/7d, stat cards, time-series, action/category filters, log table).
Current weaknesses: Three stacked sections read as one long page; health status pill and log failure/health banners don't share one health color language; the time-series "failure portion shaded" chart is minimal.
Information hierarchy problems: The single most important signal (is the AI reachable/healthy right now?) isn't a persistent header indicator.
Responsive problems: Wide log table; stat cards ok.
Visual consistency problems: healthy/degraded/unavailable expressed differently across the three tools.
Recommended design direction: A persistent AI status header (healthy/degraded/unavailable), then tabs or clearly separated panels (Connectivity · Self-test · Activity & logs), one shared health color language, a proper mini time-series with a failure band.

Page: Analytics
Route: `/admin/analytics`
User role: Admin
Current purpose: Daily metric snapshots + trends.
Current strengths: Amber "Snapshot coverage warning" banner; date range + "Create / refresh today" + refresh-specific-date; 6 KPI tiles; four mini bar charts; dense snapshot table; pagination.
Current weaknesses: Charts lack axes, gridlines, and tooltips; chart colors (blue/green/red/purple) are decorative, not tied to the semantic status palette; KPI tiles are a bit airy.
Information hierarchy problems: The warning banner is well placed, but the four charts read as equal decorations rather than a trend story.
Responsive problems: Charts + wide table need horizontal scroll on mobile.
Visual consistency problems: Chart palette ≠ status palette; "AI failure rate %" red vs semantic destructive red.
Recommended design direction: Tie chart accents to the semantic palette, add lightweight axes/tooltips, compact KPI row, keep the warning banner pattern, dense snapshot table with sticky header.

Page: Admin Storage
Route: `/admin/storage`
User role: Admin
Current purpose: Backfill status/actions, quarantine-first reconciliation, safe orphan cleanup.
Current strengths: Backfill status stats; Dry run/Apply; Orphan scan + Delete selected; Quarantine reconciliation (run history table + candidates table with Ignore/Restore/Delete); explicit "nothing auto-deletes" notes.
Current weaknesses: Several destructive operations (Apply backfill, Delete orphans, Delete quarantine) currently rely on `confirm()`; the page is a long stack of governance cards; destructive vs safe actions aren't strongly separated by color/zone.
Information hierarchy problems: Safe (scan/dry-run) and destructive (delete) actions sit close together.
Responsive problems: Low mobile priority; wide tables.
Visual consistency problems: Amber "safe" notes vs destructive actions need one consistent risk language.
Recommended design direction: Two clear zones — "Reconciliation (safe, recommended)" and "Destructive cleanup" — destructive actions in bordered danger zones with modal confirmations and reference-safety copy; keep run-history and candidate tables dense.

Page: Demo Tools
Route: `/admin/demo`
User role: Admin
Current purpose: Seed/refresh/clear deterministic demo data; review counts; quick links.
Current strengths: Seed/Refresh + Clear (disabled in presentation mode); count tiles (Devices, Sessions, Detections, Signs, Observations, Location logs, System logs, Snapshots); Key pages links; presentation checklist.
Current weaknesses: The destructive "Clear demo data" sits near the safe seed action; count tiles are plain.
Information hierarchy problems: Destructive clear isn't zoned off.
Responsive problems: Low priority; stacks fine.
Visual consistency problems: Count tiles differ from KPI tiles elsewhere.
Recommended design direction: A "Demo data" control card (seed/refresh primary; clear in a small danger zone with confirmation), a compact counts grid reusing the KPI tile style, and a "Key pages" quick-link list.
