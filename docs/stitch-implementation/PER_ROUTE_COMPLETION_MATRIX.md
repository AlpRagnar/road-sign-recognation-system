# Per-Route Stitch Layout Completion Matrix

Scope: full internal-layout parity for the 14 non-foundation routes (public landing / login / dashboard / Admin Detection Review were completed in TASK 030). Shared foundation (navy shell, page header, tokens, fonts, status badges) is applied everywhere. Screenshots in `docs/stitch-implementation/final-screenshots/`. Full E2E suite: **88 passed, 2 skipped, 0 failed** (real Supabase). `npm run validate` / `lint` / `typecheck` / production build: pass.

**TASK 032 update:** the five routes that were PARTIAL after TASK 031 — `/detection`, `/map/signs`, `/map/devices`, `/admin/ai`, `/admin/storage` — are now **COMPLETE on desktop and mobile**. New shared components: `ui/BottomSheet` (draggable 3-snap sheet), `ui/Tabs`, `AiConsole`.

## Route-count reconciliation (TASK 033)

The earlier "14 / 17 / 18" figures refer to three different counts. The authoritative number is **18 App Router pages** (`find src/app -name page.tsx` = 18), broken down as:

- **2 public:** `/`, `/login`
- **6 general authenticated:** `/dashboard`, `/detection`, `/map/signs`, `/map/devices`, `/devices`, `/presentation`
- **9 administrative:** `/admin/logs`, `/admin/detections`, `/admin/review`, `/admin/devices`, `/admin/users`, `/admin/ai`, `/admin/analytics`, `/admin/storage`, `/admin/demo`
- **1 dynamic detail:** `/detections/[id]`

Of these 18: **4 were delivered in TASK 030** (`/` landing, `/login`, `/dashboard`, `/admin/detections` Detection Review) and **14 were the TASK 031/032 internal-layout scope** (the 14 rows below). "17" was an intermediate count that omitted the dynamic `/detections/[id]` route. All 18 pages exist and render; all 14 redesign-scope routes are COMPLETE (desktop + mobile). API routes under `/api/*` are not user-facing pages and are excluded from this count.

Legend — parity: COMPLETE (page-specific Stitch layout implemented) · PARTIAL · BLOCKED. Functional: PASS/FAIL. Visual smoke: PASS/FAIL (no overflow / broken images / cut-off actions in the captured screenshots).

| Route | Desktop parity | Mobile parity | Functional | Visual smoke | Remaining differences |
|-------|----------------|---------------|-----------|--------------|-----------------------|
| `/detection` | COMPLETE | COMPLETE | PASS | PASS | Camera-first workspace; live results directly below the camera; single-flight/AbortController/stale-session logic untouched. Mobile (375 & 390): status strip (`Active/Stopped · timer`, `N frames sent`, GPS), **collapsible Session Details**, **sticky safe-area Start/Stop**. Desktop control rail preserved. |
| `/map/signs` | COMPLETE | COMPLETE | PASS | PASS | Real Leaflet; blue markers, **amber selected marker + halo**, density legend, right detail panel (inventory ID, avg confidence, supporting observations, representative location, first/last detected, latest observation, View Detection Detail, admin Open in Sign Review). Mobile: **draggable 3-snap detail bottom sheet** + **filter bottom sheet**; map zoom controls stay visible above the collapsed sheet. |
| `/map/devices` | COMPLETE | COMPLETE | PASS | PASS | Real Leaflet + polling; **reporting-status marker colours** (Reporting Recently / Stale / Offline) distinct from admin-controlled **Operational status**; reporting-status filter, legend, desktop detail panel, **mobile draggable detail sheet**. No invented cameras/CCTV/movement/live-video. |
| `/devices` | COMPLETE | COMPLETE | PASS | PASS | Dense desktop table + **mobile cards** + **right register/edit Drawer** + overflow actions + **sticky mobile Register** + status badges + field-user permission note. |
| `/presentation` | COMPLETE | COMPLETE | PASS | PASS | Numbered guided **step rail** with the exact 7 steps (Dashboard → Admin Storage), real route links, admin-only tags, connecting line. |
| `/admin/logs` | COMPLETE | COMPLETE | PASS | PASS | Read-only chip, **data-backed KPI summary**, dense sticky-header table (frozen Class column) on desktop, **event cards** on mobile, status badges, confidence meters. No review actions (correct). |
| `/admin/review` | COMPLETE | COMPLETE | PASS | PASS | Grouped inventory records with **representative image** (signed), observation count, avg confidence, exact status badge, **View on Sign Map**, primary Verify + overflow (Reject / Mark duplicate / Reset). |
| `/admin/devices` | COMPLETE | COMPLETE | PASS | PASS | Fleet table (owner, status badge + change control, det., last loc./seen, created), inline edit, filters, **mobile cards**, pagination. No "Register device" (no admin create-for-user API exists — not invented). |
| `/admin/users` | COMPLETE | COMPLETE | PASS | PASS | Role badges, inline name/role edit, **Create-user Drawer**, reset-password (confirm) + one-time credential dialog, **mobile cards**, self-role safeguard. No invented MFA/exports/security-score. |
| `/admin/ai` | COMPLETE | COMPLETE | PASS | PASS | **AI operations console**: persistent **health chip** (auto-run) + **tabs** Connectivity / Self-Test / Activity & Logs (horizontally scrollable on mobile). Integration configuration shows only real fields (mode / external configured / model host / timeout / max retries / retry backoff / checked-at / status + detail). Health check and self-test remain functional. No model versions / GPU / throughput / cluster IDs. |
| `/admin/analytics` | COMPLETE | COMPLETE | PASS | PASS | Coverage-warning banner, date range + create/refresh, **6 KPI tiles**, **4 trend charts with semantic colours** (detections blue, signs green, AI-failure red, devices teal) + baseline/labels, sticky dense snapshot table, pagination. |
| `/admin/storage` | COMPLETE | COMPLETE | PASS | PASS | Backfill status **KPI tiles**, Dry Run / Apply Backfill (**modal-confirmed**), orphan scan + candidate list, safe-note banner, security notes, and **separated danger zones** for orphan-delete and quarantine-delete — each **confirmation-gated (no backdrop dismiss, disabled during execution)**. Real `storage_quarantine_candidates` reconciliation/restore/ignore workflow preserved; no fictional quarantine stages. |
| `/admin/demo` | COMPLETE | COMPLETE | PASS | PASS | Seed/Refresh control card, **KPI count tiles**, Key Pages links, checklist, **separated danger-zone Clear** with a focus-trapped **confirmation modal**, presentation-mode disable preserved. |
| `/detections/[id]` | COMPLETE | COMPLETE | PASS | PASS | Evidence-first captured frame + bbox hero, hero fact header (friendly class + class ID + confidence meter + status badge), Detection/Location/Device fact cards (mono), linked inventory record + View on Sign Map, raw-JSON disclosure, **danger zone** with Delete frame (confirm dialog) + **Open in Detection Review**. |

## Summary
- **COMPLETE desktop + mobile — all 14 routes:** `/detection`, `/map/signs`, `/map/devices`, `/devices`, `/presentation`, `/admin/logs`, `/admin/review`, `/admin/devices`, `/admin/users`, `/admin/ai`, `/admin/analytics`, `/admin/storage`, `/admin/demo`, `/detections/[id]`.
- **0 routes remain PARTIAL or BLOCKED.**
- All 14 routes: **functional PASS**, **visual-smoke PASS**, no schema/RLS/API/production-data changes.

### TASK 032 screenshots (the five finished routes)
`detection-desktop.png`, `detection-mobile-375.png`, `detection-mobile-390.png`, `sign-map-desktop.png`, `sign-map-mobile.png`, `device-map-desktop.png`, `device-map-mobile.png`, `admin-ai-desktop.png`, `admin-ai-mobile.png`, `admin-storage-desktop.png`, `admin-storage-mobile.png`.
