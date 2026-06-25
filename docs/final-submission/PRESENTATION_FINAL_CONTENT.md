# Presentation Final Content

Slide-by-slide content ready to paste into PowerPoint/Keynote/Google Slides. 14 slides
(12 required + 2 optional). Capture screenshots manually from the demo-seeded app (no
images are generated here). Aim for ~30–45 s per slide (~10 minutes).

---

## Opening script (~20 s)
> "Good [morning/afternoon]. I built a web platform that turns noisy AI traffic-sign
> detections into a clean, mapped, verified sign inventory. The detection model is an
> external service — my contribution is everything around it: capturing frames with GPS,
> integrating the model safely, removing duplicates, mapping the result, and giving
> administrators tools to review and operate the system. Let me walk you through it."

---

### Slide 1 — Title  *(required)*
- **Bullets:** AI-Based Traffic Sign Detection, Localization & Map Dashboard System · your name · course / date.
- **Speaker notes:** State the one-line goal: detection → usable, mapped inventory.
- **Screenshot:** App dashboard hero.

### Slide 2 — Problem Statement  *(required)*
- **Bullets:** Manual sign surveying is slow and error-prone · raw per-frame detections are duplicated and noisy · GPS and confidence vary.
- **Speaker notes:** Detection ≠ inventory; the same physical sign is seen many times.
- **Screenshot:** Diagram — many raw detections converging to one sign.

### Slide 3 — Project Goal  *(required)*
- **Bullets:** Deduplicated, location-refined, reviewable inventory · secure media · observability · reproducible demo.
- **Speaker notes:** The detector is external; the platform is the contribution.
- **Screenshot:** Goal bullets over a map background.

### Slide 4 — System Overview  *(required)*
- **Bullets:** Next.js 14 + TypeScript + Tailwind · Supabase (Auth, Postgres, Storage, RLS) · Leaflet/OpenStreetMap · Playwright tests.
- **Speaker notes:** Two server trust tiers — RLS client for user reads, service-role for trusted writes/RPCs.
- **Screenshot:** Architecture block diagram.

### Slide 5 — End-to-End Data Flow  *(required)*
- **Bullets:** Frame + GPS → upload → sign URL → AI → validate → save events → group signs → logs → dashboards.
- **Speaker notes:** Walk the seven steps of the frame endpoint.
- **Screenshot:** The data-flow diagram (report §6) redrawn.

### Slide 6 — Detection Session Workflow  *(required)*
- **Bullets:** Select device → start session → periodic capture → results stream → counters update.
- **Speaker notes:** Camera + geolocation in the browser; a device must be selected before Start.
- **Screenshot:** `/detection` (device selector + camera panel).

### Slide 7 — AI Model API Contract  *(required)*
- **Bullets:** Modes mock/external/auto · signed image URL in request · validated/normalised response · timeout + retry.
- **Speaker notes:** Mock mode runs the whole pipeline with no external server — used for this demo.
- **Screenshot:** Request/response JSON snippet (from `docs/AI_MODEL_INTEGRATION.md`).

### Slide 8 — Location Fusion & Duplicate Filtering  *(required)*
- **Bullets:** Same type + Haversine within 25 m → observation; else new sign · weighted average `confidence / max(gps_accuracy, 1)` · auto-verify ≥3 obs & avg conf > 0.75.
- **Speaker notes:** Core algorithmic contribution; cite Haversine and density-based clustering as background.
- **Screenshot:** Diagram of observations converging to a weighted centroid.

### Slide 9 — Database Design  *(required)*
- **Bullets:** 11 tables; UUID PKs, `timestamptz`, `jsonb` · RLS on all · migrations 0001–0006.
- **Speaker notes:** Maintenance/analytics tables are service-role-only; raw + optimized data both retained.
- **Screenshot:** ERD or the migrations table from the report.

### Slide 10 — Map Dashboard  *(required)*
- **Bullets:** Markers / clustering / density · filters · sign detail panel · live device map.
- **Speaker notes:** The inventory map shows optimized signs, not raw detections.
- **Screenshot:** `/map/signs` clustered mode with demo data.

### Slide 11 — Admin & Observability  *(required)*
- **Bullets:** Users/devices/review · AI health + self-test + failure analytics · daily snapshots + gap detection.
- **Speaker notes:** Human-in-the-loop review improves operational data quality (doesn't guarantee correctness).
- **Screenshot:** `/admin/ai` (summary + time-series) or `/admin/analytics`.

### Slide 12 — Security & Storage Design  *(required)*
- **Bullets:** Private bucket + signed URLs (server-only, after auth) · RLS · secrets server-only · cron bearer secret · quarantine-first cleanup.
- **Speaker notes:** Images are never public; nothing is auto-deleted; secrets never reach the client.
- **Screenshot:** `/admin/storage` (quarantine + run history).

### Slide 13 — Testing & Validation  *(required)*
- **Bullets:** Real Supabase backend · migrations applied · private bucket · demo seeded · **Playwright 24/24** · lint/typecheck/build clean (54 routes).
- **Speaker notes:** Verified end-to-end, not just locally mocked. Demo counts are seeded data, not metrics.
- **Screenshot:** Terminal — green E2E run + `npm run validate`.

### Slide 14 — Limitations, Future Work & Conclusion  *(required)*
- **Bullets:** Limitations (no spatial index, no model-accuracy benchmark, capped scans) · future work (PostGIS, labelled evaluation, alerting) · conclusion: the platform is the contribution.
- **Speaker notes:** Be honest about scope; transition into the live demo.
- **Screenshot:** `/presentation?presentation=1` landing with guided cards.

### Slide 15 — References  *(optional)*
- **Bullets:** Key sources [1]–[16] (see `REFERENCES_FINAL.md`).
- **Speaker notes:** Mention benchmarks (GTSRB/GTSDB), detectors (YOLO/Faster R-CNN/SSD), Haversine, DBSCAN, WHO road-safety, GPS SPS standard, HITL survey.
- **Screenshot:** None (text slide).

> Optional **Live Demo** slide can be inserted before Slide 14 — follow `DEMO_SCRIPT.md`.

---

## Closing script (~20 s)
> "To summarise: the system turns raw, duplicated detections into a deduplicated,
> location-refined, reviewable, and securely served sign inventory, with administrative
> observability and a reproducible demo. It was validated against a real Supabase backend
> with the full end-to-end test suite passing. Thank you — I'm happy to take questions."
