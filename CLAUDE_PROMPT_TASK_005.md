You are working inside the existing Next.js 14 + TypeScript + Tailwind + Supabase project for the AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

TASK 004 is complete. The current repo already has the MVP, device management, admin user management, Supabase Auth user creation, password reset, and search/pagination. Do NOT rebuild the project.

Read and execute the file:

TASK_005_Map_Analytics_Data_Quality_Export.md

Your mission for this task is strictly:

- Improve the static traffic sign map with clustering and richer sign details.
- Add a safe density/heatmap-style visualization if practical.
- Add admin per-detection review for raw detection_events.
- Add admin CSV export for traffic_signs and detection_events.
- Add a few lightweight dashboard analytics metrics.
- Update documentation.
- Run lint/build and provide the requested final report.

Critical rules:

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rebuild from scratch.
- Do NOT remove working existing features.
- Do NOT create new DB tables unless there is a clear blocker.
- Reuse existing tables and code patterns.
- Keep implementation focused and MVP-safe.
- Use service-role access only in server-side Route Handlers or server utilities.
- Never import service-role/admin clients into `use client` components.

Expected final verification:

```bash
npm run lint
npm run build
```

Final response must include:

1. What you implemented
2. Files changed
3. Database changes, if any
4. API routes added/modified
5. Security/authorization checks
6. Commands run
7. Verification result
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

No git commit, no git push, no deploy.
