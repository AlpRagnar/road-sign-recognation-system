# Academic Report Outline

A ready-to-write outline for the university report on the **AI-Based Traffic Sign
Detection, Localization and Map Dashboard System**. Each section lists what to
write. Replace every `[Reference needed]` with a real citation — **do not invent
citations**.

---

## 1. Abstract
- One paragraph: problem, approach, what was built, key result.
- State that the AI model is an external service and the contribution is the
  data/localization/governance/visualization platform around it.

## 2. Introduction
- Context: road-asset/traffic-sign inventory and maintenance.
- What the system does in one or two paragraphs.
- Report structure overview.

## 3. Problem Statement
- Raw per-frame detections are noisy, duplicated, and not location-consolidated.
- Need: turn detections into a deduplicated, verified, mapped sign inventory.
- Operational needs: access control, image privacy, observability, maintenance.

## 4. Motivation
- Why a structured inventory matters (maintenance, safety, planning).
- Why treat the model as external (focus, realism, scalability).
- Academic value: full-stack + data engineering + geospatial + governance.

## 5. Related Work `[Reference needed]`
- Traffic-sign detection/recognition approaches `[Reference needed]`.
- Geospatial clustering / map inventory systems `[Reference needed]`.
- Web platforms for ML result management `[Reference needed]`.

## 6. System Requirements
- Functional: auth/roles, devices, detection sessions, AI integration, grouping,
  maps, review, analytics, storage governance, demo.
- Non-functional: security (RLS, signed URLs), reliability (timeout/retry),
  observability, maintainability, presentability.
- List actors (field user, admin, external model, scheduler).

## 7. System Architecture
- Summarize `docs/FINAL_SYSTEM_ARCHITECTURE.md`.
- Include the end-to-end data-flow diagram and the two-trust-tier server model.
- Describe Next.js App Router + Supabase responsibilities.

## 8. Methodology
- Iterative, task-based development (TASK 001 → 016): MVP → hardening → governance
  → analytics → automation → demo → final QA.
- Tooling: TypeScript strictness, lint/build/typecheck gates, migration-per-feature.

## 9. AI Model Integration
- Modes (`mock`/`external`/`auto`), request/response contract, validation &
  normalization, timeout/retry, observability and self-test.
- Cite `docs/AI_MODEL_INTEGRATION.md`. Note any real model used `[Reference needed]`.

## 10. Geolocation and Localization Method
- GPS metadata capture; Haversine matching within a radius; confidence/accuracy
  weighted centroid; auto-verification rule.
- Include the weighting formula and a worked example/figure.

## 11. Database Design
- Entity list + relationships (ERD figure suggested).
- RLS policy strategy; service-role-only maintenance/analytics tables and RPCs.
- Migration history (0001–0006) and rationale per migration.

## 12. User Interface Design
- Page inventory and purpose (see `docs/FEATURE_INVENTORY.md`).
- Map modes (markers/cluster/density), detection detail + bbox overlay,
  admin dashboards. Include screenshots in the appendix.

## 13. Security and Access Control
- Auth flow, middleware + layout guards, admin checks (401/403).
- Private storage + signed URLs; cron bearer secret; secret isolation.
- RLS model and trust tiers.

## 14. Testing and Validation
- Static gates: `npm run lint`, `npm run build`, `npm run typecheck`.
- Manual smoke plan (cite `docs/FINAL_SMOKE_TEST_PLAN.md`).
- Migration validation approach. Note absence of automated tests as a limitation.

## 15. Results and Discussion
- What works end-to-end (demo-seeded screenshots/metrics).
- Discuss grouping effectiveness, observability insights, governance behavior.
- Honest discussion of approximations (fallback analytics, capped scans).

## 16. Limitations
- Pull from `docs/FINAL_SYSTEM_ARCHITECTURE.md` §14 and the readiness checklist.

## 17. Future Work
- Spatial indexing, server-side tiling, automated tests, alerting, model versioning.

## 18. Conclusion
- Restate contribution and outcomes; suitability for real-world extension.

## 19. References `[Reference needed]`
- Add all citations here. Placeholders only until real sources are added.

## 20. Appendix suggestions
- A: Environment variables (from `.env.example`).
- B: API & page inventory (from `docs/FEATURE_INVENTORY.md`).
- C: Migration SQL summaries.
- D: Screenshots of each page (seed demo data first via `/admin/demo`).
- E: Demo runbook (`docs/DEMO_RUNBOOK.md`) and smoke test results.
