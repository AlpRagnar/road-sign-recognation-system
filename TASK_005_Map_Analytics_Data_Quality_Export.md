# TASK 005 — Map Analytics, Data Quality Review & CSV Export

## Context

You are working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase MVP for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The project already includes:

- Supabase Auth login and route protection
- Role-aware dashboard and sidebar
- User device registration/management
- Admin user/device management
- Admin Auth user creation and password reset
- Camera + geolocation detection sessions
- Frame upload pipeline
- External AI API integration with mock fallback
- `detection_events`, `traffic_signs`, `traffic_sign_observations`, `device_location_logs`, and `system_logs`
- Haversine duplicate grouping and weighted localization
- Static traffic sign map
- Live device map
- Admin logs and sign review

TASK 004 has been completed successfully. Do not rebuild the MVP. Continue from the current codebase.

## Main Goal

Implement the next project layer: map analytics, data quality review, and export functionality.

The system should become stronger for university presentation and reporting by adding:

1. Better map visualization for many traffic signs
2. Traffic sign clustering on the static sign map
3. Optional heatmap-style density visualization if practical with the existing stack
4. Better traffic sign detail view with linked observations/events
5. Admin per-detection review workflow
6. CSV export for traffic signs and detection logs
7. Small dashboard analytics improvements based on existing data

## Critical Rules

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rebuild the project from scratch.
- Do NOT remove working existing features.
- Do NOT introduce a new database table unless there is a clear blocker.
- Prefer reusing existing tables: `traffic_signs`, `traffic_sign_observations`, `detection_events`, `devices`, `profiles`, `system_logs`.
- Keep changes focused and MVP-safe.
- Use the existing architectural style, naming, route patterns, and API patterns.
- If adding a small dependency for clustering/heatmap, choose a well-known lightweight package and document why.
- Run lint and build before final report.

## Feature 1 — Improve Static Traffic Sign Map

Enhance `/map/signs` so it can handle more signs and present richer information.

### Requirements

- Add marker clustering for traffic sign markers.
- Preserve existing filters:
  - sign type
  - verification status
  - confidence range
  - date range if already present
- Add or improve a sign detail side panel or modal when a marker is selected.
- The detail view should show:
  - sign type
  - latitude/longitude
  - confidence score
  - verification status
  - detection count
  - first detected date
  - last detected date
  - representative image if available
  - linked observation count
  - latest related detection event details if easily available
- Avoid Leaflet SSR issues. Use dynamic imports/client-only components as already done in the project.

### Expected Result

The static map remains stable but becomes visually usable when many signs exist.

## Feature 2 — Optional Heatmap/Density View

Add a map density/heatmap option if it can be implemented safely.

### Requirements

- Add a toggle such as:
  - `Markers`
  - `Clustered Markers`
  - `Density / Heatmap`
- If heatmap dependency causes SSR/type complexity, do not force it. Instead implement a simple density mode using aggregated visual circles or document why heatmap was skipped.
- Do not break the current map.

### Expected Result

The map can visually communicate where detections are dense, which is useful for project presentation.

## Feature 3 — Admin Per-Detection Review

The existing admin review flow works mainly at the optimized `traffic_signs` level. Add per-detection review so admins can inspect and classify raw AI events.

### Route

Create or enhance:

```text
/admin/detections
```

or extend the existing admin logs/review pages if the project already has a better place for it.

### Requirements

The admin detections page should list raw `detection_events` with:

- detected class name
- confidence
- device
- user/profile if available
- latitude/longitude
- GPS accuracy
- created_at
- validation_status
- image preview/link
- AI response time

Admin actions:

- mark as `verified`
- mark as `rejected`
- mark as `duplicate`
- optionally reset to `pending`

Use the existing `validation_status` column if available. Do not create a new table for this.

### API Requirements

Add server-side admin-only API route(s), for example:

```text
GET /api/admin/detections?search=&status=&className=&page=&pageSize=
PATCH /api/admin/detections/[id]
```

Must enforce:

- 401 unauthenticated
- 403 non-admin
- service-role writes only on server
- no service-role leakage to client components

### Logging

Write useful system logs for detection review actions:

- `ADMIN_DETECTION_REVIEW_UPDATED`

No schema migration should be needed if `system_logs.action_type` is free text.

## Feature 4 — CSV Export

Add admin CSV export for:

1. optimized traffic signs
2. raw detection events

### API Routes

Recommended:

```text
GET /api/admin/export/traffic-signs.csv
GET /api/admin/export/detection-events.csv
```

or equivalent route naming consistent with the codebase.

### Requirements

- Admin-only.
- Return `text/csv` with proper headers.
- Include filters if practical using query params:
  - status
  - sign type / class name
  - date range
  - device id
- Do not export secrets or full raw AI JSON by default.
- Include useful columns only.

### Traffic Signs CSV Columns

Suggested columns:

- id
- sign_type
- latitude
- longitude
- confidence_score
- verification_status
- detection_count
- first_detected_at
- last_detected_at
- representative_image_url

### Detection Events CSV Columns

Suggested columns:

- id
- session_id
- user_id
- device_id
- detected_class_name
- confidence
- latitude
- longitude
- gps_accuracy
- heading
- speed
- validation_status
- ai_response_time_ms
- image_url
- created_at

## Feature 5 — Dashboard Analytics Improvements

Enhance `/dashboard` with a few additional lightweight metrics using existing data.

Recommended additions:

- top detected sign types
- verification breakdown: pending / verified / rejected / duplicate / auto_verified
- average AI response time
- average confidence
- detections in last 24 hours / last 7 days

Keep this simple. Do not build a complex charting system unless the project already has a chart library.

If no chart library exists, use clean cards, small tables, and simple bars using CSS/Tailwind.

## Feature 6 — Documentation Update

Update `README.md` with:

- map clustering/density explanation
- admin detection review explanation
- CSV export routes
- known limitations
- how to test the new flow

## Acceptance Criteria

The task is complete when:

- `/map/signs` supports improved clustered visualization and richer sign details.
- Admin can review raw detection events individually.
- Admin can export traffic signs and detection events as CSV.
- Dashboard shows at least 2–3 additional analytics metrics.
- All new admin APIs enforce 401/403 correctly.
- No service-role key is imported into client components.
- Existing detection/session/device/admin functionality still works.
- `npm run lint` passes.
- `npm run build` passes.

## Verification Commands

Run:

```bash
npm run lint
npm run build
```

If practical, run a short dev-server smoke test for:

```text
/map/signs
/admin/detections
/api/admin/export/traffic-signs.csv
/api/admin/export/detection-events.csv
/dashboard
```

## Final Report Format

At the end, report:

1. What you implemented
2. Files changed
3. Database changes, if any
4. API routes added/modified
5. Security/authorization checks
6. Commands run
7. Verification result
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
