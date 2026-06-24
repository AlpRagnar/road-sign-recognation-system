# TASK 008 — Signed Storage URLs, Image Access Control & Secure Media Delivery

## Context

You are working inside the existing Traffic Sign Mapping MVP.

The project is a Next.js 14 App Router + TypeScript + Tailwind + Supabase application for AI-based traffic sign detection, localization, map visualization, detection review, admin analytics, and AI model integration.

Previous tasks already implemented and verified:

- Supabase Auth and protected routes
- Detection sessions with browser camera and geolocation
- Frame upload pipeline
- AI API/mock model integration
- Detection events and traffic sign grouping
- Static sign map and live device map
- Admin logs/review
- User device management
- Admin user/device management
- Admin Auth user provisioning and password reset
- Map clustering/density, CSV export and dashboard analytics
- Detection image preview, bounding-box overlay and detail page
- Hardened AI API contract, timeout/retry handling and admin AI health check

The known limitation now is that captured images are served from public Supabase Storage URLs. For a stronger security model, the bucket should be private and the application should serve time-limited signed URLs only to authorized users.

## Main Goal

Replace public image delivery with signed URL delivery end-to-end.

The expected final state:

- Captured frames are still uploaded to Supabase Storage.
- The storage bucket is expected to be private in production.
- The database should store storage object paths, not rely on public URLs as the access-control primitive.
- Authorized users receive short-lived signed URLs through server-side API routes only.
- Users can only access images they are allowed to see.
- Admins can access all detection images.
- Existing UI features continue to work:
  - detection result cards
  - detection detail page
  - admin detection thumbnails
  - sign detail panel representative/latest image
  - map/sign detail links
  - CSV exports remain safe and should not leak signed URLs unless explicitly designed as temporary links
- Lint and build must pass.

## Critical Rules

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT redesign the whole application.
- Do NOT introduce unrelated features.
- Do NOT make the storage bucket public as the long-term solution.
- Do NOT expose the Supabase service-role key to client components.
- Do NOT generate permanent public URLs for protected images.
- Keep changes minimal, targeted and consistent with the current architecture.
- Reuse existing auth/admin helpers where possible.
- Preserve all existing pages and flows.
- After completing the task, provide a concise final report and a suggested manual commit message.

## Implementation Requirements

### 1. Inspect Current Storage Usage

Find all current places where image URLs or storage paths are created, stored, read, returned, or displayed.

Inspect at minimum:

- `src/app/api/detection/frame/route.ts`
- `src/app/api/detections/[id]/route.ts`
- `src/app/api/map/signs/[id]/route.ts`
- `src/app/api/admin/detections/route.ts`
- `src/app/api/admin/export/detection-events.csv/route.ts`
- `src/app/api/admin/export/traffic-signs.csv/route.ts`
- `src/components/DetectionImagePreview.tsx`
- `src/components/DetectionResultCard.tsx`
- `src/components/DetectionDetailClient.tsx`
- `src/components/AdminDetectionsClient.tsx`
- `src/components/SignDetailPanel.tsx`
- any Supabase storage helper files
- database types related to `image_url` or storage object paths

Report the current image flow before modifying it.

### 2. Decide and Implement a Safe Storage Model

The preferred model:

- Keep the existing DB column names if changing schema would be too invasive.
- If `image_url` currently stores a public URL, migrate the application logic toward storing a storage object path.
- If the schema already has or can safely use `image_path`, use that for signed URL generation.
- Avoid breaking old rows if they contain public URLs. Add compatibility handling where necessary.

Recommended behavior:

- New frame uploads should persist the Supabase Storage object path.
- Server API responses should return `signedImageUrl` or `imageUrl` as a signed URL generated server-side.
- Client components should remain mostly unaware of storage internals.

If a migration is required, create a new migration file, for example:

```text
supabase/migrations/0002_secure_image_paths.sql
```

Only add a migration if it is truly necessary.

### 3. Add Server-Side Signed URL Helper

Create a reusable server-only helper, for example:

```text
src/lib/storage/signed-urls.ts
```

It should provide functions such as:

- `createSignedFrameUrl(path, expiresInSeconds)`
- `createSignedFrameUrls(paths, expiresInSeconds)`
- `extractStoragePathFromKnownValue(value)` if needed for backward compatibility

Requirements:

- Use the Supabase service-role/server client only on the server.
- Default expiry should be short, e.g. 5 minutes or 10 minutes.
- Expiry should be configurable through env if useful:
  - `SIGNED_IMAGE_URL_TTL_SECONDS=300`
- Never expose service role credentials.
- Do not log signed URLs.
- Return `null` gracefully for missing/invalid paths.

### 4. Update Frame Upload Pipeline

Modify `POST /api/detection/frame` so that:

- It uploads the captured frame to Supabase Storage.
- It stores the object path in the database or in a clearly documented field.
- It can still call the AI API using a URL the AI server can access.

Important design point:

If the AI server needs to access the image, decide one of the following:

Option A — Preferred for MVP:
- Generate a short-lived signed URL for the AI request.
- Send that signed URL as `image_url` to the AI server.
- Store only the object path in the DB.

Option B:
- Send image bytes/base64 directly to the AI server if current contract supports it.

Use Option A unless the existing AI contract makes it impossible.

The frame API response to the frontend should include a signed URL for immediate preview.

### 5. Update Detection Detail API

Modify `GET /api/detections/[id]` so that:

- It checks owner-or-admin authorization exactly as before.
- It returns a signed image URL only after authorization passes.
- It includes the storage path only if safe and needed internally; prefer not to expose it unnecessarily.
- Raw AI JSON should not include sensitive signed URLs if avoidable. If raw AI response contains signed image URLs, document the limitation and consider sanitizing the returned raw object.

### 6. Update Sign Detail API

Modify `GET /api/map/signs/[id]` so that:

- It still requires auth.
- It returns signed URLs for representative/latest images only if the user is allowed to see them.
- Admin can see all.
- Normal users should only see images from detections they are permitted to access under the existing policy model.

Preserve existing sign detail panel behavior.

### 7. Update Admin Detection List API

Modify admin detection list responses so that:

- Admin thumbnails use signed URLs.
- URLs are short-lived.
- Pagination/search/filter behavior remains unchanged.
- No signed URLs are logged.

### 8. Update UI Components

Update UI components to consume the new signed URL shape without breaking existing UX:

- `DetectionResultCard`
- `DetectionImagePreview`
- `DetectionDetailClient`
- `AdminDetectionsClient`
- `SignDetailPanel`

Requirements:

- Loading/error states should remain stable.
- If a signed URL expires while the page is open, the UI should fail gracefully.
- Do not attempt complex auto-refresh unless simple and safe.
- If implementing refresh, do it through an authenticated API route, not direct Storage calls from the client.

### 9. Update CSV Export Behavior

CSV export should not leak long-lived public image URLs.

Recommended behavior:

- Export storage paths or image presence indicators, not signed URLs.
- Or include signed URLs only if explicitly named as temporary and short-lived.

For MVP, prefer:

- `image_available=true/false`
- `image_path` only if it is not considered sensitive in this project
- no signed URL in CSV

Document the chosen behavior.

### 10. Environment and Documentation

Update `.env.example` if needed:

```env
SIGNED_IMAGE_URL_TTL_SECONDS=300
```

Update `README.md` and/or Supabase docs with:

- Bucket should be private in production.
- How to create/configure the `traffic-sign-frames` bucket.
- The app generates signed URLs server-side.
- The AI server receives a temporary signed URL for inference.
- Known limitation: signed URLs expire and may require refreshing by reloading/opening detail again.

### 11. Security Review

Verify and report:

- Service-role key is not imported by client components.
- Signed URLs are generated only after authorization.
- Admin APIs remain admin-only.
- Owner-only detection access remains enforced.
- No signed URLs are written to `system_logs`.
- No signed URLs are included in permanent CSV exports unless explicitly documented as temporary.
- No API key or secret is exposed in client code.

### 12. Validation Commands

Run:

```bash
npm run lint
npm run build
```

If possible, run a dev smoke test:

```bash
npm run dev
```

Smoke-test at least:

- unauthenticated access to detail/image routes returns 401 or redirects
- `/detections/[id]` route is protected
- `/admin/detections` remains protected
- frame API still works in mock mode

Do not leave the dev server running in the final state.

## Acceptance Criteria

This task is complete when:

- Public image URL dependency is removed or clearly isolated as backward compatibility only.
- New frame uploads use secure signed URL flow.
- Detection detail images render through signed URLs.
- Admin thumbnails render through signed URLs.
- Sign detail panel images render through signed URLs.
- CSV exports do not leak long-lived public image URLs.
- Existing AI mock/external flow still works.
- Lint passes.
- Build passes.
- No service-role or secret leakage to client components.
- Final report is provided.

## Final Report Format

At the end, report:

1. What you implemented
2. Files changed
3. Database/migration changes, if any
4. API routes changed
5. Environment variables added/changed
6. Security/access-control checks
7. Commands run
8. Verification result
9. Known limitations
10. Recommended next task
11. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
