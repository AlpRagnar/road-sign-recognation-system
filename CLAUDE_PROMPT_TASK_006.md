You are working inside the existing repository for the AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

Important context:
- The MVP is already implemented and verified.
- TASK 002, TASK 003, TASK 004, and TASK 005 are complete.
- Do NOT rebuild the project.
- Do NOT re-run the original kickoff prompt.
- Continue from the current codebase only.

Your task is to implement:

# TASK 006 — Captured Image Preview, Bounding Box Overlay & AI Response Detail

Read the task file in the repository root:

`TASK_006_Image_Preview_Bounding_Box_AI_Detail.md`

Then implement it completely.

Critical rules:
- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rewrite the architecture.
- Do NOT expose service-role/admin code to client components.
- Keep changes focused on image preview, bounding-box overlay, detection detail, and integrations.
- Run lint and build at the end.

Expected implementation summary:
1. Add reusable `DetectionImagePreview` component.
2. Add authenticated detection detail API, recommended `GET /api/detections/[id]`.
3. Add protected detail page, recommended `/detections/[id]`.
4. Show captured frame image with bbox overlay.
5. Show detection metadata, location metadata, device/user context, linked sign context, and AI response JSON summary.
6. Add `View details` action to `/admin/detections`.
7. Add latest detection link to `/map/signs` sign detail panel.
8. Enhance `/detection` result cards with detail links if the frame API can return saved detection IDs safely.
9. Update README.
10. Verify `npm run lint` and `npm run build` pass.

Final response format:
1. What you implemented
2. Files changed
3. API routes added/modified
4. Security/authorization checks
5. Commands run
6. Verification result
7. Known limitations
8. Recommended next task
9. Suggested manual git commit message

No git commit, no git push, no deploy.
