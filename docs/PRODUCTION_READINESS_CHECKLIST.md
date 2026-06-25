# Production Readiness Checklist

Legend: **[code]** already implemented in the app · **[ops]** must be configured
manually per environment. Boxes are unchecked because they must be verified for
*your* deployment.

## Environment variables
- [ ] **[ops]** All vars from `.env.example` set in the deployment environment.
- [x] **[code]** Centralized, clamped parsing in `src/lib/env.ts`.
- [ ] **[ops]** `SUPABASE_SERVICE_ROLE_KEY`, `AI_MODEL_API_KEY`, `CRON_SECRET` stored as secrets (never in client/build).
- [ ] **[ops]** `NEXT_PUBLIC_APP_URL` set to the real origin.

## Supabase database
- [ ] **[ops]** Migrations `0001`→`0006` applied in order (see `supabase/README.md`).
- [x] **[code]** `handle_new_user` trigger auto-creates `profiles`.
- [ ] **[ops]** Confirm tables, indexes, and RPCs exist after migration.

## Supabase Auth
- [ ] **[ops]** Email/password provider enabled; email confirmation policy chosen.
- [ ] **[ops]** First admin created and promoted (`update profiles set role='admin' …`).
- [x] **[code]** Role-aware routing and admin user provisioning UI (`/admin/users`).

## Supabase Storage
- [ ] **[ops]** Bucket `traffic-sign-frames` created and **private**.
- [x] **[code]** Frames stored by path; signed URLs minted server-side.
- [ ] **[ops]** No public read policy added on the bucket.

## RLS / security
- [x] **[code]** RLS enabled on all tables; maintenance/analytics tables have no client policies.
- [x] **[code]** Admin APIs enforce 401/403; cron APIs enforce bearer secret.
- [x] **[code]** Service-role / AI key / cron secret are server-only (no client imports).
- [ ] **[ops]** Spot-check that anon key cannot read other users' rows.

## AI model server
- [x] **[code]** `mock | external | auto` modes; timeout/retry; contract validation.
- [ ] **[ops]** For real use: set `AI_MODEL_MODE=external`, `AI_MODEL_API_URL`, `AI_MODEL_API_KEY` over HTTPS.
- [ ] **[ops]** Model returns stable class names/ids and bbox matching stored frame size.
- [ ] **[ops]** Run `/admin/ai` health check + self-test against the real server.

## Cron jobs
- [x] **[code]** `/api/cron/daily-metrics-snapshot`, `/storage-reconciliation`, `/daily-maintenance` (bearer-protected; reconciliation never deletes).
- [ ] **[ops]** `CRON_SECRET` set; scheduler configured (Vercel/Supabase/external) — see `docs/CRON_AUTOMATION.md`.
- [ ] **[ops]** `CRON_*_ENABLED` flags set as desired.

## Admin users
- [ ] **[ops]** At least one admin exists; admin count reviewed.
- [x] **[code]** Self-demotion guard; admin can create/reset users.

## Logging / observability
- [x] **[code]** `system_logs` audit trail (safe metadata only).
- [x] **[code]** AI observability dashboard + failure-rate threshold alert.
- [ ] **[ops]** Decide retention for `system_logs` / `device_location_logs`.

## Data retention
- [x] **[code]** Daily snapshots persist KPIs beyond raw-log lifetime.
- [x] **[code]** Quarantine-first storage cleanup with grace period.
- [ ] **[ops]** Define pruning policy for old events/logs/frames.

## Performance / scalability
- [x] **[code]** DB-side analytics RPCs; capped scans; pagination on admin tables.
- [ ] **[ops]** Add spatial index/PostGIS and server-side map tiling if dataset is large.
- [ ] **[ops]** Load-test the frame pipeline for expected concurrency.

## Deployment
- [ ] **[ops]** `npm run build` succeeds in CI with production env.
- [ ] **[ops]** Host supports Node runtime route handlers and image sizes.
- [ ] **[ops]** HTTPS enforced (required for camera/GPS and signed URLs).

## Post-deployment verification
- [ ] **[ops]** Run `docs/FINAL_SMOKE_TEST_PLAN.md` end to end.
- [ ] **[ops]** Confirm unauthenticated admin APIs → 401 and cron without secret → 401/500.
- [ ] **[ops]** Confirm a real detection produces an event + grouped sign + signed image.
- [ ] **[ops]** Confirm a daily snapshot can be created and appears in `/admin/analytics`.
