# TASK 004 — Admin Auth User Provisioning, Password Reset, Pagination & Search

## Role

You are a senior full-stack engineer working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase MVP for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The project already has:

- Supabase Auth login
- Route protection and role-aware navigation
- User device CRUD
- Detection session device selection
- Admin device management
- Admin user/profile management
- Admin-only APIs
- Supabase service-role usage only on the server
- Clean `npm run lint` and `npm run build`

Your task is to extend the existing admin management layer with Supabase Auth-level user provisioning and production-friendly admin table controls.

---

## Critical Rules

- Do NOT create git commits.
- Do NOT run `git commit`.
- Do NOT run `git push`.
- Do NOT deploy.
- Do NOT rewrite the existing architecture.
- Do NOT move service-role logic into client components.
- Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Do NOT add unrelated features.
- Do NOT introduce a new UI framework.
- Keep the implementation consistent with the existing Next.js + Supabase + Tailwind structure.
- Prefer small, targeted changes.
- If a schema change is truly required, create a new migration file instead of editing `0001_init.sql`. However, try to reuse the existing schema first.

---

## Main Goal

Implement admin-level Supabase Auth user provisioning and improve admin management screens with pagination, search, and safer operational UX.

After this task, an admin should be able to:

1. Create a real Supabase Auth user from the admin UI.
2. Assign the created user a `profiles.role` value of `user` or `admin`.
3. Set or generate an initial temporary password.
4. See the generated credentials once after creation so they can hand them to the user.
5. Reset a user's password from the admin UI and see the new temporary password once.
6. Search and paginate admin users.
7. Search and paginate admin devices.
8. Keep all admin Auth operations protected server-side.

---

## Existing Context From Previous Task

Task 003 implemented:

- `/devices` user device CRUD
- `/admin/devices` admin device management
- `/admin/users` admin profile/role management
- `/api/devices`
- `/api/admin/devices`
- `/api/admin/users`
- Server-side admin checks
- Self-demotion guard
- Device ownership validation
- Logging actions:
  - `DEVICE_CREATED`
  - `DEVICE_UPDATED`
  - `DEVICE_DEACTIVATED`
  - `ADMIN_DEVICE_UPDATED`
  - `ADMIN_PROFILE_UPDATED`

Current limitation:

- `/admin/users` manages only the `profiles` row.
- Admin cannot create real Supabase Auth users yet.
- Admin cannot reset passwords yet.
- Admin user/device tables are not paginated.

---

## Required Feature 1 — Admin Create Auth User

Add a secure admin-only flow for creating a real Supabase Auth user.

### UI Location

Extend the existing `/admin/users` page.

Add a clear action such as:

```text
Create User
```

This should open a modal/dialog or inline form.

### Form Fields

Required:

- Full name
- Email
- Role: `user` or `admin`

Password behavior:

- Provide a default option to generate a secure temporary password automatically.
- Optionally allow admin to manually enter a temporary password.
- The generated/manual password must be shown to the admin once after successful user creation.

### Server Behavior

Create or extend an admin API route, for example:

```text
POST /api/admin/users
```

The route must:

1. Authenticate the request.
2. Confirm requester is admin.
3. Validate payload.
4. Normalize email.
5. Create the user using Supabase service-role `auth.admin.createUser`.
6. Ensure email is confirmed if appropriate for local MVP usage.
7. Create or update the related `profiles` row.
8. Set `profiles.full_name` and `profiles.role`.
9. Write a `system_logs` entry with action type `ADMIN_AUTH_USER_CREATED`.
10. Return the created profile and the temporary password only once.

### Important

The password must never be stored in the database or logs.

Logs may include:

- created user ID
- created email
- role
- admin actor ID

Logs must NOT include:

- password
- service-role key
- token values

---

## Required Feature 2 — Admin Password Reset

Add a secure admin-only password reset flow.

### UI Location

On `/admin/users`, each user row should include an action such as:

```text
Reset Password
```

This action should ask for confirmation.

After success, show the generated temporary password once in a dialog/card.

### Server Behavior

Create an endpoint such as:

```text
POST /api/admin/users/[id]/reset-password
```

or equivalent.

The route must:

1. Authenticate the request.
2. Confirm requester is admin.
3. Resolve the target profile.
4. Use `auth.admin.updateUserById` to set a new generated password.
5. Write a `system_logs` entry with action type `ADMIN_AUTH_PASSWORD_RESET`.
6. Return the temporary password only once.

### Self-Reset Behavior

Admin self-password reset may be allowed, but require explicit confirmation in the UI.

Do not allow accidental destructive account operations.

---

## Required Feature 3 — Search & Pagination for Admin Users

Improve `/admin/users` so it works beyond a small demo dataset.

### Required Controls

Add:

- Search input
- Role filter: all / user / admin
- Page size selector: 10 / 25 / 50
- Previous / next pagination
- Visible result count or range

### Search Fields

Search should match at least:

- email
- full_name

### Backend

Update the admin users API to support query parameters such as:

```text
/api/admin/users?search=abc&role=admin&page=1&pageSize=25
```

Return:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 25,
  "total": 100,
  "totalPages": 4
}
```

Use Supabase range/count where appropriate.

---

## Required Feature 4 — Search & Pagination for Admin Devices

Improve `/admin/devices` similarly.

### Required Controls

Add:

- Search input
- Device type filter
- Status filter
- Page size selector: 10 / 25 / 50
- Previous / next pagination
- Visible result count or range

### Search Fields

Search should match at least:

- device_name
- device_identifier
- owner email/full_name if possible

### Backend

Update admin devices API to support query parameters such as:

```text
/api/admin/devices?search=vehicle&type=mobile_phone&status=active&page=1&pageSize=25
```

Return the same paginated shape:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 25,
  "total": 100,
  "totalPages": 4
}
```

---

## Required Feature 5 — Client UX Requirements

The admin UX must be practical and safe.

### Create User UX

After successful user creation, show a result panel/dialog containing:

- email
- full name
- role
- temporary password

Add a clear warning:

```text
Copy this password now. It will not be shown again.
```

Add a copy-to-clipboard button if simple to implement.

### Reset Password UX

After reset, show:

- target email
- new temporary password
- copy-to-clipboard button
- one-time visibility warning

### Loading/Error States

Every mutation should show:

- loading state
- success state
- error state

Do not crash the page on API failure.

---

## Required Feature 6 — Logging

Add these action types to the existing type definitions if applicable:

- `ADMIN_AUTH_USER_CREATED`
- `ADMIN_AUTH_PASSWORD_RESET`

Write logs for both operations.

Do not log passwords.

---

## Required Feature 7 — Documentation Update

Update `README.md` and/or relevant docs with:

1. How admin user creation works.
2. How temporary passwords are handled.
3. How to promote/demote users.
4. Security note that service-role operations are server-only.
5. Current limitations.

Keep documentation concise.

---

## Security Requirements

The following must be true after implementation:

- Non-authenticated users get `401` from admin APIs.
- Authenticated non-admin users get `403` from admin APIs.
- Service-role key is only imported/used in server-side files.
- No client component imports server admin Supabase client.
- Passwords are never stored in database rows.
- Passwords are never written to logs.
- Passwords are returned only in the immediate create/reset response.
- Admin cannot accidentally demote themselves if the existing guard already prevents it.

---

## Verification Commands

At the end, run:

```bash
npm run lint
npm run build
```

Also perform a dev smoke test if possible:

```bash
npm run dev
```

Smoke test the following manually or via curl where possible:

- unauthenticated admin API call returns 401
- non-admin admin API call returns 403 if easy to validate
- admin create user returns a created profile and one-time password
- admin reset password returns one-time password
- admin user list pagination returns correct response shape
- admin device list pagination returns correct response shape
- `/admin/users` page renders
- `/admin/devices` page renders

---

## Acceptance Criteria

This task is complete when:

- Admin can create a real Supabase Auth user from `/admin/users`.
- Admin can assign role during creation.
- Admin sees initial temporary password once.
- Admin can reset a user's password and see the new temporary password once.
- Admin users table supports search/filter/pagination.
- Admin devices table supports search/filter/pagination.
- Existing device and detection flows still work.
- Lint passes.
- Build passes.
- No service-role logic leaks to client components.
- Final report includes files changed and suggested manual commit message.

---

## Final Report Format

At the end, report:

1. What you implemented
2. Files changed
3. API routes added/modified
4. Security checks added/verified
5. Commands run
6. Verification result
7. Known limitations
8. Recommended next task
9. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
