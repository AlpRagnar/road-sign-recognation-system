import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { deleteQuarantineCandidates } from "@/lib/storage/quarantine";

export const runtime = "nodejs";

// POST /api/admin/storage/quarantine/delete  { candidateIds: string[] }
// Deletes only PENDING, grace-eligible, still-unreferenced candidates.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as { candidateIds?: unknown } | null;
  const ids = Array.isArray(body?.candidateIds)
    ? (body!.candidateIds as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  if (ids.length === 0) return jsonError("candidateIds must be a non-empty string array", 400);

  const result = await deleteQuarantineCandidates(ids);

  const admin = createSupabaseAdminClient();
  await writeSystemLog(admin, {
    action: "ADMIN_STORAGE_QUARANTINE_DELETED",
    message: `Quarantine delete: ${result.deleted} deleted, ${result.skipped} skipped`,
    userId: ctx.profile.id,
    metadata: {
      requested: ids.length,
      deleted: result.deleted,
      skipped: result.skipped,
      candidate_ids: ids.slice(0, 100),
    },
  });

  return jsonOk(result);
}
