import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDemoStatus } from "@/lib/demo/seed";

export const runtime = "nodejs";

// GET /api/admin/demo/status — admin-only. Counts of demo-marked data present.
export async function GET() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const status = await getDemoStatus(admin);
  return jsonOk(status);
}
