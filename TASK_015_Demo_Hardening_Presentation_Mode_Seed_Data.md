# TASK 015 — Demo Hardening, Presentation Mode & Seed/Demo Data Generator

## Role

You are a senior full-stack engineer working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase project for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The project already has a working MVP plus admin/device management, map analytics, image detail views, hardened AI integration, signed Storage URLs, storage quarantine, DB-side analytics, daily metrics snapshots, and secret-protected cron endpoints.

Your task is to make the project reliable and impressive for a university demo/presentation without rewriting the architecture.

## Critical Rules

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rebuild the project from scratch.
- Do NOT remove existing features.
- Do NOT introduce a new UI framework.
- Do NOT introduce external chart/map/seed libraries unless absolutely necessary.
- Do NOT weaken authentication, admin checks, RLS, signed URL flow, or service-role isolation.
- Keep the implementation incremental and safe.
- Preserve the current architecture: Next.js App Router, Supabase, Tailwind, Leaflet, server Route Handlers, service-role server-only usage.
- Run lint/build at the end.
- Provide a final report and suggested manual commit message.

## Context Summary

Implemented so far:

- Supabase Auth and role-aware protected routes.
- User device registration and admin device/user management.
- Detection session page with camera + geolocation + selected device.
- Frame pipeline: upload image, sign image URL, AI/mock detection, save detection_events, grouping/localization, logs.
- Static sign map with marker/cluster/density modes.
- Live device map.
- Detection detail page with image preview and bbox overlay.
- Admin detection review.
- CSV exports.
- Hardened AI API layer with mock/external/auto modes, timeout/retry/validation.
- Admin AI health/self-test/log analytics/time-series dashboard.
- Signed Storage URL access control and refresh endpoint.
- Storage backfill, orphan scan, quarantine-first cleanup.
- DB-side dashboard/AI analytics RPCs and daily metrics snapshots.
- Secret-protected cron endpoints.

## Main Goal

Prepare the system for a clean university presentation/demo.

The final state should include:

1. A deterministic demo-data generator that can seed realistic users/devices/sessions/detections/signs/logs/snapshots.
2. A safe admin-only demo tools page to run/clear demo data where appropriate.
3. A polished presentation/demo mode that highlights the most important project flows without exposing unnecessary admin complexity.
4. A demo checklist/runbook explaining exactly how to present the system.
5. Final smoke-test hardening so the project can be shown without obvious UI/runtime issues.

## Scope

This task is NOT about adding new core architecture.

It is about making the existing system easier to demonstrate.

Implement the following.

---

# Part A — Demo Data Generator

Create a deterministic demo data generator.

## Requirements

Add a server-only demo seed helper, for example:

```text
src/lib/demo/seed.ts
```

It should create realistic demo data for:

- profiles or demo-owned profile references if needed
- devices
- detection_sessions
- detection_events
- traffic_signs
- traffic_sign_observations
- device_location_logs
- system_logs
- daily_metrics_snapshots if clean and safe

The generator must be idempotent or at least safely repeatable.

Use a consistent marker field in metadata or deterministic naming so demo data can be identified later.

Example marker:

```json
{
  "demo": true,
  "demoSeedVersion": "task-015"
}
```

Do NOT create real Supabase Auth users unless absolutely necessary. Prefer using the currently authenticated admin/profile as the owner for demo data, or create demo rows in a way that does not require passwords or external email flows.

If the existing schema requires a user/profile foreign key, use the current admin profile as the owner unless there is already a safe internal demo user pattern.

## Suggested demo content

Create data that looks realistic:

- 3–5 devices:
  - vehicle-mounted camera
  - mobile phone
  - dashcam
  - custom IoT device
- 4–8 detection sessions across recent dates.
- 80–200 detection_events.
- 20–50 grouped traffic_signs.
- Several repeated observations per sign.
- A few low-confidence or rejected detections.
- A few AI timeout/failure/validation logs.
- Several AI success logs.
- Device movement logs along a plausible route.

Use a realistic geographic cluster. Default can be Aalborg, Denmark unless the project already has a configured demo region.

Suggested Aalborg base:

```text
latitude: 57.0488
longitude: 9.9217
```

Traffic sign examples:

- Speed Limit 30
- Speed Limit 50
- Stop
- Yield
- No Entry
- Pedestrian Crossing
- Roundabout
- Parking
- School Zone
- Road Work

## Important

The generated data must be compatible with the existing map, dashboard, admin logs, AI analytics, sign detail, detection detail, and CSV export pages.

If Storage images are required but not available, use null image paths for generated detections/signs or a documented placeholder approach. Do not fake signed URLs into the database.

---

# Part B — Demo Management APIs

Add admin-only APIs for demo data management.

Suggested routes:

```text
POST /api/admin/demo/seed
GET  /api/admin/demo/status
POST /api/admin/demo/clear
```

## `/api/admin/demo/seed`

Admin-only.

Creates or refreshes demo data.

Expected response:

```json
{
  "ok": true,
  "created": {
    "devices": 4,
    "sessions": 6,
    "events": 120,
    "signs": 35,
    "observations": 120,
    "locationLogs": 80,
    "systemLogs": 20,
    "snapshots": 7
  }
}
```

## `/api/admin/demo/status`

Admin-only.

Returns counts of demo-marked data currently present.

Expected response:

```json
{
  "hasDemoData": true,
  "counts": {
    "devices": 4,
    "sessions": 6,
    "events": 120,
    "signs": 35,
    "observations": 120,
    "locationLogs": 80,
    "systemLogs": 20,
    "snapshots": 7
  },
  "lastSeededAt": "..."
}
```

## `/api/admin/demo/clear`

Admin-only.

Clears only demo-marked data.

This must be conservative and safe.

Do not delete real user data.

If some tables cannot be cleared safely because they lack metadata or a demo marker, do not clear them and document the limitation.

Delete order must respect FK constraints.

---

# Part C — Admin Demo Tools Page

Add a new admin page:

```text
/admin/demo
```

Sidebar label:

```text
Demo Tools
```

The page should show:

- Demo data status/counts.
- Seed/refresh demo data button.
- Clear demo data button with confirmation.
- Demo presentation checklist.
- Links to key pages:
  - Dashboard
  - Detection
  - Sign Map
  - Device Map
  - Admin AI
  - Admin Analytics
  - Admin Storage
  - Admin Detections

The page should be admin-only.

It should not expose secrets.

---

# Part D — Presentation Mode

Add a simple presentation mode that makes the app easier to present.

Avoid overengineering.

Options:

1. Query param based:

```text
?presentation=1
```

2. Or localStorage toggle via a small button on dashboard/admin demo page.

Recommended: implement both only if easy; otherwise implement query param only.

## Presentation mode behavior

When presentation mode is active:

- Show a clear badge: `Presentation Mode`.
- Make the dashboard/demo pages visually cleaner.
- Hide destructive admin buttons where practical, or show them disabled with explanation.
- Prefer demo-friendly empty states.
- Add quick navigation cards for the intended demo flow.

Do NOT bypass authentication.
Do NOT bypass admin checks.
Do NOT expose hidden data.
Do NOT create a public demo route unless it still requires login.

## Suggested presentation route

Add a page if useful:

```text
/presentation
```

Protected route.

This page can act as a guided demo landing page with cards:

1. System Overview
2. Start Detection
3. Traffic Sign Map
4. Detection Detail
5. AI Integration Health
6. Analytics
7. Storage Governance

Each card links to the correct page and briefly explains what to show.

---

# Part E — Demo Runbook Documentation

Add documentation:

```text
docs/DEMO_RUNBOOK.md
```

It should include:

1. Environment setup.
2. Required migrations.
3. Required env vars.
4. How to seed demo data.
5. How to clear demo data.
6. How to run the system locally.
7. Exact demo flow for presentation.
8. What to show on each page.
9. Common issues and fixes:
   - camera/GPS requires localhost or HTTPS
   - expired signed image URLs
   - mock AI mode vs external mode
   - private bucket requirement
   - CRON_SECRET missing
10. Final pre-presentation checklist.

Also update README.md with a short link/reference to the runbook.

---

# Part F — Demo Hardening & UX Polish

Review the main demo pages for obvious issues:

- `/dashboard`
- `/presentation` if added
- `/detection`
- `/map/signs`
- `/map/devices`
- `/detections/[id]`
- `/admin/demo`
- `/admin/ai`
- `/admin/analytics`
- `/admin/storage`
- `/admin/detections`

Fix only small MVP-breaking or demo-breaking UX issues:

- missing loading states
- ugly empty states
- unclear error messages
- buttons not disabled while loading
- missing links between pages
- obvious typos
- broken signed image refresh behavior

Do not redesign the entire UI.

---

# Part G — Security Requirements

- Demo seed/clear/status APIs must be admin-only.
- No demo endpoint may be public.
- No service-role/admin Supabase client may be imported into any `use client` file.
- Do not expose `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_MODEL_API_KEY`, signed URLs in logs, or raw secrets in UI.
- Demo seed must not create real passwords or leak credentials.
- Clear operation must only remove demo-marked data.
- Do not bypass RLS for user-facing pages.

---

# Part H — Verification

Run:

```bash
npm run lint
npm run build
```

Also run a dev smoke test if possible:

- unauthenticated `/admin/demo` redirects to login
- unauthenticated demo APIs return 401
- non-admin demo APIs return 403 if easy to verify
- admin seed/status/clear route logic is valid
- `/presentation` route, if added, is protected

Run a client leak scan or grep similar to previous tasks to confirm server-only imports are not used in client components.

---

# Acceptance Criteria

Task is complete when:

- Demo seed/status/clear APIs exist and are admin-only.
- Admin Demo Tools page exists and is linked in the sidebar.
- Demo data can populate the dashboard/map/admin analytics pages with realistic values.
- Demo data can be cleared safely without deleting real records.
- Presentation mode or presentation landing page exists.
- DEMO_RUNBOOK.md exists and explains the demo flow clearly.
- Lint and build are clean.
- No service-role/admin/secret leakage into client components.

---

# Final Report Format

At the end, report:

1. What was implemented
2. Files changed
3. API routes added/modified
4. Demo data strategy
5. Security/access-control checks
6. Commands run
7. Verification result
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
