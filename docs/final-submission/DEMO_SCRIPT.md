# Live Demo Script (7–10 minutes)

A click-by-click script for demonstrating the **already-implemented, demo-seeded** app.
Practice once end-to-end before presenting.

## Pre-demo setup checklist

- [ ] `.env.local` configured (real Supabase keys, `AI_MODEL_MODE=mock`).
- [ ] `npm run dev` running on `http://localhost:3000` (use **localhost** — camera/GPS require it).
- [ ] Logged out, or ready to log in fresh.
- [ ] Demo data seeded (Admin → Demo Tools → Seed). If unsure, you'll seed live in Step 4.
- [ ] Internet available for OpenStreetMap tiles.
- [ ] Browser: Chrome/Edge; allow camera + location prompts in advance if showing `/detection`.
- [ ] Zoom level / font size comfortable for the room.

**Login reminder:** email `<E2E_ADMIN_EMAIL>` · password `<your admin password>`
*(do not show the password on screen; type it privately).*

**Tabs to prepare (optional):** keep one tab; navigate within it. Optionally pre-open a
second tab on `/presentation?presentation=1` as a fallback.

---

## Step-by-step flow

### 1. `/login` (~30s)
- **Do:** Open `http://localhost:3000/login`.
- **Say:** "Everything is behind Supabase Auth; unauthenticated users are redirected."
- **Expect:** Login form (email + password).

### 2. Log in as admin (~20s)
- **Do:** Enter admin email + password → Sign in.
- **Say:** "I'm logging in as an administrator."
- **Expect:** Redirect to `/dashboard`; sidebar shows admin links.

### 3. `/dashboard` (~45s)
- **Do:** Point out KPI cards, verification breakdown, top sign types.
- **Say:** "These KPIs come from a database-side RPC — note the 'Summary metrics source: DB RPC' line."
- **Expect:** Populated metrics (after seeding); no errors.

### 4. `/admin/demo` (~45s)
- **Do:** Open Admin → Demo Tools. If counts are zero, click **Seed demo data** and wait for the "Seeded …" notice.
- **Say:** "Demo data is deterministic and clearly marked, so it can be cleared safely without touching real records."
- **Expect:** Status counts (e.g., 4 devices, 6 sessions, 120 detections, 35 signs, 7 snapshots).

### 5. `/map/signs` (~60s)
- **Do:** Switch between **Markers**, **Clustered**, **Density**; apply a filter.
- **Say:** "This is the optimized inventory — one marker per physical sign, not per raw detection."
- **Expect:** Leaflet map with demo markers/clusters.

### 6. Sign detail panel (~30s)
- **Do:** Click a marker to open the detail panel.
- **Say:** "Each sign shows type, confidence, detection count, verification status, and a link to the latest detection."
- **Expect:** Side panel with sign details.

### 7. Detection detail (~40s)
- **Do:** From the panel "view latest detection" or via `/admin/detections` → **View details**.
- **Say:** "Here is the raw detection: metadata, location, the AI response, and a bounding-box overlay. Demo rows have no image, which the UI handles gracefully."
- **Expect:** Detection detail page; metadata visible; image area shows a graceful state.

### 8. `/admin/detections` (~30s)
- **Do:** Show the paginated/filterable list; mention per-row review actions.
- **Say:** "Admins can verify, reject, or mark duplicates here."
- **Expect:** Table with demo detections + thumbnails.

### 9. `/admin/ai` (~60s)
- **Do:** Click **Run health check**, then **Run self-test**; show activity summary / failure breakdown / time-series.
- **Say:** "Self-test validates the model contract without creating any production data. Observability shows success/failure rates and a threshold alert."
- **Expect:** Health result; self-test returns normalized detections; charts render.

### 10. `/admin/analytics` (~30s)
- **Do:** Show daily snapshot KPIs and trend bars; click **Create / refresh today** if useful.
- **Say:** "Durable daily snapshots preserve trends even if raw logs are pruned; a gap warning flags missing days."
- **Expect:** Snapshot table + trend bars.

### 11. `/admin/storage` (~30s)
- **Do:** Show quarantine reconciliation + run history.
- **Say:** "Cleanup is quarantine-first and grace-period gated — nothing is ever auto-deleted."
- **Expect:** Status counts + reconciliation runs.

### 12. `/presentation?presentation=1` (~20s)
- **Do:** Show the Presentation Mode badge and guided cards.
- **Say:** "Presentation mode gives a clean, guided tour without bypassing auth."
- **Expect:** Badge visible; step cards render.

### 13. (Optional) `/detection` (~45s)
- **Do:** Open `/detection`; allow camera/GPS prompts.
- **Say:** "Live capture: select a device, then Start streams frames to the AI (mock mode here)."
- **Expect:** Device selector; Start enabled after selecting a device; no crash.

---

## Backup plans

- **Camera/GPS permission fails or no hardware:** Skip Step 13. Say "live capture needs camera/GPS permission; the saved demo detections already show the full result." The automated suite mocks camera/GPS, so the page itself is verified.
- **Map tiles slow / offline:** Stay on the page; the Leaflet container still renders. Say "tiles come from OpenStreetMap; markers/clusters are ours." Switch to **Density** mode (no tile dependency for the shapes) or fall back to `/admin/detections` to show the data.
- **Demo data missing (counts zero):** Go to `/admin/demo` → **Seed demo data**; wait for the notice; then revisit the page.
- **Signed image URL expired (image fails to load):** Click **Refresh image** on the detail/sign panel — it re-signs by entity id. Note: demo detections intentionally have no image, so this is expected for seeded rows.
- **Anything errors unexpectedly:** Fall back to `/presentation?presentation=1` and narrate the guided cards, or show the green Playwright run / `npm run validate` output as evidence of a working build.
