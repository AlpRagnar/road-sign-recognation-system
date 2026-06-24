import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { attachDetectionCounts } from "@/lib/device-stats";
import { parsePageParams, paginate } from "@/lib/pagination";
import { isValidDeviceStatus, isValidDeviceType } from "@/lib/devices";

function sanitizeSearch(raw: string): string {
  return raw.replace(/[,()%]/g, " ").trim();
}

// GET /api/admin/devices?search=&type=&status=&page=&pageSize=
// Paginated list of ALL devices across users (admin only).
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const sp = req.nextUrl.searchParams;
  const params = parsePageParams(sp);

  let query = admin
    .from("devices")
    .select("*, profiles(full_name, email)", { count: "exact" });

  const type = sp.get("type");
  if (type && isValidDeviceType(type)) query = query.eq("device_type", type);

  const status = sp.get("status");
  if (status && isValidDeviceStatus(status)) query = query.eq("status", status);

  // Search device_name + device_identifier. (Owner-email search would require a
  // cross-table filter; see README "Known limitations".)
  const search = sanitizeSearch(sp.get("search") ?? "");
  if (search) {
    query = query.or(`device_name.ilike.%${search}%,device_identifier.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (error) return jsonError(error.message, 500);

  type Row = { id: string } & Record<string, unknown>;
  const devices = await attachDetectionCounts(admin, (data ?? []) as Row[]);
  return jsonOk(paginate(devices, params, count ?? 0));
}
