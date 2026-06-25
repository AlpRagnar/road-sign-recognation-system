# AI-Based Traffic Sign Detection, Localization and Map Dashboard System
### Project Report (Final)

> Submission-ready report. Citation labels `[n]` refer to `REFERENCES_FINAL.md`.
> All technical claims reflect the actual repository (migrations `0001`–`0006`, the
> `src/` codebase, and the Playwright E2E suite). The detection model is external and is
> not trained or benchmarked in this project; no detection-accuracy or benchmark numbers
> are claimed. Demo counts cited in §17 are representative seeded-dataset counts, not
> performance measurements.

---

## Abstract

This project presents a web platform that converts raw, per-frame traffic-sign
detections produced by an external computer-vision model into a structured,
location-aware, deduplicated, and reviewable traffic-sign inventory visualised on an
interactive map. Field devices capture camera frames together with GPS metadata; an
external (or, for development and demonstration, a deterministic mock) detector returns
sign detections; and the backend persists every detection, consolidates repeated
observations of the same physical sign through a distance- and confidence-weighted
localisation method, and exposes maps, analytics, review workflows, and operational
tooling to administrators. The detection model is deliberately treated as an external
inference service; the contribution of this work is the surrounding platform —
integration, geolocation fusion, duplicate filtering, secure media delivery,
observability, and data-lifecycle management. The system is implemented with Next.js 14
(App Router) [10], TypeScript, Tailwind CSS, and Supabase (Authentication, PostgreSQL,
and Storage) [11]. It was validated against a real Supabase backend with migrations
`0001`–`0006` applied, a private storage bucket, an administrator account, successful
demo-data seeding, an end-to-end (E2E) test suite passing 24 of 24 cases, and a clean
lint, type-check, and production build.

## 1. Introduction

Road safety remains a major global public-health concern [14], and accurate road-asset
information — including an up-to-date inventory of traffic signs — supports infrastructure
maintenance and planning. Building such an inventory manually is slow and error-prone.
Automatic traffic-sign detection and recognition from imagery have therefore been studied
extensively [1], [2], and modern object detectors — for example YOLO [3], Faster R-CNN
[4], and SSD [5] — can localise and classify signs in images. However, a raw stream of
per-frame detections is not itself an inventory: the same physical sign is detected
repeatedly, GPS readings vary, and confidence fluctuates. This project addresses the gap
between *detection* and a *usable inventory* by building an end-to-end web system that
ingests detections, fuses them with geolocation, removes duplicates, and presents a
verified, queryable map.

## 2. Problem Definition

Given a stream of camera frames with GPS metadata and an external detector that returns,
per detection, a class, a confidence value, and a bounding box, the system must produce
and maintain a single, deduplicated, location-refined, and reviewable record for each
physical sign, while preserving the complete raw detection history for audit. Secondary
requirements include authentication and authorisation, private media delivery,
operational observability, and reproducible demonstration.

## 3. Project Motivation

The project aims to (i) transform a noisy detection stream into decision-ready data;
(ii) demonstrate a realistic, production-shaped architecture — external model service,
row-level security, signed media, observability, and scheduled maintenance — rather than
a minimal prototype; and (iii) provide a defensible, full-stack academic artefact
spanning web engineering, data modelling, geospatial processing, and operational
governance.

## 4. System Requirements

**Functional requirements:** authentication and roles; device registration;
camera/GPS detection sessions; AI integration through a defined contract; persistence of
raw detection events; duplicate grouping and location refinement; sign and device maps;
administrative review, logs, user and device management; AI health, self-test, and
observability; analytics with durable daily snapshots; storage governance; demo seeding;
and a presentation mode.

**Non-functional requirements:** security (authentication, row-level security, private
storage with signed URLs [11], [12], and server-only secrets); reliability (request
timeout, bounded retry, and response validation in the AI layer); observability (an
audit log and administrative dashboards); maintainability (typed code, ordered
migrations, and automated smoke tests); and demonstrability.

**Actors:** the field user, the administrator, the external AI model service, and the
scheduler/cron caller.

## 5. Related Work

Automatic traffic-sign recognition and detection are established research areas, with
public benchmarks such as the German Traffic Sign Recognition Benchmark [1] and the
German Traffic Sign Detection Benchmark [2], and with general-purpose detectors such as
YOLO [3], Faster R-CNN [4], and SSD [5] frequently applied to the task. The duplicate-
consolidation problem addressed here is conceptually related to density-based spatial
clustering [7], which groups nearby points and isolates noise. Human-in-the-loop review
of machine-learning outputs — reflected in this project's administrative verification
workflow — is a recognised approach for improving the operational quality of model
outputs [16]. A detailed comparative survey is left as future work.

## 6. System Architecture

The application uses the Next.js App Router [10] with a `(protected)` route group whose
server layout re-checks the session (a defence-in-depth measure behind middleware) and
renders a role-aware navigation sidebar. Server Components and Route Handlers execute on
the server, while client components handle interactivity (camera, maps, tables, forms)
and communicate with Route Handlers over HTTP. The server operates in two trust tiers:

- a **row-level-security (RLS) client** bound to the user's session for user-scoped
  reads [12]; and
- a **service-role client**, used only on the server for trusted writes and
  administrative/analytics database functions, and always after an explicit
  authentication and role check.

```
Field user (browser)            Next.js server (Route Handlers)        Supabase
  camera + GPS ──frame+meta──▶  /api/detection/frame
                                 1 upload frame ───────────────────▶  Storage (private)
                                 2 sign short-lived URL
                                 3 call AI (mock|external|auto) ◀──▶  External AI API
                                 4 validate + normalise
                                 5 insert detection_events ─────────▶  PostgreSQL
                                 6 group → traffic_signs ───────────▶  PostgreSQL
                                 7 system_logs (safe metadata) ─────▶  PostgreSQL
  dashboard / maps / admin ◀──── server components + APIs + RPCs ◀──  PostgreSQL (RLS)
```

## 7. Technology Stack

The platform is built with Next.js 14 (App Router) [10], TypeScript, and Tailwind CSS on
the frontend; Supabase (Authentication, PostgreSQL, Storage, and row-level security)
[11], [12] on the backend; Leaflet with OpenStreetMap tiles for mapping [8], [9]; and
Playwright for end-to-end testing. Charts are rendered with lightweight Tailwind/SVG
components rather than an external charting library, to minimise dependencies.

## 8. Data Model and Database Design

The schema is defined across six ordered SQL migrations:

| Migration | Purpose |
| --- | --- |
| `0001_init.sql` | Core tables, RLS policies, a profile-creation trigger, and an admin helper. |
| `0002_secure_image_paths.sql` | Storage object-path columns (`image_path`, `representative_image_path`). |
| `0003_backfill_image_paths.sql` | Idempotent backfill of legacy public-URL columns into path columns. |
| `0004_analytics_rpc.sql` | Service-role analytics functions (AI summary, breakdown, time-series, dashboard summary). |
| `0005_storage_quarantine.sql` | `storage_quarantine_candidates` and `storage_reconciliation_runs`. |
| `0006_daily_metrics_snapshots.sql` | `daily_metrics_snapshots` and a snapshot upsert function. |

Core tables include `profiles`, `devices`, `detection_sessions`, `detection_events`,
`traffic_signs`, `traffic_sign_observations`, `device_location_logs`, and `system_logs`,
alongside the governance and analytics tables introduced above. The design uses UUID
primary keys, `timestamptz` timestamps, and `jsonb` columns for raw AI responses and
metadata. Row-level security is enabled on all tables; the maintenance and analytics
tables expose no client policies and are reached only through the service-role client
[12].

## 9. AI Model API Integration

The AI layer defines a canonical request/response contract and supports three modes,
selected by the `AI_MODEL_MODE` environment variable:

- **`mock`** — a built-in deterministic detector that performs no network call (used for
  development, demonstrations, and tests);
- **`external`** — always calls the configured model endpoint, returning a clear error
  if no endpoint is configured; and
- **`auto`** — calls the endpoint when configured and otherwise falls back to the mock
  detector, without silently falling back after a *failed* external call.

A request carries a short-lived signed image URL together with session, device,
timestamp, and location metadata, and contains no secrets. Responses are validated and
normalised — the detections field must be an array, each confidence value must lie in
`[0, 1]`, each class name must be non-empty, and bounding boxes must be well-formed —
before any database write, so that an invalid response cannot corrupt or crash the
pipeline. External calls are bounded by a request timeout and retried only on transient
failures (timeout, network error, or HTTP 429/502/503/504) with linear backoff. General-
purpose detectors such as YOLO [3], Faster R-CNN [4], and SSD [5] are representative of
the kind of model that such an external endpoint might host; the platform itself is
model-agnostic.

## 10. Detection Session Workflow

A detection session proceeds as follows: (1) the user selects a registered, active
device and starts a session; (2) the browser captures a downscaled JPEG frame and the
current GPS reading and posts them to the frame endpoint; (3) the server uploads the
frame to the private bucket and stores its object path; (4) a short-lived signed URL is
sent to the AI layer for inference; (5) the normalised response is persisted as one
detection-event row per detection, with the raw JSON retained, a device location-log
entry written, and session counters updated; (6) grouping and localisation consolidate
the detection into the sign inventory; and (7) safe audit entries are written to the
system log.

## 11. Geolocation and Localisation Method

Each detection carries latitude, longitude, GPS accuracy, heading, and speed. The
representative location of a sign is refined from all of its observations using a
confidence- and accuracy-weighted average:

```
weight = confidence / max(gps_accuracy, 1)
refined_location = Σ(weight · position) / Σ(weight)
```

This formulation reduces the influence of low-confidence detections and of imprecise GPS
fixes when computing a sign's coordinates. Satellite positioning has a bounded but
non-zero error budget — the GPS Standard Positioning Service commits to a global average
user range error within a specified limit rather than to exact positions [15] — so a
single GPS fix should not be treated as the exact location of a sign; weighting by
reported accuracy and averaging across observations mitigates this uncertainty.

## 12. Duplicate Detection and Traffic Sign Grouping

For each saved detection whose confidence exceeds a configured minimum, the system:

1. retrieves existing signs of the **same sign type**;
2. computes the **Haversine** (great-circle) distance to each candidate [6] and, if the
   nearest candidate lies within `SIGN_MATCH_RADIUS_METERS` (default 25 m), records the
   detection as an additional observation of that sign; otherwise it creates a new sign;
3. recomputes the sign's location using the weighted average of §11; and
4. **auto-verifies** a sign once it has at least three observations and an average
   confidence above 0.75, without overriding any manual decision.

This same-type, proximity-bounded consolidation is conceptually aligned with density-
based spatial clustering [7], specialised here to the traffic-sign domain. Verification
states include `pending`, `auto_verified`, `manually_verified`, `rejected`, `duplicate`,
and `low_confidence`.

## 13. Map Visualisation and Dashboard

The static sign map renders the optimised inventory with markers, zoom-aware clustering,
and a density view, together with filters (type, status, confidence, and date) and a
detail panel; clustering and density are computed within the application and require no
additional mapping dependency. A separate live device map shows last-known device
positions. The dashboard presents key performance indicators sourced from a database-side
function (with a JavaScript fallback), a verification breakdown, and the most frequent
sign types. Maps use Leaflet [8] with OpenStreetMap tiles [9] and are imported
dynamically on the client to avoid server-rendering issues.

## 14. Admin Management and Observability

Administrators manage users — including Supabase Authentication user creation and
password reset — devices, and the review of detections and signs. The AI console
provides a connectivity health check, a model-contract self-test that creates no
production data, and observability views (an activity summary, a failure breakdown, a
time-series, and a failure-rate threshold alert) backed by database functions with a
JavaScript fallback. The analytics view presents durable daily metric snapshots, trend
bars, and snapshot-coverage gap detection. This administrative verification capability
implements human-in-the-loop review intended to improve the operational quality of the
model's outputs [16]; it supports manual correction and curation but does not, by itself,
guarantee correctness. All administrative APIs return HTTP 401 for unauthenticated
callers and HTTP 403 for authenticated non-administrators.

## 15. Storage Security and Signed-URL Design

The storage bucket is private. The database stores the storage object path rather than a
public URL, and every API that returns an image mints a short-lived signed URL on the
server, only after authorisation (owner-or-administrator for detection events;
RLS-readable for shared signs) [11]. A dedicated endpoint re-signs images by entity
identifier — never from a client-supplied path — so that expired images can be refreshed
in place. CSV exports emit an availability flag and the object path, never a signed URL.
Governance tooling adds legacy-path backfill, quarantine-first reconciliation
(unreferenced objects become pending candidates; deletion is grace-period gated,
re-checked immediately before removal, and administrator-initiated — never automatic),
and a record of reconciliation runs. Secret-protected scheduled endpoints
(authenticated by a bearer secret) enable daily snapshots and reconciliation scans
without deleting objects.

## 16. Demo Data and Testing Strategy

A deterministic, demo-marked seeder creates devices, sessions, detections, signs,
observations, location logs, AI logs, and snapshots; the clear operation removes only
demo-marked data. A presentation mode and a guided presentation page support
demonstrations without bypassing authentication. Automated testing uses Playwright,
organised into an unauthenticated suite (route and API gating, and cron-secret
handling), an authenticated suite (the dashboard, all administrative pages, both maps,
the presentation page, and the detection page with camera and GPS mocked), and an
opt-in demo-seed suite. The tests are environment-aware and skip cleanly when
credentials are absent.

## 17. Evaluation and Validation

The system was validated against a real Supabase backend, with the following verified
outcomes:

- migrations `0001`–`0006` applied, and all expected tables, columns, and the analytics
  function confirmed present;
- a private storage bucket configured (public access disabled);
- an administrator account present with the administrator role;
- demo data seeded successfully (in a representative run: 4 devices, 6 sessions, 120
  detection events, 35 signs, and 7 daily snapshots — these are representative seeded
  dataset counts, not performance measurements);
- a Playwright end-to-end suite passing 24 of 24 cases against the Supabase-backed
  environment; and
- a clean lint, type-check, and production build (54 application routes built).

The accuracy of the detection model is not evaluated in this work because the model is an
external service and no labelled evaluation dataset was measured here; benchmark datasets
such as [1] and [2] would support such an evaluation in future work.

## 18. Limitations

- Sign matching performs a same-type scan without a spatial index; very large
  inventories would benefit from spatial indexing (for example, PostGIS [13]).
- Maps load a bounded number of signs on the client; larger datasets would require
  server-side tiling or aggregation.
- Some analytics use a bounded in-application fallback when the database functions are
  unavailable.
- Demo detections use null image paths (no fabricated signed URLs), so their detail
  views display a graceful "no image" state.
- No detection-model accuracy evaluation is performed, as the model is external.
- Reconciliation scans are prefix- and count-bounded and are therefore not exhaustive
  for very large buckets.

## 19. Future Work

- Introduce spatial indexing (for example, PostGIS [13]) and server-side map tiling for
  scalability.
- Conduct a labelled evaluation of grouping and localisation quality using public
  benchmarks such as [2].
- Add a background reconciliation reaper and alerting, and rotate the cron secret.
- Expand automated test coverage and run it in continuous integration against a
  dedicated test project.
- Support model versioning and multiple model backends.

## 20. Conclusion

The project delivers a complete, validated pipeline that transforms noisy per-frame
detections into a deduplicated, location-refined, reviewable, and securely served
traffic-sign inventory, complemented by administrative observability and reproducible
demonstration. By treating the detector as an external service, the work concentrates on
the integration, geospatial, security, and operational problems that make detections
operationally useful.

## 21. References

The full bibliography ([1]–[16]) is provided in `REFERENCES_FINAL.md`. Confirm all
entries against the citation style required by your institution before final submission.
