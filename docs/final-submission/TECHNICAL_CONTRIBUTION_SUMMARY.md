# Technical Contribution Summary

A concise explanation of what this project contributes **beyond plain traffic-sign
detection** — useful for quickly explaining the work to a teacher or jury.

## One-line statement
The contribution is not the detection model; it is the **end-to-end system that turns
noisy per-frame detections into a deduplicated, location-refined, reviewable, securely-
served, and observable traffic-sign inventory.**

## Contributions beyond detection

1. **External-AI service architecture.** The detector is integrated as an external
   inference service behind a defined request/response contract, with `mock`/`external`/
   `auto` modes, response validation/normalization, timeout, and transient-only retry.
   *Why it's realistic:* production CV models are usually separate services; this
   decoupling lets the platform evolve independently of any specific model and keeps the
   app demonstrable offline via mock mode.

2. **Geolocation fusion.** Each detection's GPS (lat/lng, accuracy, heading, speed) is
   fused into a sign location via a confidence/accuracy-weighted average
   (`weight = confidence / max(gps_accuracy, 1)`). *Why it matters:* a single GPS fix is
   noisy; combining many observations yields a more stable, trustworthy coordinate.

3. **Duplicate filtering / consolidation.** Same-type Haversine matching within a
   distance threshold (default 25 m) links repeated detections to one `traffic_signs`
   record via `traffic_sign_observations`, with auto-verification at ≥3 observations and
   >0.75 average confidence. *Why it matters:* without this, a map would show hundreds of
   duplicate markers for the same physical sign — unusable as an inventory.

4. **Map inventory & visualization.** An optimized inventory map (markers / clustering /
   density) plus a live device map present decision-ready data rather than raw events.

5. **Observability & logging.** Every important action is audited in `system_logs`
   (safe metadata only), and an admin AI dashboard exposes health, a contract self-test,
   failure breakdown, time-series, and a failure-rate threshold alert. *Why it matters:*
   operators can tell whether the integration is healthy and diagnose failures by category.

6. **Signed storage / private media.** The bucket is private; the DB stores object
   paths; images are delivered via short-lived signed URLs minted server-side only after
   authorization, with in-place refresh and quarantine-first cleanup. *Why it matters:*
   captured frames may be sensitive and must not be world-readable, and storage must be
   maintainable without risky auto-deletion.

7. **Admin review & data lifecycle.** Human-in-the-loop review of detections and signs,
   user/device administration, daily metric snapshots (durable trends), and secret-
   protected cron endpoints for scheduled maintenance.

8. **Testing & reproducibility.** Deterministic demo seeding, presentation mode, and an
   environment-aware Playwright E2E suite make the system reproducible and demonstrable.

## What was validated (facts)
- Real Supabase backend connected; migrations `0001`–`0006` applied.
- Private `traffic-sign-frames` bucket (public = false).
- Admin user/profile present (`role = admin`).
- Demo data seeded successfully.
- Playwright E2E suite **passed 24/24**.
- `npm run lint`, `npm run typecheck`, `npm run build` clean.

## Honest scope note
No detection-model accuracy benchmark is claimed — the model is external and no labeled
evaluation dataset was measured here `[Reference needed]`. The platform's value is the
data engineering, geospatial consolidation, security, and operability around detection.
