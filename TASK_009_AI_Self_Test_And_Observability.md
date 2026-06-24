# TASK 009 — AI Model Contract Self-Test, AI Log Analytics & Admin Observability

## Context

You are working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase MVP for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The project already includes:

- Supabase Auth and role-aware protected routes.
- Device registration and admin device/user management.
- Detection sessions using browser camera + geolocation.
- Frame upload pipeline.
- External/mock AI model integration.
- AI request/response contract validation and normalization.
- AI timeout/retry handling.
- Admin AI health page.
- Signed Storage URLs and private-bucket-ready image delivery.
- Detection detail with image preview and bounding-box overlay.
- Admin detection review, map analytics, CSV export and dashboard analytics.

TASK 008 has just switched image handling to secure signed URLs. TASK 009 must build on top of the current repo. Do not rebuild the MVP.

## Goal

Implement an admin-facing AI observability and model-contract self-test layer.

The system must allow an admin to:

1. See recent AI integration health and failure analytics.
2. Run a model-contract self-test against the configured AI server without creating real detection events or traffic signs.
3. Inspect recent AI system logs in a structured way.
4. Quickly understand whether failures are caused by configuration, timeout, network, HTTP errors, invalid response contract, or model-side issues.

This task should improve operational confidence and project demonstration quality.

## Critical Rules

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rebuild the existing MVP from scratch.
- Do NOT add unrelated features.
- Do NOT break mock mode.
- Do NOT store API keys, signed URLs, request headers, bearer tokens, or secrets in logs.
- Do NOT create real `detection_events`, `traffic_signs`, or `traffic_sign_observations` during self-test.
- Keep changes minimal, consistent with the existing architecture, and TypeScript-safe.
- Prefer reusing the existing AI layer under `src/lib/ai/`.
- Preserve all existing routes and behavior.
- At the end, run lint/build and provide a final report plus manual commit message.

## Main Features to Implement

### 1. Admin AI Observability Dashboard Enhancements

Enhance the existing `/admin/ai` page.

It should show:

- Current AI mode: `mock`, `external`, or `auto`.
- Whether `AI_MODEL_API_URL` is configured.
- Hostname only, never full URL with paths/tokens.
- Timeout/retry settings:
  - `AI_MODEL_TIMEOUT_MS`
  - `AI_MODEL_MAX_RETRIES`
  - `AI_MODEL_RETRY_BACKOFF_MS`
- Existing health-check result.
- Recent AI activity summary.

Recent AI activity summary should include at least:

- total AI requests in selected time window
- success count
- failure count
- timeout count
- invalid response count
- mock-used count
- average elapsed time where available
- latest success time
- latest failure time
- failure rate percentage

Suggested time-window filters:

- Last 1 hour
- Last 24 hours
- Last 7 days

Use existing `system_logs` entries from TASK 007 where possible.

Expected log actions may include:

- `AI_REQUEST_STARTED`
- `AI_REQUEST_SUCCEEDED`
- `AI_REQUEST_FAILED`
- `AI_REQUEST_TIMEOUT`
- `AI_RESPONSE_INVALID`
- `AI_MOCK_USED`
- `AI_HEALTH_CHECK`

Use exact action names that currently exist in the repo. Inspect `src/lib/types/database.ts` before implementation.

### 2. Recent AI Log Table

On `/admin/ai`, add a recent AI logs table.

The table should show:

- timestamp
- action type
- category/status
- attempts
- elapsed ms
- safe message
- session id if present
- device id if present

Add filters:

- action type
- category/status
- time window

Keep it lightweight and paginated if there may be many logs.

Do not expose raw secrets, full URLs, headers, signed URLs, or API keys.

### 3. AI Model Contract Self-Test

Add an admin-only self-test feature on `/admin/ai`.

The self-test should validate the configured AI server contract without polluting production detection data.

The self-test should support at least one of the following approaches. Prefer implementing both if simple, but one robust approach is enough:

#### Option A — Upload Test Image

Admin uploads a test image from the browser.

Flow:

1. Admin selects an image file.
2. Client posts it to an admin-only API route.
3. Server uploads it to the existing Storage bucket under a safe path such as:

```text
ai-self-tests/{adminProfileId}/{timestamp}-{random}.jpg
```

4. Server creates a short-lived signed URL.
5. Server builds a canonical AI request using the existing AI contract utilities.
6. Server calls the AI layer in external/mock/auto mode depending on current env.
7. Server validates and normalizes the response.
8. Server returns the normalized result to the admin UI.
9. Server logs safe self-test events to `system_logs`.

Important:

- Do not create `detection_events`.
- Do not create `traffic_signs`.
- Do not create `traffic_sign_observations`.
- Do not save fake production detections.
- It is acceptable to leave the uploaded self-test object in Storage for MVP, but document this. If simple, delete it after the test.

#### Option B — Use Existing Detection Frame

Admin selects or enters an existing `detection_event.id`.

Flow:

1. Server verifies admin role.
2. Server loads the event and image path.
3. Server signs the image path.
4. Server calls the AI layer with a self-test request.
5. Server returns the normalized result.
6. No production detection data is changed.

This option is useful after real detections already exist.

### 4. Admin API Route for Self-Test

Add a route similar to:

```text
POST /api/admin/ai/self-test
```

Expected behavior:

- 401 if unauthenticated.
- 403 if non-admin.
- Accept either multipart image upload or JSON with existing detection id, depending on the implemented approach.
- Validate input.
- Call the existing AI layer.
- Return structured result:

```json
{
  "ok": true,
  "mode": "external",
  "elapsedMs": 1234,
  "attempts": 1,
  "modelVersion": "...",
  "detections": [
    {
      "class_id": 14,
      "class_name": "Speed Limit 50",
      "confidence": 0.92,
      "bbox": { "x": 120, "y": 80, "width": 64, "height": 64 }
    }
  ],
  "processingTimeMs": 180,
  "message": "Contract self-test passed"
}
```

Failure response example:

```json
{
  "ok": false,
  "category": "validation",
  "attempts": 1,
  "elapsedMs": 900,
  "message": "AI response did not match the expected contract"
}
```

Map HTTP status codes clearly:

- 400 for invalid self-test input.
- 401 unauthenticated.
- 403 non-admin.
- 500 for config/misconfiguration.
- 502 for upstream/model/invalid response issues.
- 504 for timeout.

### 5. Safe System Logging

Add new `system_logs.action_type` values if needed. Since `system_logs.action_type` is free text, no migration should be needed unless the current schema has changed.

Suggested new actions:

- `AI_SELF_TEST_STARTED`
- `AI_SELF_TEST_SUCCEEDED`
- `AI_SELF_TEST_FAILED`

Log safe metadata only:

- mode
- category
- attempts
- elapsedMs
- detection count
- model version if available
- host name only
- admin profile id

Never log:

- API key
- bearer token
- full signed URL
- request headers
- full image URL
- raw payload if it may contain URL/secrets

### 6. UI Requirements for `/admin/ai`

The page should include:

1. Existing AI health panel.
2. New AI activity summary cards.
3. Self-test panel.
4. Self-test result display.
5. Recent AI logs table.

Self-test result display should show:

- status: success/failure
- mode
- elapsed time
- attempts
- model version
- number of detections
- normalized detections table
- validation/failure message if failed

If bbox is present, show numeric bbox values. Do not implement image overlay in this task unless trivial; detection overlay already exists elsewhere.

### 7. Optional: Recent AI Failure Insight

If simple, add a small “Recent Failure Breakdown” section grouped by category:

- config
- timeout
- network
- http
- validation
- unknown

This is useful for demo and report writing.

### 8. Documentation Updates

Update `docs/AI_MODEL_INTEGRATION.md` and/or `README.md`.

Document:

- How to run the AI health check.
- How to run the self-test.
- Difference between health check and self-test:
  - health check checks reachability/configuration
  - self-test validates actual detection contract
- How mock/external/auto modes behave.
- That self-tests do not create production detection records.
- That logs are sanitized.

## Implementation Guidance

### Reuse Existing AI Layer

Before writing new code, inspect:

- `src/lib/ai/client.ts`
- `src/lib/ai/contract.ts`
- `src/lib/env.ts`
- `src/app/api/detection/frame/route.ts`
- `src/app/api/admin/ai/health/route.ts`
- `src/components/AdminAiHealthClient.tsx`
- `src/app/(protected)/admin/ai/page.tsx`
- `src/lib/storage/signed-urls.ts`
- `src/lib/system-logs` or wherever `writeSystemLog` exists

Do not duplicate AI response normalization logic. Use existing helpers.

### Storage Handling

Use the signed URL helper introduced in TASK 008.

For uploaded self-test images:

- Store only object path internally.
- Do not return long-lived public URLs.
- Do not log signed URLs.
- If deletion is easy and safe, remove the self-test file after the AI call. If not, document that self-test images remain under `ai-self-tests/`.

### Type Safety

Add or update TypeScript types for:

- AI observability summary
- AI log row
- self-test response
- self-test detection result

Avoid `any`. If parsing unknown JSON, use `unknown` and narrow safely.

## Verification Requirements

Run:

```bash
npm run lint
npm run build
```

Also run a dev smoke test if possible:

```bash
npm run dev
```

Verify:

- `/admin/ai` unauthenticated redirects to login.
- `GET /api/admin/ai/health` unauthenticated returns 401.
- `POST /api/admin/ai/self-test` unauthenticated returns 401.
- Non-admin receives 403 for admin APIs.
- Client components do not import service-role, auth.admin, AI_MODEL_API_KEY, or server-only helpers.
- No signed URLs/API keys are logged or exported.

## Acceptance Criteria

The task is complete when:

- `/admin/ai` shows health + observability + recent AI logs.
- Admin can run a model-contract self-test.
- Self-test does not create production detection records.
- AI failures are categorized clearly.
- Safe logs are written.
- Lint and build pass.
- Documentation is updated.
- No git commit, push, or deploy is performed.

## Final Report Format

At the end, report:

1. What was implemented
2. Files changed
3. API routes added/modified
4. Logging changes
5. Security checks
6. Commands run
7. Verification result
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
