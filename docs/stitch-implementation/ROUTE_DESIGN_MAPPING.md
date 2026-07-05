# Route ↔ Stitch Design Mapping

Design source (visual only): `design/stitch-export/`. Real behavior/data/auth/schema/API remain the source of truth. Stitch `code.html` files are references — never pasted into the app. Remote Google-hosted images in Stitch (`lh3.googleusercontent.com`) are ignored/localized.

## Stitch directories inspected (34)

**Implementable (`code.html` + `screen.png`) — 26:** `login_traffic_sign_mapping_refined_auth`, `operational_dashboard_refined`, `detection_session_refined_operations`, `detection_session_final_refinement` (mobile 706w), `traffic_sign_map_refined`, `sign_map_mobile_workspace_refined` (mobile), `device_map_refined_operations`, `device_map_refined_mobile_operations` (mobile), `devices_my_hardware_management_refined`, `devices_my_hardware_management_field_user_refined` (mobile/field), `presentation_guided_operational_walkthrough`, `admin_detection_logs_refined_audit`, `admin_detection_review_refined`, `admin_detection_review_final_workspace` (mobile 780w), `detection_detail_refined`, `detection_detail_refined_mobile_workspace` (mobile), `admin_sign_review_refined_operations`, `admin_devices_refined_operations`, `admin_users_refined_operations`, `admin_ai_integration_refined`, `admin_analytics_refined`, `admin_storage_refined_governance`, `admin_demo_tools_refined_operations`, `traffic_sign_mapping_public_landing_page`, `traffic_sign_mapping_mobile_landing_refined_v2` (mobile), `traffic_sign_mapping_logo`.

**Image-only marketing assets — 8:** `a_realistic_product_ui_screenshot_of_a_traffic_sign_inventory_map._showing_a`, `a_realistic_ui_showcase_pairing_a_sign_map_on_the_left_and_a_dashboard_on_the`, `technical_precision_engineering`, and 5 `a_clear/clean_professional_driver_view_road_scene_*` camera/road photos. Usable only as landing-page previews (localized into `public/ui-previews/`), never as live map/camera replacements.

**Reference JSON:** `auth_components_reference.json` (SignInCard + BrandPanel tokens).

## Per-route mapping

| Route | Existing source | Chosen desktop design | Chosen mobile design | Preserve (real behavior) | Visual changes | Stitch content to IGNORE | Shared components |
|-------|-----------------|-----------------------|----------------------|--------------------------|----------------|--------------------------|-------------------|
| `/` | `src/app/page.tsx` (redirect) | `traffic_sign_mapping_public_landing_page` | `traffic_sign_mapping_mobile_landing_refined_v2` | authenticated → `/dashboard`; unauth now sees a public landing (no new auth) | Public landing for unauth visitors, Sign In CTA | remote map/camera images → use localized `public/ui-previews/` | PublicHeader, landing sections |
| `/login` | `src/app/login/page.tsx` | `login_traffic_sign_mapping_refined_auth` + `auth_components_reference.json` | same (single card) | Supabase `signInWithPassword`, error banner, redirectedFrom, no registration | Split brand panel + "Sign in / Use your assigned account to continue" card; footer "© Traffic Sign Mapping" | invented forgot-password/social/legal | BrandPanel, form fields |
| `/dashboard` | `dashboard/page.tsx` | `operational_dashboard_refined` | responsive stack | real KPI queries, verification breakdown, top types, recent detections, admin note | navy shell, 8 compact KPI tiles, semantic dots, real inventory mini-map link (Leaflet, not the Stitch image) | hotlinked map `img` | KpiTile, StatusBadge, PageHeader, AppShell |
| `/detection` | `detection/page.tsx` + `DetectionClient` | `detection_session_refined_operations` | `detection_session_final_refinement` (375/706) | camera/GPS perms, device/session select, start/stop, interval, single-flight, live results, abort/stale | camera hero, control rail, sticky mobile controls | fake camera imagery | Session cards |
| `/map/signs` | `map/signs/page.tsx` + `TrafficSignMap` | `traffic_sign_map_refined` | `sign_map_mobile_workspace_refined` | real Leaflet map, filters, markers/clusters/density, detail panel | restyle toolbar + detail panel; keep live Leaflet | screenshot map | MapToolbar, MapDetailPanel, StatusBadge |
| `/map/devices` | `map/devices/page.tsx` + `LiveDevicesMap` | `device_map_refined_operations` | `device_map_refined_mobile_operations` | real Leaflet polling, popups | restyle toolbar/legend; keep live map | screenshot map | MapToolbar, StatusBadge |
| `/devices` | `devices/page.tsx` + `DeviceManager` | `devices_my_hardware_management_refined` | `devices_my_hardware_management_field_user_refined` | own devices, register/edit, admin-only status | table + status badges; cards on mobile | invented bulk ops | StatusBadge, Table, form fields |
| `/presentation` | `presentation/page.tsx` | `presentation_guided_operational_walkthrough` | responsive | real step links only, presentation badge | numbered step rail | fake external links | PageHeader |
| `/admin/logs` | `admin/logs/page.tsx` + `DetectionLogsTable` | `admin_detection_logs_refined_audit` | card list | read-only latest-200 events | read-only chip, status badges, sticky header | invented actions | Table, StatusBadge |
| `/admin/detections` | `admin/detections/page.tsx` + `AdminDetectionsClient` | `admin_detection_review_refined` | `admin_detection_review_final_workspace` | search/status filter, pagination, CSV, verify/reject/duplicate/reset, delete-frame | primary + overflow actions, separated destructive, status badges | merge/split/class-edit/bulk | Table, StatusBadge, OverflowMenu, ConfirmModal |
| `/detections/[id]` | `detections/[id]/page.tsx` + `DetectionDetailClient` | `detection_detail_refined` | `detection_detail_refined_mobile_workspace` | signed frame, bbox, class, device/user, raw AI, linked sign, admin delete | evidence-first layout, danger zone | invented edit/relocate | StatusBadge, ConfirmModal, DangerZone |
| `/admin/review` | `admin/review/page.tsx` + `ReviewClient` | `admin_sign_review_refined_operations` | responsive cards | verify/reject/duplicate on grouped signs | evidence cards + status badges | invented actions | StatusBadge, cards |
| `/admin/devices` | `admin/devices/page.tsx` + `AdminDevicesClient` | `admin_devices_refined_operations` | cards | all-devices inline edit, filters, pagination, admin status | dense table + status badges | invented roles | Table, StatusBadge |
| `/admin/users` | `admin/users/page.tsx` + `AdminUsersClient` | `admin_users_refined_operations` | cards | profiles, role edit, create user, reset password, credential dialog | table + role badges | invented MFA/security-score/sessions | Table, ConfirmModal |
| `/admin/ai` | `admin/ai/page.tsx` + 3 clients | `admin_ai_integration_refined` | responsive | real health fields, self-test, logs | health chip + sections | invented model/version fields | StatusBadge, Table |
| `/admin/analytics` | `admin/analytics/page.tsx` + `AdminAnalyticsClient` | `admin_analytics_refined` | responsive | snapshot data, refresh, warning banner | KPI row + charts + table | invented metrics | KpiTile, Table |
| `/admin/storage` | `admin/storage/page.tsx` + clients | `admin_storage_refined_governance` | responsive | real backfill/reconciliation/quarantine (as implemented) | safe vs danger zones | fictional quarantine beyond code | ConfirmModal, DangerZone, Table |
| `/admin/demo` | `admin/demo/page.tsx` + `AdminDemoClient` | `admin_demo_tools_refined_operations` | responsive | real seed/clear + counts | control card + counts + danger clear | fake counts | KpiTile, ConfirmModal |

## Duplicate / obsolete variants
- Detection Review: `admin_detection_review_refined` (desktop) is final for desktop; `admin_detection_review_final_workspace` (780w) is its mobile variant — not a separate route.
- Detection Session: `detection_session_refined_operations` (desktop) + `detection_session_final_refinement` (mobile) — same route.
- Devices: `devices_my_hardware_management_refined` (desktop/admin table) + `devices_my_hardware_management_field_user_refined` (mobile/field) — same `/devices` route, responsive + role variants.
- All `a_*` road-scene photos + `technical_precision_engineering` + the two `a_realistic_*` UI showcases = landing marketing imagery only.

## Global "ignore" list (do NOT implement from Stitch)
Remote `lh3.googleusercontent.com` images; `href="#"` links; any fake route names; invented roles/MFA/security scores/auth-session metrics/model versions; merge/split/class-correction/location-edit/live-feed/bulk actions; screenshot maps/cameras/charts in the authenticated app; "Demo Admin" hardcoded identity (bind to real profile).
