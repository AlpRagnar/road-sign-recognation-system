import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/admin/system-logs?limit=&action=
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const supabase = createSupabaseServerClient();
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Number(sp.get("limit") ?? "200"), 1000);

  let query = supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  const action = sp.get("action");
  if (action) query = query.eq("action_type", action);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  return jsonOk({ logs: data ?? [] });
}
