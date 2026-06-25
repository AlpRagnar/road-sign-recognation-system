# Report Polish Notes

How `PROJECT_REPORT_FINAL_CANDIDATE.md` differs from `PROJECT_REPORT_DRAFT.md`, what was
cited, and what remains. The original draft is left unchanged; the final candidate is a
new file.

## 1. What changed from the draft
- **Citations integrated.** Inline `[n]` labels were added throughout and a verified
  bibliography (`REFERENCES.md`, [1]–[13]) was created. The draft's four bare
  `[Reference needed]` reference-list bullets were replaced by the real reference set.
- **Academic tone & transitions.** Sentences were tightened and made more formal;
  consistent British-style academic phrasing; clearer section-to-section flow
  (Introduction → Problem → Motivation → Requirements → Related Work → Architecture).
- **Terminology consistency.** Standardised on "row-level security (RLS)",
  "localisation", "detection events", "sign inventory", and "external inference service"
  throughout.
- **Contribution clarity.** The abstract, §3, and §20 now state the contribution
  consistently: the detector is external; the platform (integration, geolocation fusion,
  duplicate filtering, mapping, review, observability, storage security, demo, tests) is
  the contribution.
- **Architecture/implementation/evaluation alignment.** The two-trust-tier model, the
  seven-step frame workflow, the localisation formula, and the verified validation
  outcomes are described consistently across §6, §9–§12, and §17.

## 2. Placeholders resolved (with verified sources)
- Traffic-sign detection/recognition (Introduction, Related Work) → [1], [2].
- Object detectors named as examples (AI integration, Related Work) → [3] YOLO,
  [4] Faster R-CNN, [5] SSD.
- Haversine / great-circle distance (§12, and the references list) → [6] Sinnott (1984).
- Geospatial clustering / point consolidation (Related Work) → [7] DBSCAN (Ester et al.).
- Stack/platform/security (§7, §8, §13, §15) → [8] Leaflet, [9] OpenStreetMap,
  [10] Next.js, [11] Supabase, [12] PostgreSQL RLS.
- Future-work spatial indexing (§18, §19) → [13] PostGIS; future evaluation → [2].

All academic entries [1]–[7] were checked against indexing/publisher pages during
preparation (dblp, CVF, NeurIPS, Springer, publisher DOIs). Confirmed DOIs are included
for [1], [3], [5]; [2], [4], [7] are cited without a DOI rather than guessing one.

## 3. Placeholders that remain (see CITATION_GAP_LIST.md)
- §1 — road-safety / maintenance / asset-management motivation.
- §11 — GPS/GNSS positioning uncertainty in mobile collection.
- §5 / §14 — human-in-the-loop review of ML outputs.

These are marked `[citation pending]` in the report. They were **not** filled with
fabricated sources.

## 4. Claims softened or removed to avoid overclaiming
- Removed the draft's bare "no labelled evaluation dataset was measured" placeholder and
  reworded it as a **scope statement** (the model is external; accuracy is not measured),
  which needs no external citation.
- Detectors [3]–[5] are presented as **representative examples** of what an external
  endpoint "might host," not as components built or evaluated in this project.
- The grouping method is described as **"conceptually aligned with"** density-based
  spatial clustering [7], not as an implementation of DBSCAN.
- Avoided absolute terms (e.g., "state-of-the-art", "best"); kept the evaluation strictly
  to verified facts (migrations applied, private bucket, demo seed, E2E 24/24, clean
  validate, 54 routes) and labelled demo counts explicitly as demo-dataset counts, not
  performance metrics.

## 5. Citation / source limitations
- Verification used web search against public indexing/publisher pages; entries should be
  re-confirmed against the institution's required citation style and, where needed, exact
  DOIs/pages added (notably [6]'s page 158 vs 159 and DOIs for [2], [4], [7]).
- Official-documentation references [8]–[13] are canonical project sites with an
  "accessed 2026" note; add precise access dates if the style requires them.

## 6. Recommended next step before DOCX/PDF export
1. Resolve the three open `[citation pending]` items (or remove the corresponding
   sentences if a source cannot be found).
2. Reformat `REFERENCES.md` into the exact required citation style and renumber if needed.
3. Insert the manually captured screenshots (seed demo data first) into a figures section
   / appendix.
4. Re-read once for any residual `[citation pending]` markers, then export to DOCX/PDF
   (no PDF/DOCX is produced by this task).
