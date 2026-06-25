# AI Model Integration Guide

This document describes how an external traffic-sign detection model server
integrates with the app. The app treats the model as an **external HTTP
service**; all model calls happen **server-side** inside
`POST /api/detection/frame` (never from the browser).

Implementation lives in:

- `src/lib/ai/contract.ts` — request builder, response validation/normalization, mode resolution
- `src/lib/ai/client.ts` — `runDetection()` (timeout + retry) and `checkAiHealth()`

## 1. Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `AI_MODEL_API_URL` | _(empty)_ | Detection endpoint (POST). |
| `AI_MODEL_API_KEY` | _(empty)_ | Bearer token sent as `Authorization: Bearer <key>`. **Server-only.** |
| `AI_MODEL_MODE` | `auto` | `mock` \| `external` \| `auto` (`live` = legacy alias for `external`). |
| `AI_MODEL_TIMEOUT_MS` | `15000` | Per-request timeout (ms). |
| `AI_MODEL_MAX_RETRIES` | `1` | Extra attempts on **transient** failures. |
| `AI_MODEL_RETRY_BACKOFF_MS` | `500` | Linear backoff between retries (ms). |

## 2. AI mode behavior

- **`mock`** — always use the built-in mock detector; never call the external
  server. Ideal for local dev / classroom demos.
- **`external`** — always call `AI_MODEL_API_URL`. If the URL is missing, the
  frame request fails clearly (HTTP 500, `category: "config"`). **No silent mock
  fallback.**
- **`auto`** (default) — call the URL when it is configured; otherwise use the
  mock detector. `auto` only chooses mock when **no URL is set** — it does **not**
  fall back to mock after a failed external call.

## 3. Request contract (app → model server)

`POST {AI_MODEL_API_URL}` with `Content-Type: application/json`:

```json
{
  "image_url": "https://.../sessions/<id>/<ts>-<rand>.jpg",
  "image_id": "sessions/<id>/<ts>-<rand>.jpg",
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
  "metadata": { "source": "web-camera", "app": "traffic-sign-mapping-dashboard" }
}
```

No secrets are included in the payload. The API key (if any) is sent only in the
`Authorization` header.

## 4. Response contract (model server → app)

The app normalizes the response to this internal shape before saving:

```json
{
  "detections": [
    {
      "class_id": 14,
      "class_name": "Speed Limit 50",
      "confidence": 0.92,
      "bbox": { "x": 120, "y": 80, "width": 64, "height": 64 }
    }
  ],
  "processing_time_ms": 180,
  "model_version": "optional-model-version",
  "raw": {}
}
```

Validation/normalization rules:

- `detections` **must** be an array (may be empty — empty is allowed and logged).
- `class_name` **must** be a non-empty string.
- `confidence` **must** be a finite number in `[0, 1]`.
- `class_id` may be a number or numeric string; it is normalized to an integer
  (or `null` if not numeric).
- `bbox` is optional; if present, `x/y/width/height` must be finite numbers and
  `width/height` must be `> 0`, otherwise the bbox is dropped (`null`).
- `processing_time_ms` / `processingTimeMs` and `model_version` / `modelVersion`
  are both accepted (snake or camel case).
- Any validation failure → the frame returns `category: "invalid_response"` and
  **no detections are saved** (the pipeline does not crash).

## 5. Example cURL

```bash
curl -X POST "$AI_MODEL_API_URL" \
  -H "Authorization: Bearer $AI_MODEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.supabase.co/storage/v1/object/public/traffic-sign-frames/sessions/s1/123-abc.jpg",
    "image_id": "sessions/s1/123-abc.jpg",
    "session_id": "11111111-1111-1111-1111-111111111111",
    "device_id": "22222222-2222-2222-2222-222222222222",
    "timestamp": "2026-06-24T12:00:00.000Z",
    "location": { "latitude": 57.0488, "longitude": 9.9217, "accuracy": 8.5, "heading": 120.4, "speed": 13.2 },
    "metadata": { "source": "web-camera", "app": "traffic-sign-mapping-dashboard" }
  }'
```

### Example successful response

```json
{
  "detections": [
    { "class_id": 14, "class_name": "Speed Limit 50", "confidence": 0.92,
      "bbox": { "x": 120, "y": 80, "width": 64, "height": 64 } }
  ],
  "processing_time_ms": 180,
  "model_version": "yolo-signs-v1"
}
```

### Example invalid response (and why it fails)

```json
{ "detections": [ { "class_name": "", "confidence": 1.4 } ] }
```

Rejected because `class_name` is empty and `confidence` is outside `[0, 1]`.
The app logs `AI_RESPONSE_INVALID` and returns `category: "invalid_response"`;
nothing is written to `detection_events`.

## 6. Timeout & retry behavior

- Each attempt is bounded by `AI_MODEL_TIMEOUT_MS` via `AbortController`.
- Retries (up to `AI_MODEL_MAX_RETRIES`) happen **only** on transient failures:
  timeout, network error, or HTTP `429 / 502 / 503 / 504`, with linear backoff
  (`AI_MODEL_RETRY_BACKOFF_MS × attempt`).
- **No retry** on validation errors or HTTP `400 / 401 / 403`.
- Total elapsed time is returned to the frontend and saved in the event's
  `ai_response_time_ms` when the model provides it.
- If all attempts fail in `external`/`auto`, the API returns a clear error
  (`category`: `timeout` → HTTP 504, `config` → 500, otherwise 502) and saves
  **no fake detections**.

### Logged actions (`system_logs`)

`AI_REQUEST_STARTED`, `AI_REQUEST_SUCCEEDED`, `AI_REQUEST_FAILED`,
`AI_REQUEST_TIMEOUT`, `AI_RESPONSE_INVALID`, `AI_MOCK_USED`,
`AI_HEALTH_CHECK_RUN`. Logs contain **safe metadata only** (status code, attempt
count, elapsed time, error category, sanitized message, model **hostname** — never
the full URL with tokens, headers, or API keys).

## 7. Admin health check

- API: `GET /api/admin/ai/health` (auth required → 401; admin required → 403).
- UI: `/admin/ai` shows mode, external-configured status, model host, timeout,
  retry settings, and a **Run health check** button.
- In `mock` mode it reports `mock-ready` and makes no external call. Otherwise it
  probes `GET {origin}/health` first, then falls back to a `HEAD` of the
  configured URL (`healthy` / `reachable` / `unreachable` / `misconfigured`). It
  **never** sends an image frame.

## 7b. Model-contract self-test & observability

The `/admin/ai` page also offers a **self-test** and an **activity dashboard**.

- **Health check vs self-test**:
  - *Health check* only verifies **reachability/configuration** (no image sent).
  - *Self-test* validates the **actual detection contract**: it sends a real
    test image through the AI layer and validates/normalizes the response.
- **API**: `POST /api/admin/ai/self-test` (401 unauth, 403 non-admin). Accepts
  either `multipart/form-data` with a `file` (Option A — uploads to
  `ai-self-tests/{adminProfileId}/…`, signs it, then **deletes** the object
  after the call) or JSON `{ detectionEventId }` (Option B — reuse an existing
  frame). It honors the current mode (`mock` / `external` / `auto`).
- **No production data**: the self-test **never** creates `detection_events`,
  `traffic_signs`, or `traffic_sign_observations`, and its internal
  `AI_REQUEST_*` logs are not persisted (only `AI_SELF_TEST_*` summary events
  are), so request analytics stay clean.
- **Status mapping**: 400 invalid input · 401 unauth · 403 non-admin · 500
  config · 502 upstream/invalid-response · 504 timeout.
- **Observability**: `GET /api/admin/ai/logs?window=&action=&category=&page=&pageSize=`
  aggregates AI `system_logs` into a summary (total/success/failure/timeout/
  invalid/mock, avg elapsed, failure rate, latest success/failure), a failure
  breakdown by category (config/timeout/network/http/validation/unknown), and a
  filterable, paginated recent-logs table. All metadata is sanitized — no API
  keys, bearer tokens, request headers, signed URLs, or full URLs (hostname only).
- **DB-side analytics + time-series + alerts** (migration `0004_analytics_rpc.sql`):
  the summary, failure breakdown, and a zero-filled **time-series** are computed
  by Postgres RPCs (`admin_ai_activity_summary`, `admin_ai_failure_breakdown`,
  `admin_ai_timeseries`) called server-side with the service-role client. The
  RPCs are `EXECUTE`-granted to `service_role` only (revoked from public), so
  clients cannot call them directly. If the migration is not applied, the API
  transparently **falls back** to JS aggregation and the dashboard shows a
  `source: JS fallback` badge (vs `DB RPC`). `/admin/ai` also renders a
  **failure-rate threshold** panel — healthy / warning / no-data — controlled by
  `AI_FAILURE_RATE_WARNING_PERCENT` (default 20), with bucket size
  `AI_TIMESERIES_BUCKET_MINUTES` (default 60). Self-test logs are excluded from
  production request totals; `ai_response_raw` is never included in analytics.

## 8. Local mock-mode testing

```bash
# .env.local
AI_MODEL_MODE=mock        # or leave AI_MODEL_MODE=auto with AI_MODEL_API_URL empty
```

Run `npm run dev`, start a detection session — the mock detector returns 0–2
detections per frame so the full pipeline (events, grouping, map, logs) works
without a model server.

## 9. Production recommendations

- Serve the model over **HTTPS**.
- Keep `AI_MODEL_API_KEY` **server-side only** (it is read in Route Handlers; it
  is never sent to the browser or included in the request body).
- If the Storage bucket is private, send **signed** frame URLs (short-lived).
- Ensure returned **bbox coordinates match the stored frame dimensions** (frames
  are downscaled to max 1280px wide before upload).
- Keep the response payload **small** (avoid echoing the image).
- Return **stable** `class_name` / `class_id` values so sign grouping stays
  consistent across detections.
