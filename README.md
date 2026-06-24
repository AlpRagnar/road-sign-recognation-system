# AI-Based Traffic Sign Detection, Localization and Map Dashboard System

MVP web application that turns raw AI traffic-sign detections into a structured,
location-aware, reviewable, map-ready inventory.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Auth / Postgres / Storage) · Leaflet + OpenStreetMap**.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# fill in Supabase URL/keys (see supabase/README.md)

# 3. Set up the database + storage bucket
#    Run supabase/migrations/0001_init.sql in the Supabase SQL editor,
#    then create the `traffic-sign-frames` storage bucket (public for MVP).

# 4. Run
npm run dev          # http://localhost:3000
```

Leave `AI_MODEL_API_URL` blank to use the built-in **development mock detector**
so you can exercise the whole pipeline without a real model server.

## Routes

| Page | Purpose |
| --- | --- |
| `/login` | Supabase email/password auth |
| `/dashboard` | Metrics + recent detections |
| `/detection` | Camera + GPS capture, start/stop session |
| `/map/signs` | Optimized traffic-sign inventory map |
| `/map/devices` | Live device map (polling) |
| `/devices` | Register & manage your own devices |
| `/admin/logs` | Raw detection events (admin) |
| `/admin/review` | Verify/reject signs (admin) |
| `/admin/devices` | Manage all devices (admin) |
| `/admin/users` | Manage profiles & roles (admin) |

## API

| Endpoint | Description |
| --- | --- |
| `POST /api/detection/session/start` | Create session for a selected device (ownership-checked) |
| `POST /api/detection/session/stop` | Complete session |
| `POST /api/detection/frame` | Upload frame → AI → save events → group signs |
| `GET /api/map/signs` | Traffic-sign inventory (filterable) |
| `GET /api/map/devices` | Devices with last-known location |
| `GET/POST /api/devices` | List / create the current user's devices |
| `PATCH/DELETE /api/devices/[id]` | Edit / deactivate own device (soft-delete) |
| `GET /api/admin/devices`, `PATCH /api/admin/devices/[id]` | All devices (admin) |
| `GET /api/admin/users`, `PATCH /api/admin/users/[id]` | Profiles & roles (admin) |
| `GET /api/admin/detection-logs` | Raw events (admin) |
| `GET /api/admin/system-logs` | System logs (admin) |
| `POST /api/admin/review-detection` | Update verification status (admin) |

## Key design points

- **Duplicate detection / localization** (`src/lib/localization/grouping.ts`):
  matches by sign type within a Haversine radius (default 25 m), attaches
  observations, recomputes location with confidence/accuracy-weighted averaging,
  and auto-verifies at ≥3 observations & >0.75 average confidence.
- **AI client** (`src/lib/ai/`): mode-aware (`mock` / `external` / `auto`)
  detection with request/response contract, validation/normalization, timeout +
  retry on transient failures, and safe logging. `/admin/ai` provides a
  connectivity **health check** (`GET /api/admin/ai/health`), a model-contract
  **self-test** (`POST /api/admin/ai/self-test` — never creates detection
  records), and an **activity dashboard** (`GET /api/admin/ai/logs`: summary,
  failure breakdown, filterable recent logs). Full spec:
  [`docs/AI_MODEL_INTEGRATION.md`](docs/AI_MODEL_INTEGRATION.md).
- **Service-role writes**: all trusted server writes use the service-role key
  inside Route Handlers, after authenticating the caller. RLS protects
  client-side reads.

## Devices & admin management

- **Register a device**: open `/devices` → **Register device** (name + type;
  identifier auto-generates if blank). You can edit or **deactivate** your own
  devices. Deactivation is a soft-delete (`status = 'inactive'`) so historical
  detections are preserved.
- **Why selection is required**: `/detection` now requires choosing one of your
  **active** registered devices before **Start detection** is enabled. The
  session and every frame are tied to that `device_id`; you can only start a
  session with a device you own. (A no-selection auto-provision path remains
  only as a backward-compatibility fallback.)
- **Promote a user to admin**: either run
  `update public.profiles set role = 'admin' where email = 'you@example.com';`
  in the Supabase SQL editor, or, once you have one admin, use `/admin/users`
  to flip roles in the UI.
- **Admin management pages**: `/admin/devices` (view/edit any device's
  name/type/status) and `/admin/users` (create users, edit display name, switch
  role, reset passwords). Both tables support search, filters, and pagination.
  All admin APIs enforce `role = 'admin'` server-side (401 unauthenticated, 403
  non-admin).

### Admin Auth user provisioning

- **Create a user** (`/admin/users` → *Create user*): creates a real Supabase
  Auth user via the **service-role** `auth.admin.createUser` (email
  pre-confirmed), then sets `profiles.full_name` + `role`. The temporary
  password is auto-generated (or you may type one) and shown **once** in a
  dialog with a copy button — hand it to the user.
- **Reset a password** (per row → *Reset password*): sets a new generated
  password via `auth.admin.updateUserById` and shows it **once**. Self-reset is
  allowed but requires explicit confirmation.
- **Security**: temporary passwords are **never stored in the database or
  written to logs** — they exist only in the immediate create/reset response.
  All `auth.admin` calls and the service-role key are strictly server-side
  (Route Handlers). Logs (`ADMIN_AUTH_USER_CREATED`, `ADMIN_AUTH_PASSWORD_RESET`)
  record only the actor, target id/email, and role.
- **Limitations**: device admin search matches device name/identifier (not owner
  email). Email delivery / invite links are not wired up — credentials are
  handed over manually for this MVP.

## Map analytics, data quality & export

- **Sign map views** (`/map/signs`): a view toggle switches between **Markers**,
  **Clustered** (zoom-aware grid clustering — click a cluster to zoom in), and
  **Density** (circle size/colour by local count). Clustering/density are
  implemented in-app (`src/lib/cluster.ts`) with no extra dependency, keeping the
  map SSR-safe (the whole map is a `ssr:false` dynamic import). Filters: sign
  type, status, confidence, and a last-detected date range. Clicking a marker
  opens a **detail panel** (location, confidence, status, counts, observation
  count, representative image, latest related event via `/api/map/signs/[id]`).
- **Admin detection review** (`/admin/detections`): paginated, searchable list of
  raw `detection_events`. Per-row actions set `validation_status` to
  **manually_verified / rejected / duplicate / pending** (logged as
  `ADMIN_DETECTION_REVIEW_UPDATED`). This complements the sign-level review at
  `/admin/review`.
- **CSV export** (admin only): `GET /api/admin/export/traffic-signs.csv` and
  `GET /api/admin/export/detection-events.csv`. Both accept filter query params
  (status, type/class, date range, device id). The full raw AI JSON is **not**
  exported. Buttons are on the `/admin/detections` page header.
- **Dashboard analytics** (`/dashboard`): last-24h / last-7d detection counts,
  average confidence and average AI response time (recent window), a verification
  breakdown bar chart, and top detected sign types — all rendered with plain
  Tailwind (no chart library).

### Testing the new flow

1. Run a detection session to generate events/signs (mock detector is fine).
2. Open `/map/signs`, switch between Markers/Clustered/Density, click a marker.
3. As admin, open `/admin/detections`, change a detection's status, then export
   both CSVs from the header buttons.
4. Check `/dashboard` for the new metrics and breakdown bars.

## Inspecting a detection (image + bounding box)

- **Detection detail page** (`/detections/[id]`): shows the captured frame with a
  **bounding-box overlay**, detection metadata (class, confidence, validation
  status, AI response time), location metadata (lat/lng, accuracy, heading,
  speed), device/user context, the linked traffic sign (if grouped), and a
  collapsible **raw AI response** JSON viewer.
- **Where to find previews**:
  - `/detection` result cards show a per-frame preview with the box and a
    **View detail** link (the frame API returns the saved detection id, image
    url, and bbox).
  - `/admin/detections` has a lazy-loaded thumbnail column and a **View details**
    link per row (alongside the existing verify/reject/duplicate/reset actions).
  - The `/map/signs` sign detail panel links to the **latest related detection**.
- **Bounding boxes** are stored as pixel coordinates on the captured frame;
  `DetectionImagePreview` scales the overlay by rendered-size ÷ natural-size so it
  stays aligned on any layout. Missing image or bbox is handled gracefully.
- **Access control**: `GET /api/detections/[id]` is owner-or-admin only.
- **Image URLs (secure delivery)**: the bucket should be **private** in
  production. The DB stores the storage **object path** (`detection_events.image_path`,
  `traffic_signs.representative_image_path`), and every API that returns an image
  mints a **short-lived signed URL** server-side **after** authorization
  (`src/lib/storage/signed-urls.ts`, TTL = `SIGNED_IMAGE_URL_TTL_SECONDS`, default
  5 min). The AI server receives a temporary signed URL for inference. Detection
  detail is owner-or-admin; admin lists/sign panels sign only what the caller may
  see. **CSV exports never include image URLs** — they emit `image_available` and
  the object path only. Legacy rows that stored a public URL still work (the path
  is extracted from the old URL when signing). Known limitation: signed URLs
  expire, so a long-open page may need a reload to refresh the image.

See `ARCHITECTURE.md` and `TASK.md` for the full specification.
