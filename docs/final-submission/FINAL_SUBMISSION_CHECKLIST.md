# Final Submission Checklist

Work top to bottom before submitting/presenting. Boxes are unchecked so you verify each
on your machine/project.

## Code readiness
- [ ] `npm run lint` clean.
- [ ] `npm run typecheck` clean.
- [ ] `npm run build` clean.
- [ ] `npm run validate` (lint + typecheck + build) passes in one command.
- [ ] No stray `console.log`/debug code or secrets in source.

## Supabase readiness
- [ ] Project reachable; migrations `0001`–`0006` applied (in order).
- [ ] Expected tables + analytics RPCs exist.
- [ ] RLS enabled on all tables; maintenance/analytics tables have no client policies.

## Auth readiness
- [ ] Admin user exists and `public.profiles.role = 'admin'`.
- [ ] Login works; protected pages redirect to `/login` when logged out.
- [ ] Admin APIs return 401 (unauthenticated) / 403 (non-admin).

## Storage readiness
- [ ] Bucket `traffic-sign-frames` exists and is **private** (public = false).
- [ ] Images load via signed URLs; **Refresh image** works after expiry.
- [ ] No public read policy on the bucket.

## Demo readiness
- [ ] `AI_MODEL_MODE=mock` for the demo (no external server needed).
- [ ] Demo data seeded via `/admin/demo` (counts visible).
- [ ] Dashboard, sign map, detection detail, admin pages populated.
- [ ] `/presentation?presentation=1` shows badge + guided cards.

## E2E testing readiness
- [ ] Chromium installed: `npx playwright install chromium`.
- [ ] `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` set for authed tests.
- [ ] `E2E_ALLOW_DEMO_MUTATIONS=true` set for demo tests (opt-in).
- [ ] `npm run test:e2e` → suite passes (verified 24/24).

## Report readiness
- [ ] `PROJECT_REPORT_DRAFT.md` reviewed and expanded.
- [ ] All `[Reference needed]` placeholders replaced with real citations.
- [ ] Screenshots captured and placed in the report appendix.
- [ ] No invented benchmark numbers.

## Presentation readiness
- [ ] Slides built from `PRESENTATION_SLIDE_OUTLINE.md`.
- [ ] Screenshots captured for the suggested slides.
- [ ] `DEMO_SCRIPT.md` rehearsed end-to-end once.
- [ ] Backup plans understood (camera/GPS, tiles, missing data, expired URLs).

## Known risks
- [ ] Demo data exists in the connected project — clear it via `/admin/demo` if the
      project is shared/production-like.
- [ ] `AI_MODEL_MODE=auto` with no `AI_MODEL_API_URL` falls back to mock — fine for demo,
      but set `mock` explicitly to be safe.
- [ ] Map tiles depend on internet (OpenStreetMap).
- [ ] Sign matching has no spatial index; large datasets need PostGIS/tiling.

## Final manual commands
```bash
npm run validate
npm run test:e2e
```

## Reminders (security)
- **`.env.local` must never be committed** (it is gitignored — keep it that way).
- The **service-role key** and **CRON_SECRET** are server-only; never expose them to the
  client or in logs/screenshots.
- Use a **non-production** Supabase project for demos, since demo tests/seed write data.
