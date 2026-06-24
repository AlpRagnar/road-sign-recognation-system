import { NextRequest } from "next/server";
import { getAuthedContext, jsonError } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toCsv, csvResponse } from "@/lib/csv";
import { extractStoragePathFromKnownValue } from "@/lib/storage/signed-urls";

// Columns fetched from the DB.
// Note: full raw AI JSON (ai_response_raw) is intentionally NOT exported.
const SELECT_COLUMNS = [
  "id",
  "session_id",
  "user_id",
  "device_id",
  "detected_class_name",
  "confidence",
  "latitude",
  "longitude",
  "gps_accuracy",
  "heading",
  "speed",
  "validation_status",
  "ai_response_time_ms",
  "image_path",
  "image_url",
  "created_at",
];

// Columns written to the CSV. Signed/public URLs are NOT exported; we emit an
// availability flag and the (non-sensitive) storage object path instead.
const OUTPUT_COLUMNS = [
  "id",
  "session_id",
  "user_id",
  "device_id",
  "detected_class_name",
  "confidence",
  "latitude",
  "longitude",
  "gps_accuracy",
  "heading",
  "speed",
  "validation_status",
  "ai_response_time_ms",
  "image_available",
  "image_path",
  "created_at",
];

// GET /api/admin/export/detection-events.csv?status=&className=&deviceId=&from=&to=
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const sp = req.nextUrl.searchParams;

  let query = admin
    .from("detection_events")
    .select(SELECT_COLUMNS.join(","))
    .order("created_at", { ascending: false });

  const status = sp.get("status");
  if (status) query = query.eq("validation_status", status);
  const className = sp.get("className");
  if (className) query = query.eq("detected_class_name", className);
  const deviceId = sp.get("deviceId");
  if (deviceId) query = query.eq("device_id", deviceId);
  const from = sp.get("from");
  if (from) query = query.gte("created_at", from);
  const to = sp.get("to");
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query.limit(50000);
  if (error) return jsonError(error.message, 500);

  const rows = ((data ?? []) as unknown as Array<Record<string, unknown>>).map((r) => {
    const path =
      (r.image_path as string | null) ??
      extractStoragePathFromKnownValue(r.image_url as string | null);
    return { ...r, image_path: path ?? "", image_available: path ? "true" : "false" };
  });

  const csv = toCsv(OUTPUT_COLUMNS, rows);
  return csvResponse("detection-events.csv", csv);
}
