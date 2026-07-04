# Paper ↔ Code Consistency Audit

**Paper:** *A Server-Side Web Framework for Smartphone-Based Traffic Sign Detection, Geospatial De-duplication, and Inventory Management* (`IEEE_Traffic_Sign_Inventory_Updated_Draft.docx`)
**Repository:** traffic_sign_mapping_project — verified 2026-07-05.
Companion documents: `PAPER_CODE_CLAIM_MATRIX.md`, `PAPER_REFERENCE_AUDIT.md`.

---

## 1. Executive verdict

The paper is a genuine, well-structured description of a **real, working** server-side web framework, and the majority of its *implementation* claims are accurate and directly verifiable in the repository (Next.js 14 App Router, Supabase Auth/PostgreSQL/RLS, private storage + signed URLs, migrations 0001–0006, mock/external AI contract, weighted-observation location refinement, review statuses, dashboard/maps/analytics, permanent frame deletion, admin-only security). The contribution — *an operational layer that turns image-level detections into secure, auditable, geospatially grouped, reviewable inventory records* — is real and defensible.

However, the paper **overstates the geospatial matching methodology and the inventory-lifecycle model** relative to the code. Specifically, the multi-factor matching **Equation (1)** is not implemented; the **"change layer"** is a review-state workflow on a single table, not an authoritative/candidate-layer separation; several **administrative actions (merge/split/correct)** do not exist; **PostGIS** is not used; and the **candidate vs. validated-instance** entity separation is conceptual. Some **results counts are outdated** (24/24 tests, 54 routes). None of these require code changes — the paper must be corrected to match the code.

**Verdict: MOSTLY ACCURATE IMPLEMENTATION, OVERSTATED METHODOLOGY — corrections required before submission.**

## 2. Overall consistency score

**70 / 100 — "partially aligned; important corrections required."**

Rubric: 90–100 strongly aligned · 75–89 mostly aligned, minor corrections · 60–74 partially aligned, important corrections · below 60 substantial inconsistency.

Rationale: the implementation core is strong (would score ~90 alone), but four material methodology/lifecycle overclaims (Eq. 1, change layer, merge/split/correct, PostGIS/candidate entities) plus outdated result counts pull it into the 60–74 band. The score is deliberately not inflated; it is recoverable to the high-80s with the precise corrections listed in §13.

## 3. Strongly supported claims (IMPLEMENTED)

- Next.js 14.2.5 App Router + TypeScript + Tailwind; Server Components, Route Handlers (`package.json`, `src/app/**`).
- Supabase Auth, PostgreSQL, private Storage, RLS (`src/lib/supabase/*`, `supabase/migrations/0001_init.sql` L180–247).
- Migrations 0001–0006 exactly as described (`supabase/migrations/`).
- Object-path storage + short-lived signed URLs; CSV exports avoid signed URLs (`0002_secure_image_paths.sql`, `src/lib/storage/signed-urls.ts`, `src/app/api/admin/export/*.csv/route.ts`).
- Normalized AI contract (array; confidence ∈ [0,1]; non-empty class; bbox) with mock/external/auto modes, timeout + bounded retry (`src/lib/ai/contract.ts`, `src/lib/ai/client.ts`, `src/lib/env.ts`).
- Confidence/accuracy-weighted location refinement, Eq. (2)(3) (`src/lib/localization/grouping.ts weightedAverage`).
- Review statuses pending / auto_verified / manually_verified / rejected / duplicate / low_confidence (`0001_init.sql`; review routes/UI).
- Dashboard, sign map (markers/clustered/density), device map, detail panel, detection review, analytics snapshots, presentation mode, AI health/self-test, storage governance (`src/components/*`, `src/app/(protected)/**`, `src/lib/cluster.ts`).
- Server-side admin checks, service-role isolation, AI bearer auth (`src/lib/api.ts`, `src/lib/supabase/admin.ts`, `ai-server/main.py _check_auth`).
- Seeded demo dataset counts 4/6/120/35/7 are exact (`src/lib/demo/seed.ts`).

## 4. Partially supported claims (PARTIALLY_IMPLEMENTED)

- **Physical sign localization** (§III, §V.C): implemented as confidence/accuracy-weighted mean of **device GPS** — an observation-location proxy, not geometry-derived localization (no calibration/bbox-geometry/heading/triangulation). `heading`/`speed` are stored but unused in matching.
- **Complete raw history** (§III): retained by default, but admin-only permanent frame deletion exists (`.../detections/[id]/frame/route.ts`, audit `ADMIN_FRAME_DELETED`).
- **Candidate / fused / validated stages** (§III, §V, Tables I/III): real as *review states of one `traffic_signs` table*, not separate entities.

## 5. Unsupported or overstated claims

- **Equation (1)** multi-factor `S_match` (spatial+semantic+direction+road+temporal): **not implemented** (CONCEPTUAL_ONLY). Actual matching = same `sign_type` + nearest within 25 m.
- **"Change layer"** as an implemented authoritative-layer separation (Abstract, §IV.C, Index Terms): **UNSUPPORTED**; it is a review-status workflow.
- **Administrative merge / split / correct** (§IV.C): **INCORRECT** — no such actions exist.
- **PostGIS** as an implemented platform component / Index Term: **UNSUPPORTED** (future path only).
- Reported **latency / localization error / duplicate-reduction** as measured results: none are computed (only per-event `ai_response_time_ms` is stored).

## 6. Outdated implementation details (OUTDATED)

- "Playwright suite passed **24 of 24**" → current run: **88 passed, 2 skipped** (opt-in demo-seed) across 10 spec files, chromium + WebKit projects.
- "**54 application routes** built" → current production build reports **62 routes** (2 static, 60 dynamic).

## 7. Missing current implementation details (should be ADDED)

- The evaluated detector prototype is concrete: **FastAPI wrapper → NVIDIA Triton**, two-stage **`e2e` detection (1280×1280) + `sign-mid` classification (128×128)**, NMS, `confidence = det × cls`, bearer auth (`ai-server/main.py`).
- **400-class** friendly class mapping generated from `classifier_index_classes_mapping.yaml` into `src/data/traffic-sign-classes.json` + `ai-server/classes.json`, resolver `getTrafficSignDisplayName`, fallback `Sign {id}`.
- Field lifecycle correctness: **stopping a session no longer deactivates the device** (admin-only device status); **single-flight** mobile capture with `AbortController` (`DetectionClient.tsx`, `src/lib/detection/live-results.ts`).
- **`recomputeSignAggregate`** re-derives sign aggregates after deletion using the same Eq. (2)(3).

## 8. Schema and terminology mismatches

| Paper term | Actual schema entity |
|-----------|----------------------|
| raw observation / detection event | `detection_events` |
| candidate | *(no table)* → a `traffic_signs` row with `verification_status='pending'/'auto_verified'` |
| fused sign instance / validated sign instance | `traffic_signs` (one row per fused sign; status distinguishes stages) |
| observation link | `traffic_sign_observations` |
| change-layer record | *(no table)* → `verification_status` on `traffic_signs` |
| device capture coordinate | `detection_events.latitude/longitude` |
| representative fused coordinate | `traffic_signs.latitude/longitude` (weighted mean) |

Table II in the paper already lists the **real** entities correctly (profiles, devices, detection_sessions, detection_events, traffic_signs, traffic_sign_observations, system_logs, daily_metrics_snapshots) — it omits `device_location_logs`, `storage_quarantine_candidates`, and `storage_reconciliation_runs`, but introduces no fictional table. The mismatch is in the *prose/Tables I & III*, which imply separate candidate/validated entities.

## 9. Algorithm and equation audit

- **Eq. (1) `S_match`** — REJECTED as implemented. No semantic/directional/road/temporal scoring exists. → move to future work / proposed extension.
- **Eq. (2) `weight = confidence / max(gps_accuracy,1)`** — VERIFIED (`weightedAverage`), with defaults null-confidence→0.5, null-accuracy→1.
- **Eq. (3) `refined = Σ(w·pos)/Σ(w)`** — VERIFIED; latitude and longitude fused **independently**; simple-mean fallback when Σw=0; re-applied by `recomputeSignAggregate` after deletion.
- **Distance** — great-circle haversine, R=6 371 000 m (`haversine.ts`).
- **Matching rule** — exact `sign_type` equality + nearest neighbour within 25 m (`SIGN_MATCH_RADIUS_METERS`, default 25); auto-verify when ≥3 observations and avg confidence > 0.75; never overrides a manual decision.

## 10. Security-claim audit

All security claims verified: server-side role gate (`ctx.profile.role!=="admin"` across admin routes), RLS (`0001_init.sql`), service-role client server-only (`src/lib/supabase/admin.ts`), private bucket + signed URLs, AI bearer via constant-time compare (`ai-server/main.py`), admin-only device status and admin-only frame deletion, reference-safe storage deletion, secret-free audit logs. **No rate limiting exists** — the paper does not claim it, and none should be added. No credentials/keys/signed URLs are exposed in code or docs.

## 11. Evaluation / result audit

The paper *already* states results are implementation validation, not detector benchmarks — this is correct and should be preserved. Required tightening:
- §VIII / Table IV: update 24/24 → current pass count (88 passed, 2 skipped) and 54 → 62 routes.
- Keep demo counts (4/6/120/35/7) but keep the explicit caveat "not detection-performance measurements."
- §VII metrics (latency, localization error, duplicate-reduction) must remain a **protocol** for future field evaluation; do **not** report numeric values (none are computed).
- Add the one genuinely new, honest evaluation fact: real mobile capture → server ingestion → normalized persistence → grouping → map/review was exercised (implementation validation), distinct from a labelled field campaign.

## 12. Reference / citation audit

See `PAPER_REFERENCE_AUDIT.md`. Key items: **[18] (WHO) is uncited** → cite in §I or remove. **[16] PostGIS** is fine only as a future-path citation. Web references [12]–[16] need concrete accessed dates. Bibliographic metadata for [1]–[11],[17],[18] was **not externally verified** (no network) — verify before submission; no DOIs were fabricated.

## 13. Required corrections before submission

1. Move **Eq. (1)** to a *proposed extension* (§X) or replace with the implemented same-class + 25 m nearest-neighbour rule.
2. Reframe **"change layer"** as a review-state workflow *inspired by* change-layer principles [11]; remove it from Index Terms and from "implemented" prose.
3. Replace **"approve, reject, merge, split, correct, or mark"** with the real action set: verify, reject, mark duplicate, reset, permanently delete frame; move merge/split/correct to future work.
4. Clarify device GPS is an **observation-location proxy**; representative coordinate is a fused centroid, not geometry-derived.
5. Reword **"complete raw history"**: retained by default; admins can permanently delete erroneous frames + dependents; audited; reference-safe storage deletion.
6. Remove **PostGIS** from Index Terms; keep only as a §X scalability path.
7. Map **candidate/validated-instance** terminology to the single `traffic_signs` table + statuses (fix Tables I & III wording).
8. Update **result counts**: 88 passed / 2 skipped E2E; 62 routes; keep demo 4/6/120/35/7 as seeded.
9. Add a concise, accurate paragraph on the **FastAPI/Triton two-stage prototype** and the **400-class mapping** (without accuracy claims).
10. **Cite [18]** in §I or remove it; add concrete accessed dates to web references.

## 14. Optional improvements

- Add `device_location_logs`, `storage_quarantine_candidates`, `storage_reconciliation_runs` to the data-entity table for completeness.
- Briefly mention single-flight mobile capture and device-active-after-stop as field-robustness engineering.
- Convert the four rasterized tables (embedded as images) into native tables for accessibility/reflow.
- Add author email (currently "[to be added]").

## 15. Final submission-readiness verdict

**Not yet submission-ready as written**, but **recoverable with the targeted §13 corrections** — none of which require code changes. After applying them (as done in the code-aligned draft `IEEE_Traffic_Sign_Inventory_Code_Aligned_Draft.docx`), the paper accurately represents a strong, defensible systems contribution and should reach the high-80s on this rubric. The corrected draft removes the overclaims while preserving the core contribution and academic tone.
