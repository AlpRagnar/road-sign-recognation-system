import { NextRequest } from "next/server";
import { getAuthedContext, jsonError } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toCsv, csvResponse } from "@/lib/csv";
import { extractStoragePathFromKnownValue } from "@/lib/storage/signed-urls";

const SELECT_COLUMNS = [
  "id",
  "sign_type",
  "latitude",
  "longitude",
  "confidence_score",
  "verification_status",
  "detection_count",
  "first_detected_at",
  "last_detected_at",
  "representative_image_path",
  "representative_image_url",
];

// Signed/public URLs are NOT exported; emit availability + object path only.
const OUTPUT_COLUMNS = [
  "id",
  "sign_type",
  "latitude",
  "longitude",
  "confidence_score",
  "verification_status",
  "detection_count",
  "first_detected_at",
  "last_detected_at",
  "image_available",
  "representative_image_path",
];

// GET /api/admin/export/traffic-signs.csv?status=&signType=&from=&to=
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const sp = req.nextUrl.searchParams;

  let query = admin
    .from("traffic_signs")
    .select(SELECT_COLUMNS.join(","))
    .order("last_detected_at", { ascending: false, nullsFirst: false });

  const status = sp.get("status");
  if (status) query = query.eq("verification_status", status);
  const signType = sp.get("signType");
  if (signType) query = query.eq("sign_type", signType);
  const from = sp.get("from");
  if (from) query = query.gte("last_detected_at", from);
  const to = sp.get("to");
  if (to) query = query.lte("last_detected_at", to);

  const { data, error } = await query.limit(50000);
  if (error) return jsonError(error.message, 500);

  const rows = ((data ?? []) as unknown as Array<Record<string, unknown>>).map((r) => {
    const path =
      (r.representative_image_path as string | null) ??
      extractStoragePathFromKnownValue(r.representative_image_url as string | null);
    return {
      ...r,
      representative_image_path: path ?? "",
      image_available: path ? "true" : "false",
    };
  });

  const csv = toCsv(OUTPUT_COLUMNS, rows);
  return csvResponse("traffic-signs.csv", csv);
}
