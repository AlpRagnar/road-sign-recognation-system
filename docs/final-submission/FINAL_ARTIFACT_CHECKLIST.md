# Final Artifact Checklist

Complete before submission/presentation. Boxes are unchecked so each is verified on your
machine/project.

## Code validation
- [ ] `npm run lint` clean.
- [ ] `npm run typecheck` clean.
- [ ] `npm run build` clean (production build, ~54 routes).
- [ ] `npm run validate` (lint + typecheck + build) passes in one command.

## Real Supabase validation
- [ ] Project reachable; migrations `0001`–`0006` applied in order.
- [ ] Expected tables + analytics functions present.
- [ ] Private `traffic-sign-frames` bucket (public access disabled).
- [ ] Admin account present with `role = 'admin'`.

## Playwright E2E validation
- [ ] Chromium installed (`npx playwright install chromium`).
- [ ] E2E env vars set (`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, optional `E2E_ALLOW_DEMO_MUTATIONS=true`).
- [ ] `npm run test:e2e` passes (verified 24/24).

## Report finalization
- [ ] `PROJECT_REPORT_FINAL.md` reviewed; no `[citation pending]`/`[Reference needed]`/`TODO`/`TBD` markers.
- [ ] Demo counts described as representative seeded data (not metrics).
- [ ] No claim that the external model was trained/benchmarked here.

## References finalization
- [ ] `REFERENCES_FINAL.md` reviewed; all sources cited in the report appear in the list.
- [ ] Reformatted to the institution's required citation style (IEEE/APA/Harvard).
- [ ] [6] page (158 vs 159) finalised; DOIs added where the style requires.

## Screenshots captured (seed demo data first)
> Captured into `public/final-screenshots/`; mapping in `SCREENSHOT_INDEX.md`.
- [x] Dashboard. (`02-dashboard-kpis.png`)
- [x] Traffic sign map (clustered/density). (`04-sign-map-cluster-or-density.png`)
- [x] Sign detail panel. (`05-sign-detail-panel.png`)
- [x] Detection detail with bounding box. (`06-detection-detail-bbox.png` — demo rows show the no-image state; see index.)
- [x] Admin AI observability. (`08-ai-observability.png`)
- [x] Admin analytics. (`09-admin-analytics.png`)
- [x] Demo / presentation page. (`03-demo-tools-seeded.png`, `11-presentation-mode.png`)
- [x] Login, admin detections, storage, device map, detection session. (`01`, `07`, `10`, `12`, `13`)

## Export artifacts
> Generated into `docs/final-submission/exports/`; details in `exports/EXPORT_SUMMARY.md`.
- [x] DOCX exported (`exports/Traffic_Sign_Mapping_Final_Report.docx`) — 8 figures, tables, references.
- [ ] PDF exported — **manual step** (no pandoc/LibreOffice/LaTeX; headless Word blocked). See `exports/EXPORT_SUMMARY.md` §5.
- [x] PPTX created (`exports/Traffic_Sign_Mapping_Presentation.pptx`) — 14 slides, screenshots + speaker notes.
- [x] Export summary written (`exports/EXPORT_SUMMARY.md`).

## Demo readiness
- [ ] `AI_MODEL_MODE=mock` for the demo.
- [ ] Demo data seeded via `/admin/demo`.
- [ ] `/presentation?presentation=1` shows badge + guided cards.
- [ ] Demo credentials prepared **securely** (typed privately; not shown on screen or in files).

## Security / hygiene
- [ ] `.env.local` is **not** committed (gitignored — confirm with `git status`).
- [ ] No service-role key, API key, `CRON_SECRET`, or real password in any document/screenshot.
- [ ] Demo data cleared from any shared/production-like project after the demo.

## Final review
- [ ] `git status` reviewed; only intended files staged (docs).
- [ ] Final commands run and recorded:

```bash
npm run validate
npm run test:e2e
```
