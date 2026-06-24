You are Claude Code working inside the existing Traffic Sign Mapping MVP repository.

Read and execute the task file:

`TASK_009_AI_Self_Test_And_Observability.md`

Important context:

- The MVP already exists and has been extended through TASK 008.
- Do NOT rebuild the project.
- Continue from the current codebase.
- Implement TASK 009 only.
- The target is AI model contract self-test, AI log analytics, and admin AI observability.
- Preserve the existing Next.js 14 App Router + Supabase + Tailwind architecture.
- Reuse the existing AI integration layer under `src/lib/ai/`.
- Reuse the signed URL/storage helpers introduced in TASK 008.

Critical rules:

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT wipe or regenerate the existing app.
- Do NOT add unrelated features.
- Do NOT store API keys, bearer tokens, request headers, signed URLs, or full external URLs in logs.
- Do NOT create production detection records during AI self-test.

Required workflow:

1. Inspect the current AI/admin/storage/logging implementation.
2. Plan the minimal implementation.
3. Implement the task.
4. Run `npm run lint`.
5. Run `npm run build`.
6. If possible, run a dev smoke test for the new admin APIs/pages.
7. Produce the required final report.

Expected deliverables:

- Enhanced `/admin/ai` page.
- Admin-only self-test route, preferably `POST /api/admin/ai/self-test`.
- Recent AI log analytics and table.
- Safe AI self-test logging.
- Updated docs.
- Clean lint/build.

Final answer must include:

1. What was implemented
2. Files changed
3. API routes added/modified
4. Logging changes
5. Security checks
6. Commands run
7. Verification result
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

No git commit, push, or deploy.
