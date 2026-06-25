You are working inside the existing Traffic Sign Mapping MVP repository.

Read and execute the task file:

`TASK_015_Demo_Hardening_Presentation_Mode_Seed_Data.md`

Important context:

- The project is NOT empty.
- Do NOT rebuild the MVP.
- Continue from the current working repository.
- Implement Task 015 only.
- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Keep changes incremental, secure, and compatible with the existing Next.js + Supabase architecture.

Main objective:

Make the application presentation-ready by adding:

1. Admin-only demo seed/status/clear tools.
2. Realistic deterministic demo data for maps, analytics, detection details, devices, AI logs, and snapshots.
3. A new `/admin/demo` page.
4. A protected `/presentation` or equivalent presentation mode/landing flow.
5. `docs/DEMO_RUNBOOK.md`.
6. Minor demo-hardening UX polish only.

Security rules:

- Demo APIs must be admin-only.
- Clear must delete only demo-marked data.
- No service-role/admin client in client components.
- No secrets in UI/logs/responses.
- Do not weaken auth, RLS, signed URL, AI key, or cron-secret protections.

After implementation:

Run:

```bash
npm run lint
npm run build
```

Run a dev smoke test if possible.

Finish with the exact final report format required in the task file, including the suggested manual git commit message.
