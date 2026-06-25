import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { createDailyMetricsSnapshot } from "@/lib/metrics";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/admin/metrics/daily-snapshot  { date?: "YYYY-MM-DD" }
// Admin-only. Upserts the daily metrics snapshot via the service-role RPC.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => ({}))) as { date?: string };
  const date = body.date?.trim();
  if (date && !DATE_RE.test(date)) return jsonError("date must be YYYY-MM-DD", 400);

  const admin = createSupabaseAdminClient();
  const started = Date.now();
  const result = await createDailyMetricsSnapshot(admin, date);

  if (!result.ok) {
    await writeSystemLog(admin, {
      action: "ADMIN_DAILY_METRICS_SNAPSHOT_FAILED",
      message: "Daily metrics snapshot failed",
      userId: ctx.profile.id,
      metadata: {
        target_date: date ?? "current_date",
        elapsed_ms: Date.now() - started,
        reason: result.message,
      },
    });
    return jsonError("Could not create snapshot (is migration 0006 applied?)", 500);
  }

  const snapshot = result.snapshot;

  await writeSystemLog(admin, {
    action: "ADMIN_DAILY_METRICS_SNAPSHOT_CREATED",
    message: `Daily metrics snapshot for ${snapshot.snapshot_date}`,
    userId: ctx.profile.id,
    metadata: {
      target_date: snapshot.snapshot_date,
      elapsed_ms: Date.now() - started,
      source: "rpc",
      success: true,
    },
  });

  return jsonOk({ snapshot });
}
