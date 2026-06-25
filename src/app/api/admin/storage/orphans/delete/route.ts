import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { deleteOrphanFrameObjects } from "@/lib/storage/maintenance";

export const runtime = "nodejs";

// POST /api/admin/storage/orphans/delete  { paths: string[] }
// Explicit, conservative deletion: only paths under the frame prefix, re-checked
// as unreferenced immediately before removal.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as { paths?: unknown } | null;
  const paths = Array.isArray(body?.paths)
    ? (body!.paths as unknown[]).filter((p): p is string => typeof p === "string")
    : [];
  if (paths.length === 0) return jsonError("paths must be a non-empty string array", 400);

  const result = await deleteOrphanFrameObjects(paths);

  const admin = createSupabaseAdminClient();
  await writeSystemLog(admin, {
    action: "ADMIN_STORAGE_CLEANUP",
    message: `Orphan cleanup: ${result.deleted} deleted, ${result.skippedReferenced} skipped, ${result.rejected} rejected`,
    userId: ctx.profile.id,
    metadata: {
      requested: result.requested,
      deleted: result.deleted,
      skipped_referenced: result.skippedReferenced,
      rejected: result.rejected,
    },
  });

  return jsonOk({ result });
}
