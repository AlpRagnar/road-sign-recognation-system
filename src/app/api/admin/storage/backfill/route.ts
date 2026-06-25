import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { runImageBackfill } from "@/lib/storage/maintenance";

export const runtime = "nodejs";

// POST /api/admin/storage/backfill  { mode: "dry-run" | "apply" }
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as { mode?: string } | null;
  const apply = body?.mode === "apply";
  if (body?.mode !== "apply" && body?.mode !== "dry-run") {
    return jsonError("mode must be 'dry-run' or 'apply'", 400);
  }

  const result = await runImageBackfill(apply);

  if (apply) {
    const admin = createSupabaseAdminClient();
    await writeSystemLog(admin, {
      action: "ADMIN_STORAGE_BACKFILL",
      message: `Backfill applied: ${result.detectionEvents.updated} events, ${result.trafficSigns.updated} signs`,
      userId: ctx.profile.id,
      metadata: {
        detection_events_updated: result.detectionEvents.updated,
        traffic_signs_updated: result.trafficSigns.updated,
        capped: result.capped,
      },
    });
  }

  return jsonOk({ result });
}
