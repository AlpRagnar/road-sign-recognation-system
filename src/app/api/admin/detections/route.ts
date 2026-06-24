import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedFrameUrls } from "@/lib/storage/signed-urls";
import { parsePageParams, paginate } from "@/lib/pagination";

function sanitizeSearch(raw: string): string {
  return raw.replace(/[,()%]/g, " ").trim();
}

// GET /api/admin/detections?search=&status=&className=&page=&pageSize=
// Paginated raw detection_events for admin per-detection review.
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const sp = req.nextUrl.searchParams;
  const params = parsePageParams(sp);

  let query = admin
    .from("detection_events")
    .select("*, profiles(full_name, email), devices(device_name, device_type)", {
      count: "exact",
    });

  const status = sp.get("status");
  if (status) query = query.eq("validation_status", status);

  const className = sp.get("className");
  if (className) query = query.eq("detected_class_name", className);

  const search = sanitizeSearch(sp.get("search") ?? "");
  if (search) query = query.ilike("detected_class_name", `%${search}%`);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (error) return jsonError(error.message, 500);

  // Replace stored paths/legacy URLs with short-lived signed URLs for thumbnails.
  const rows = (data ?? []) as Array<{
    image_path?: string | null;
    image_url?: string | null;
  }>;
  const signed = await createSignedFrameUrls(rows.map((r) => r.image_path ?? r.image_url));
  rows.forEach((r, i) => {
    r.image_url = signed[i] ?? null;
    r.image_path = null;
  });

  return jsonOk(paginate(rows, params, count ?? 0));
}
