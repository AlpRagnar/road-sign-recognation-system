# TASK 016 — Final QA, Production Readiness & Academic Documentation Pack

## Role

You are a senior full-stack engineer and technical documentation reviewer working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase project.

The project is an AI-Based Traffic Sign Detection, Localization and Map Dashboard System. It already has MVP functionality, admin management, AI integration hardening, signed image storage, analytics, cron automation, storage maintenance, demo seed tools, and presentation mode.

Your task is **not** to rebuild the project and **not** to add major product features. Your task is to perform a final stabilization, QA, production-readiness review, and create a complete academic/project documentation pack that can be used for university submission and presentation.

## Critical Rules

- Do NOT create git commits.
- Do NOT run `git commit`.
- Do NOT run `git push`.
- Do NOT deploy.
- Do NOT rebuild the project from scratch.
- Do NOT remove existing working features.
- Do NOT add unrelated product features.
- Keep code changes minimal and targeted.
- Prefer documentation, validation, small fixes, and final polish.
- If you find a real breaking issue, fix it with the smallest safe change.
- If a larger architectural change is needed, document it as a future improvement instead of implementing it now.
- At the end, provide a final report and a suggested manual commit message.

## Current Project State

The project already includes:

- Supabase Auth login and protected routes
- Admin/user roles
- Device registration and management
- Detection sessions with camera + GPS
- Frame upload pipeline
- External AI model API integration with mock/external/auto modes
- Timeout/retry/validation/normalization for AI responses
- Signed/private storage URL flow
- Detection event detail pages with image + bounding box overlay
- Traffic sign grouping/localization
- Static signs map with markers/cluster/density modes
- Live device map
- Admin logs/review pages
- Admin users/devices management
- Admin Auth user creation and reset password
- Admin AI health/self-test/observability dashboard
- AI analytics RPCs and time-series
- Daily metrics snapshots
- Cron-protected maintenance endpoints
- Storage reconciliation and quarantine-first cleanup
- Demo seed/status/clear APIs
- Presentation mode and demo runbook

## Main Goal

Prepare the project for final delivery.

The final state should include:

1. Clean lint/build/type-check.
2. Verified environment documentation.
3. Verified Supabase migration order and application instructions.
4. A clear production readiness checklist.
5. A clear final smoke-test checklist.
6. A clear demo run checklist.
7. A clear academic system architecture document.
8. A project report skeleton suitable for university submission.
9. A final feature inventory and API/database inventory.
10. A concise risk/limitation/future-work document.

## Step 1 — Repository Review

Inspect the current repository structure and identify all important files and directories, especially:

- `package.json`
- `.env.example`
- `README.md`
- `docs/`
- `supabase/migrations/`
- `supabase/README.md`
- `src/app/`
- `src/components/`
- `src/lib/`
- `middleware.ts`

Check whether any generated Task markdown files in the repo root should be ignored by final docs or listed as development history.

Do not delete user-created task files unless they are clearly duplicate/generated junk and deletion is safe.

## Step 2 — Final Static Verification

Run:

```bash
npm run lint
npm run build
```

If there is a dedicated type-check script, run it too. If not, rely on Next.js build type-check.

If issues appear:

1. Read the exact error.
2. Fix the smallest possible issue.
3. Re-run the failing command.
4. Continue until clean or document the blocker precisely.

Do not ignore TypeScript errors.

## Step 3 — Environment Variable Audit

Audit all environment variable usage in the codebase.

Compare actual code usage against `.env.example`, `README.md`, and docs.

At minimum verify/document these groups:

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

### AI model

- `AI_MODEL_MODE`
- `AI_MODEL_API_URL`
- `AI_MODEL_API_KEY`
- `AI_MODEL_TIMEOUT_MS`
- `AI_MODEL_MAX_RETRIES`
- `AI_MODEL_RETRY_BACKOFF_MS`
- `AI_FAILURE_RATE_WARNING_PERCENT`
- `AI_TIMESERIES_BUCKET_MINUTES`

### App/config

- `NEXT_PUBLIC_APP_URL`
- `SIGNED_IMAGE_URL_TTL_SECONDS`
- `SIGN_MATCH_RADIUS_METERS`
- `MIN_GROUPING_CONFIDENCE`
- `DASHBOARD_ANALYTICS_SOURCE`
- `DAILY_METRICS_DEFAULT_DAYS`

### Cron/storage/demo

- `CRON_SECRET`
- `CRON_DAILY_METRICS_ENABLED`
- `CRON_STORAGE_RECONCILIATION_ENABLED`
- `CRON_STORAGE_RECONCILIATION_MAX_FOLDERS`
- `CRON_STORAGE_RECONCILIATION_MAX_FILES_PER_FOLDER`
- `SNAPSHOT_GAP_WARNING_DAYS`
- `STORAGE_QUARANTINE_GRACE_DAYS`
- `STORAGE_QUARANTINE_DELETE_BATCH_LIMIT`
- Any other STORAGE/DEMO variables actually used by code

Make sure `.env.example` contains every variable used by code, with safe placeholder values and short comments.

## Step 4 — Supabase Migration and Setup Audit

Inspect `supabase/migrations/` and verify the order and purpose of each migration.

Expected migration history:

- `0001_init.sql`
- `0002_secure_image_paths.sql`
- `0003_backfill_image_paths.sql`
- `0004_analytics_rpc.sql`
- `0005_storage_quarantine.sql`
- `0006_daily_metrics_snapshots.sql`

If migrations differ, document actual order.

Update or create a final setup section explaining:

1. How to create a Supabase project.
2. How to run migrations in order.
3. How to create the private storage bucket.
4. How to configure Auth.
5. How to create the first admin.
6. How to configure environment variables.
7. How to run locally.
8. How to enable demo data.
9. How to configure cron.
10. How to connect a real AI model server.

## Step 5 — Route/API Inventory

Create or update documentation listing the key pages and APIs.

Minimum page inventory:

- `/login`
- `/dashboard`
- `/devices`
- `/detection`
- `/detections/[id]`
- `/map/signs`
- `/map/devices`
- `/presentation`
- `/admin/logs`
- `/admin/review`
- `/admin/detections`
- `/admin/devices`
- `/admin/users`
- `/admin/ai`
- `/admin/storage`
- `/admin/analytics`
- `/admin/demo`

Minimum API inventory:

- Auth/session-related routes if present
- Detection session routes
- Frame route
- Detection detail route
- Map routes
- Admin users/devices routes
- Admin detections/review routes
- Admin AI routes
- Admin storage routes
- Admin metrics routes
- Demo routes
- Cron routes
- Image signing route
- CSV export routes

For each route, document:

- Purpose
- Auth level: public / authenticated / owner-or-admin / admin / cron-secret
- Main data touched
- Notes or limitations

## Step 6 — Final Academic Architecture Document

Create or update:

```text
docs/FINAL_SYSTEM_ARCHITECTURE.md
```

It should be written in clear academic/technical English and include:

1. Project objective
2. System overview
3. Main actors
4. End-to-end data flow
5. Frontend architecture
6. Backend/Supabase architecture
7. AI model integration architecture
8. Localization and duplicate grouping algorithm
9. Storage security and signed URL design
10. Admin observability and analytics
11. Demo/presentation mode
12. Security model
13. Scalability considerations
14. Known limitations
15. Future work

Include ASCII diagrams where useful. Do not use Mermaid unless the project already supports Mermaid rendering.

## Step 7 — University Report Skeleton

Create:

```text
docs/ACADEMIC_REPORT_OUTLINE.md
```

This should be a ready-to-write university report outline.

Include sections such as:

1. Abstract
2. Introduction
3. Problem Statement
4. Motivation
5. Related Work placeholder
6. System Requirements
7. System Architecture
8. Methodology
9. AI Model Integration
10. Geolocation and Localization Method
11. Database Design
12. User Interface Design
13. Security and Access Control
14. Testing and Validation
15. Results and Discussion
16. Limitations
17. Future Work
18. Conclusion
19. References placeholder
20. Appendix suggestions

For each section, add bullet points describing what the student should write.

Do not invent scientific citations. Add placeholders like `[Reference needed]` where references should be added.

## Step 8 — Production Readiness Checklist

Create:

```text
docs/PRODUCTION_READINESS_CHECKLIST.md
```

Include checklist sections:

- Environment variables
- Supabase database
- Supabase Auth
- Supabase Storage
- RLS/security
- AI model server
- Cron jobs
- Admin users
- Logging/observability
- Data retention
- Performance/scalability
- Deployment
- Post-deployment verification

Use markdown checkboxes.

Be direct about what is already implemented vs what must be configured manually.

## Step 9 — Final Smoke Test Plan

Create:

```text
docs/FINAL_SMOKE_TEST_PLAN.md
```

Include a step-by-step test plan:

1. Fresh install/build test
2. Supabase migration test
3. First admin creation
4. Demo seed test
5. Login/dashboard test
6. Device registration test
7. Detection mock flow test
8. Sign map test
9. Detection detail/bbox test
10. Admin detections review test
11. AI health/self-test test
12. Signed image refresh test
13. Analytics snapshot test
14. Storage reconciliation/quarantine test
15. Cron endpoint auth test
16. CSV export test
17. Presentation flow test

For each test, provide expected result and common failure hints.

## Step 10 — Final Feature Inventory

Create:

```text
docs/FEATURE_INVENTORY.md
```

Group features under:

- Authentication & authorization
- Device management
- Detection pipeline
- AI integration
- Traffic sign localization
- Maps
- Admin operations
- Storage security
- Analytics
- Cron/maintenance
- Demo/presentation
- Documentation

This file will help the user explain the project quickly.

## Step 11 — Minimal Code Polish Only If Needed

Only if you find obvious small issues during inspection, fix them.

Examples of acceptable small fixes:

- broken README link
- stale route name in docs
- missing env var in `.env.example`
- typo causing user confusion
- route documented incorrectly
- build/lint failure
- small UI label mismatch

Examples of unacceptable scope creep:

- adding new major pages
- redesigning the UI
- replacing Leaflet/Map logic
- introducing new chart libraries
- changing auth architecture
- adding PostGIS
- changing database schema unless essential for docs/test stability

## Step 12 — Final Validation

Run again:

```bash
npm run lint
npm run build
```

Then report results.

## Expected Deliverables

At minimum, produce/update these files:

```text
docs/FINAL_SYSTEM_ARCHITECTURE.md
docs/ACADEMIC_REPORT_OUTLINE.md
docs/PRODUCTION_READINESS_CHECKLIST.md
docs/FINAL_SMOKE_TEST_PLAN.md
docs/FEATURE_INVENTORY.md
```

Optionally update:

```text
README.md
supabase/README.md
.env.example
```

Do not create PDF/DOCX unless explicitly requested.

## Final Report Format

At the end, report:

1. Commands run
2. Files created/modified
3. Documentation created
4. Code/config fixes made, if any
5. Final lint/build result
6. Remaining risks/limitations
7. Recommended next step
8. Suggested manual git commit message

## Suggested Manual Commit Message Format

Use this structure:

```text
chore(docs): final QA, production readiness and academic documentation pack

Add final architecture, academic report outline, production readiness checklist,
smoke test plan, and feature inventory. Audit env/migration/setup documentation
and verify lint/build remain clean. No functional product scope changes.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

Remember: no git commit, no git push, no deploy.
