import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "./env";

// Service-role Supabase client for integration tests that need to seed/verify
// database fixtures directly. Credentials come from env — never hardcoded.
// These are gated so the tests skip cleanly when the env is not provided.

const URL =
  process.env.E2E_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY =
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

export const hasServiceRole = URL.length > 0 && SERVICE_KEY.length > 0;

export const SKIP_SERVICE_MSG =
  "Set SUPABASE_SERVICE_ROLE_KEY (+ NEXT_PUBLIC_SUPABASE_URL) and admin creds to run DB integration tests.";

export function serviceClient(): SupabaseClient {
  return createClient(URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Resolves the admin profile id (the E2E admin logs in through the UI; the API
// writes rows keyed by profile id).
export async function adminProfileId(admin: SupabaseClient): Promise<string | null> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("email", ADMIN_EMAIL.toLowerCase())
    .maybeSingle();
  return (data?.id as string) ?? null;
}
