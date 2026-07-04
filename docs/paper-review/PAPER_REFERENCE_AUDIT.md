# Reference & Citation Audit

Source: `IEEE_Traffic_Sign_Inventory_Updated_Draft.docx`. Body citations were extracted programmatically (python-docx) and compared to the reference list.

## Summary

- Reference list contains **18** entries, `[1]`–`[18]`, numbered sequentially with no gaps.
- In-text citations present: **`[1]`–`[17]`** (the range token `[3]-[5]` expands to 3,4,5).
- **`[18]` (WHO, Global Status Report on Road Safety 2023) is NOT cited anywhere in the body.** → uncited reference.
- No in-text citation refers to a number missing from the list (no dangling citations).

## Per-reference status

| Ref | Short form | Cited in body? | Used appropriately for the claim? | Notes |
|-----|-----------|----------------|-----------------------------------|-------|
| [1] | Stallkamp et al., GTSRB (Neural Networks 2012) | Yes (§II.A) | Yes — traffic-sign recognition benchmark | Not externally verified (no network lookup); metadata plausible |
| [2] | Houben et al., GTSDB (IJCNN 2013) | Yes (§II.A) | Yes — detection benchmark | Not externally verified |
| [3] | Redmon et al., YOLO (CVPR 2016) | Yes (§II.A) | Yes — general detector | Not externally verified |
| [4] | Ren et al., Faster R-CNN (NeurIPS 2015) | Yes (§II.A) | Yes | Not externally verified |
| [5] | Liu et al., SSD (ECCV 2016) | Yes (§II.A) | Yes | Not externally verified |
| [6] | Soilán et al., mobile-mapping sign inventory (2016) | Yes (§II.A) | Yes — mobile-mapping + point clouds | Not externally verified |
| [7] | Balado et al., mobile mapping (Remote Sensing 2020) | Yes (§II.A) | Yes | Not externally verified |
| [8] | Gaspari et al., open-source GIS road cadastre (2023) | Yes (§II.A, §II.C) | Yes — cited for cadastre + sign-holder model | Cited 3×; consistent with related-work statements |
| [9] | Pedersen & Torp, geolocating from large imagery (SIGSPATIAL 2021) | Yes (§II.B) | Yes — position + direction importance | Not externally verified |
| [10] | Pedersen & Torp, crowd-sourced imagery (SIGSPATIAL 2020) | Yes (§II.B) | Yes — clustering repeated observations | Not externally verified |
| [11] | Hu et al., incremental crowd-source HD-map update (2025) | Yes (§II.B) | Yes — **change-layer** design principle. NOTE: the paper adopts the *principle*; the implementation does not build a separate authoritative/change layer (see claim matrix row 2) | Cite remains valid as inspiration; ensure body text says "design principle adopted" not "implemented as in [11]" |
| [12] | Leaflet documentation | Yes (§II.C) | Yes — map library actually used (`react-leaflet`) | URL present; add explicit accessed date (see below) |
| [13] | OpenStreetMap | Yes (§II.C) | Yes — tiles actually used | Accessed date should be a full date |
| [14] | Supabase documentation | Yes (§II.C) | Yes — auth/PostgreSQL/storage actually used | Accessed date should be a full date |
| [15] | PostgreSQL Row Security Policies | Yes (§II.C) | Yes — RLS actually used (`0001_init.sql`) | OK |
| [16] | PostGIS documentation | Yes (§II.C) | **Partially** — cited as a "scalable extension path". PostGIS is **not** implemented (no migration uses it). Acceptable as a future-path citation, but it must not appear as an implemented component or Index Term | Keep as future-path only |
| [17] | Wu et al., human-in-the-loop survey (2022) | Yes (§II.C) | Yes — motivates human review | Not externally verified |
| [18] | WHO, Global Status Report on Road Safety 2023 | **No** | Would fit the Introduction's road-safety motivation | **Uncited** — either cite in §I or remove |

## Required corrections

1. **[18] uncited** — Add a citation in §I (e.g., after the first sentence motivating road safety) *or* delete the entry. Recommended: cite it in the Introduction, since the road-safety framing is genuine.
2. **[16] PostGIS** — Ensure it is cited only as a future scalability path (§X), and remove "PostGIS" from the Index Terms (it is not an implemented platform component). See claim matrix row 3.
3. **[11] change layer** — Keep the citation, but the body must say the change-layer *principle* inspired a review-state workflow, not that an authoritative/change-layer separation was implemented.
4. **IEEE style for web references [12]–[16]** — Use a consistent "[Online]. Available: URL (accessed: Mon. DD, YYYY)." form with a concrete accessed date rather than "accessed 2026".
5. **No DOIs were fabricated.** Bibliographic details for [1]–[11], [17], [18] were **not externally verified** in this environment (no network lookup); they are carried over from the draft unchanged. They should be verified against the primary sources before submission. Do not invent DOI/volume/page values.

## Sequential-numbering check

`[1]…[18]` — sequential, no duplicates, no gaps in the list. Only issue is the uncited `[18]`.
