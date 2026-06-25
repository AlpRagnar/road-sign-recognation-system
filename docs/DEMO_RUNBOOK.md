# Demo Runbook

How to set up, seed, present, and reset the Traffic Sign Mapping system for a
university demo.

## 1. Environment setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase values (see below)
npm run dev                  # http://localhost:3000
```

## 2. Required migrations (Supabase SQL editor, in order)

- `0001_init.sql` — core schema, RLS, profile trigger
- `0002_secure_image_paths.sql` — image path columns
- `0003_backfill_image_paths.sql` — legacy URL → path backfill (optional)
- `0004_analytics_rpc.sql` — AI/dashboard analytics RPCs
- `0005_storage_quarantine.sql` — quarantine tables
- `0006_daily_metrics_snapshots.sql` — daily snapshot table + RPC

Also create the **private** Storage bucket `traffic-sign-frames`.

## 3. Required env vars (minimum for a demo)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `AI_MODEL_MODE=mock` (no external model server needed for the demo)
- Optional: `CRON_SECRET` (only if demoing cron endpoints)

Create an admin: add a user in Supabase Auth, then
`update public.profiles set role='admin' where email='you@example.com';`

## 4. Seed demo data

1. Log in as an admin.
2. Go to **Admin → Demo Tools** (`/admin/demo`).
3. Click **Seed demo data** (or *Refresh* — it clears then re-seeds).
4. Counts appear: ~4 devices, 6 sessions, ~120 detections, 35 signs, ~120
   observations, ~80 location logs, AI logs, and ~7 daily snapshots.

Demo data is owned by your admin profile and marked so it can be removed later.

## 5. Clear demo data

On `/admin/demo`, click **Clear demo data** (confirm). Only demo-marked rows are
removed (demo devices `DEMO-*` and everything linked to them, demo `system_logs`,
and the snapshot dates the seed created). Real records are untouched.
> The Clear button is hidden in presentation mode.

## 6. Run locally

`npm run dev` → open `http://localhost:3000`. Camera + GPS require `localhost`
(or HTTPS). Use Chrome/Edge and allow permissions when prompted.

## 7. Demo flow (recommended order)

Open **Presentation** (`/presentation`) — it turns on presentation mode and shows
guided cards. Go through:

1. **Dashboard** — KPI cards, verification breakdown, top sign types, recent detections.
2. **Detection** — pick a device, Start, show camera + GPS + live results (mock AI).
3. **Sign Map** — toggle Markers / Clustered / Density; click a marker → detail panel → "View latest detection".
4. **Detection detail** — metadata, location, device/user, AI response JSON, bounding-box overlay (demo rows have no image → "No image captured").
5. **Admin AI** — run health check; run a self-test; show activity summary, failure breakdown, time-series.
6. **Admin Analytics** — latest snapshot KPIs, trend bars, snapshot-coverage gap warning; "Create / refresh today".
7. **Admin Storage** — quarantine reconciliation + run history; explain nothing is auto-deleted (grace-period, admin-reviewed).

## 8. What to show on each page

- *Dashboard*: "all metrics come from a DB-side RPC with a JS fallback."
- *Sign Map*: "raw detections are grouped into an optimized sign inventory."
- *Detection detail*: "signed image URLs + bounding-box overlay; refreshable."
- *Admin AI*: "mock/external/auto modes, timeout/retry, validated contract, observability."
- *Analytics*: "durable daily snapshots survive log pruning; cron can refresh them."
- *Storage*: "quarantine-first cleanup with grace period; reconciliation is scheduled-friendly."

## 9. Common issues & fixes

- **Camera/GPS blocked** → must be `localhost` or HTTPS; allow browser permissions.
- **Images show "failed to load"** → signed URLs expire; click **Refresh image** (detection detail / sign panel). Demo rows intentionally have no image.
- **AI calls fail** → ensure `AI_MODEL_MODE=mock` for the demo (no external server needed).
- **Images 404 / bucket errors** → the bucket must exist and be private; the app signs URLs server-side.
- **Cron endpoints 500** → `CRON_SECRET` is unset; set it only if demoing `/api/cron/*`.
- **Analytics/AI empty** → seed demo data first (`/admin/demo`).

## 10. Pre-presentation checklist

- [ ] Migrations 0001–0006 applied; `traffic-sign-frames` bucket exists (private).
- [ ] Admin user created and promoted.
- [ ] `AI_MODEL_MODE=mock`.
- [ ] Demo data seeded (`/admin/demo`).
- [ ] Visited `/presentation` and each step loads without errors.
- [ ] Browser camera/GPS permissions granted (for the live detection step).
- [ ] Plan to **Clear demo data** afterwards if this is a shared environment.
