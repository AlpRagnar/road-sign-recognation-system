You are Claude Code working inside an existing Next.js 14 App Router + TypeScript + Tailwind + Supabase project.

The project is already feature-complete and documented through TASK 016. Do NOT rebuild the MVP and do NOT re-run the initial scaffold task.

Your task is to implement TASK 017 only:

- Add Playwright E2E smoke tests.
- Add CI-ready validation scripts.
- Add safe auth/demo test helpers.
- Add documentation for running tests.
- Keep the suite lightweight and stable.

Read and follow the file:

`TASK_017_Playwright_E2E_CI_Smoke_Tests.md`

Critical constraints:

- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT rewrite the architecture.
- Do NOT add unrelated features.
- Do NOT hardcode secrets or credentials.
- Do NOT require a real external AI server.
- Do NOT mutate production-like data unless `E2E_ALLOW_DEMO_MUTATIONS=true` is explicitly set.

Start by inspecting the current repository structure, package scripts, docs, auth flow, and demo APIs. Then implement the smallest useful Playwright test suite and documentation.

At the end, run:

```bash
npm run lint
npm run typecheck
npm run build
```

Run Playwright tests if the required environment is available. If not, clearly state what could not be run and exactly which environment variables are required.

Final response must include:

1. What was implemented
2. Files changed
3. Test scripts added
4. E2E tests added
5. Commands run
6. Verification result
7. Tests not run and why, if any
8. Known limitations
9. Recommended next task
10. Suggested manual git commit message

No git commit, no git push, no deploy.
