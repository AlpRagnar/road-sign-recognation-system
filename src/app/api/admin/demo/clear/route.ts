import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { clearDemoData } from "@/lib/demo/seed";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/demo/clear — admin-only. Deletes only demo-marked data.
export async function POST() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  try {
    const removed = await clearDemoData(admin);
    // Note: clearDemoData already removed prior demo system_logs (incl. manifest);
    // record a fresh, non-demo audit entry so the action is traceable.
    await writeSystemLog(admin, {
      action: "ADMIN_DEMO_CLEARED",
      message: "Demo data cleared",
      userId: ctx.profile.id,
      metadata: { summary: removed },
    });
    return jsonOk({ removed });
  } catch (err) {
    return jsonError(`Demo clear failed: ${(err as Error).message.slice(0, 160)}`, 500);
  }
}
