# Supabase setup

## 1. Run the schema

Open the Supabase **SQL Editor** and run `migrations/0001_init.sql`.
(Or, with the Supabase CLI: `supabase db push`.)

This creates all 8 tables, the `handle_new_user` trigger (auto-creates a
`profiles` row on signup), RLS policies, and an `is_admin()` helper.

## 2. Create the Storage bucket

Dashboard → **Storage** → **New bucket**:

- Name: `traffic-sign-frames`
- Public: **OFF (private)** — recommended. The app now stores the storage
  object **path** and serves short-lived **signed URLs** generated server-side
  (default 5 min, `SIGNED_IMAGE_URL_TTL_SECONDS`). A private bucket still works
  end-to-end because the backend signs with the service-role key.
  (A public bucket also works for local dev; signing succeeds either way.)

Frames are stored under:

```
sessions/{sessionId}/{timestamp}-{randomId}.jpg
```

The backend reads/writes via the **service role key**, so no extra storage
policy is required for uploads or signing. Don't add a public read policy in
production — image access is mediated by the app's authenticated APIs.

## 2b. (If migrating an existing project) apply the secure-paths migration

Run `migrations/0002_secure_image_paths.sql`. It adds `detection_events.image_path`
and `traffic_signs.representative_image_path`. Existing rows that stored a public
URL keep working — the app extracts the object path from the old URL when signing.

## 3. Create a user and (optionally) promote to admin

Dashboard → **Authentication** → **Add user** (email + password, "Auto
Confirm" on). The trigger creates a matching `profiles` row.

To make that user an admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## 4. Environment variables

Copy `.env.example` → `.env.local` in the project root and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API (keep secret, server only)

Leave `AI_MODEL_API_URL` blank to use the built-in development mock detector.
