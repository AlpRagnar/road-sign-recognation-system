# Presentation Slide Outline

14 slides. Each has bullets, speaker notes, and a suggested visual. Capture the
screenshots manually from the running, demo-seeded app (this task does not generate
images). Keep ~30–45 seconds per slide for a ~10-minute talk.

---

### Slide 1 — Title
- **Bullets:** Project title; "AI-Based Traffic Sign Detection, Localization & Map Dashboard"; your name; course/date.
- **Speaker notes:** One sentence: "A web platform that turns noisy AI sign detections into a clean, mapped, verified sign inventory."
- **Visual:** App logo / dashboard hero screenshot.

### Slide 2 — Problem Statement
- **Bullets:** Manual sign surveying is slow; raw per-frame detections are duplicated and noisy; GPS and confidence vary.
- **Speaker notes:** Detection ≠ inventory. The same physical sign is seen many times; we need one record per sign.
- **Visual:** Diagram: many raw detections → one consolidated sign.

### Slide 3 — Project Goal
- **Bullets:** Deduplicated, location-refined, reviewable inventory; secure media; observability; reproducible demo.
- **Speaker notes:** The AI model is an external service; our contribution is everything *around* the detection.
- **Visual:** Goal bullets over a map background.

### Slide 4 — System Overview
- **Bullets:** Next.js 14 + TypeScript + Tailwind; Supabase (Auth, Postgres, Storage, RLS); Leaflet maps; Playwright tests.
- **Speaker notes:** Two server trust tiers — RLS client for user reads, service-role for trusted writes/RPCs.
- **Visual:** Stack/architecture block diagram (from `docs/FINAL_SYSTEM_ARCHITECTURE.md`).

### Slide 5 — End-to-End Data Flow
- **Bullets:** Frame+GPS → upload → sign URL → AI → validate → save events → group signs → logs → dashboards.
- **Speaker notes:** Walk the 7 steps of `/api/detection/frame`.
- **Visual:** The ASCII data-flow diagram, redrawn cleanly.

### Slide 6 — Detection Session Workflow
- **Bullets:** Select device → start session → periodic capture → results stream → counters update.
- **Speaker notes:** Camera + geolocation in the browser; device must be selected before start.
- **Visual:** Screenshot of `/detection` (device selector + camera panel).

### Slide 7 — AI Model API Contract
- **Bullets:** Modes mock/external/auto; signed image URL in request; validated/normalized response; timeout + retry.
- **Speaker notes:** Mock mode lets the whole pipeline run with no external server — ideal for the demo.
- **Visual:** Request/response JSON snippet (from `docs/AI_MODEL_INTEGRATION.md`).

### Slide 8 — Location Fusion & Duplicate Filtering
- **Bullets:** Same type + Haversine within 25 m → observation; else new sign; weighted average `confidence / max(gps_accuracy,1)`; auto-verify ≥3 obs & avg conf >0.75.
- **Speaker notes:** This is the core algorithmic contribution that removes duplicates and refines coordinates.
- **Visual:** Diagram of observations converging to a weighted centroid.

### Slide 9 — Database Design
- **Bullets:** 11 tables; UUID PKs, `timestamptz`, `jsonb`; RLS on all; migrations 0001–0006.
- **Speaker notes:** Maintenance/analytics tables are service-role-only; raw + optimized data both retained.
- **Visual:** ERD or the migrations table from the report draft.

### Slide 10 — Map Dashboard
- **Bullets:** Markers / clustering / density; filters; sign detail panel; live device map.
- **Speaker notes:** Inventory map shows optimized signs, not raw detections.
- **Visual:** Screenshot of `/map/signs` in clustered mode with demo data.

### Slide 11 — Admin & Observability
- **Bullets:** Users/devices/review; AI health + self-test + failure analytics; daily snapshots + gap detection.
- **Speaker notes:** Operators can see whether the AI integration is healthy and whether metrics are being captured.
- **Visual:** Screenshot of `/admin/ai` (summary + time-series) or `/admin/analytics`.

### Slide 12 — Security & Storage Design
- **Bullets:** Private bucket + signed URLs (server-only, after auth); RLS; secrets server-only; cron bearer secret; quarantine-first cleanup.
- **Speaker notes:** Images are never public; nothing is auto-deleted; secrets never reach the client.
- **Visual:** Screenshot of `/admin/storage` (quarantine + run history).

### Slide 13 — Testing & Validation
- **Bullets:** Real Supabase backend; migrations applied; private bucket; demo seeded; **Playwright 24/24**; lint/typecheck/build clean.
- **Speaker notes:** Verified end-to-end, not just locally mocked.
- **Visual:** Terminal screenshot of the green E2E run + `npm run validate`.

### Slide 14 — Demo, Limitations & Conclusion
- **Bullets:** Live demo next; limitations (no spatial index, no model-accuracy benchmark, capped scans); future work (PostGIS, evaluation, alerting); conclusion.
- **Speaker notes:** Honest about scope; the platform is the contribution. Transition into the live demo.
- **Visual:** `/presentation?presentation=1` landing with guided cards.

> Optional Slide 15 — References: list real citations (replace `[Reference needed]`).
