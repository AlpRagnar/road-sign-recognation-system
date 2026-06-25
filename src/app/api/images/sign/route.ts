import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSignedFrameUrl } from "@/lib/storage/signed-urls";
import { env } from "@/lib/env";
import type { DetectionEvent, TrafficSign } from "@/lib/types/database";

export const runtime = "nodejs";

interface Body {
  kind?: "detection_event" | "traffic_sign";
  id?: string;
}

// POST /api/images/sign  { kind, id }
// Mints a fresh short-lived signed URL for an image, resolving the object PATH
// from the database by entity id. Never accepts/sign raw client paths.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const body = (await req.json().catch(() => null)) as Body | null;
  const id = body?.id?.trim();
  const kind = body?.kind;
  if (!id || (kind !== "detection_event" && kind !== "traffic_sign")) {
    return jsonError("kind and id are required", 400);
  }

  let stored: string | null = null;

  if (kind === "detection_event") {
    // Owner-or-admin only.
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("detection_events")
      .select("user_id, image_path, image_url")
      .eq("id", id)
      .maybeSingle();
    const ev = data as Pick<DetectionEvent, "user_id" | "image_path" | "image_url"> | null;
    if (!ev) return jsonError("Detection event not found", 404);
    if (ctx.profile.role !== "admin" && ev.user_id !== ctx.profile.id) {
      return jsonError("Forbidden", 403);
    }
    stored = ev.image_path ?? ev.image_url;
  } else {
    // Traffic signs are shared inventory; read via the RLS-aware client so the
    // caller can only sign images for signs they may read.
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("traffic_signs")
      .select("representative_image_path, representative_image_url")
      .eq("id", id)
      .maybeSingle();
    const sign = data as Pick<
      TrafficSign,
      "representative_image_path" | "representative_image_url"
    > | null;
    if (!sign) return jsonError("Traffic sign not found", 404);
    stored = sign.representative_image_path ?? sign.representative_image_url;
  }

  if (!stored) return jsonError("No image available", 404);

  const ttl = env.signedImageUrlTtl();
  const imageUrl = await createSignedFrameUrl(stored, ttl);
  if (!imageUrl) return jsonError("Could not sign image", 404);

  return jsonOk({ imageUrl, expiresInSeconds: ttl });
}
