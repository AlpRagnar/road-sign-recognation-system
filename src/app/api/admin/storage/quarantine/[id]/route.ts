import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { updateQuarantineStatus } from "@/lib/storage/quarantine";

export const runtime = "nodejs";

// PATCH /api/admin/storage/quarantine/[id]  { status: "ignored" | "restored" }
// Deletion is NOT allowed here — it must go through the delete endpoint.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  if (body?.status !== "ignored" && body?.status !== "restored") {
    return jsonError("status must be 'ignored' or 'restored'", 400);
  }

  const result = await updateQuarantineStatus(params.id, body.status);
  if (!result.ok) return jsonError(result.error || "Update failed", 404);

  const admin = createSupabaseAdminClient();
  await writeSystemLog(admin, {
    action: "ADMIN_STORAGE_QUARANTINE_UPDATED",
    message: `Quarantine candidate ${params.id} → ${body.status}`,
    userId: ctx.profile.id,
    metadata: { candidate_id: params.id, status: body.status },
  });

  return jsonOk({ updated: true });
}
