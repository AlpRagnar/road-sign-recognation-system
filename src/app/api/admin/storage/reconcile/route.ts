import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { runReconciliation } from "@/lib/storage/quarantine";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/storage/reconcile  { mode?, prefix? }
// Scans Storage and records unreferenced objects as PENDING quarantine
// candidates. Never deletes anything. Admin-only; scheduled-friendly.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => ({}))) as { mode?: string; prefix?: string };
  const mode = body.mode === "scheduled" ? "scheduled" : "manual";

  const admin = createSupabaseAdminClient();
  await writeSystemLog(admin, {
    action: "ADMIN_STORAGE_RECONCILIATION_STARTED",
    message: "Storage reconciliation started",
    userId: ctx.profile.id,
    metadata: { mode },
  });

  const result = await runReconciliation(ctx.profile.id, body.prefix, mode);

  await writeSystemLog(admin, {
    action: "ADMIN_STORAGE_RECONCILIATION_COMPLETED",
    message: `Reconciliation: ${result.candidatesAdded} added of ${result.candidatesFound} found`,
    userId: ctx.profile.id,
    metadata: {
      run_id: result.runId,
      objects_scanned: result.objectsScanned,
      candidates_found: result.candidatesFound,
      candidates_added: result.candidatesAdded,
      scan_limited: result.scanLimited,
    },
  });

  return jsonOk(result);
}
