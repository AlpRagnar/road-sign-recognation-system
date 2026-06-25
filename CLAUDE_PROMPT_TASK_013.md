You are working inside the existing Traffic Sign Mapping MVP repo.

Do NOT rebuild the project.
Do NOT create git commits.
Do NOT run git commit.
Do NOT run git push.
Do NOT deploy.

The project has already completed TASKS 001–012. Continue from the current working tree and implement TASK 013 only.

Read the file `TASK_013_Dashboard_RPC_Daily_Metrics_Snapshots.md` from the project root and implement it exactly:

- Adopt DB-side dashboard summary RPC for `/dashboard` with safe fallback.
- Add migration `0006_daily_metrics_snapshots.sql`.
- Add daily metrics snapshot table + service-role/admin-only snapshot RPC/API flow.
- Add admin analytics UI, preferably `/admin/analytics`.
- Add safe logging and docs.
- Keep all new APIs admin-only.
- Do not expose secrets, raw AI payloads, signed URLs, or service-role helpers to client components.
- Preserve existing architecture and avoid unrelated refactors.

Execution workflow:

1. Inspect the current repo structure and relevant files.
2. Summarize the implementation plan briefly.
3. Implement the smallest safe set of changes.
4. Run `npm run lint`.
5. Run `npm run build`.
6. If possible, validate the new migration against local Postgres.
7. Perform basic unauthenticated smoke checks for new admin APIs/pages if a dev server can be started.
8. Run a client leak scan for service-role/admin/server-only imports.
9. Provide the final report in the exact format requested in the task file.

Important: If any existing code differs from the task assumptions, adapt carefully to the current implementation. Do not rewrite working areas unnecessarily.
