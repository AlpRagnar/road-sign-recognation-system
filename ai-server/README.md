# Traffic Sign AI Wrapper (FastAPI → Triton)

A small, stateless FastAPI service that adapts the local two-stage Triton pipeline
(stage 1 `e2e` detection → stage 2 `sign-mid` classification) to the Traffic Sign
Mapping web app's AI contract.

It does **not** persist images, draw boxes, or log signed URLs / bearer tokens.

```
Mobile browser → Next.js app → /api/detection/frame → Supabase signed URL
   → POST {this}/detect → Triton (e2e + sign-mid) → normalized JSON
   → Next.js saves detection_events / traffic_signs
```

The browser never calls Triton directly. Triton (`localhost:8000`) and this wrapper
(`localhost:8080`) run on the same machine; the wrapper is exposed for field testing via
a secure HTTPS tunnel.

## Endpoints

### `GET /health`
Checks the wrapper, Triton liveness, and (best-effort) model readiness.

```json
{
  "ok": true,
  "triton_live": true,
  "models": { "e2e": true, "sign_mid": true },
  "model_version": "triton-e2e-sign-mid-v1"
}
```
Returns **HTTP 503** (same body shape, `ok:false`) if Triton is unavailable.
> The web app's `/admin/ai` health probe only checks for a `2xx` on `GET /health`, so a
> healthy wrapper reports green there; a 503 makes it fall back to a reachability probe.

### `POST /detect`
Request body (the app's `AiRequest`; only `image_url` is required, extra fields allowed):
```json
{
  "image_url": "https://signed-supabase-url",
  "image_id": "optional",
  "session_id": "optional",
  "device_id": "optional",
  "timestamp": "optional",
  "location": { "latitude": 57.0488, "longitude": 9.9217, "accuracy": 8, "heading": 120, "speed": 10 },
  "metadata": { "source": "web-camera", "app": "traffic-sign-mapping-dashboard" }
}
```
Response (matches the app's normalizer exactly):
```json
{
  "detections": [
    { "class_id": 14, "class_name": "Stop", "confidence": 0.92,
      "bbox": { "x": 120, "y": 80, "width": 64, "height": 64 } }
  ],
  "processing_time_ms": 180,
  "model_version": "triton-e2e-sign-mid-v1"
}
```
Empty detections are valid: `{ "detections": [], "processing_time_ms": 120, "model_version": "triton-e2e-sign-mid-v1" }`.

Contract guarantees enforced by the wrapper (so the app accepts the response):
- `bbox` is in **original image coordinates**, converted from `x1,y1,x2,y2` → `x,y,width,height`.
- Degenerate / non-positive boxes are dropped (the app rejects `width<=0`/`height<=0`).
- `confidence = detection_confidence * classification_confidence`, clamped to `[0,1]`.
- `class_id` is the stage-2 (`sign-mid`) top-1 index; `class_name` from `classes.json` or `"Sign {class_id}"`.

### Errors (no stack traces in responses)
`400` invalid/undecodable `image_url` · `401` missing/wrong key (when `AI_WRAPPER_API_KEY` set) ·
`503` Triton unavailable · `500` unexpected inference error.

## Pipeline (matches the local test code)
- **Stage 1 `e2e`** — input `images`, output `output0`. Preprocess: BGR→RGB, letterbox to
  `1280×1280`, `/255.0`, CHW, batch, FP32. Postprocess: `non_max_suppression(conf=0.25,
  iou=0.45)` then `scale_boxes` back to the original image size.
- **Stage 2 `sign-mid`** — crop each detected sign; BGR→RGB, resize `128×128`, `/255.0`,
  CHW, batch, FP32; output = class probabilities; `top1_idx = argmax`, `top1_conf = max`.

> For **exact parity** with the local pipeline, install `ultralytics` (in
> `requirements.txt`); the wrapper then uses ultralytics' own `non_max_suppression` /
> `scale_boxes`. Without ultralytics it uses a built-in numpy NMS that assumes a standard
> YOLO head (`[1, 4+nc, N]` / `[1, N, 4+nc]`) — verify against your model if you use it.

## Environment variables
```env
TRITON_URL=localhost:8000
AI_WRAPPER_API_KEY=test-ai-secret      # empty -> unauthenticated local testing allowed
MODEL_VERSION=triton-e2e-sign-mid-v1
DETECTION_MODEL_NAME=e2e
CLASSIFICATION_MODEL_NAME=sign-mid
DETECTION_CONF_THRESHOLD=0.25
DETECTION_IOU_THRESHOLD=0.45
# Optional overrides:
# DET_INPUT_NAME=images
# DET_OUTPUT_NAME=output0
# CLS_INPUT_NAME=            # auto-detected from Triton metadata if empty
# CLS_OUTPUT_NAME=           # auto-detected from Triton metadata if empty
# DET_IMGSZ=1280
# CLS_IMGSZ=128
# IMAGE_DOWNLOAD_TIMEOUT_S=10
# MAX_DETECTIONS=50
```

## Class mapping
Optional `ai-server/classes.json`, keyed by the **`sign-mid` output index**:
```json
{ "0": "Speed Limit 20", "1": "Speed Limit 30", "2": "Speed Limit 50" }
```
If absent, the wrapper falls back to `"Sign {class_id}"`. See `classes.json.example`.
Do not block field testing on the real class list — the fallback works immediately.

## Run locally
```bash
cd ai-server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export TRITON_URL=localhost:8000
export AI_WRAPPER_API_KEY=test-ai-secret      # optional
uvicorn main:app --host 0.0.0.0 --port 8080
```

Health check:
```bash
curl http://localhost:8080/health
```

Detect test (requires Triton running + a reachable image URL):
```bash
curl -X POST http://localhost:8080/detect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-ai-secret" \
  -d '{
    "image_url": "https://example.com/test.jpg",
    "session_id": "test-session",
    "device_id": "test-device",
    "timestamp": "2026-06-25T12:00:00Z",
    "location": { "latitude": 57.0488, "longitude": 9.9217, "accuracy": 8 }
  }'
```

## Expose for field testing (HTTPS tunnel)
The deployed web app (e.g. Vercel) cannot reach `localhost`. Expose port 8080 over HTTPS:
```bash
cloudflared tunnel --url http://localhost:8080
# or
ngrok http 8080
```
Then set the web app env to the tunnel's HTTPS URL (note the `/detect` path):
```env
AI_MODEL_MODE=external
AI_MODEL_API_URL=https://YOUR-TUNNEL-URL/detect
AI_MODEL_API_KEY=test-ai-secret
AI_MODEL_TIMEOUT_MS=15000
AI_MODEL_MAX_RETRIES=1
AI_MODEL_RETRY_BACKOFF_MS=500
```
Keep the laptop/GPU machine (Triton + wrapper + tunnel) awake during the field test.
See `docs/REAL_AI_FIELD_TEST_RUNBOOK.md` for the full procedure.

## Security notes
- Never commit a real `AI_WRAPPER_API_KEY`; the value here is a test placeholder.
- The wrapper does not log `image_url` (signed) or the bearer token.
- Supabase signed URLs are short-lived; if one expires before download, the app simply
  captures another frame.
