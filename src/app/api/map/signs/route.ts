import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/map/signs
// Optional filters: ?signType=&minConfidence=&status=&from=&to=
// Returns optimized traffic_signs inventory (NOT raw detection events).
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const supabase = createSupabaseServerClient();
  const sp = req.nextUrl.searchParams;

  let query = supabase.from("traffic_signs").select("*").order("last_detected_at", {
    ascending: false,
    nullsFirst: false,
  });

  const signType = sp.get("signType");
  if (signType) query = query.eq("sign_type", signType);

  const minConfidence = sp.get("minConfidence");
  if (minConfidence) query = query.gte("confidence_score", Number(minConfidence));

  const status = sp.get("status");
  if (status) query = query.eq("verification_status", status);

  const from = sp.get("from");
  if (from) query = query.gte("last_detected_at", from);

  const to = sp.get("to");
  if (to) query = query.lte("last_detected_at", to);

  const { data, error } = await query.limit(2000);
  if (error) return jsonError(error.message, 500);

  return jsonOk({ signs: data ?? [] });
}
