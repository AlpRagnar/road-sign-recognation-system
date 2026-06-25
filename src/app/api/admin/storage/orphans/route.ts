import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { scanOrphanedFrameObjects } from "@/lib/storage/maintenance";

export const runtime = "nodejs";

// GET /api/admin/storage/orphans — conservative, capped orphan scan (admin only).
export async function GET() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const scan = await scanOrphanedFrameObjects();
  return jsonOk({ scan });
}
