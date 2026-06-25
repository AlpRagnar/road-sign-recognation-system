# Cron Automation Guide

Headless, secret-protected endpoints let a scheduler run daily maintenance
without an admin clicking buttons. They live under `/api/cron/*`, authenticate
with a bearer secret (no user session), and use the service-role client
**server-side only**.

> Storage reconciliation from cron **only records quarantine candidates** — it
> never deletes Storage objects. Deletion stays an explicit, grace-period-gated,
> admin-reviewed action in `/admin/storage`.

## Authentication

All cron endpoints require:

```
Authorization: Bearer <CRON_SECRET>
```

- Set `CRON_SECRET` to a long random value. If unset, cron endpoints return
  **500** (`category: "config"`).
- A missing/invalid header returns **401** (`category: "auth"`).
- The secret is **only** accepted via the header — never via query string —
  and is never logged or returned.

## Endpoints

### `POST /api/cron/daily-metrics-snapshot`
Creates/refreshes the daily metrics snapshot (reuses the TASK 013 RPC).
- Body (optional): `{ "date": "YYYY-MM-DD" }` — defaults to the server date.
- If `CRON_DAILY_METRICS_ENABLED=false` → `200 { ok:true, skipped:true, reason:"disabled" }`.
- Success → `{ ok:true, skipped:false, date, snapshot, elapsedMs }`.

### `POST /api/cron/storage-reconciliation`
Runs the quarantine-first reconciliation scan (reuses TASK 012 `runReconciliation`).
- If `CRON_STORAGE_RECONCILIATION_ENABLED=false` → `200 { ok:true, skipped:true, reason:"disabled" }`.
- Uses `CRON_STORAGE_RECONCILIATION_MAX_FOLDERS` / `..._MAX_FILES_PER_FOLDER`.
- Success → `{ ok:true, skipped:false, runId, scannedObjects, newCandidates, existingCandidates, scanLimited, elapsedMs }`.
- **Never deletes / ignores / restores** candidates.

### `POST /api/cron/daily-maintenance` (recommended single daily job)
Runs the snapshot, then the reconciliation, honoring each job's enabled flag.
Returns a structured per-step result; `ok:false` if any attempted step failed:

```json
{ "ok": true, "steps": { "snapshot": { "status": "ok" }, "reconciliation": { "status": "ok" } } }
```

## Example curl

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/cron/daily-maintenance" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"
```

## Vercel Cron

`vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/daily-maintenance", "schedule": "0 3 * * *" }
  ]
}
```

Vercel Cron sends its own `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET`
is configured in the project env, so the same secret check applies.

## Supabase Scheduled Edge Function / external cron

Any scheduler (Supabase `pg_cron` + `net.http_post`, GitHub Actions, a server
crontab) can call the endpoint with the bearer header:

```bash
# crontab: every day at 03:00
0 3 * * * curl -fsS -X POST "https://your-app/api/cron/daily-maintenance" \
  -H "Authorization: Bearer $CRON_SECRET" >/dev/null 2>&1
```

## Verifying daily snapshots

- Open `/admin/analytics` — the latest snapshot KPIs and trend bars update, and a
  **snapshot coverage** warning appears if `>= SNAPSHOT_GAP_WARNING_DAYS` days are
  missing in the selected range.
- Or `GET /api/admin/metrics/daily-snapshots` (admin) and check `gapSummary`.

## Inspecting reconciliation runs

- `/admin/storage` → **Quarantine reconciliation** → **Recent runs** lists run id,
  mode (`manual`/`scheduled`), status, started/completed, scanned/found/added,
  and the scan-limited flag.
- Or `GET /api/admin/storage/reconciliation-runs?page=&pageSize=&status=` (admin).

## Security summary

- Cron endpoints: bearer secret only, no browser session; service-role used
  server-side; no storage deletion; logs carry safe metadata only (counts/ids).
- Admin endpoints keep their session + `role='admin'` checks unchanged.
- The cron secret and service-role key are never exposed to client components.
