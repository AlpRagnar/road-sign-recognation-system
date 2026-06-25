# TASK 017 — Playwright E2E Smoke Tests, Demo-Seed Validation & CI Readiness

## Context

You are working inside an existing, feature-complete Next.js 14 App Router + TypeScript + Tailwind + Supabase project for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The system already includes:

- Supabase Auth and protected routes
- Role-aware user/admin navigation
- Device registration and management
- Camera/GPS detection sessions
- AI API integration with mock/external/auto modes
- Signed Storage URLs and secure media delivery
- Static sign map, live device map, clustering/density mode
- Detection detail with image preview and bounding box overlay
- Admin logs, reviews, users, devices, storage, AI, analytics, demo tools
- Demo seed/status/clear APIs
- Presentation mode and demo runbook
- Final QA documentation pack
- Clean lint, typecheck, and production build as of TASK 016

The current remaining gap is that there is no automated E2E/integration smoke test suite.

## Main Goal

Add a lightweight Playwright-based E2E smoke test setup and CI-ready validation scripts that can verify the most important application flows without rewriting the application architecture.

This task should make the project automatically testable before final presentation and future commits.

## Critical Rules

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rewrite the architecture.
- Do NOT add new product features beyond testing/support utilities.
- Do NOT expose secrets in logs, tests, fixtures, or screenshots.
- Keep the test suite lightweight and stable.
- Prefer deterministic tests over fragile visual assertions.
- Do not require a real external AI model server; tests should work with mock AI mode.
- Do not require real camera/GPS hardware for CI unless browser mocking is implemented safely.

## Required Output

At the end, the project should have:

1. Playwright installed and configured.
2. A small, useful E2E smoke test suite.
3. Test scripts in `package.json`.
4. A CI-ready validation command.
5. Documentation explaining how to run tests locally.
6. A final report with commands run and results.

## Step 1 — Inspect Existing Project

Inspect:

- `package.json`
- `README.md`
- `.env.example`
- `docs/FINAL_SMOKE_TEST_PLAN.md`
- `docs/DEMO_RUNBOOK.md`
- `src/app`
- `src/app/api/admin/demo/*`
- `src/app/(protected)`
- existing Supabase client/server utilities

Do not modify files until you understand the current auth/demo setup.

## Step 2 — Add Playwright Setup

Install/configure Playwright for a Next.js app.

Expected files may include:

- `playwright.config.ts`
- `tests/e2e/*.spec.ts`
- `tests/e2e/helpers/*`

Add or update scripts in `package.json`, for example:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "validate": "npm run lint && npm run typecheck && npm run build"
}
```

If a `validate` script already exists, preserve it and extend only if appropriate.

## Step 3 — Environment Strategy

Create a safe test environment strategy.

The tests should rely on environment variables rather than hardcoded secrets.

Document the required variables, for example:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`
- optional `E2E_BASE_URL`

Do not commit real credentials.

If admin credentials are missing, tests should fail with a clear message or skip only the tests that truly require auth. Prefer clear failure for CI.

## Step 4 — Auth Helper

Implement a Playwright helper for login.

Recommended approach:

- Open `/login`
- Fill email/password from env
- Submit
- Wait for redirect to `/dashboard`
- Assert dashboard content is visible

Do not bypass Supabase Auth with direct cookie injection unless the project already has a clean, safe helper for this.

## Step 5 — Core Smoke Tests

Create stable tests for the most important pages.

Minimum recommended tests:

### 5.1 Unauthenticated Routing

Assert unauthenticated access redirects or returns unauthorized as expected:

- `/dashboard` redirects to `/login`
- `/admin/analytics` redirects to `/login`
- `/admin/storage` redirects to `/login`
- `/api/admin/ai/health` returns 401
- `/api/cron/daily-maintenance` returns 401 without bearer token

### 5.2 Authenticated Dashboard Smoke

After login:

- `/dashboard` loads
- key KPI/dashboard UI exists
- no visible fatal error boundary

### 5.3 Demo Seed Flow

As admin:

- Open `/admin/demo`
- Check status
- Trigger seed
- Confirm demo status counts are updated
- Do not clear automatically unless the test is explicitly designed to clean up after itself

If seeding live data in CI is risky, implement this test behind an opt-in env var:

- `E2E_ALLOW_DEMO_MUTATIONS=true`

Default should not mutate production-like data.

### 5.4 Presentation Flow

After demo data is present:

- Open `/presentation?presentation=1`
- Assert presentation mode badge is visible
- Assert step cards/links render

### 5.5 Admin Pages Smoke

As admin, verify these pages render:

- `/admin/ai`
- `/admin/analytics`
- `/admin/storage`
- `/admin/demo`
- `/admin/detections`
- `/admin/users`
- `/admin/devices`

Use resilient selectors based on headings/text, not fragile CSS classes.

### 5.6 Map/Dashboard Smoke

Verify:

- `/map/signs` loads without SSR/Leaflet crash
- `/map/devices` loads without SSR/Leaflet crash

Do not require exact marker counts unless demo seed is enabled and deterministic.

### 5.7 Detection Detail Smoke

If demo data has no images, avoid image-specific assumptions.

If an existing detection ID can be discovered through admin detection list or API, open `/detections/[id]` and assert:

- page loads
- metadata section is visible
- image area gracefully handles missing image or signed URL expiry

## Step 6 — Optional Browser Camera/GPS Mock Test

Only if feasible and low-risk, add a separate test for `/detection` that mocks browser permissions and geolocation.

Do not make the main CI suite depend on real camera hardware.

Possible approach:

- grant geolocation permission in Playwright context
- set geolocation coordinates around Aalborg
- mock media devices if simple and stable
- assert page renders, device selector appears, Start button is disabled until device selected

If this becomes fragile, skip camera automation and document manual testing instead.

## Step 7 — CI Readiness

Add a CI-friendly command or documentation section showing the intended order:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

If adding GitHub Actions is low-risk, add `.github/workflows/ci.yml` with:

- install
- lint
- typecheck
- build
- Playwright install
- E2E tests only if required env vars/secrets are available

If GitHub Actions would be too environment-specific, document it but do not add a broken workflow.

## Step 8 — Documentation

Update or create:

- `docs/E2E_TESTING.md`
- README documentation index if needed

Document:

- required env vars
- how to run locally
- how to run headed/UI mode
- how to seed demo data before tests
- how to avoid mutating production data
- known limitations

## Step 9 — Final Verification

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Then run at least the non-mutating Playwright tests if the local environment allows it.

If Playwright cannot run because Supabase credentials/admin credentials are missing, be explicit:

- what was run
- what could not be run
- what env vars are needed

Do not claim tests pass if they were not executed.

## Acceptance Criteria

The task is complete when:

- Playwright config exists.
- At least unauthenticated route/API smoke tests exist.
- Authenticated smoke tests exist and are documented.
- Demo mutation tests are protected behind an explicit opt-in env var.
- `package.json` has clear test scripts.
- `docs/E2E_TESTING.md` exists.
- `npm run lint`, `npm run typecheck`, and `npm run build` are clean.
- The final report clearly states which tests were executed and which require live credentials.

## Final Report Format

Return:

1. What was implemented
2. Files changed
3. Test scripts added
4. E2E tests added
5. Commands run
6. Verification result
7. Tests not run and why, if any
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
