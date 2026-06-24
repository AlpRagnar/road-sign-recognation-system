import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/map/devices
// Returns devices with a last-known location for the live/polling device map.
export async function GET() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const supabase = createSupabaseServerClient();

  // Admins see all devices; field users see only their own.
  let query = supabase
    .from("devices")
    .select("*, profiles(full_name, email)")
    .not("last_latitude", "is", null)
    .order("last_seen_at", { ascending: false, nullsFirst: false });

  if (ctx.profile.role !== "admin") {
    query = query.eq("user_id", ctx.profile.id);
  }

  const { data, error } = await query.limit(500);
  if (error) return jsonError(error.message, 500);

  return jsonOk({ devices: data ?? [] });
}
