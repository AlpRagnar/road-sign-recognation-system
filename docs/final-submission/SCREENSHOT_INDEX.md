# Screenshot Index

Final demo screenshots for the report and slides. Files live in
`public/final-screenshots/`. Captured via Playwright MCP against the **real
Supabase backend**, logged in as the admin, after seeding demo data
(`/admin/demo`). Viewport 1440×1000; `AI_MODEL_MODE=mock`. No secrets, tokens,
`.env.local`, or passwords appear in any image (the login shot has empty fields).

Report sections refer to `PROJECT_REPORT_FINAL.md`; slide numbers refer to
`PRESENTATION_FINAL_CONTENT.md`.

| File | Route | Purpose | Report section | Slide | Notes / limitations |
|---|---|---|---|---|---|
| `01-login-page.png` | `/login` | Authentication entry point | §12, §6 | 6 | Captured logged-out; fields empty (no credentials shown). |
| `02-dashboard-kpis.png` | `/dashboard` | KPI cards + "Summary metrics source: DB RPC" | §13, §17 | 4, 13 | Full page; populated after demo seed. |
| `03-demo-tools-seeded.png` | `/admin/demo` | Demo tooling + seeded status counts | §16 | 13 | Shows "Seeded 4 devices, 6 sessions, 120 detections, 35 signs, 7 snapshots". Counts are seeded demo data, not metrics. |
| `04-sign-map-cluster-or-density.png` | `/map/signs` | Optimized sign inventory map | §13 | 10 | Clustered markers over OpenStreetMap tiles (26 clusters from demo signs). |
| `05-sign-detail-panel.png` | `/map/signs` | Selected sign detail panel | §13 | 10 | Captured in "Markers" mode after opening a marker; side panel visible. |
| `06-detection-detail-bbox.png` | `/detections/[id]` | Detection detail: metadata + bounding-box area | §10, §11 | 8 | **Limitation:** demo detections have null image paths, so the image area shows the graceful "No image captured" state. Bounding-box numeric fields and metadata still render. Capture against a real camera-captured detection to show the overlay on an image. |
| `07-admin-detections-review.png` | `/admin/detections` | Raw detection review table + controls | §14 | 11 | Full page; thumbnails column shows the no-image placeholder for demo rows. |
| `08-ai-observability.png` | `/admin/ai` | AI health, self-test, activity/failure analytics | §9, §14 | 7, 11 | Captured after clicking "Run health check". |
| `09-admin-analytics.png` | `/admin/analytics` | Daily metric snapshots + trend bars | §14, §17 | 11 | Full page; trend bars from the 7 seeded daily snapshots. |
| `10-storage-maintenance.png` | `/admin/storage` | Backfill, quarantine-first reconciliation, run history | §15 | 12 | Full page; nothing is auto-deleted (quarantine-first). |
| `11-presentation-mode.png` | `/presentation?presentation=1` | Guided presentation/demo landing | §16 | 14 | Full page; "Presentation Mode" badge + guided cards visible. |
| `12-live-devices-map.png` | `/map/devices` | Live field-device tracking map | §13 | 10 | *(optional)* 4 device markers over OSM tiles. |
| `13-detection-session.png` | `/detection` | Camera/GPS/device-selection detection page | §10 | 6 | *(optional)* Camera/GPS handled via Playwright fake media-stream flags + injected geolocation (Aalborg); page renders device selector + Start without hardware. |

## Notes / limitations summary
- **Detection-detail image (`06`):** seeded demo detections intentionally use null image
  paths (no fabricated signed URLs), so the detail view and admin thumbnails show a
  graceful "no image" state. To show a real bounding-box overlay on an image, capture
  against a live camera-captured detection (run `/detection` with a real camera) and use
  the **Refresh image** control if a signed URL has expired.
- **Maps (`04`, `05`, `12`):** captured as viewport screenshots (the map fills the
  viewport); OpenStreetMap tiles require internet at capture time.
- **`/detection` (`13`):** camera and geolocation are mocked by the browser launch flags
  (`--use-fake-ui-for-media-stream`, `--use-fake-device-for-media-stream`) and an injected
  geolocation; no real hardware was used.
- All other pages are full-page screenshots.
