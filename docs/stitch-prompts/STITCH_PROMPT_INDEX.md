# Stitch Prompt Index

Work page by page. Every `pages/*.md` file is self-contained (it embeds the global consistency block) and can be pasted into Google Stitch on its own. Priority: **P0** = defines a reusable pattern (generate first); **P1** = core operational page; **P2** = supporting/admin page.

| Order | Page | Route | Prompt file | Desktop prompt | Mobile prompt | Priority | Notes |
|-------|------|-------|-------------|----------------|---------------|----------|-------|
| 1 | Landing page | (public) | `pages/000_landing_page.md` | ✅ | `pages/000_landing_page_mobile.md` | P0 | Sets brand/visual direction; realistic UI previews |
| 2 | Login | `/login` | `pages/001_login.md` | ✅ | (in-file mobile section) | P1 | Split brand + form; no self-registration |
| 3 | Dashboard | `/dashboard` | `pages/002_dashboard.md` | ✅ | (in-file mobile section) | P0 | Establishes app shell + compact KPIs + semantic bars |
| 4 | Detection Session | `/detection` | `pages/003_detection_session.md` | ✅ | `pages/003_mobile_detection_session_375px.md` | P0 | Field-critical; mobile is the real use case |
| 5 | Sign Map | `/map/signs` | `pages/004_sign_map.md` | ✅ | `pages/004_sign_map_mobile_390px.md` | P0 | Establishes map language + detail panel |
| 6 | Device Map | `/map/devices` | `pages/005_device_map.md` | ✅ | `pages/005_device_map_mobile_390px.md` | P1 | Distinct device markers by status |
| 7 | Devices | `/devices` | `pages/006_devices.md` | ✅ | `pages/006_devices_mobile.md` | P1 | Own devices; status admin-only |
| 8 | Presentation | `/presentation` | `pages/007_presentation.md` | ✅ | (in-file mobile section) | P2 | Numbered guided steps + badge |
| 9 | Detection Logs | `/admin/logs` | `pages/008_detection_logs.md` | ✅ | (in-file card list) | P2 | Read-only audit table |
| 10 | Detection Review | `/admin/detections` | `pages/009_detection_review.md` | ✅ | `pages/009_detection_review_mobile.md` | P0 | Densest table; fixes actions overflow |
| 11 | Detection Detail | `/detections/[id]` | `pages/010_detection_detail.md` | ✅ | `pages/010_detection_detail_mobile.md` | P0 | Evidence-first detail template |
| 12 | Sign Review | `/admin/review` | `pages/011_sign_review.md` | ✅ | (in-file card list) | P1 | Evidence-rich review cards |
| 13 | Admin Devices | `/admin/devices` | `pages/012_admin_devices.md` | ✅ | (in-file card+sheet) | P2 | Fleet inline-edit table |
| 14 | Admin Users | `/admin/users` | `pages/013_admin_users.md` | ✅ | (in-file card+sheet) | P2 | Role badge + credential dialog |
| 15 | AI Integration | `/admin/ai` | `pages/014_ai_integration.md` | ✅ | (in-file stacked) | P1 | Ops console; health chip + tabs |
| 16 | Analytics | `/admin/analytics` | `pages/015_analytics.md` | ✅ | (in-file stacked) | P1 | Semantic charts + snapshot table |
| 17 | Admin Storage | `/admin/storage` | `pages/016_admin_storage.md` | ✅ | (in-file stacked) | P2 | Safe vs destructive governance zones |
| 18 | Demo Tools | `/admin/demo` | `pages/017_demo_tools.md` | ✅ | (in-file stacked) | P2 | Seed/counts + separated Clear |

## Totals
- **Existing user-facing routes:** 17 (+ the `/` redirect, not a page).
- **Unique pages (incl. new landing):** 18.
- **Total Stitch prompt files:** 25 (18 primary + 7 mobile-specific).
- **Mobile-specific prompt files:** 7 (`000_landing_page_mobile`, `003_mobile_detection_session_375px`, `004_sign_map_mobile_390px`, `005_device_map_mobile_390px`, `006_devices_mobile`, `009_detection_review_mobile`, `010_detection_detail_mobile`).
- Pages whose mobile behavior is handled inside the desktop prompt (no separate file needed): login, dashboard, presentation, detection logs, sign review, admin devices, admin users, AI integration, analytics, admin storage, demo tools.

## Supporting documents
- `00_PAGE_INVENTORY.md` — every page, role, purpose, components, issues.
- `01_CURRENT_UI_UX_AUDIT.md` — per-page concrete UI/UX audit.
- `02_MASTER_DESIGN_SYSTEM.md` — the full shared design system (tokens, components, responsive, accessibility).
- `03_GLOBAL_STITCH_CONSISTENCY_BLOCK.md` — the block embedded in every page prompt.
- `04_STITCH_EXECUTION_ORDER.md` — recommended generation order + rejection checklist.
- `STITCH_PROMPT_PACK.md` — everything consolidated into one document.

## How to use
1. Read `04_STITCH_EXECUTION_ORDER.md`.
2. Open the first prompt file, copy its ENTIRE contents, paste into Stitch, generate.
3. Validate against the rejection checklist; regenerate with a one-line correction if needed.
4. Move to the next file in order. Each file already carries the shared design language.
