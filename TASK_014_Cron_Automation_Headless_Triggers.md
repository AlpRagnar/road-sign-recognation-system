# TASK 014 — Headless Cron Automation, Secret-Protected Triggers & Snapshot Gap Detection

## Context

You are working inside an existing, already-implemented Next.js 14 App Router + TypeScript + Tailwind + Supabase project for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The project is NOT empty. Do NOT rebuild the MVP.

Previous tasks already implemented:

- Supabase Auth and protected routes
- Detection sessions with camera/GPS
- AI API integration with mock/external/auto mode, timeout/retry and validation
- Map dashboard, sign inventory, live devices map
- Admin user/device management
- Detection review, CSV export, bounding-box image preview
- Private storage with signed URLs
- Storage backfill, signed URL refresh, quarantine-first cleanup
- DB-side AI analytics RPCs
- Daily metrics snapshots and `/admin/analytics`

TASK 013 added manual/admin-triggered daily metrics snapshots. TASK 012 added admin-triggered storage reconciliation with quarantine-first cleanup.

The next required step is to make these maintenance flows automation-ready via secure headless endpoints and clear cron documentation.

## Main Goal

Implement secure headless/cron automation for:

1. Daily metrics snapshot generation.
2. Storage reconciliation scan into quarantine candidates.
3. Snapshot gap detection in `/admin/analytics`.
4. Reconciliation run history visibility in `/admin/storage`.
5. Clear documentation for Vercel Cron and Supabase Scheduled Edge Function / external cron usage.

This task should make the system operationally maintainable without requiring an admin to manually click buttons every day.

## Critical Rules

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rebuild the project from scratch.
- Do NOT remove the existing admin UI/manual actions.
- Do NOT expose service-role keys to the client.
- Do NOT weaken existing admin security checks.
- Do NOT add automatic physical deletion of storage objects.
- Cron endpoints may create snapshots and run reconciliation scans, but must NOT delete quarantine candidates.
- Keep changes minimal, focused and production-safe.
- Run lint and build at the end.

## Required Environment Variables

Add and document these env vars:

```bash
CRON_SECRET=
CRON_DAILY_METRICS_ENABLED=true
CRON_STORAGE_RECONCILIATION_ENABLED=true
CRON_STORAGE_RECONCILIATION_MAX_FOLDERS=60
CRON_STORAGE_RECONCILIATION_MAX_FILES_PER_FOLDER=100
SNAPSHOT_GAP_WARNING_DAYS=2
```

Notes:

- `CRON_SECRET` is required for all headless cron endpoints.
- Use `Authorization: Bearer <CRON_SECRET>`.
- Do not accept the secret in query strings.
- If `CRON_SECRET` is missing, cron endpoints must return a safe server-side configuration error.
- Admin UI routes continue using normal admin session authentication.

## Part 1 — Shared Cron Auth Helper

Create a server-only helper, for example:

```text
src/lib/cron/auth.ts
```

It should:

- Read `CRON_SECRET` from env.
- Check the `Authorization` header.
- Require exact `Bearer <secret>` format.
- Return typed results such as `ok`, `missing_config`, `unauthorized`.
- Never log or return the secret.
- Be usable only from Route Handlers.

Expected behavior:

- Missing `CRON_SECRET` → 500 with category/config message.
- Missing/invalid header → 401.
- Valid header → allow execution.

## Part 2 — Headless Daily Snapshot Endpoint

Add a cron-safe endpoint:

```text
POST /api/cron/daily-metrics-snapshot
```

Expected behavior:

- Requires `Authorization: Bearer <CRON_SECRET>`.
- Does not require a user session.
- Checks `CRON_DAILY_METRICS_ENABLED`; if false, returns 200 with `{ skipped: true, reason: "disabled" }`.
- Creates or refreshes the daily metrics snapshot for the requested date.
- Supports optional JSON body:

```json
{
  "date": "2026-06-25"
}
```

- If no date is supplied, use the server current date.
- Reuse the existing snapshot RPC from TASK 013.
- Use the service-role client server-side only.
- Log a safe system log action, for example:
  - `CRON_DAILY_METRICS_SNAPSHOT_STARTED`
  - `CRON_DAILY_METRICS_SNAPSHOT_SUCCEEDED`
  - `CRON_DAILY_METRICS_SNAPSHOT_FAILED`

Response shape:

```json
{
  "ok": true,
  "skipped": false,
  "date": "2026-06-25",
  "snapshot": { },
  "elapsedMs": 123
}
```

On failure:

```json
{
  "ok": false,
  "category": "config|auth|rpc|unknown",
  "message": "Safe short message"
}
```

## Part 3 — Headless Storage Reconciliation Endpoint

Add a cron-safe endpoint:

```text
POST /api/cron/storage-reconciliation
```

Expected behavior:

- Requires `Authorization: Bearer <CRON_SECRET>`.
- Does not require a user session.
- Checks `CRON_STORAGE_RECONCILIATION_ENABLED`; if false, returns 200 with `{ skipped: true, reason: "disabled" }`.
- Runs the existing quarantine-first reconciliation scan from TASK 012.
- Must only create/update quarantine candidates and reconciliation run records.
- Must NOT delete objects.
- Must NOT ignore/restore candidates.
- Must use configured limits from env.
- Must log safe system log actions, for example:
  - `CRON_STORAGE_RECONCILIATION_STARTED`
  - `CRON_STORAGE_RECONCILIATION_SUCCEEDED`
  - `CRON_STORAGE_RECONCILIATION_FAILED`

Response shape:

```json
{
  "ok": true,
  "skipped": false,
  "runId": "uuid",
  "scannedObjects": 123,
  "newCandidates": 5,
  "existingCandidates": 2,
  "scanLimited": false,
  "elapsedMs": 456
}
```

## Part 4 — Optional Combined Cron Endpoint

Add a combined endpoint only if clean and low-risk:

```text
POST /api/cron/daily-maintenance
```

Expected behavior:

- Requires `Authorization: Bearer <CRON_SECRET>`.
- Runs daily metrics snapshot first.
- Then runs storage reconciliation.
- If one step fails, return a structured partial failure response.
- Do not delete anything.

This endpoint is useful for a single daily Vercel Cron job.

If this adds too much duplication or complexity, skip it and document why.

## Part 5 — Snapshot Gap Detection

Enhance `/admin/analytics` and/or its existing API to detect missing daily snapshots.

Expected behavior:

- For the selected date range, detect dates without a snapshot row.
- Show a warning panel when there are missing days.
- Use `SNAPSHOT_GAP_WARNING_DAYS` to determine warning severity.
- Show missing dates or at least the count and first/last missing date.
- Do not auto-create missing snapshots unless the admin clicks the existing create/refresh action.

Example UI message:

```text
Snapshot coverage warning: 3 days are missing in the selected range. Latest missing date: 2026-06-23.
```

The API should return something like:

```json
{
  "gapSummary": {
    "missingCount": 3,
    "missingDates": ["2026-06-21", "2026-06-22", "2026-06-23"],
    "warning": true,
    "thresholdDays": 2
  }
}
```

Keep missing date arrays reasonably capped if the range is large.

## Part 6 — Reconciliation Run History

Enhance `/admin/storage` to show reconciliation run history from TASK 012.

Expected behavior:

- Add a compact table or panel listing recent reconciliation runs.
- Include:
  - run id
  - status
  - started_at
  - completed_at
  - scanned object count
  - new candidate count
  - existing candidate count
  - scanLimited flag
- Add an admin API if needed:

```text
GET /api/admin/storage/reconciliation-runs?page=&pageSize=&status=
```

This API must be admin-only.

Do not expose signed URLs or secrets.

## Part 7 — Documentation

Update documentation:

- `.env.example`
- `README.md`
- `supabase/README.md`
- Add a new doc if useful:

```text
docs/CRON_AUTOMATION.md
```

The docs must explain:

1. What each cron endpoint does.
2. How to set `CRON_SECRET`.
3. Example curl commands.
4. Example Vercel Cron configuration.
5. Example external cron command.
6. That storage reconciliation does not delete objects.
7. That quarantine deletion remains admin-reviewed and grace-period protected.
8. How to verify that daily snapshots are being created.
9. How to inspect reconciliation run history.

Example curl:

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/cron/daily-maintenance" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"
```

## Part 8 — Security Requirements

Verify and preserve:

- Cron endpoints do not require browser session auth but require bearer secret.
- Admin endpoints still require admin session auth.
- No cron secret leaks to client components.
- No service-role client in client components.
- No storage deletion happens from cron endpoints.
- Logs contain only safe metadata.
- Secrets are never returned in API responses.
- Query-string secret authentication is not supported.

## Part 9 — Validation Commands

Run:

```bash
npm run lint
npm run build
```

If possible, run dev smoke tests:

```bash
npm run dev
```

Test expected unauthenticated/admin behavior:

- `POST /api/cron/daily-metrics-snapshot` without bearer → 401 or config error if secret missing.
- `POST /api/cron/storage-reconciliation` without bearer → 401 or config error if secret missing.
- `POST /api/cron/daily-maintenance` without bearer → 401 or config error if implemented.
- `/admin/analytics` unauthenticated → redirect to login.
- `/admin/storage` unauthenticated → redirect to login.

If `CRON_SECRET` is set locally, test one successful cron request with a safe local secret.

## Final Report Format

At the end, report:

1. What was implemented
2. Files changed
3. API routes added/modified
4. Environment variables added
5. Security checks
6. Commands run
7. Verification result
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
