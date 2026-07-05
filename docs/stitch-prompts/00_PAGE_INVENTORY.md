# 00 — Page Inventory

Source of truth: App Router `page.tsx` files in `src/app/**` (verified 2026-07-05), the navigation config in `src/components/AppSidebar.tsx`, and stored screenshots in `public/final-screenshots/`. API routes (`route.ts`) are **excluded**. The root route `/` (`src/app/page.tsx`) is a server redirect (`→ /dashboard` or `→ /login`) and is **not** a page.

## Navigation labels (exact, from `AppSidebar.tsx`)
Dashboard · Detection Session · Sign Map · Device Map · Devices · Presentation · **[admin]** Detection Logs · Detection Review · Sign Review · Admin Devices · Admin Users · AI Integration · Analytics · Admin Storage · Demo Tools. Sidebar brand block reads **"Traffic Sign Mapping"** with subtitle **"MVP dashboard"** (placeholder to retire — see QC).

## Inventory table

| Route | Page name | User role | Primary purpose | Main components | Main data | Mobile importance | Existing UI issues | Stitch prompt file |
|-------|-----------|-----------|-----------------|-----------------|-----------|-------------------|--------------------|--------------------|
| *(new)* | Landing page | Public | Explain the platform, workflow, security, roles; drive Sign In / demo | Marketing sections, UI previews, workflow diagram | — | High | Does not exist yet | `pages/000_landing_page.md` (+ `000_landing_page_mobile.md`) |
| `/login` | Login | Public | Authenticate email/password | Centered card, email/password, error banner | Supabase auth | Medium | Bare; no product framing; mobile ok | `pages/001_login.md` |
| `/dashboard` | Dashboard | Field + Admin | Operational overview + entry to a session | 8 KPI cards, Verification breakdown bars, Top sign types bars, Recent detections list, "Start detection" | Signs, detections, sessions, devices | High | Oversized KPI cards, wasted space, low density, no map preview, plain footer note | `pages/002_dashboard.md` |
| `/detection` | Detection Session | Field (primary) + Admin | Capture camera frames + GPS, run detection | CameraCapturePanel, DeviceSelectPanel, DetectionSessionControls, LocationStatusPanel, DetectionResultCard | Live frames, GPS, detections | **Critical** | Desktop wastes vertical space; on mobile Start is buried mid-scroll, results at bottom, controls not sticky | `pages/003_detection_session.md` (+ `003_mobile_detection_session_375px.md`) |
| `/map/signs` | Sign Map | Field + Admin | Explore grouped traffic-sign inventory on a map | TrafficSignMap (Leaflet), filter bar, view-mode segmented control, SignDetailPanel | traffic_signs, observations | High | Strong; date inputs raw; detail panel/marker relationship could be stronger; filters dense but plain | `pages/004_sign_map.md` (+ `004_sign_map_mobile_390px.md`) |
| `/map/devices` | Device Map | Field + Admin | See live/last-known device positions | LiveDevicesMap (Leaflet), device popups | devices, device_location_logs | High | Legend/status color key unclear; popup density | `pages/005_device_map.md` (+ `005_device_map_mobile_390px.md`) |
| `/devices` | Devices | Field + Admin | Register/edit the user's own field devices | DeviceManager (table + register/edit form) | devices (own) | High | Table overflows on mobile; status controls admin-only; edit form modal-less | `pages/006_devices.md` (+ `006_devices_mobile.md`) |
| `/presentation` | Presentation | Field + Admin | Guided demo walkthrough; toggles presentation mode | Step cards, PresentationBadge overlay | — | Medium | Cards generic; step order/labels need visual system | `pages/007_presentation.md` |
| `/admin/logs` | Detection Logs | Admin | Read-only raw detection events (latest 200) | DetectionLogsTable | detection_events | Medium | Dense table overflows on mobile; read-only vs review unclear | `pages/008_detection_logs.md` |
| `/admin/detections` | Detection Review | Admin | Verify / reject / duplicate / reset / delete-frame per detection | AdminDetectionsClient (table, filters, row actions, DeleteFrameDialog) | detection_events | High | **Actions column overflows** (5 competing buttons cut off); plain-text statuses (not badges); FRAME + IMG both "—" | `pages/009_detection_review.md` (+ `009_detection_review_mobile.md`) |
| `/detections/[id]` | Detection detail | Field (owner) + Admin | Inspect one detection: frame, bbox, metadata, linked sign, admin delete | DetectionDetailClient, DetectionImagePreview, DeleteFrameDialog | one detection_event + linked sign | High | Three-column detail on desktop; image + bbox is the hero but competes with metadata cards | `pages/010_detection_detail.md` (+ `010_detection_detail_mobile.md`) |
| `/admin/review` | Sign Review | Admin | Verify / reject / duplicate grouped sign inventory records | ReviewClient (record cards + actions) | traffic_signs | Medium | Card list ok on mobile; status badge + actions grouping needs system | `pages/011_sign_review.md` |
| `/admin/devices` | Admin Devices | Admin | Manage all devices across users; inline edit name/type/status | AdminDevicesClient (paginated table, inline edits, filters) | devices (all) | Medium | Dense inline-edit table overflows mobile; status semantics | `pages/012_admin_devices.md` |
| `/admin/users` | Admin Users | Admin | View profiles; edit display name + role; (create user) | AdminUsersClient, CredentialDialog | profiles | Low | Inline edit table; role change needs clear affordance | `pages/013_admin_users.md` |
| `/admin/ai` | AI Integration | Admin | AI health, model-contract self-test, AI activity observability | AdminAiHealthClient, AdminAiSelfTestClient, AdminAiLogsClient | health, self-test, ai logs | Medium | Three tools stacked; health indicators need clear healthy/degraded/unavailable states | `pages/014_ai_integration.md` |
| `/admin/analytics` | Analytics | Admin | Daily metric snapshots + trends | AdminAnalyticsClient (warning banner, KPIs, bar charts, dense table) | daily_metrics_snapshots | Medium | Charts lack axes/tooltips; chart colors ad hoc vs semantic; KPIs airy | `pages/015_analytics.md` |
| `/admin/storage` | Admin Storage | Admin | Backfill status, reconciliation scan, quarantine-first orphan cleanup | AdminStorageClient, AdminQuarantineClient | storage rows, quarantine candidates | Low | Multi-section governance page; destructive cleanup needs strong separation + confirmation | `pages/016_admin_storage.md` |
| `/admin/demo` | Demo Tools | Admin | Seed / clear deterministic demo data; review counts | AdminDemoClient | demo counts | Low | Destructive "clear" must be clearly separated; counts panel | `pages/017_demo_tools.md` |

## Page states covered inside the prompts (not separate routes)
- **Sign detail** = right-side `SignDetailPanel` state of Sign Map (→ bottom sheet on mobile).
- **Delete-frame confirmation** = `DeleteFrameDialog` state on Detection Review + Detection detail.
- **Credential dialog** = one-time password state on Admin Users.
- **Field permission/error states** = no-camera, no-GPS ("Timeout expired"), stopped/active session, "0 frames sent", "No detections yet this session" — covered in Detection Session prompts.
- **System states** (loading skeleton, empty, error banner, 403/permission, unavailable image, unavailable AI, offline device) — specified per page and centrally in the design system.

## Counts
- **Total public pages:** 2 (Landing *(new)*, Login).
- **Total field-user / general authenticated pages:** 6 (Dashboard, Detection Session, Sign Map, Device Map, Devices, Presentation).
- **Total admin pages:** 9 (Detection Logs, Detection Review, Sign Review, Admin Devices, Admin Users, AI Integration, Analytics, Admin Storage, Demo Tools).
- **Total detail (template) pages:** 1 (Detection detail `/detections/[id]`).
- **Total existing user-facing routes:** 17 (excludes the `/` redirect and all API routes).
- **Total unique pages (incl. new landing):** 18.
- **Total unique Stitch prompts required:** **25** — 18 primary/desktop prompts + 7 mobile-specific prompts (landing, detection session 375px, sign map 390px, device map 390px, detection review, detection detail, devices).
