# TASK 007 — AI API Contract Hardening, Retry/Timeout Handling & Model Server Integration Docs

## Context

You are working inside an existing, already implemented and verified Next.js 14 App Router + TypeScript + Tailwind + Supabase project for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The project already includes:

- Supabase Auth and protected routes
- Device registration and admin management
- Detection sessions using browser camera + geolocation
- Frame upload pipeline
- Supabase Storage frame uploads
- AI model API integration with mock fallback
- Detection events, traffic sign grouping, weighted localization and auto-verification
- Static sign map, live device map, admin logs/review, CSV export
- Detection detail page with captured image preview, bounding-box overlay and raw AI response viewer

TASK 006 was completed successfully. Your job now is to harden the AI model integration layer so that the system can be connected to a real external model server more safely and predictably.

This is not a rebuild task.

## Primary Goal

Implement a production-ready AI integration layer around the existing model call flow:

1. Define and enforce a clear AI request/response contract.
2. Add timeout and retry handling for external AI requests.
3. Support explicit AI modes: `mock`, `external`, and `auto`.
4. Validate and normalize model responses before saving detections.
5. Add an admin-only AI health-check endpoint/page or panel.
6. Improve logging for AI request success/failure/timeout/invalid-response cases.
7. Document exactly how a real model server must integrate with the app.

The expected result is that the system remains usable in mock mode, but is also ready for a real AI API server without fragile assumptions.

## Critical Rules

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rebuild the MVP from scratch.
- Do NOT replace the existing architecture.
- Do NOT remove the current mock AI behavior.
- Do NOT leak `SUPABASE_SERVICE_ROLE_KEY`, `AI_MODEL_API_KEY`, or any secret to client components.
- Keep service-role and AI API key usage server-side only.
- Prefer small, targeted changes.
- Run `npm run lint` and `npm run build` at the end.
- After completion, provide a concise report and suggested manual commit message.

## Current Assumption

The existing frame pipeline already calls an AI API or mock fallback inside `POST /api/detection/frame`.

You must inspect the current files first. Do not assume exact file names. Likely relevant areas:

- `src/app/api/detection/frame/route.ts`
- any existing AI client/helper files under `src/lib`
- `.env.example`
- `README.md`
- `src/lib/types/database.ts`
- `system_logs` writer/helper
- detection event insert logic
- mock AI logic

## AI Mode Behavior

Implement or verify support for this mode behavior:

### `AI_MODEL_MODE=mock`

- Always use the local mock detector.
- Never call the external model server.
- Useful for local development and classroom demos.

### `AI_MODEL_MODE=external`

- Always call the external model server.
- If `AI_MODEL_API_URL` is missing, return a clear server error.
- Do not silently fall back to mock mode.

### `AI_MODEL_MODE=auto`

- If `AI_MODEL_API_URL` is set, call the external model server.
- If `AI_MODEL_API_URL` is empty, use mock mode.
- This can be the default if the env var is missing.

Update `.env.example` and README accordingly.

## AI Request Contract

Create or document a canonical request payload sent from this app to the model server.

The contract should support at least:

```json
{
  "image_url": "https://.../frame.jpg",
  "image_id": "optional-storage-path-or-id",
  "session_id": "uuid",
  "device_id": "uuid",
  "timestamp": "2026-06-24T12:00:00.000Z",
  "location": {
    "latitude": 57.0488,
    "longitude": 9.9217,
    "accuracy": 8.5,
    "heading": 120.4,
    "speed": 13.2
  },
  "metadata": {
    "source": "web-camera",
    "app": "traffic-sign-mapping-dashboard"
  }
}
```

Do not send secrets in this payload.

If the existing AI server currently expects a different shape, preserve backward compatibility where reasonable, but clearly document the canonical contract.

## AI Response Contract

Normalize external responses to this internal shape before saving:

```json
{
  "detections": [
    {
      "class_id": 14,
      "class_name": "Speed Limit 50",
      "confidence": 0.92,
      "bbox": {
        "x": 120,
        "y": 80,
        "width": 64,
        "height": 64
      }
    }
  ],
  "processing_time_ms": 180,
  "model_version": "optional-model-version",
  "raw": {}
}
```

The external server may return either exactly this shape or a compatible variant. Implement response normalization where appropriate.

Required validation rules:

- `detections` must be an array.
- `confidence` must be a finite number between 0 and 1.
- `class_name` must be a non-empty string.
- `class_id` may be number or string but should be normalized consistently for current DB expectations.
- `bbox` is optional, but if present it must have finite numeric `x`, `y`, `width`, `height`.
- Negative bbox width/height should be rejected or normalized safely.
- Missing/invalid detections should not crash the frame pipeline.
- Empty detections should be allowed and logged.

Do not add a heavy validation library unless the project already uses one. A small TypeScript validator is acceptable.

## Timeout and Retry Requirements

Add configurable timeout/retry behavior for the external AI call.

Environment variables:

```env
AI_MODEL_TIMEOUT_MS=15000
AI_MODEL_MAX_RETRIES=1
AI_MODEL_RETRY_BACKOFF_MS=500
```

Behavior:

- Use `AbortController` or equivalent to enforce timeout.
- Retry only on transient failures: timeout, network failure, HTTP 429, HTTP 502, HTTP 503, HTTP 504.
- Do not retry on validation errors or HTTP 400/401/403.
- Include total AI response time in the frame response and saved event metadata if currently supported.
- If all external attempts fail in `external` mode, return a clear failure response to the frontend without saving fake detections.
- If all external attempts fail in `auto` mode, do NOT silently switch to mock after a failed external call. `auto` only chooses mock when no external URL is configured.

## Logging Requirements

Use the existing `system_logs` mechanism. Add log action names in TypeScript types if needed.

Add useful logs for:

- `AI_REQUEST_STARTED`
- `AI_REQUEST_SUCCEEDED`
- `AI_REQUEST_FAILED`
- `AI_REQUEST_TIMEOUT`
- `AI_RESPONSE_INVALID`
- `AI_MOCK_USED`
- `AI_HEALTH_CHECK_RUN`

Do not log full secrets or request headers.

For errors, log safe metadata only:

- status code
- attempt count
- elapsed time
- error category
- sanitized message
- model URL hostname if useful, not full URL with tokens

## Admin AI Health Check

Add a small admin-only way to check model connectivity.

Acceptable implementation options:

Option A — API only:

- `GET /api/admin/ai/health`

Option B — API + UI panel/page:

- `GET /api/admin/ai/health`
- `/admin/ai` page showing AI mode, configured URL status, timeout, retry settings, and health-check result

Prefer Option B if it fits the existing app structure.

Health check behavior:

- Requires authenticated admin.
- Returns 401 unauthenticated, 403 non-admin.
- In `mock` mode, report `mode: mock`, `externalConfigured: false/true`, and `status: mock-ready`.
- In `external` or `auto` with URL configured, perform a lightweight check.
- If the model server exposes `/health`, try that first if safe/easy.
- If no health endpoint is known, perform a safe non-invasive check such as a HEAD/GET to the configured base URL, with timeout.
- Do not send image frames from health check unless the existing integration already supports a dedicated test endpoint.
- Log the health check result using `system_logs`.

## Frontend Frame Failure UX

Review the detection session UI and result/error handling.

If an AI call fails, the UI should show a clear non-crashing message such as:

- `AI model request failed. The frame was uploaded but no detection result was saved.`
- `AI response was invalid. Please check the model server response contract.`
- `AI request timed out after 15000 ms.`

Do not let the detection loop permanently crash because one frame failed.

If the current UI already handles this, preserve it and only refine messages if needed.

## Documentation Requirements

Update or add documentation, preferably in README and/or a dedicated file such as:

- `docs/AI_MODEL_INTEGRATION.md`

The documentation must include:

1. Environment variables.
2. AI mode behavior: `mock`, `external`, `auto`.
3. Request contract.
4. Response contract.
5. Example cURL request to a model server.
6. Example successful response.
7. Example invalid response and why it fails.
8. Timeout/retry behavior.
9. Local mock-mode testing instructions.
10. Production recommendations.

Production recommendations should mention:

- Use HTTPS.
- Keep model API key server-side only.
- Prefer signed frame URLs if the bucket is private.
- Ensure bbox coordinates match the stored frame dimensions.
- Keep response payload small.
- Return stable class names/class IDs.

## Acceptance Criteria

The task is complete when:

- AI integration is centralized or clearly structured.
- `AI_MODEL_MODE=mock` works without external URL.
- `AI_MODEL_MODE=external` fails clearly if external URL is missing.
- `AI_MODEL_MODE=auto` uses external only when URL exists, otherwise mock.
- External AI requests have timeout and retry handling.
- External AI responses are validated/normalized before database writes.
- Invalid AI responses do not crash the frame pipeline.
- Admin can check AI integration health through an authenticated admin endpoint or page.
- Logs capture AI request success/failure/timeout/invalid-response/mock usage.
- `.env.example` includes all new env vars.
- AI integration docs are clear enough for a separate model-server developer.
- `npm run lint` passes.
- `npm run build` passes.
- No git commit, push, or deploy is performed.

## Verification Commands

Run:

```bash
npm run lint
npm run build
```

If possible, run a dev smoke test:

```bash
npm run dev
```

Smoke-test at least:

- unauthenticated `GET /api/admin/ai/health` returns 401
- non-admin returns 403 if you have a test token/profile available
- admin can access `/admin/ai` if you implement the UI page
- mock mode detection still works
- external mode missing URL fails clearly

## Final Report Format

When finished, report:

1. What you implemented
2. Files changed
3. API routes added/modified
4. Environment variables added/changed
5. AI contract summary
6. Security checks
7. Commands run
8. Verification result
9. Known limitations
10. Recommended next task
11. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
