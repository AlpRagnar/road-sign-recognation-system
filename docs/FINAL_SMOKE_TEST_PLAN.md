# Final Smoke Test Plan

Manual end-to-end checklist to validate a build before a demo or delivery. Run on
`localhost` (or HTTPS) — camera/GPS and signed URLs require it. Seed demo data
first for steps that need populated pages.

| # | Test | Steps | Expected result | Common failure hints |
| --- | --- | --- | --- | --- |
| 1 | Fresh install/build | `npm install` → `npm run lint` → `npm run typecheck` → `npm run build` | All succeed; ~54 routes generated | Node version mismatch; missing deps |
| 2 | Supabase migration | Apply `0001`→`0006` in SQL editor | No errors; tables + RPCs exist | Wrong order; missing `pgcrypto` |
| 3 | First admin | Add Auth user → `update profiles set role='admin' where email=…` | Profile row exists with `role=admin` | Trigger not applied (migration 0001) |
| 4 | Demo seed | `/admin/demo` → **Seed demo data** | Counts appear (~4 devices, 6 sessions, ~120 events, 35 signs) | Bucket missing; service-role key wrong |
| 5 | Login / dashboard | Log in → `/dashboard` | KPI cards, breakdown, top types, recent detections render | RLS misconfig; empty data → seed first |
| 6 | Device registration | `/devices` → register a device | Device appears active; usable in detection | `device_identifier` unique conflict |
| 7 | Detection (mock) | `AI_MODEL_MODE=mock`; `/detection` → pick device → Start | Frames upload; results stream; events saved | Camera/GPS blocked → allow + use localhost |
| 8 | Sign map | `/map/signs` → toggle Markers/Clustered/Density; filter | Signs render; modes switch; filters apply | No signs → seed/run detection |
| 9 | Detection detail / bbox | Open a detection → detail page | Metadata, location, AI JSON, bbox overlay (demo rows: "No image captured") | Expired URL → **Refresh image** |
| 10 | Admin detections review | `/admin/detections` → set a status | Status updates; row reflects change | Non-admin → 403 |
| 11 | AI health / self-test | `/admin/ai` → Run health check; Run self-test | Health status shown; self-test returns normalized detections; **no** new production rows | External mode w/o URL → clear config error |
| 12 | Signed image refresh | On a real (non-demo) detection with image, wait past TTL → **Refresh image** | New signed URL loads image | Bucket public/missing; path not stored |
| 13 | Analytics snapshot | `/admin/analytics` → **Create / refresh today** | Snapshot row appears; KPIs + trend bars update; gap warning if days missing | Migration 0006 missing → falls back/empty |
| 14 | Storage reconciliation/quarantine | `/admin/storage` → **Run reconciliation scan** | Candidates recorded (no deletion); run appears in history | Migration 0005 missing |
| 15 | Cron endpoint auth | `curl -X POST .../api/cron/daily-maintenance` (no header) | 401 (or 500 if `CRON_SECRET` unset); valid bearer → runs/`skipped` | Secret mismatch; query-string secret rejected |
| 16 | CSV export | `/admin/detections` → export events/signs CSV | Downloads CSV; **no signed URLs**, `image_available` + path only | Non-admin → 403 |
| 17 | Presentation flow | `/presentation` (badge shows) → open each card | Each step page loads; presentation badge + Exit work | — |

## Quick unauthenticated API checks (expect 401)
```
POST /api/detection/frame
GET  /api/map/signs
POST /api/admin/demo/seed
GET  /api/admin/ai/logs
GET  /api/admin/storage/reconciliation-runs
POST /api/images/sign
```
Protected pages (e.g. `/dashboard`, `/admin/*`, `/presentation`) should **307**
redirect to `/login` when unauthenticated.

## Cron auth matrix
| Condition | Result |
| --- | --- |
| `CRON_SECRET` unset | 500 (config) |
| Missing/invalid bearer | 401 |
| Query-string secret | 401 (not accepted) |
| Valid bearer, job disabled | 200 `{ skipped: true }` |
| Valid bearer, job enabled | 200 with result |
