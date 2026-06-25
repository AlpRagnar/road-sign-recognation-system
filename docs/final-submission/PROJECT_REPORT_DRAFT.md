# AI-Based Traffic Sign Detection, Localization and Map Dashboard System
### Project Report (Draft)

> Draft for university submission. Replace every `[Reference needed]` with a real
> citation. All technical claims below reflect the actual repository
> implementation (migrations `0001`–`0006`, the `src/` codebase, and the
> Playwright E2E suite). No benchmark numbers are invented.

---

## Abstract

This project implements a web platform that converts raw, per-frame AI traffic-sign
detections into a structured, location-aware, deduplicated and reviewable traffic-sign
inventory visualized on an interactive map. Field devices capture camera frames with
GPS metadata; an external (or mock) computer-vision model returns sign detections; the
backend persists every detection, groups duplicate observations into optimized sign
records using a distance- and confidence-weighted localization method, and exposes
maps, analytics, review workflows, and operational tooling to administrators. The
computer-vision model is treated as an **external inference service**; the academic
contribution is the surrounding data pipeline — integration, geolocation fusion,
duplicate filtering, secure media handling, observability, and data lifecycle
management. The system is built on Next.js 14 (App Router), TypeScript, Tailwind CSS,
and Supabase (Auth, PostgreSQL, Storage). It was validated against a real Supabase
backend with migrations `0001`–`0006` applied, a private storage bucket, an admin
account, successful demo-data seeding, a Playwright end-to-end suite passing **24/24**,
and clean `lint`, `typecheck`, and `build`.

## 1. Introduction

Maintaining an accurate inventory of road traffic signs is important for road safety,
maintenance planning, and asset management `[Reference needed]`. Manual surveying is
slow and error-prone. Modern detection models can recognize signs in images, but a raw
stream of per-frame detections is noisy: the same physical sign is detected many times,
GPS readings vary, and confidence fluctuates. This project addresses the gap between
*detection* and a *usable inventory* by building an end-to-end web system that ingests
detections, fuses them with geolocation, removes duplicates, and presents a verified map.

## 2. Problem Definition

Given a stream of camera frames with GPS metadata and an external detector that returns
`{ class, confidence, bounding box }` per detection, produce and maintain a **single,
deduplicated, location-refined, reviewable record per physical sign**, while preserving
the full raw detection history for audit. Secondary problems include access control,
private media delivery, operational observability, and reproducible demonstration.

## 3. Project Motivation

- Turn a noisy detection stream into decision-ready data (a sign inventory).
- Demonstrate a realistic, production-shaped architecture (external model service,
  RLS, signed media, observability, scheduled maintenance) rather than a toy demo.
- Provide a defensible, full-stack academic artifact spanning web engineering, data
  modeling, geospatial processing, and operational governance.

## 4. System Requirements

**Functional:** authentication and roles; device registration; camera/GPS detection
sessions; AI integration with a defined contract; raw detection persistence; duplicate
grouping and location refinement; sign and device maps; admin review, logs, users,
devices; AI health/self-test/observability; analytics and daily snapshots; storage
governance; demo seeding; presentation mode.

**Non-functional:** security (Supabase Auth, Row-Level Security, private storage with
signed URLs, server-only secrets); reliability (AI timeout/retry, response validation);
observability (audit logs, dashboards); maintainability (typed code, migrations,
automated smoke tests); demonstrability.

**Actors:** field user, administrator, external AI model service, scheduler/cron.

## 5. Related Work (placeholder)

- Traffic-sign detection and recognition methods `[Reference needed]`.
- Geospatial clustering / point consolidation techniques `[Reference needed]`.
- Web platforms for managing machine-learning outputs and human-in-the-loop review
  `[Reference needed]`.

## 6. System Architecture

The application uses the Next.js App Router with a `(protected)` route group whose
server layout re-checks the session (defence-in-depth behind middleware) and renders a
role-aware sidebar. Server Components and Route Handlers run on the server; client
components handle interactivity (camera, maps, tables, forms) and call Route Handlers.
The server operates in **two trust tiers**:

- an **RLS client** bound to the user's session (anon key) for user-scoped reads;
- a **service-role client** (server-only) for trusted writes and admin/analytics RPCs,
  always after an explicit authentication/role check.

```
Field user (browser)            Next.js server (Route Handlers)        Supabase
  camera + GPS ──frame+meta──▶  /api/detection/frame
                                 1 upload frame ───────────────────▶  Storage (private)
                                 2 sign short-lived URL
                                 3 call AI (mock|external|auto) ◀──▶  External AI API
                                 4 validate + normalize
                                 5 insert detection_events ─────────▶  Postgres
                                 6 group → traffic_signs ───────────▶  Postgres
                                 7 system_logs (safe metadata) ─────▶  Postgres
  dashboard / maps / admin ◀──── server components + APIs + RPCs ◀──  Postgres (RLS)
```

## 7. Technology Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth, PostgreSQL,
Storage, Row-Level Security) · Leaflet + OpenStreetMap for maps · Playwright for E2E
testing. No external charting library is used (charts are lightweight Tailwind/SVG).

## 8. Data Model and Database Design

Schema is defined across six SQL migrations:

| Migration | Purpose |
| --- | --- |
| `0001_init.sql` | Core tables, RLS policies, `handle_new_user` profile trigger, `is_admin()` helper. |
| `0002_secure_image_paths.sql` | Adds object-path columns (`image_path`, `representative_image_path`). |
| `0003_backfill_image_paths.sql` | Idempotent backfill of legacy public-URL columns into path columns. |
| `0004_analytics_rpc.sql` | Service-role analytics RPCs (AI summary, breakdown, time-series, dashboard summary). |
| `0005_storage_quarantine.sql` | `storage_quarantine_candidates`, `storage_reconciliation_runs`. |
| `0006_daily_metrics_snapshots.sql` | `daily_metrics_snapshots` + snapshot upsert RPC. |

Core tables: `profiles`, `devices`, `detection_sessions`, `detection_events`,
`traffic_signs`, `traffic_sign_observations`, `device_location_logs`, `system_logs`,
plus the governance/analytics tables above. UUID primary keys, `timestamptz`
timestamps, and `jsonb` for raw AI responses/metadata. RLS is enabled on all tables;
maintenance/analytics tables have no client policies (service-role only).

## 9. AI Model API Integration

The AI layer (`src/lib/ai/`) defines a canonical request/response contract and supports
three modes via `AI_MODEL_MODE`:

- **`mock`** — built-in deterministic detector, no network (used for demos/tests);
- **`external`** — always call the configured `AI_MODEL_API_URL`; clear error if unset;
- **`auto`** — call the URL when configured, otherwise mock (never silently mock after a
  failed external call).

The request carries a short-lived **signed image URL** plus session/device/timestamp/
location metadata and no secrets. Responses are **validated and normalized** (detections
array; confidence in `[0, 1]`; non-empty class name; sane bounding box) before any
database write; invalid responses never crash the pipeline. External calls use an
`AbortController` timeout and retry only on transient failures (timeout, network, HTTP
429/502/503/504) with linear backoff.

## 10. Detection Session Workflow

1. The user selects a registered **active device** and starts a session.
2. The browser captures a downscaled JPEG frame plus current GPS, posting it to
   `POST /api/detection/frame`.
3. The server uploads the frame to the private bucket and stores the **object path**.
4. A short-lived signed URL is sent to the AI layer for inference.
5. The normalized response is persisted as one `detection_events` row per detection
   (raw JSON retained), with a `device_location_logs` entry and updated session counters.
6. Grouping/localization consolidates the detection into the sign inventory.
7. Safe audit entries are written to `system_logs`.

## 11. Geolocation and Localization Method

Each detection carries latitude/longitude, GPS accuracy, heading, and speed. The sign
location is refined from all of its observations using a **confidence/accuracy-weighted
average**:

```
weight = confidence / max(gps_accuracy, 1)
refined_location = Σ(weight · position) / Σ(weight)
```

This down-weights low-confidence detections and noisy GPS fixes when computing the
sign's representative coordinates.

## 12. Duplicate Detection and Traffic Sign Grouping

For each saved detection above a minimum confidence (`MIN_GROUPING_CONFIDENCE`):

1. Find existing `traffic_signs` of the **same sign type**.
2. Compute the **Haversine** distance to candidates; if within
   `SIGN_MATCH_RADIUS_METERS` (default **25 m**), attach the detection as a
   `traffic_sign_observations` row of the matched sign; otherwise create a new sign.
3. Recompute the sign's location via the weighted average above.
4. **Auto-verify** a sign when it has **≥ 3 observations** and **average confidence
   > 0.75**, without overriding a manual decision.

Verification states include `pending`, `auto_verified`, `manually_verified`,
`rejected`, `duplicate`, and `low_confidence`.

## 13. Map Visualization and Dashboard

The static sign map (`/map/signs`) renders the optimized inventory with **markers**,
**zoom-aware clustering**, and a **density** view, plus filters (type, status,
confidence, date) and a detail panel; clustering/density are computed in-app with no map
dependency. A separate live device map (`/map/devices`) shows last-known device
positions. The dashboard presents KPIs from a database-side RPC (with a JS fallback),
a verification breakdown, and top sign types. Maps use Leaflet and are dynamically
imported client-side to avoid server-rendering issues.

## 14. Admin Management and Observability

Administrators can manage users (including Supabase Auth user creation and password
reset), devices, and review detections and signs. The AI console (`/admin/ai`) provides
a connectivity health check, a model-contract self-test that creates no production data,
and observability (activity summary, failure breakdown, time-series, failure-rate
threshold alert) backed by RPCs with a JS fallback. Analytics (`/admin/analytics`) shows
durable daily metric snapshots, trend bars, and snapshot-coverage gap detection. All
admin APIs return **401** for unauthenticated and **403** for non-admin callers.

## 15. Storage Security and Signed URL Design

The storage bucket (`traffic-sign-frames`) is **private**. The database stores the
storage **object path**, not a public URL. Every API that returns an image mints a
**short-lived signed URL** server-side **after authorization** (owner-or-admin for
detection events; RLS-readable for shared signs). A `POST /api/images/sign` endpoint
re-signs by **entity id** (never a client-supplied path) so expired images refresh in
place. CSV exports emit an availability flag and object path, never signed URLs.
Governance tooling adds legacy-path backfill, quarantine-first reconciliation
(unreferenced objects become pending candidates; deletion is grace-period-gated,
re-checked, and admin-only — never automatic), and run history. Secret-protected cron
endpoints (`Authorization: Bearer <CRON_SECRET>`) enable scheduled daily snapshots and
reconciliation without deleting objects.

## 16. Demo Data and Testing Strategy

A deterministic, demo-marked seeder (`/admin/demo`) creates devices, sessions,
detections, signs, observations, location logs, AI logs, and snapshots; clearing removes
only demo-marked data. A presentation mode (`?presentation=1`) and guided `/presentation`
flow support demonstrations without bypassing authentication. Automated testing uses
Playwright: an unauthenticated suite (route/API gating, cron secret handling), an
authenticated suite (dashboard, all admin pages, maps, presentation, detection page with
camera/GPS mocked), and an opt-in demo-seed suite. Tests are environment-aware and skip
cleanly when credentials are absent.

## 17. Evaluation and Validation

The system was validated against a **real Supabase backend** with the following verified
outcomes:

- Migrations `0001`–`0006` applied; all expected tables, columns, and the analytics RPC
  confirmed present.
- Private `traffic-sign-frames` bucket configured (public = false).
- Admin user/profile present with `role = admin`.
- Demo data seeded successfully (e.g., 4 devices, 6 sessions, 120 detections, 35 signs,
  7 snapshots in a representative run).
- Playwright end-to-end suite **passed 24/24**.
- `npm run lint`, `npm run typecheck`, and `npm run build` are clean.

No accuracy/precision benchmarks of the detection model are claimed here, because the
model is an external service and no labeled evaluation dataset was measured in this
project `[Reference needed]`.

## 18. Limitations

- Sign matching is a same-type scan (no spatial index); very large inventories would
  benefit from PostGIS/server-side tiling.
- Maps load a bounded number of signs client-side; large datasets need tiling.
- Some analytics use a capped in-JS fallback when RPCs are unavailable.
- Demo detections use null image paths (no fabricated signed URLs), so their detail
  views show a graceful "no image" state.
- No model-accuracy evaluation was performed (external service).
- Reconciliation scans are prefix- and count-capped; not exhaustive for huge buckets.

## 19. Future Work

- Spatial indexing (PostGIS) and server-side map tiling for scale.
- A labeled evaluation of grouping/localization quality `[Reference needed]`.
- Background reconciliation reaper and alerting; cron secret rotation.
- Expanded automated test coverage and CI execution with a dedicated test project.
- Model versioning and multi-model support.

## 20. Conclusion

The project delivers a complete, validated pipeline that transforms noisy per-frame
detections into a deduplicated, location-refined, reviewable, and securely-served
traffic-sign inventory, with administrative observability and reproducible
demonstration. By treating the detector as an external service, the work focuses on the
engineering and data problems that make such detections operationally useful.

## 21. References (placeholder)

- `[Reference needed]` — traffic-sign detection/recognition.
- `[Reference needed]` — geospatial point consolidation/clustering.
- `[Reference needed]` — Haversine / great-circle distance.
- `[Reference needed]` — web platforms for ML output management / human-in-the-loop review.

## 22. Appendix suggestions

- A: Environment variables (`.env.example`).
- B: API & page inventory (`docs/FEATURE_INVENTORY.md`).
- C: Migration summaries (`supabase/migrations/`).
- D: Screenshots per page (seed demo data first).
- E: E2E results and demo runbook (`docs/E2E_TESTING.md`, `docs/DEMO_RUNBOOK.md`).
