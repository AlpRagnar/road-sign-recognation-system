# Final System Architecture

**Project:** AI-Based Traffic Sign Detection, Localization and Map Dashboard System
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth / Postgres / Storage) · Leaflet + OpenStreetMap

---

## 1. Project objective

The system turns raw, per-frame AI traffic-sign detections into a **structured,
location-aware, reviewable, map-ready traffic-sign inventory**. Field users
capture camera frames with GPS; an external (or mock) AI model returns sign
detections; the backend persists every detection, groups duplicates into
optimized sign records, and exposes maps, analytics, review, and operational
tooling to administrators.

The AI model itself is treated as an **external service** — the project's value
is the data pipeline, localization, governance, and visualization around it.

## 2. System overview

```
 Field user (browser)                Next.js server (Route Handlers)        Supabase
 ────────────────────                ──────────────────────────────        ────────
 Camera + GPS  ──frame+meta──▶  /api/detection/frame                 
                                  1. upload frame ─────────────────▶  Storage (private bucket)
                                  2. sign short-lived URL
                                  3. call AI (mock|external|auto)  ◀─▶  External AI model API
                                  4. validate + normalize response
                                  5. insert detection_events ──────▶  Postgres
                                  6. group → traffic_signs ────────▶  Postgres
                                  7. write system_logs ────────────▶  Postgres
 Dashboard / maps / admin  ◀──── server components + APIs  ◀────────  Postgres (RLS) + RPCs
```

Two trust tiers on the server:
- **RLS client** (anon key, bound to the user's session) — for user-scoped reads.
- **Service-role client** (server-only) — for trusted writes and admin/analytics
  RPCs, always after an explicit auth/role check in the Route Handler.

## 3. Main actors

| Actor | Capabilities |
| --- | --- |
| **Field user** (`role = user`) | Log in, register/manage own devices, run detection sessions, view maps, view own detections. |
| **Admin** (`role = admin`) | Everything a user can do, plus: manage all users/devices, review detections/signs, AI health/self-test/observability, analytics & snapshots, storage governance, demo tools. |
| **External AI model service** | Receives a signed image URL + metadata, returns detections (class, confidence, bbox, timing). Owns no app data. |
| **Scheduler / cron** | Calls secret-protected `/api/cron/*` endpoints for daily snapshots and storage reconciliation. |

## 4. End-to-end data flow (detection)

1. User selects a registered **active device** and starts a session (`/detection`).
2. Browser captures a frame (downscaled JPEG) + current GPS, posts to
   `POST /api/detection/frame`.
3. Server uploads the frame to the **private** Storage bucket and stores only the
   **object path** (`detection_events.image_path`).
4. Server mints a **short-lived signed URL** and sends it (with metadata) to the
   AI layer, honoring `AI_MODEL_MODE` (`mock | external | auto`) with
   timeout + retry.
5. The response is **validated and normalized** (detections array; confidence
   0–1; non-empty class name; sane bbox).
6. Each detection is saved as a `detection_events` row (raw AI JSON kept in
   `ai_response_raw`), plus `device_location_logs`, with session counters updated.
7. **Grouping/localization** matches each detection to an existing nearby sign of
   the same type (Haversine) or creates a new `traffic_signs` record, updating a
   confidence/accuracy-weighted centroid and auto-verifying when warranted.
8. Safe `system_logs` entries are written throughout (no secrets/URLs).

## 5. Frontend architecture

- **App Router** with a `(protected)` route group whose server `layout.tsx`
  re-checks the session (defence-in-depth behind middleware) and renders the
  role-aware `AppSidebar`.
- **Server Components** fetch data directly (RLS client / server helpers);
  **Client Components** (`"use client"`) handle interactivity (camera, maps,
  tables, forms) and call Route Handlers via `fetch` — they never import
  server-only/service-role helpers.
- **Leaflet** maps are loaded via `next/dynamic` (`ssr: false`); clustering and
  density are computed in-app (no map-cluster dependency).
- **Presentation mode** (`?presentation=1`) adds a global badge and a guided
  `/presentation` flow without bypassing auth.

## 6. Backend / Supabase architecture

- **Auth:** Supabase email/password; a `handle_new_user` trigger creates a
  `profiles` row; `role ∈ {user, admin}`.
- **Postgres tables:** `profiles`, `devices`, `detection_sessions`,
  `detection_events`, `traffic_signs`, `traffic_sign_observations`,
  `device_location_logs`, `system_logs`, `storage_quarantine_candidates`,
  `storage_reconciliation_runs`, `daily_metrics_snapshots`.
- **RLS:** enabled on all tables. User-scoped read policies; maintenance/analytics
  tables have no client policies (service-role only). Trusted writes use the
  service-role client inside Route Handlers after role checks.
- **RPCs (service-role-only EXECUTE):** `admin_ai_activity_summary`,
  `admin_ai_failure_breakdown`, `admin_ai_timeseries`,
  `admin_detection_dashboard_summary`, `admin_create_daily_metrics_snapshot`,
  `admin_daily_metrics_snapshots`.
- **Route Handlers** under `src/app/api/**` implement the API surface; shared
  helpers live in `src/lib/**`.

## 7. AI model integration architecture

- Centralized in `src/lib/ai/` (`contract.ts`, `client.ts`, `observability.ts`).
- **Modes:** `mock` (built-in detector, no network), `external` (always call the
  configured URL; clear error if unset), `auto` (call if URL set, else mock — and
  never silently mock after a failed external call).
- **Resilience:** `AbortController` timeout, retries only on transient failures
  (timeout, network, HTTP 429/502/503/504), linear backoff.
- **Contract:** canonical request (`image_url`, `image_id`, ids, timestamp,
  location, metadata; no secrets) and a normalized response. Invalid responses
  never crash the frame pipeline. See `docs/AI_MODEL_INTEGRATION.md`.

## 8. Localization and duplicate grouping algorithm

For each saved detection above a minimum confidence:
1. Find existing `traffic_signs` of the **same sign type**.
2. Compute **Haversine** distance; if within `SIGN_MATCH_RADIUS_METERS`
   (default 25 m), attach as a `traffic_sign_observations` row; else create a new
   sign.
3. Recompute the sign location as a **weighted average** of observations with
   `weight = confidence / max(gps_accuracy, 1)`.
4. **Auto-verify** when a sign has ≥ 3 observations and average confidence > 0.75
   (never overriding a manual decision).

## 9. Storage security and signed URL design

- The bucket is **private** in production. The DB stores the **object path**, not
  a public URL.
- Every API returning an image mints a **short-lived signed URL**
  (`SIGNED_IMAGE_URL_TTL_SECONDS`, default 5 min) **after** authorization
  (owner-or-admin for events; RLS-readable for shared signs).
- `POST /api/images/sign` re-signs by **entity id** (never a client-supplied
  path) so expired images can refresh in-place.
- CSV exports emit `image_available` + object path, never signed URLs.
- **Governance:** backfill (legacy URL → path), quarantine-first reconciliation
  (unreferenced objects become pending candidates; deletion is grace-period-gated,
  re-checked, admin-only — never automatic), and run history.

## 10. Admin observability and analytics

- **AI observability** (`/admin/ai`): health check, model-contract self-test
  (creates no production data), activity summary, failure breakdown, time-series,
  failure-rate threshold alert — DB-side RPCs with JS fallback (`source` badge).
- **Operational analytics** (`/admin/analytics`): durable `daily_metrics_snapshots`
  with trend bars, KPI cards, and snapshot-coverage gap detection.
- **Dashboard** (`/dashboard`): KPI cards from `admin_detection_dashboard_summary`
  RPC with JS fallback.

## 11. Demo / presentation mode

- **Demo Tools** (`/admin/demo`): deterministic, demo-marked seed/status/clear.
  Clear removes only demo-marked rows. See `docs/DEMO_RUNBOOK.md`.
- **Presentation mode** (`?presentation=1`): global badge, guided `/presentation`
  cards, destructive demo actions hidden. No auth bypass.

## 12. Security model

- Middleware gates protected routes; the `(protected)` layout re-checks the
  session; admin pages re-check `role = 'admin'` server-side and redirect.
- Admin APIs return **401** (unauthenticated) / **403** (non-admin). Cron APIs
  require `Authorization: Bearer <CRON_SECRET>` (header only) → **500** if the
  secret is unset, **401** if missing/invalid.
- The **service-role key**, **AI API key**, and **CRON_SECRET** are server-only
  and never imported into client components or returned in responses/logs.
- RLS protects user-scoped reads; signed URLs are time-limited; logs carry safe
  metadata only.

## 13. Scalability considerations

- Sign matching is a same-type scan (fine for MVP; a spatial index / PostGIS
  would scale further).
- Some analytics fall back to in-JS aggregation over a capped window when RPCs are
  absent; RPCs provide exact, DB-side aggregation.
- Storage scans and backfills are **capped** and cron/scheduler-friendly.
- Maps load up to ~2000 signs client-side; large datasets would need server-side
  tiling/aggregation.

## 14. Known limitations

- Demo detections use null image paths (no fake signed URLs), so their detail
  views show "No image captured".
- Reconciliation scan is prefix- and count-capped; not exhaustive for huge buckets.
- Snapshot/AI fallback windows are approximate vs the exact RPC path.
- No automated test suite yet (manual smoke plan provided).
- Single-region map defaults (Aalborg) for demo data.

## 15. Future work

- Spatial indexing (PostGIS) for sign matching at scale.
- Server-side map tiling/clustering for very large inventories.
- Automated E2E/integration tests (Playwright) seeded from demo data.
- Background reconciliation reaper + alerting; headless cron secret rotation.
- Real model server integration guide hardening and per-model versioning.
- Optional explicit `is_demo` columns to replace linkage-based demo inference.
