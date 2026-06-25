# Export Summary

Generated final submission artifacts from the `docs/final-submission/` Markdown sources.

## 1. Artifacts generated

| Artifact | Status | File |
| --- | --- | --- |
| Final report (DOCX) | ✅ generated | `Traffic_Sign_Mapping_Final_Report.docx` |
| Final report (PDF) | ⚠️ not generated (see §5) | — (manual step) |
| Presentation (PPTX) | ✅ generated (14 slides) | `Traffic_Sign_Mapping_Presentation.pptx` |
| Export summary | ✅ this file | `EXPORT_SUMMARY.md` |

## 2. Source files used

- `docs/final-submission/PROJECT_REPORT_FINAL.md` → report body.
- `docs/final-submission/REFERENCES_FINAL.md` → references section (appended after a page break).
- `docs/final-submission/PRESENTATION_FINAL_CONTENT.md` → slide titles, bullets, and speaker notes.
- `docs/final-submission/SCREENSHOT_INDEX.md` → screenshot placement mapping.
- `public/final-screenshots/*.png` → embedded figures.

## 3. Screenshot files included

**DOCX (8 figures, placed by section):**
- §13 Map Visualisation: `04-sign-map-cluster-or-density.png`, `05-sign-detail-panel.png`
- §14 Admin & Observability: `07-admin-detections-review.png`, `08-ai-observability.png`, `09-admin-analytics.png`
- §15 Storage Security: `10-storage-maintenance.png`
- §16 Demo & Testing: `11-presentation-mode.png`
- §17 Evaluation: `02-dashboard-kpis.png`

**PPTX (8 slides with figures):**
- System Overview → `02-dashboard-kpis.png`
- Detection Session Workflow → `13-detection-session.png`
- Location Fusion & Duplicate Filtering → `05-sign-detail-panel.png`
- Map Dashboard → `04-sign-map-cluster-or-density.png`
- Admin & Observability → `08-ai-observability.png`
- Security & Storage → `10-storage-maintenance.png`
- Testing & Validation → `09-admin-analytics.png`
- Limitations / Conclusion → `11-presentation-mode.png`

The remaining screenshots (`01-login-page.png`, `03-demo-tools-seeded.png`, `06-detection-detail-bbox.png`, `12-live-devices-map.png`) are catalogued in `SCREENSHOT_INDEX.md` and can be inserted manually if desired. Note: `06` shows the documented "no image" state for demo detections.

## 4. Tooling used

- **DOCX:** `python-docx` 1.2.0 (with `Pillow` for image sizing). Headings, paragraphs,
  GFM pipe tables (rendered as Word tables), fenced code blocks (Courier New), bullet/
  numbered lists, blockquotes, and inline bold/italic/code are preserved; figures are
  centred with italic captions.
- **PPTX:** `python-pptx` 1.0.2 (16:9, 13.33×7.5 in). One title slide + 13 content slides,
  brand accent bar, concise bullets, screenshots on the right, and **speaker notes** on
  every slide (opening script on the title slide; closing script appended to the last
  slide's notes).
- Libraries were installed into a throwaway virtual environment outside the repo; no new
  runtime dependencies were added to the application.

## 5. PDF generation status — NOT generated (documented blocker)

No reliable headless PDF path is available in this environment:
- **Pandoc** — not installed.
- **LibreOffice / `soffice`** — not installed (no app bundle).
- **LaTeX** (`pdflatex`/`xelatex`/`tectonic`) — not installed.
- **Microsoft Word** — installed, but headless AppleScript conversion (`save as … PDF`)
  hung on a macOS GUI/automation permission prompt in this non-interactive shell, so it
  was aborted to avoid blocking. No partial PDF was produced.

**To produce the PDF (any one of these — pick the easiest):**
1. **Word (fastest here):** open `Traffic_Sign_Mapping_Final_Report.docx` in Microsoft
   Word → *File → Save As / Export → PDF*.
2. **Google Docs:** upload the DOCX → *File → Download → PDF Document (.pdf)*.
3. **macOS Pages:** open the DOCX → *File → Export To → PDF*.
4. **Pandoc + LaTeX** (if installed later):
   ```bash
   pandoc docs/final-submission/PROJECT_REPORT_FINAL.md docs/final-submission/REFERENCES_FINAL.md \
     -o docs/final-submission/exports/Traffic_Sign_Mapping_Final_Report.pdf \
     --toc --number-sections --pdf-engine=xelatex
   ```
5. **LibreOffice headless** (if installed later):
   ```bash
   soffice --headless --convert-to pdf \
     --outdir docs/final-submission/exports \
     docs/final-submission/exports/Traffic_Sign_Mapping_Final_Report.docx
   ```

## 6. Manual actions still required

- [ ] Generate the PDF from the DOCX (see §5).
- [ ] Open the DOCX/PPTX once in Word/PowerPoint (or Google equivalents) to confirm
      formatting, page breaks, and figure scaling; adjust the title slide author/date.
- [ ] Optionally insert the 4 remaining screenshots.
- [ ] Reformat references to the institution's required citation style if needed.

## 7. Final pre-submission checklist (quick)

- [x] DOCX generated with figures, tables, and references.
- [x] PPTX generated (14 slides, figures + speaker notes).
- [ ] PDF generated (manual — §5).
- [x] Export summary written.
- [ ] Artifacts opened and visually verified.

## 8. Security warning

`.env.local`, the Supabase service-role key, the anon key, `AI_MODEL_API_KEY`,
`CRON_SECRET`, and any real passwords must **never** be included in these exports. The
screenshots were captured logged-in but contain no secrets (the login shot has empty
fields); do not add new screenshots that reveal tokens, the address bar with secrets, or
credential fields. Keep `.env.local` gitignored and out of the `exports/` folder.
