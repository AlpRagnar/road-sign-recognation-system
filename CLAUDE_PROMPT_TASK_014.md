You are working in an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase codebase for the AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

IMPORTANT: The project is already implemented through TASK 013. Do NOT rebuild the MVP. Continue from the current repository state and implement TASK 014 only.

Read the task file in the project root:

TASK_014_Cron_Automation_Headless_Triggers.md

Your mission:

Implement TASK 014 — Headless Cron Automation, Secret-Protected Triggers & Snapshot Gap Detection.

Critical rules:

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rebuild the project from scratch.
- Do NOT remove existing manual admin actions.
- Do NOT expose service-role keys, cron secrets, signed URLs, or sensitive metadata to client components.
- Do NOT allow cron endpoints to delete storage objects.
- Keep the implementation minimal, secure, and aligned with the current architecture.

Implementation priorities:

1. Add a server-only CRON_SECRET bearer auth helper.
2. Add POST /api/cron/daily-metrics-snapshot.
3. Add POST /api/cron/storage-reconciliation.
4. Optionally add POST /api/cron/daily-maintenance if clean and low-risk.
5. Add snapshot gap detection to /admin/analytics.
6. Add reconciliation run history to /admin/storage.
7. Update docs and .env.example.
8. Run npm run lint and npm run build.
9. Provide the final report in the requested format.

Before coding, inspect the current relevant files:

- src/lib/env.ts
- src/lib/dashboard.ts
- src/lib/storage/quarantine.ts
- src/lib/storage/maintenance.ts
- src/app/api/admin/metrics/daily-snapshot/route.ts
- src/app/api/admin/storage/reconcile/route.ts
- src/app/(protected)/admin/analytics/page.tsx
- src/components/AdminAnalyticsClient.tsx
- src/app/(protected)/admin/storage/page.tsx
- src/components/AdminStorageClient.tsx
- supabase/migrations/0006_daily_metrics_snapshots.sql
- supabase/migrations/0005_storage_quarantine.sql

Reuse existing helpers wherever possible. Avoid duplicating snapshot/reconciliation logic. Cron endpoints should call shared server functions or carefully reuse existing internals.

Final output must include:

1. What was implemented
2. Files changed
3. API routes added/modified
4. Environment variables added
5. Security checks
6. Commands run
7. Verification result
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

Remember: no git commit, no git push, no deploy.
