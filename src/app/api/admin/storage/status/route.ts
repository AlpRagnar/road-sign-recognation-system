import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { getImageBackfillStatus } from "@/lib/storage/maintenance";

export const runtime = "nodejs";

// GET /api/admin/storage/status — image-path backfill counts (admin only).
export async function GET() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const status = await getImageBackfillStatus();
  return jsonOk({ status });
}
