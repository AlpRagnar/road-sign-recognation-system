// Test environment helpers. Credentials come from env — never hardcoded.

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

// Auth-dependent tests require admin credentials.
export const hasAdminCreds = ADMIN_EMAIL.length > 0 && ADMIN_PASSWORD.length > 0;

// Demo-seed tests are destructive-ish (they create/refresh demo-marked rows),
// so they only run when explicitly opted in.
export const allowDemoMutations = process.env.E2E_ALLOW_DEMO_MUTATIONS === "true";

export const SKIP_AUTH_MSG =
  "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated E2E tests.";

export const SKIP_DEMO_MSG =
  "Set E2E_ALLOW_DEMO_MUTATIONS=true (plus admin creds) to run demo-seed E2E tests.";
