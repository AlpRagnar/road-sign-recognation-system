# Supabase setup

## 1. Run the schema

Open the Supabase **SQL Editor** and run `migrations/0001_init.sql`.
(Or, with the Supabase CLI: `supabase db push`.)

This creates all 8 tables, the `handle_new_user` trigger (auto-creates a
`profiles` row on signup), RLS policies, and an `is_admin()` helper.

## 2. Create the Storage bucket

Dashboard → **Storage** → **New bucket**:

- Name: `traffic-sign-frames`
- Public: **OFF (private)** — recommended. The app now stores the storage
  object **path** and serves short-lived **signed URLs** generated server-side
  (default 5 min, `SIGNED_IMAGE_URL_TTL_SECONDS`). A private bucket still works
  end-to-end because the backend signs with the service-role key.
  (A public bucket also works for local dev; signing succeeds either way.)

Frames are stored under:

```
sessions/{sessionId}/{timestamp}-{randomId}.jpg
```

The backend reads/writes via the **service role key**, so no extra storage
policy is required for uploads or signing. Don't add a public read policy in
production — image access is mediated by the app's authenticated APIs.

## 2b. (If migrating an existing project) apply the secure-paths migration

Run `migrations/0002_secure_image_paths.sql`. It adds `detection_events.image_path`
and `traffic_signs.representative_image_path`. Existing rows that stored a public
URL keep working — the app extracts the object path from the old URL when signing.

## 2c. (Optional) backfill legacy image paths

Run `migrations/0003_backfill_image_paths.sql` to populate the new path columns
from legacy `*_image_url` values (idempotent; safe to run repeatedly; old URL
columns are kept). Alternatively, an admin can run a dry-run/apply backfill from
the in-app **`/admin/storage`** page. Truly external (non-Storage) URLs remain
unresolved.

## 2d. (Optional) analytics RPCs

Run `migrations/0004_analytics_rpc.sql` to add DB-side analytics functions
(`admin_ai_activity_summary`, `admin_ai_failure_breakdown`, `admin_ai_timeseries`,
`admin_detection_dashboard_summary`). They are `EXECUTE`-granted to `service_role`
only and power the `/admin/ai` observability dashboard. If not applied, the app
falls back to JS aggregation automatically (the dashboard shows a `JS fallback`
source badge).

## 2e. (Optional) storage quarantine

Run `migrations/0005_storage_quarantine.sql` to add `storage_quarantine_candidates`
and `storage_reconciliation_runs` (RLS on, no client policies — server/service-role
only). This powers quarantine-first cleanup: `/admin/storage` → **Run reconciliation
scan** records unreferenced `sessions/` objects as *pending* candidates without
deleting them. Candidates can be ignored/restored, or deleted only after the
`STORAGE_QUARANTINE_GRACE_DAYS` grace period (default 7), with a reference re-check
immediately before deletion. In production, call the reconcile endpoint from a
scheduled job (Supabase/Vercel/GitHub cron); deletion stays an explicit admin action.

## 2f. (Optional) daily metrics snapshots

Run `migrations/0006_daily_metrics_snapshots.sql` to add `daily_metrics_snapshots`
(RLS on, no client policies) plus `admin_create_daily_metrics_snapshot(target_date)`
(service-role upsert) and `admin_daily_metrics_snapshots(from, to)`. The
`/dashboard` summary cards prefer `admin_detection_dashboard_summary()` (migration
`0004`) and fall back to JS counts if not applied. Admins capture/inspect daily
snapshots at **`/admin/analytics`** (or via `POST /api/admin/metrics/daily-snapshot`).
A future cron can call that POST route on a schedule (currently admin-session
protected; add a headless bearer secret later if you wire up an external scheduler).

Headless cron endpoints now exist (`/api/cron/daily-metrics-snapshot`,
`/api/cron/storage-reconciliation`, `/api/cron/daily-maintenance`) protected by
`CRON_SECRET` — they reuse `admin_create_daily_metrics_snapshot()` and the
quarantine reconciliation scan, and **never delete** objects. See
`docs/CRON_AUTOMATION.md`.

## 3. Create a user and (optionally) promote to admin

Dashboard → **Authentication** → **Add user** (email + password, "Auto
Confirm" on). The trigger creates a matching `profiles` row.

To make that user an admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## 4. Environment variables

Copy `.env.example` → `.env.local` in the project root and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API (keep secret, server only)

Leave `AI_MODEL_API_URL` blank to use the built-in development mock detector.
