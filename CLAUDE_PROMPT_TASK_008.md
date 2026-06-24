You are working in the existing Traffic Sign Mapping MVP repository.

Read and execute the task file:

`TASK_008_Signed_Storage_URLs_Access_Control.md`

This is NOT a rebuild task. Do not recreate the MVP. Continue from the current repository state.

Your goal is to implement TASK 008 only: signed Supabase Storage URLs, image access control, and secure media delivery.

Important constraints:

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT add unrelated features.
- Do NOT rewrite the existing architecture.
- Do NOT expose service-role keys or AI keys to client components.
- Do NOT keep public image URLs as the main production access model.
- Preserve all existing flows and pages.
- Keep changes minimal and targeted.

Expected output:

- Implement signed URL generation server-side.
- Update frame upload, detection detail, admin detection thumbnails, sign detail images, and CSV behavior.
- Update docs and env example.
- Run lint and build.
- Provide the final report in the exact format requested by the task file.

Start by inspecting the current image/storage flow and report the current state before making changes. Then implement the smallest safe set of changes to satisfy the task.
