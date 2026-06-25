# TASK 013 — Dashboard RPC Adoption, Daily Metrics Snapshots & Operational KPI Hardening

## Context

You are working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase project for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The project is already implemented through TASK 012:

- Supabase Auth and protected routes
- User/admin roles
- Device registration and admin device/user management
- Detection session with camera + GPS
- AI model API integration with mock/external/auto modes
- AI timeout/retry/contract validation
- Signed Storage URLs and private bucket flow
- Detection image detail + bounding-box overlay
- Static sign map, live device map, clustering/density view
- Admin review/logs/export
- Admin AI health/self-test/observability
- DB-side AI analytics RPCs from migration `0004_analytics_rpc.sql`
- Storage backfill/refresh/cleanup/quarantine tools through migration `0005_storage_quarantine.sql`

TASK 011 introduced `admin_detection_dashboard_summary()` but the main `/dashboard` page was intentionally not migrated to use it. TASK 013 should now adopt DB-side dashboard metrics and add a daily metrics snapshot foundation for long-range reporting.

## Critical Rules

- Do NOT create git commits.
- Do NOT run `git commit`.
- Do NOT run `git push`.
- Do NOT deploy.
- Do NOT rebuild the MVP from scratch.
- Continue from the current repo state.
- Preserve existing architecture and pages.
- Keep changes focused on dashboard analytics, daily snapshots, and operational KPI hardening.
- Do not introduce a chart library unless one already exists in the repo.
- Prefer Tailwind-based lightweight charts/components, consistent with previous tasks.
- Do not expose secrets, signed URLs, API keys, raw AI JSON, or service-role details to client components.
- Keep admin-only analytics protected server-side.
- At the end, run lint/build and provide a final report plus a suggested manual commit message.

## Main Goal

Upgrade the main dashboard and analytics foundation:

1. Move main `/dashboard` metrics to DB-side RPC where possible.
2. Add a durable `daily_metrics_snapshots` table for long-range trend reporting.
3. Add admin-only API routes to create/read daily snapshots.
4. Add a small admin dashboard analytics panel or section showing daily trend data.
5. Preserve safe fallback behavior if the latest migration is not applied.
6. Improve the documentation for operational analytics and snapshot usage.

## Scope

This task is about operational metrics and snapshot infrastructure, not detection/model changes.

Do not modify the AI detection flow unless required for typing or consistency.
Do not change storage quarantine logic unless required for dashboard metrics.
Do not add cron/external scheduler integration beyond documentation and an optional protected route if clearly scoped.

---

# Part A — Inspect Current Dashboard and Analytics

Inspect these files first:

- `src/app/(protected)/dashboard/page.tsx`
- `src/lib/ai/observability.ts`
- `src/app/api/admin/ai/logs/route.ts`
- `supabase/migrations/0004_analytics_rpc.sql`
- existing dashboard-related components
- `src/lib/env.ts`
- `src/lib/types/database.ts`
- README and Supabase docs

Identify:

- Which dashboard metrics are currently calculated in JS/server queries.
- Whether `admin_detection_dashboard_summary()` already returns enough values.
- Whether additional RPCs are needed for daily trend snapshots.
- What can be migrated with minimal risk.

Do not start implementation until you understand the existing metric shape.

---

# Part B — Database Migration: Daily Metrics Snapshots

Create a new migration:

```text
supabase/migrations/0006_daily_metrics_snapshots.sql
```

Add a new table, preferably:

```sql
public.daily_metrics_snapshots
```

Recommended columns:

- `snapshot_date date primary key`
- `total_traffic_signs bigint not null default 0`
- `verified_traffic_signs bigint not null default 0`
- `pending_traffic_signs bigint not null default 0`
- `rejected_traffic_signs bigint not null default 0`
- `duplicate_traffic_signs bigint not null default 0`
- `total_detection_events bigint not null default 0`
- `detections_last_24h bigint not null default 0`
- `low_confidence_events bigint not null default 0`
- `average_detection_confidence numeric`
- `average_ai_response_time_ms numeric`
- `active_devices_24h bigint not null default 0`
- `active_sessions bigint not null default 0`
- `ai_request_total bigint not null default 0`
- `ai_request_success bigint not null default 0`
- `ai_request_failed bigint not null default 0`
- `ai_failure_rate_percent numeric`
- `storage_quarantine_pending bigint not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

You may adjust names if the existing code style suggests a better convention.

Requirements:

- Migration must be idempotent where practical.
- Enable RLS.
- Do not add public/anon/client write policies.
- Server/service-role writes only.
- Add useful indexes if needed.
- Add an updated_at trigger if the project already uses that style; otherwise keep simple.

## Snapshot RPC

Add or replace a function, for example:

```sql
public.admin_create_daily_metrics_snapshot(target_date date default current_date)
```

The function should:

- Calculate the relevant values from existing tables.
- Upsert into `daily_metrics_snapshots`.
- Return the inserted/updated row.
- Be executable only by `service_role`.
- Avoid depending on `auth.uid()` because service-role calls often have no auth context.

Also add a read function if useful:

```sql
public.admin_daily_metrics_snapshots(from_date date, to_date date)
```

or use direct table reads from server-side admin route.

Important: Do not let authenticated users call these RPCs directly from the client.

---

# Part C — Dashboard Summary RPC Adoption

Update the main `/dashboard` server logic to prefer DB-side analytics.

Preferred behavior:

1. Try to call `admin_detection_dashboard_summary()` from the server using service-role or safe server helper.
2. If the RPC exists and succeeds, use it as the source of dashboard metrics.
3. If the RPC is missing or fails due to migration not applied, fall back to existing JS/server-query calculations.
4. Show or internally expose a source indicator such as `rpc` or `fallback`, but do not clutter the UI unless useful.

Do not break non-admin users. The normal dashboard should remain accessible to authenticated users.

If using service-role on dashboard metrics, ensure no user-private data is exposed beyond aggregate counts already intended for the dashboard.

---

# Part D — Admin Daily Metrics API

Add admin-only API routes:

## 1. Create/refresh snapshot

```text
POST /api/admin/metrics/daily-snapshot
```

Expected payload:

```json
{
  "date": "2026-06-25"
}
```

Rules:

- Admin-only.
- If date omitted, use current date.
- Validate date format.
- Call the snapshot RPC.
- Return the created/updated snapshot.
- Log safe metadata to `system_logs` using a free-text action, for example:
  - `ADMIN_DAILY_METRICS_SNAPSHOT_CREATED`

## 2. Read snapshots

```text
GET /api/admin/metrics/daily-snapshots?from=&to=&page=&pageSize=
```

Rules:

- Admin-only.
- Default range: last 30 days.
- Return paginated rows ordered by `snapshot_date desc`.
- Also return a trend array ordered ascending for chart usage if useful.
- Do not expose any secrets or raw logs.

Optional but useful:

```text
GET /api/admin/metrics/dashboard-summary
```

Only add it if it simplifies the UI cleanly.

---

# Part E — Admin UI: Daily Metrics Trend Panel

Add a small admin-facing UI section. Preferred location:

- `/admin/ai` only if it is strictly AI-related, or
- a new `/admin/analytics` page if broader operational metrics are included.

Recommended: create `/admin/analytics` because this includes signs, detections, devices, AI, and storage.

If creating `/admin/analytics`:

- Add sidebar nav entry: `Analytics`
- Server guard admin-only.
- Client component fetches daily snapshot rows.
- Include:
  - date range filters
  - “Create/Refresh Today Snapshot” button
  - optional “Refresh selected date” input
  - KPI cards using latest snapshot
  - lightweight trend bars or line-like div chart for:
    - total detection events
    - traffic signs
    - AI failure rate
    - active devices 24h
  - table of snapshot rows
  - loading/error/empty states

No chart library required. Use existing Tailwind style.

---

# Part F — Environment Variables

Add optional environment variables if useful:

```env
DASHBOARD_ANALYTICS_SOURCE=auto
DAILY_METRICS_DEFAULT_DAYS=30
```

Rules:

- `DASHBOARD_ANALYTICS_SOURCE=auto|rpc|fallback`
- default should be `auto`
- `DAILY_METRICS_DEFAULT_DAYS` should be clamped to a sane range such as 7–365

Only add these if they are actually used.

---

# Part G — Logging

Add safe system log actions in the TypeScript action union if the project tracks known actions:

- `ADMIN_DAILY_METRICS_SNAPSHOT_CREATED`
- `ADMIN_DAILY_METRICS_SNAPSHOT_FAILED`

Logging metadata may include:

- actor profile id
- target date
- source
- elapsed ms
- success/failure

Do not log raw SQL errors verbatim if they may include internals. Sanitize/truncate messages.

---

# Part H — Documentation

Update:

- `README.md`
- `supabase/README.md`
- optionally `docs/AI_MODEL_INTEGRATION.md` only if AI analytics are referenced

Document:

1. Migration `0006_daily_metrics_snapshots.sql`
2. What the daily snapshot table stores
3. How to manually create/refresh a snapshot from `/admin/analytics`
4. How a future scheduled job/cron could call the snapshot API
5. That the route is admin-session protected unless a future headless secret is added
6. That dashboard metrics prefer RPC and fall back safely if migration is missing

---

# Part I — Verification

Run:

```bash
npm run lint
npm run build
```

If possible, validate migration `0006` against local Postgres as previous tasks did.

Smoke-test unauthenticated access:

- `/admin/analytics` should redirect to login.
- `/api/admin/metrics/daily-snapshot` should return 401 unauthenticated.
- `/api/admin/metrics/daily-snapshots` should return 401 unauthenticated.

Run a client leak scan:

- No `service-role`, `SUPABASE_SERVICE_ROLE_KEY`, `auth.admin`, storage maintenance helpers, or server-only RPC helpers imported by client components.

---

# Acceptance Criteria

The task is complete only if:

- Migration `0006` exists and is safe/idempotent enough.
- Daily metrics snapshot table exists.
- Snapshot creation/upsert is server-only/admin-triggered.
- `/dashboard` prefers DB-side summary and has fallback.
- Admin can view daily metric snapshots.
- Admin can create/refresh a snapshot from UI.
- Lint passes.
- Build passes.
- New admin APIs are auth/role protected.
- No secrets or service-role helpers leak to client components.
- Docs are updated.

---

# Final Report Format

When finished, report:

1. What was implemented
2. Files changed
3. Database/migration changes
4. API routes added/modified
5. Dashboard changes
6. Security/access-control checks
7. Commands run
8. Verification result
9. Known limitations
10. Recommended next task
11. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
