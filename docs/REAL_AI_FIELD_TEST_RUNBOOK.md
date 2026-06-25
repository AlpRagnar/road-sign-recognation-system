# Real AI Model — Field Test Runbook

End-to-end procedure for testing the deployed web app against the **real local Triton
pipeline** via the FastAPI wrapper (`ai-server/`) and an HTTPS tunnel, using a mobile
phone in the field.

Architecture under test:
```
Phone (HTTPS) → deployed Next.js app → /api/detection/frame → Supabase Storage
  → signed image URL → HTTPS tunnel → FastAPI wrapper (localhost:8080)
  → Triton (localhost:8000): e2e detection + sign-mid classification
  → JSON → app saves detection_events + traffic_signs
```

## A. On the GPU/laptop machine

1. **Start Triton** (serving models `e2e` and `sign-mid`) on `localhost:8000`.
   Verify: `curl http://localhost:8000/v2/health/ready` → `200`.

2. **Start the FastAPI wrapper:**
   ```bash
   cd ai-server
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   export TRITON_URL=localhost:8000
   export AI_WRAPPER_API_KEY=test-ai-secret
   uvicorn main:app --host 0.0.0.0 --port 8080
   ```

3. **Check wrapper health:**
   ```bash
   curl http://localhost:8080/health
   # expect: {"ok":true,"triton_live":true,"models":{"e2e":true,"sign_mid":true},...}
   ```
   If `ok:false` / 503: Triton isn't live or models aren't loaded — fix before continuing.

4. **Start a secure tunnel** (HTTPS, required for Vercel + mobile):
   ```bash
   cloudflared tunnel --url http://localhost:8080
   # or:  ngrok http 8080
   ```
   Note the generated `https://…` URL. Test it:
   ```bash
   curl https://YOUR-TUNNEL-URL/health
   ```

## B. Configure the deployed web app

5. **Set environment variables** (e.g. Vercel project settings — must be HTTPS, not localhost):
   ```env
   AI_MODEL_MODE=external
   AI_MODEL_API_URL=https://YOUR-TUNNEL-URL/detect
   AI_MODEL_API_KEY=test-ai-secret
   AI_MODEL_TIMEOUT_MS=15000
   AI_MODEL_MAX_RETRIES=1
   AI_MODEL_RETRY_BACKOFF_MS=500
   ```
   (Supabase + storage env vars stay as already configured.)

6. **Redeploy / restart** the app environment so the new env vars take effect.

## C. Accounts & devices

7. **Log in as admin** on a desktop browser.
8. **Create or verify a field user** (Admin → Users) and confirm the account works.
9. **Field user logs in on the phone** (over the app's HTTPS URL).
10. **Register or select a device** (Devices) — a device must be selected before detection.

## D. Run detection in the field

11. Field user opens **`/detection`**.
12. **Allow camera and location** when prompted (HTTPS is required for both).
13. Press **Start Detection** — frames stream to the app, which calls the wrapper.

## E. Admin verification

14. Admin checks:
    - **`/admin/ai`** — health green; run **self-test** (sends a signed image through the wrapper).
    - **`/admin/detections`** — new detection events with classes/confidence/bboxes.
    - **`/map/signs`** — grouped signs appear/refine as observations accrue.
    - **`/map/devices`** — the field device's last-known location updates.
    - **`/admin/logs`** — `AI_REQUEST_*` entries (started/succeeded/failed/timeout).

## F. Troubleshooting

- **Camera/GPS don't work on the phone** → must be **HTTPS** (`http://LOCAL_IP:3000` won't
  grant camera/geolocation). Use the deployed HTTPS app, not a LAN IP.
- **`AI_MODEL_API_URL` cannot be `localhost`** when the app is on Vercel — it must be the
  HTTPS tunnel URL reachable from the internet, ending in `/detect`.
- **Tunnel dropped** → `cloudflared`/`ngrok` must stay running; re-run and update
  `AI_MODEL_API_URL` if the URL changed (free tunnels rotate URLs).
- **Triton not live** → `/admin/ai` health is not green and `/detect` returns 503; restart
  Triton and confirm `e2e` + `sign-mid` are READY.
- **Supabase bucket** stays **private**; the wrapper must be able to fetch the **signed**
  URL. Tunnels have no egress restriction, so the wrapper can download it.
- **Signed URL expired** before the wrapper downloads it → just capture another frame
  (the app re-signs per frame); consider raising `AI_MODEL_TIMEOUT_MS` if the machine is slow.
- **Machine sleep** → disable sleep on the GPU/laptop; if it sleeps, Triton/wrapper/tunnel
  all stop.
- **First-call latency** → the first inference can be slow (model warmup); subsequent
  frames are faster.

## G. Wind-down

- Stop the tunnel, the wrapper (`Ctrl-C`), and Triton.
- Revert the web app env to `AI_MODEL_MODE=mock` (or `auto`) if you want to stop using the
  GPU machine, so demos keep working without it.
- Clear demo data if you seeded any during testing (`/admin/demo`).

> No secrets in this document. `AI_WRAPPER_API_KEY=test-ai-secret` is a placeholder —
> use a real secret for any non-local test and never commit it.
