# End-to-End Testing (Playwright)

A lightweight Playwright smoke suite that verifies the most important flows
without rewriting the app. Tests live in `tests/e2e/` and are split by the
environment they need.

## Test files

| File | Needs | What it checks |
| --- | --- | --- |
| `unauth.spec.ts` | running app only | Protected pages redirect to `/login`; admin & map APIs return **401**; cron route rejects no/query-string secret. |
| `authed.spec.ts` | admin credentials | Dashboard KPIs; every admin page renders; Leaflet maps mount; `/presentation` badge + cards; `/detection` renders with camera/GPS mocked. |
| `demo.spec.ts` | admin creds **+** `E2E_ALLOW_DEMO_MUTATIONS=true` | Seeds demo data, asserts status counts increase, sign map + detection detail populate. |

Tests skip cleanly (with a clear message) when their required env vars are absent.

## Required environment variables

The app server (started by Playwright via `npm run dev`) needs working Supabase
config; the tests additionally need admin credentials for the authenticated suite.

```bash
# App (server) — same as normal local dev
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AI_MODEL_MODE=mock              # no external AI server needed

# E2E auth (an existing admin user in your Supabase project)
E2E_ADMIN_EMAIL=admin@example.com
E2E_ADMIN_PASSWORD=********

# Opt-in: allow demo-seed tests to create/refresh demo-marked rows
E2E_ALLOW_DEMO_MUTATIONS=true   # default: unset → demo tests skip

# Optional: test against an already-running server instead of `npm run dev`
E2E_BASE_URL=http://localhost:3000
```

Never hardcode or commit real credentials. Put them in `.env.local` (gitignored)
or your CI secret store.

## Running locally

```bash
# 1) one-time: download the Chromium browser binary
npx playwright install chromium      # or: --with-deps on Linux/CI

# 2) run the suite (Playwright auto-starts `npm run dev` unless E2E_BASE_URL is set)
npm run test:e2e

# unauthenticated tests only (no credentials needed)
npm run test:e2e -- unauth.spec.ts

# interactive / headed
npm run test:e2e:ui
npm run test:e2e:headed
```

If `E2E_BASE_URL` is unset, Playwright launches the dev server itself and reuses
an already-running one when present.

## Seeding demo data before tests

The authenticated suite renders fine on an empty database (counts may be zero).
For richer assertions (sign map markers, detection detail), seed first:

- In the UI: log in as admin → **Admin → Demo Tools** (`/admin/demo`) → **Seed demo data**, or
- Run the opt-in demo test: `E2E_ALLOW_DEMO_MUTATIONS=true npm run test:e2e -- demo.spec.ts`.

## Avoiding production-data mutation

- `unauth.spec.ts` and `authed.spec.ts` are **read-only** (navigation + GET assertions).
- Only `demo.spec.ts` writes, and only when `E2E_ALLOW_DEMO_MUTATIONS=true`. It
  touches **demo-marked** rows only; clear them afterwards from `/admin/demo`.
- Never point these tests at a production project with real data.

## CI order

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npm run test:e2e            # runs unauth always; authed/demo only if env present
```

A sample workflow is provided at `.github/workflows/ci.yml` (E2E runs only when
the relevant secrets are configured).

## Known limitations

- Camera/microphone are faked via Chromium flags (`--use-fake-*-for-media-stream`)
  and geolocation is injected (Aalborg); a full capture→AI→save flow is **not**
  automated — exercise it manually (see `docs/FINAL_SMOKE_TEST_PLAN.md`).
- Demo detections have null image paths, so detection-detail image assertions are
  intentionally tolerant.
- Tests assert presence/structure, not pixel-level visuals, to stay stable.
- The authenticated suite needs a pre-existing admin account; tests do not create
  Auth users.
