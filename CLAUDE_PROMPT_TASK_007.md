You are working inside an existing verified Next.js 14 App Router + TypeScript + Tailwind + Supabase MVP for an AI-Based Traffic Sign Detection, Localization and Map Dashboard System.

Important current state:
- TASK 001–006 are already complete.
- The app already builds and lints clean.
- Do NOT rebuild the MVP.
- Do NOT re-run the initial scaffold prompt.
- Continue from the current repo state.
- Implement TASK 007 only.

Read the file `TASK_007_AI_API_Contract_Retry_Integration.md` in the project root and implement it.

Core task:
Harden the external AI model integration layer with a clear request/response contract, response validation/normalization, AI mode behavior (`mock`, `external`, `auto`), timeout/retry handling, safe AI logging, and an admin-only health check/API/page. Update env docs and AI integration documentation.

Critical constraints:
- Do NOT create git commits.
- Do NOT run git commit.
- Do NOT run git push.
- Do NOT deploy.
- Do NOT remove mock mode.
- Do NOT leak service-role or AI API keys to client components.
- Keep service-role and AI API key usage server-side only.
- Keep the current architecture intact.
- Prefer targeted changes over rewrites.
- Run `npm run lint` and `npm run build` at the end.

Required final report:
1. What you implemented
2. Files changed
3. API routes added/modified
4. Environment variables added/changed
5. AI contract summary
6. Security checks
7. Commands run
8. Verification result
9. Known limitations
10. Recommended next task
11. Suggested manual git commit message

Proceed automatically after analysis unless there is a true blocking ambiguity. No git commit, no push, no deploy.
