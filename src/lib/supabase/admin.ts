import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role Supabase client. SERVER ONLY — bypasses RLS.
// Use inside Route Handlers for trusted writes (storage uploads, log inserts,
// traffic-sign grouping) after the caller has been authenticated.
export function createSupabaseAdminClient() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
