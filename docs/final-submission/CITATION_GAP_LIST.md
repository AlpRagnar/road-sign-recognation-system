# Citation Gap List

Claims in `PROJECT_REPORT_FINAL_CANDIDATE.md` that still need a verified citation. Each
is marked `[citation pending]` in the report. No source was invented for these; add a
real, verifiable reference before final submission and replace the marker.

---

- **Report section:** §1 Introduction
  **Claim needing support:** "An accurate inventory of road traffic signs supports
  road-safety analysis, maintenance planning, and asset management."
  **Suggested source type:** A transportation asset-management standard or a peer-
  reviewed road-safety / mobile-mapping inventory paper (e.g., a journal article on
  sign-inventory systems, or an official road-asset-management guideline).
  **Status:** OPEN — not cited (no source verified during preparation).

- **Report section:** §11 Geolocation and Localisation Method
  **Claim needing support:** "GPS measurements are inherently uncertain in mobile data
  collection."
  **Suggested source type:** The official GPS Standard Positioning Service (SPS)
  Performance Standard (gps.gov), or a peer-reviewed study quantifying consumer/mobile
  GNSS positioning accuracy.
  **Status:** OPEN — deliberately not cited to avoid asserting an unverified edition/year.

- **Report section:** §5 Related Work and §14 Admin Management and Observability
  **Claim needing support:** "Human-in-the-loop review of machine-learning outputs is a
  recognised practice."
  **Suggested source type:** A peer-reviewed survey on human-in-the-loop machine learning
  / human-in-the-loop labelling or review.
  **Status:** OPEN — not cited to avoid fabricating survey metadata.

---

## Minor / metadata to finalise (not blocking)

- **Reference [6] (Sinnott, "Virtues of the Haversine," Sky & Telescope, 1984):**
  confirm the exact page (sources show **158** vs **159**; the report currently lists
  pp. 158–159). **Status:** MINOR.
- **References [2], [4], [7]:** cited without a DOI (none confirmed during preparation).
  Add the DOI/stable URL if your citation style requires it. **Status:** MINOR.
- **Citation style:** entries are in an IEEE-like numeric style; reformat to the exact
  style required by your institution (IEEE/APA/Harvard) before submission.
  **Status:** MINOR.

## Resolved (for reference)

The following draft placeholders were resolved with verified sources:
- Traffic-sign detection/recognition → [1], [2]; detectors → [3], [4], [5].
- Geospatial clustering / point consolidation → [7].
- Haversine / great-circle distance → [6].
- Platform/stack/security → [8]–[12]; spatial indexing (future work) → [13].
- The draft's "no labelled evaluation dataset was measured" placeholder was reworded as a
  project-scope statement (no external citation required).
