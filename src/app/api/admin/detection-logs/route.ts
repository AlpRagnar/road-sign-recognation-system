import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSignedFrameUrls } from "@/lib/storage/signed-urls";

// GET /api/admin/detection-logs?limit=&status=
// Admin-only raw detection event inspection.
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const supabase = createSupabaseServerClient();
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Number(sp.get("limit") ?? "200"), 1000);

  let query = supabase
    .from("detection_events")
    .select("*, profiles(full_name, email), devices(device_name, device_type)")
    .order("created_at", { ascending: false })
    .limit(limit);

  const status = sp.get("status");
  if (status) query = query.eq("validation_status", status);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  const rows = (data ?? []) as Array<{ image_path?: string | null; image_url?: string | null }>;
  const signed = await createSignedFrameUrls(rows.map((r) => r.image_path ?? r.image_url));
  rows.forEach((r, i) => {
    r.image_url = signed[i] ?? null;
    r.image_path = null;
  });

  return jsonOk({ events: rows });
}
