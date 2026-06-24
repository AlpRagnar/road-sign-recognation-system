# TASK 003 — Device Registration & Management UI + Admin User/Profile Management

## Role

You are a senior full-stack engineer working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase project for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The current MVP has already passed a verification/fix pass in TASK 002. The app has a stable foundation with auth, protected routes, Supabase schema, detection sessions, mock AI flow, map views, admin logs, and admin review.

Your job in TASK 003 is to add the next core operational layer: device registration/management and admin user/profile management.

## Critical Rules

- Do NOT create git commits.
- Do NOT run `git commit`.
- Do NOT run `git push`.
- Do NOT deploy.
- Do NOT rewrite the existing architecture.
- Do NOT introduce new database/domain entities unless truly required for this task.
- Prefer using the existing `profiles` and `devices` tables.
- Keep changes minimal, consistent, and production-readable.
- Preserve the existing Next.js + Supabase + Leaflet architecture.
- Use server-side authorization for admin-only mutations.
- Use Supabase service-role only in server-side route handlers or server-only utilities.
- Never expose service-role keys to client components.
- At the end, provide a concise final report and a suggested manual commit message.

## Current Project Context

The project currently includes:

- Supabase Auth email/password login
- Protected route group
- Role-aware sidebar navigation
- Dashboard
- Detection session page using browser camera and geolocation
- Frame upload API route
- AI API integration with mock fallback
- Supabase Storage frame upload
- `profiles`
- `devices`
- `detection_sessions`
- `detection_events`
- `traffic_signs`
- `traffic_sign_observations`
- `device_location_logs`
- `system_logs`
- Haversine duplicate grouping
- Weighted localization
- Static traffic sign map
- Live device map with polling
- Admin logs page
- Admin review page
- Supabase migration at `supabase/migrations/0001_init.sql`

TASK 002 confirmed:

- `npm run lint` clean
- `npm run build` clean
- migration applies on Postgres
- auth route protection works
- unauthenticated API access is rejected correctly

## Main Goal

Implement management screens and API routes for:

1. Field user device registration and device management.
2. Admin device management across all users.
3. Admin user/profile management.
4. Better integration between selected devices and detection sessions.

The system should stop relying only on a hidden auto-provisioned default device. A normal user should be able to register and manage their own devices. Admin users should be able to inspect and manage all users and all devices.

## Expected Final State

After this task:

- A normal user can open a Devices page and register a device.
- A normal user can edit/delete/deactivate only their own devices.
- A normal user can select which device is used when starting a detection session.
- The detection session should use the selected registered device instead of always silently auto-creating one.
- Admin users can view all devices.
- Admin users can update device status/type/name for any device.
- Admin users can view all profiles/users.
- Admin users can update profile role/status fields where applicable.
- Admin pages are server-side protected.
- Non-admin users cannot access admin APIs or admin pages.
- Existing detection, map, logs, and review flows continue working.
- `npm run lint` and `npm run build` are clean.

## Important Design Constraint

Do not overbuild.

This task is not about building a huge enterprise admin system. It is about making the MVP operational and demonstrable for a university project.

Prioritize:

- stable CRUD
- clear UI
- correct permissions
- safe server-side API routes
- clean linkage to detection sessions

## Step 1 — Inspect Existing Schema and Code

Inspect these files/directories first:

- `supabase/migrations/0001_init.sql`
- `src/app/(protected)/devices` if it exists
- `src/app/(protected)/detection`
- `src/app/(protected)/admin`
- `src/app/api`
- `src/components`
- `src/lib/supabase`
- `src/lib/auth` or equivalent auth utilities
- sidebar/navigation components

Before implementation, identify:

- current shape of `devices`
- current shape of `profiles`
- how detection sessions currently pick/create a device
- how admin role checks are currently implemented
- current UI conventions for tables, forms, buttons, cards, and loading states

Follow the existing conventions.

## Step 2 — Device Management for Normal Users

Create or update a protected user-facing page:

```text
/devices
```

This page should show the current user's registered devices.

### Required device list columns/cards

Show at least:

- device name
- device type
- device identifier
- status
- last seen time
- total detections if easy to derive from existing data
- created date
- actions

### Required actions

A normal user should be able to:

- create a new device
- edit their own device
- deactivate/delete their own device

Prefer soft deactivation over hard delete if the schema supports status. If only hard delete exists and it would break historical detection references, do not hard delete. Instead set `status = 'inactive'` or an equivalent allowed status.

### Device form fields

Use the existing `devices` table fields. At minimum:

- `device_name`
- `device_type`
- `device_identifier`
- `status` if relevant

Suggested device types:

- `mobile_phone`
- `vehicle_camera`
- `dashcam`
- `iot_camera`
- `test_device`

If the database uses different CHECK values, use the existing values. Do not break the migration.

### Validation

Validate on both client and server where reasonable:

- device name required
- device type required
- device identifier required or auto-generated if the current schema expects it
- user can only mutate their own devices

## Step 3 — Device API Routes

Create or update API routes for device CRUD.

Possible routes:

```text
GET    /api/devices
POST   /api/devices
PATCH  /api/devices/[id]
DELETE /api/devices/[id]
```

or follow the existing project style if different.

### Required behavior

- Authenticated users can list only their own devices.
- Authenticated users can create devices owned by themselves.
- Authenticated users can edit/deactivate only their own devices.
- Admin users may be supported by separate admin routes instead of overloading these endpoints.
- Return stable JSON responses.
- Handle Supabase errors cleanly.
- Log important actions to `system_logs` if the existing logging utility exists.

## Step 4 — Detection Session Device Selection

Update the detection page so the user can select a registered device before starting detection.

### Required behavior

- Load the user's active devices.
- Show a dropdown/select/card selector.
- If the user has no registered devices, show a clear empty state and a link/button to create a device.
- Disable `Start Detection` until a device is selected.
- Start detection with the selected `device_id`.
- The frame API should use that selected device.
- Do not silently create a hidden default device if the user has already selected a registered device.

### Backward compatibility

If the existing API currently auto-provisions a default device, keep it only as a fallback for older flows or emergency compatibility. The primary UI flow must be registered-device based.

## Step 5 — Admin Device Management

Create an admin-only page:

```text
/admin/devices
```

This page should list all devices across all users.

### Required columns

- device name
- device type
- device identifier
- owner user/profile
- status
- last latitude/longitude if available
- last seen time
- total detections if easy to derive
- created date
- actions

### Required actions

Admin should be able to:

- update device name
- update device type
- update status
- view owner information
- optionally deactivate device

Do not allow admin to accidentally hard delete historical devices unless the existing schema and application clearly support it safely. Prefer status-based deactivation.

## Step 6 — Admin User/Profile Management

Create an admin-only page:

```text
/admin/users
```

This page should list all profiles.

### Required columns

- full name
- email
- role
- created date
- updated date if available
- actions

### Required actions

Admin should be able to:

- update full name if the profile table supports it
- update role between `user` and `admin`
- inspect profile metadata if available

### Important auth limitation

Do not attempt to build a full Supabase Auth user creation/reset password flow unless the existing project already has a safe server-side admin auth utility.

For this task, profile management is enough:

- view profiles
- update role
- update profile fields

Document that Auth-level user creation/password management is a future task unless already implemented cleanly.

## Step 7 — Admin APIs

Create admin-only API routes if needed.

Possible routes:

```text
GET   /api/admin/devices
PATCH /api/admin/devices/[id]
GET   /api/admin/users
PATCH /api/admin/users/[id]
```

### Required authorization

Every admin API route must:

1. Authenticate the current user.
2. Verify the user has `role = 'admin'` using the existing server-side profile/admin helper.
3. Return `401` for unauthenticated users.
4. Return `403` for authenticated non-admin users.

Do not rely only on hidden navigation. Server-side enforcement is mandatory.

## Step 8 — Sidebar / Navigation

Update the sidebar/navigation consistently.

Normal users should see:

- Dashboard
- Detection
- Traffic Sign Map
- Live Devices Map
- Devices

Admin users should additionally see:

- Admin Logs
- Admin Review
- Admin Devices
- Admin Users

Keep labels clear and concise.

## Step 9 — UI/UX Requirements

Use the existing UI style.

Every management page should include:

- title
- short description
- loading state
- empty state
- error state
- table or card list
- create/edit modal or inline form
- clear success/error feedback

Do not use heavy new UI libraries unless the project already uses them.

## Step 10 — Data Consistency and Logging

When devices are created/updated/deactivated, write a `system_logs` entry if there is already a project logging helper.

Suggested action types:

- `DEVICE_CREATED`
- `DEVICE_UPDATED`
- `DEVICE_DEACTIVATED`
- `ADMIN_DEVICE_UPDATED`
- `ADMIN_PROFILE_UPDATED`

If the schema has CHECK constraints for `system_logs.action_type`, use existing allowed values. If it is free text, use the above.

Do not change log schema unless required.

## Step 11 — Security Review

After implementation, review:

- Service-role key is never imported into client components.
- Normal users cannot update another user's device.
- Normal users cannot call admin APIs successfully.
- Admin pages are protected on the server, not only hidden in nav.
- Detection session cannot be started using another user's device ID.
- API validates ownership/admin role before mutation.

Fix any issue found.

## Step 12 — Documentation Update

Update `README.md` if needed.

Add a short section explaining:

- how to register a device
- why a device must be selected before detection starts
- how to promote a user to admin
- where admin can manage devices and profiles

Do not make the README too long.

## Step 13 — Verification Commands

At the end run:

```bash
npm run lint
npm run build
```

If possible, boot the dev server and smoke test key routes:

```bash
npm run dev
```

Suggested manual route smoke test:

- `/dashboard`
- `/devices`
- `/detection`
- `/admin/devices`
- `/admin/users`
- `/map/devices`
- `/map/signs`

Stop the dev server afterward.

## Acceptance Criteria

This task is complete only if:

- Normal users can create/list/edit/deactivate their own devices.
- Detection page requires selecting a registered device.
- Detection frame/session flow uses the selected device ID.
- Admin can view/manage all devices.
- Admin can view/manage profile roles.
- Non-admin users cannot access admin pages/APIs.
- No service-role usage appears in client-side code.
- `npm run lint` passes.
- `npm run build` passes.
- Existing MVP features still work.

## Final Report Format

At the end, report:

1. What you implemented
2. Files changed
3. Database changes, if any
4. Security/authorization checks added
5. Commands run
6. Verification result
7. Known limitations
8. Recommended next task
9. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
