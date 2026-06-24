# TASK 006 — Captured Image Preview, Bounding Box Overlay & AI Response Detail

## Mission

You are working inside the existing Next.js 14 App Router + TypeScript + Tailwind + Supabase MVP for the AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

The MVP is already implemented and verified through TASK 005. Do **not** rebuild the project. Continue from the current repository and implement **Task 006 only**.

The goal of this task is to make each detection visually inspectable by adding captured image previews, bounding-box overlays, and a detailed AI response view for detection events and traffic signs.

This task is important for the university presentation because it makes the AI result explainable: the user/admin should be able to see the image, the detected sign location inside the image, the model confidence, the geolocation metadata, and the raw AI response summary.

---

## Critical Rules

- Do NOT create git commits.
- Do NOT run `git commit`.
- Do NOT run `git push`.
- Do NOT deploy.
- Do NOT rebuild the MVP from scratch.
- Do NOT rewrite the existing architecture.
- Do NOT introduce heavy image-processing dependencies unless absolutely necessary.
- Do NOT expose service-role keys or auth.admin utilities to client components.
- Keep the current stack: Next.js 14 App Router, TypeScript, Tailwind, Supabase, Leaflet.
- Prefer minimal, targeted, production-safe changes.
- Run lint and build at the end.

---

## Current Project State

The system already has:

- Supabase Auth login and protected routes
- User device management
- Admin user/device management
- Admin Auth user creation and password reset
- Detection session with camera + geolocation
- Frame upload API
- AI API/mock response flow
- `detection_events` table with image URL, bounding-box fields, confidence, raw response JSON, GPS metadata
- `traffic_signs` grouped inventory
- `traffic_sign_observations`
- Static sign map with marker/cluster/density modes
- Sign detail panel
- Admin raw detection review
- CSV export
- Dashboard analytics

Task 006 should build on these existing structures.

---

## Main Objective

Add visual inspection features for detection events:

1. Image preview for captured frames.
2. Bounding-box overlay on the detected traffic sign area.
3. Detection event detail view/page or modal.
4. AI response summary panel.
5. Link from sign detail panel to latest/related detection detail.
6. Link from admin detection review table to detection detail.
7. Optional thumbnail preview in detection/admin tables if simple and safe.

---

## Required Feature 1 — Reusable Detection Image Component

Create a reusable component for displaying a detection image with a bounding box overlay.

Recommended component:

```text
src/components/DetectionImagePreview.tsx
```

Expected behavior:

- Accepts `imageUrl`.
- Accepts bounding box fields:
  - `bbox_x`
  - `bbox_y`
  - `bbox_width`
  - `bbox_height`
- Shows image preview.
- Draws bounding box overlay above the image.
- Handles missing image URL gracefully.
- Handles missing bbox gracefully.
- Supports image loading state.
- Supports image error state.
- Does not crash if bbox values are null.
- Works in responsive layouts.

Important implementation detail:

The stored bbox fields may be in pixel coordinates relative to the captured image. Since browser rendering can resize the image, calculate overlay scaling based on the rendered image size vs natural image size.

Use the image element's `naturalWidth`, `naturalHeight`, `clientWidth`, and `clientHeight` to position the overlay correctly.

If image natural dimensions are unavailable, hide the box and show a small note: `Bounding box unavailable until image loads.`

Do not use canvas unless necessary. A positioned absolute `<div>` overlay is preferred.

---

## Required Feature 2 — Detection Detail API

Add or verify an authenticated API route for fetching one detection event with related context.

Recommended route:

```text
GET /api/detections/[id]
```

Expected response should include:

- detection event fields
- device name/type if available
- user/profile name/email if available and permitted
- linked traffic sign if available through `traffic_sign_observations`
- validation status
- AI response summary

Security:

- Must require authentication.
- Normal users can only access their own detection events.
- Admins can access all detection events.
- Use server-side authorization checks.
- Do not return secrets.
- Do not return unnecessary raw data unless needed.

Raw AI response handling:

- It is acceptable to return `ai_response_raw` to authenticated users for their own detections and admins.
- If the raw response is too large, return a summarized subset and keep a compact expandable JSON viewer on the frontend.
- Do not include API keys, request headers, or server secrets.

---

## Required Feature 3 — Detection Detail Page

Add a protected detection detail page.

Recommended route:

```text
/detections/[id]
```

The page should show:

### Visual Section

- Captured frame preview
- Bounding box overlay
- Image URL/open image link if useful

### Detection Metadata

- detected class name
- detected class ID
- confidence
- validation status
- created timestamp
- AI response time in ms

### Location Metadata

- latitude
- longitude
- GPS accuracy
- heading
- speed

### Device/User Context

- device name
- device type
- device identifier if available
- user/profile name/email if admin or already visible in current data model

### AI Response Panel

- compact formatted JSON viewer for `ai_response_raw`
- collapsible section preferred
- avoid huge UI lockups; format safely

### Linked Sign Context

If this detection is linked to a `traffic_sign`:

- show sign type
- grouped sign coordinates
- grouped sign confidence score
- detection count
- verification status
- link back to `/map/signs` or sign detail if the UI supports it

---

## Required Feature 4 — Admin Detection Review Integration

Update the existing `/admin/detections` page/table:

- Add a `View details` action per row.
- Link to `/detections/[id]`.
- If easy and not visually noisy, add a small thumbnail column using the detection image URL.
- Keep the existing verify/reject/duplicate/reset actions.
- Keep pagination/search/filter behavior from Task 005.

Do not make the table too heavy. Thumbnail must be small and lazy-loaded.

---

## Required Feature 5 — Sign Detail Integration

Update the existing sign detail panel on `/map/signs`:

- If latest related detection event exists, add a `View latest detection` link to `/detections/[id]`.
- If multiple observations are already known or easily queryable, optionally show a small list of recent related detections.
- Keep this lightweight.

Do not overload the map panel with too much information.

---

## Required Feature 6 — Detection Session Result Card Enhancement

When `/detection` receives new mock/real AI detection results, improve the result card if the current code structure allows it safely:

- Show detected class name and confidence as before.
- Show a small captured-frame preview if the returned API response includes image URL and bbox fields.
- Optionally show bbox coordinates.
- Add a `View detail` link if the API response returns the saved detection event ID.

If the current frame API does not return detection event IDs, update it to return saved event summaries safely.

Expected API response shape can include:

```json
{
  "ok": true,
  "imageUrl": "...",
  "detections": [
    {
      "id": "detection-event-uuid",
      "className": "Speed Limit 50",
      "confidence": 0.92,
      "bbox": { "x": 120, "y": 80, "width": 64, "height": 64 },
      "validationStatus": "pending"
    }
  ]
}
```

Maintain backwards compatibility if possible.

---

## Required Feature 7 — README Update

Update `README.md` with a short section explaining:

- how to inspect a captured detection
- where to find bounding-box previews
- how admins can review detections visually
- limitations of public image URLs vs signed URLs

Keep it concise.

---

## Acceptance Criteria

Task 006 is complete when:

- `/detections/[id]` exists and works for authenticated users.
- Admins can open any detection detail.
- Normal users cannot open another user's detection detail.
- Detection detail page shows captured image preview.
- Bounding box overlay renders correctly after image load.
- Missing image/bbox cases do not crash.
- `/admin/detections` has a detail link per row.
- `/map/signs` sign detail panel links to latest detection detail if available.
- `/detection` result cards expose saved detection IDs or detail links if feasible.
- No service-role code leaks into client components.
- `npm run lint` passes.
- `npm run build` passes.

---

## Recommended Verification Commands

Run:

```bash
npm run lint
npm run build
```

Also run a dev smoke test if practical:

```bash
npm run dev
```

Manual smoke-test checklist:

1. Log in as a normal user.
2. Register/select a device.
3. Start detection in mock mode.
4. Confirm detection result cards show saved detection info.
5. Open a detection detail page.
6. Confirm image and bbox overlay appear.
7. Confirm map sign detail links to latest detection.
8. Log in as admin.
9. Open `/admin/detections`.
10. Open detection detail from a row.
11. Verify/reject/reset still works.
12. Confirm non-admin users cannot access another user's detection detail.

---

## Final Report Format

At the end, report:

1. What you implemented
2. Files changed
3. API routes added/modified
4. Security/authorization checks
5. Commands run
6. Verification result
7. Known limitations
8. Recommended next task
9. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
