import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSignedFrameUrl } from "@/lib/storage/signed-urls";
import type { TrafficSign } from "@/lib/types/database";

// GET /api/map/signs/[id]
// Rich detail for one optimized sign: the record, its observation count, and
// the latest related detection event (subject to the caller's RLS visibility).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const supabase = createSupabaseServerClient();

  const { data: sign, error } = await supabase
    .from("traffic_signs")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (error) return jsonError(error.message, 500);
  if (!sign) return jsonError("Sign not found", 404);

  const { count: observationCount } = await supabase
    .from("traffic_sign_observations")
    .select("*", { count: "exact", head: true })
    .eq("traffic_sign_id", params.id);

  // Latest related detection event via the observations link.
  const { data: obs } = await supabase
    .from("traffic_sign_observations")
    .select(
      "detection_event_id, detection_events(id, detected_class_name, confidence, image_url, image_path, gps_accuracy, created_at)",
    )
    .eq("traffic_sign_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  type LatestEvent = {
    id: string;
    detected_class_name: string | null;
    confidence: number | null;
    image_url: string | null;
    image_path: string | null;
    gps_accuracy: number | null;
    created_at: string;
  };

  let latestEvent: LatestEvent | null = null;
  for (const row of (obs ?? []) as unknown as Array<{
    detection_events: LatestEvent | LatestEvent[] | null;
  }>) {
    const ev = Array.isArray(row.detection_events)
      ? (row.detection_events[0] ?? null)
      : row.detection_events;
    if (ev && (!latestEvent || ev.created_at > latestEvent.created_at)) latestEvent = ev;
  }

  // Sign the shared sign's representative image (visible to any authenticated
  // user, matching the shared-inventory model) and the latest event image
  // (only present when RLS allowed this user to read the event).
  const signedSign = sign as TrafficSign;
  signedSign.representative_image_url = await createSignedFrameUrl(
    signedSign.representative_image_path ?? signedSign.representative_image_url,
  );
  signedSign.representative_image_path = null;

  if (latestEvent) {
    latestEvent.image_url = await createSignedFrameUrl(
      latestEvent.image_path ?? latestEvent.image_url,
    );
    latestEvent.image_path = null;
  }

  return jsonOk({
    sign: signedSign,
    observationCount: observationCount ?? 0,
    latestEvent,
  });
}
