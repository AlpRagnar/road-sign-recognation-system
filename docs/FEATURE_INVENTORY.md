# Feature Inventory

A quick reference of what the system does, plus the page and API inventory with
auth levels. Use this to explain or demo the project quickly.

---

## Feature groups

### Authentication & authorization
- Supabase email/password login; session via middleware + `(protected)` layout guard.
- Roles `user` / `admin`; `handle_new_user` trigger seeds `profiles`.
- Admin user provisioning + password reset; self-demotion guard.

### Device management
- User device registration/management (`/devices`); device must be selected to start detection.
- Admin device management across all users (search/paginate/edit/deactivate).

### Detection pipeline
- Camera + GPS sessions; periodic frame capture; start/stop with selected device.
- Frame upload → private storage → AI → validated detections → `detection_events`.
- Per-frame result cards; running session counters.

### AI integration
- Modes `mock | external | auto`; canonical request/response contract.
- Validation/normalization; timeout + retry on transient failures.
- Health check, model-contract self-test (no production writes), observability dashboard.

### Traffic sign localization
- Haversine same-type matching within a radius; confidence/accuracy-weighted centroid.
- Auto-verification (≥3 observations & >0.75 avg confidence); observations link events↔signs.

### Maps
- Static sign map: markers / clustered / density modes; type/status/confidence/date filters; detail panel.
- Live device map: last-known device locations (polling).

### Admin operations
- Detection review (per-event status), sign review, raw logs, CSV export.
- Users & devices management; AI integration console.

### Storage security
- Private bucket; object paths stored; short-lived signed URLs minted server-side.
- In-place signed-URL refresh; backfill (legacy URL→path); quarantine-first cleanup with run history.

### Analytics
- Dashboard KPIs via RPC (JS fallback); verification breakdown; top sign types.
- Daily metrics snapshots, trend bars, snapshot-coverage gap warnings.

### Cron / maintenance
- Secret-protected `/api/cron/*`: daily snapshot, storage reconciliation, combined maintenance.
- Reconciliation never deletes; deletion stays admin-reviewed + grace-gated.

### Demo / presentation
- Deterministic demo seed/status/clear (demo-marked, safely repeatable).
- Presentation mode (`?presentation=1`) + guided `/presentation` flow.

### Documentation
- `docs/`: AI integration, cron automation, demo runbook, final architecture,
  academic report outline, production readiness checklist, smoke test plan,
  this inventory. Plus `README.md` and `supabase/README.md`.

---

## Page inventory

| Page | Auth | Purpose |
| --- | --- | --- |
| `/login` | public | Supabase email/password sign-in. |
| `/dashboard` | authenticated | KPIs, verification breakdown, top types, recent detections. |
| `/devices` | authenticated | Register/manage own devices. |
| `/detection` | authenticated | Camera+GPS session; select device; run detection. |
| `/detections/[id]` | owner-or-admin | Detection detail: metadata, location, AI JSON, bbox overlay. |
| `/map/signs` | authenticated | Sign inventory map (markers/cluster/density). |
| `/map/devices` | authenticated | Live device map. |
| `/presentation` | authenticated | Guided demo landing (presentation mode). |
| `/admin/logs` | admin | Raw detection event logs. |
| `/admin/review` | admin | Traffic-sign review. |
| `/admin/detections` | admin | Per-detection review + status. |
| `/admin/devices` | admin | All devices management. |
| `/admin/users` | admin | Profiles, roles, create/reset users. |
| `/admin/ai` | admin | AI health, self-test, observability. |
| `/admin/storage` | admin | Backfill, reconciliation, quarantine, run history. |
| `/admin/analytics` | admin | Daily snapshots, trends, gap detection. |
| `/admin/demo` | admin | Demo seed/status/clear + checklist + links. |

## API inventory

Auth levels: **auth** = any logged-in user · **owner/admin** = owns the row or admin ·
**admin** = `role=admin` · **cron** = `Authorization: Bearer CRON_SECRET`.

| Route | Method | Auth | Purpose / data |
| --- | --- | --- | --- |
| `/api/detection/session/start` | POST | auth | Create session (auto-provisions device fallback). |
| `/api/detection/session/stop` | POST | owner/admin | Complete a session. |
| `/api/detection/frame` | POST | owner/admin | Upload frame → AI → events → grouping → logs. |
| `/api/detections/[id]` | GET | owner/admin | Detection detail + signed image + linked sign. |
| `/api/map/signs` | GET | auth | Traffic-sign inventory (filterable). |
| `/api/map/signs/[id]` | GET | auth | Sign detail + observation count + latest event (signed). |
| `/api/map/devices` | GET | auth | Devices with last-known location. |
| `/api/devices` | GET/POST | auth | List/create own devices. |
| `/api/devices/[id]` | PATCH/DELETE | owner | Edit / soft-deactivate own device. |
| `/api/images/sign` | POST | owner/admin · RLS | Re-sign image by entity id (never raw paths). |
| `/api/admin/detections` | GET | admin | Paginated/filterable raw events (signed thumbs). |
| `/api/admin/detections/[id]` | PATCH | admin | Set event validation status. |
| `/api/admin/detection-logs` | GET | admin | Legacy logs feed (signed images). |
| `/api/admin/system-logs` | GET | admin | System log feed. |
| `/api/admin/review-detection` | POST | admin | Update sign/event verification status. |
| `/api/admin/devices` , `/[id]` | GET/PATCH | admin | All-device list / update. |
| `/api/admin/users` , `/[id]` , `/[id]/reset-password` | GET/POST/PATCH | admin | Profiles, roles, Auth user create/reset. |
| `/api/admin/ai/health` | GET | admin | Connectivity probe. |
| `/api/admin/ai/self-test` | POST | admin | Model-contract self-test (no prod writes). |
| `/api/admin/ai/logs` | GET | admin | Summary/breakdown/time-series + recent logs. |
| `/api/admin/metrics/daily-snapshot` | POST | admin | Upsert a daily snapshot. |
| `/api/admin/metrics/daily-snapshots` | GET | admin | Paginated snapshots + trend + gap summary. |
| `/api/admin/storage/status` | GET | admin | Backfill status counts. |
| `/api/admin/storage/backfill` | POST | admin | Dry-run/apply legacy path backfill. |
| `/api/admin/storage/orphans` , `/orphans/delete` | GET/POST | admin | Orphan scan / conservative delete. |
| `/api/admin/storage/reconcile` | POST | admin | Quarantine-first reconciliation scan. |
| `/api/admin/storage/quarantine` , `/[id]` , `/delete` | GET/PATCH/POST | admin | List / ignore-restore / grace-gated delete. |
| `/api/admin/storage/reconciliation-runs` | GET | admin | Reconciliation run history. |
| `/api/admin/export/detection-events.csv` | GET | admin | CSV export (no signed URLs). |
| `/api/admin/export/traffic-signs.csv` | GET | admin | CSV export (no signed URLs). |
| `/api/admin/demo/seed` , `/status` , `/clear` | POST/GET/POST | admin | Demo data lifecycle (demo-marked only). |
| `/api/cron/daily-metrics-snapshot` | POST | cron | Headless daily snapshot. |
| `/api/cron/storage-reconciliation` | POST | cron | Headless reconciliation (no deletion). |
| `/api/cron/daily-maintenance` | POST | cron | Snapshot + reconciliation in one call. |

> Note: `/api/admin/detections/[id]` (admin review) and `/api/detections/[id]`
> (owner-or-admin detail) are distinct routes with different auth and purpose.
