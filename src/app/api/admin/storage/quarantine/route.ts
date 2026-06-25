import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { parsePageParams, paginate } from "@/lib/pagination";
import { listQuarantineCandidates, quarantineConfig } from "@/lib/storage/quarantine";

export const runtime = "nodejs";

// GET /api/admin/storage/quarantine?status=&search=&page=&pageSize=&eligibleOnly=
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const sp = req.nextUrl.searchParams;
  const params = parsePageParams(sp);
  const status = sp.get("status");
  const validStatus =
    status && ["pending", "ignored", "deleted", "restored"].includes(status) ? status : null;

  const { items, total, graceDays } = await listQuarantineCandidates({
    status: validStatus,
    search: sp.get("search"),
    from: params.from,
    to: params.to,
    eligibleOnly: sp.get("eligibleOnly") === "true",
  });

  return jsonOk({
    ...paginate(items, params, total),
    config: quarantineConfig(),
    graceDays,
  });
}
