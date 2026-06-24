import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedFrameUrl } from "@/lib/storage/signed-urls";
import type { DetectionEvent, TrafficSign } from "@/lib/types/database";

// GET /api/detections/[id]
// One detection event with device/user/linked-sign context + raw AI response.
// Owner-or-admin only.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const admin = createSupabaseAdminClient();

  const { data: event, error } = await admin
    .from("detection_events")
    .select("*, devices(device_name, device_type, device_identifier), profiles(full_name, email)")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!event) return jsonError("Detection not found", 404);

  // Authorization: owner or admin only.
  const ev = event as DetectionEvent & {
    devices: unknown;
    profiles: unknown;
  };
  const isAdmin = ctx.profile.role === "admin";
  if (!isAdmin && ev.user_id !== ctx.profile.id) {
    return jsonError("Forbidden", 403);
  }

  // Authorized: mint a short-lived signed URL and avoid exposing the raw path.
  ev.image_url = await createSignedFrameUrl(ev.image_path ?? ev.image_url);
  ev.image_path = null;

  // Linked traffic sign (if this event was grouped into the inventory).
  let linkedSign: TrafficSign | null = null;
  const { data: obs } = await admin
    .from("traffic_sign_observations")
    .select("traffic_sign_id")
    .eq("detection_event_id", params.id)
    .limit(1)
    .maybeSingle();
  if (obs?.traffic_sign_id) {
    const { data: sign } = await admin
      .from("traffic_signs")
      .select("*")
      .eq("id", obs.traffic_sign_id)
      .maybeSingle();
    linkedSign = (sign as TrafficSign) ?? null;
  }

  return jsonOk({ event: ev, linkedSign });
}
