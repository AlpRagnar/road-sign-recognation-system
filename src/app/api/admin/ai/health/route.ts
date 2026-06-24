import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { checkAiHealth } from "@/lib/ai/client";

export const runtime = "nodejs";

// GET /api/admin/ai/health — admin-only AI connectivity probe.
export async function GET() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const result = await checkAiHealth();

  const admin = createSupabaseAdminClient();
  await writeSystemLog(admin, {
    action: "AI_HEALTH_CHECK_RUN",
    message: `AI health: ${result.status} (mode=${result.mode})`,
    userId: ctx.profile.id,
    // Safe metadata only — hostname, not full URL with any token.
    metadata: {
      mode: result.mode,
      status: result.status,
      hostname: result.hostname,
      externalConfigured: result.externalConfigured,
    },
  });

  return jsonOk({ health: result });
}
