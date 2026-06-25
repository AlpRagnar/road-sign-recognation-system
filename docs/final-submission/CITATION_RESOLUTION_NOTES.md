# Citation Resolution Notes

How the three citation gaps left open by TASK 019 were closed in
`PROJECT_REPORT_FINAL.md` / `REFERENCES_FINAL.md`.

## Gaps resolved

| # | Report section | Gap (TASK 019) | Resolution | Source |
| --- | --- | --- | --- | --- |
| A | §1 Introduction | Road-safety / road-asset-management motivation | Cited WHO road-safety report for the road-safety motivation; the maintenance/inventory framing is kept general and non-statistical. | [14] WHO, *Global status report on road safety 2023* |
| B | §11 Geolocation & Localisation | GPS/GNSS positioning uncertainty | Cited the official GPS SPS Performance Standard to justify that GPS has a bounded error budget and a single fix is not exact. | [15] GPS SPS Performance Standard, 5th ed., 2020 (gps.gov) |
| C | §5 Related Work, §14 Admin & Observability | Human-in-the-loop review / validation of ML outputs | Cited a peer-reviewed HITL survey; wording states review *improves operational data quality* and explicitly does **not** guarantee correctness. | [16] Wu et al., *A survey of human-in-the-loop for machine learning*, FGCS, 2022 |

All three were resolved with **verified** sources. No `[citation pending]`,
`[Reference needed]`, `TODO`, or `TBD` markers remain in `PROJECT_REPORT_FINAL.md`.

## Sources added (relative to TASK 019 `REFERENCES.md` [1]–[13])

- **[14]** World Health Organization, "Global status report on road safety 2023," WHO,
  2023, ISBN 978-92-4-008651-7. *(official report; verified — publisher page + ISBN)*
- **[15]** U.S. Government, "Global Positioning System Standard Positioning Service (SPS)
  Performance Standard," 5th ed., April 2020 (gps.gov). *(official technical standard;
  verified — gps.gov)*
- **[16]** X. Wu, L. Xiao, Y. Sun, J. Zhang, T. Ma, L. He, "A survey of human-in-the-loop
  for machine learning," *Future Generation Computer Systems*, vol. 135, pp. 364–381,
  2022, DOI 10.1016/j.future.2022.05.014. *(peer-reviewed; verified — publisher + DOI)*

## Claims softened / phrased carefully

- **Road-asset/maintenance (§1):** [14] supports road safety in general; the
  maintenance/asset framing is stated as general motivation without attributing specific
  statistics to the source. No WHO figures were quoted as project results.
- **GPS uncertainty (§11):** described as a "bounded but non-zero error budget" with a
  global-average user-range-error commitment, matching the SPS standard's language;
  avoided implying device-level accuracy guarantees.
- **HITL (§5, §14):** stated that administrative review is "intended to improve the
  operational quality" and "does not, by itself, guarantee correctness" — deliberately
  avoiding any overclaim of accuracy or correctness.
- **Detection model:** consistently described as external; detectors [3]–[5] are framed
  as representative examples a model server "might host," not as components built or
  benchmarked here.
- **Demo counts (§17):** explicitly labelled as "representative seeded dataset counts,
  not performance measurements."

## References intentionally without a DOI

- **[2] IJCNN 2013**, **[4] NeurIPS 2015**, **[7] KDD 1996** — proceedings entries; no DOI
  was confirmed during preparation, so none is asserted (venue + year + pages are
  verified). [15] is an official standard cited by edition/date rather than a DOI.

## Remaining citation issues (transparency)

- **Minor:** [6] (Sinnott) exact page — sources show 158 vs 159; the report lists
  158–159. Finalise against the print/ADS record.
- **Style:** entries use an IEEE-like numeric style; reformat to the institution's
  required style and confirm retrieval dates for web sources.
- No substantive unresolved citation gaps remain. All inline claims are traceable to a
  verified source or to the repository implementation.
