import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";

// POST /api/detection/session/start
// Body: { deviceId?: string }
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const body = (await req.json().catch(() => ({}))) as { deviceId?: string };
  const admin = createSupabaseAdminClient();

  let deviceId = body.deviceId ?? null;

  // Primary flow: the UI sends a registered device. Verify the caller owns it
  // (admins may use any device) so a session can't be started with someone
  // else's device ID.
  if (deviceId) {
    const { data: device } = await admin
      .from("devices")
      .select("id, user_id, status")
      .eq("id", deviceId)
      .maybeSingle();
    if (!device) return jsonError("Device not found", 404);
    if (device.user_id !== ctx.profile.id && ctx.profile.role !== "admin") {
      return jsonError("You can only start a session with your own device", 403);
    }
    if (device.status === "inactive") {
      return jsonError("This device is inactive", 400);
    }
  }

  // Fallback (backward compatibility only): if no device was selected,
  // reuse an existing one or auto-provision a default device.
  if (!deviceId) {
    const { data: existing } = await admin
      .from("devices")
      .select("id")
      .eq("user_id", ctx.profile.id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      deviceId = existing.id as string;
    } else {
      const { data: created, error } = await admin
        .from("devices")
        .insert({
          user_id: ctx.profile.id,
          device_name: `${ctx.profile.full_name ?? "Field"} device`,
          device_type: "mobile_phone",
          status: "active",
        })
        .select("id")
        .single();
      if (error) return jsonError(`Could not create device: ${error.message}`, 500);
      deviceId = created!.id as string;
    }
  }

  const { data: session, error } = await admin
    .from("detection_sessions")
    .insert({
      user_id: ctx.profile.id,
      device_id: deviceId,
      status: "active",
    })
    .select("*")
    .single();

  if (error) return jsonError(`Could not start session: ${error.message}`, 500);

  // The device must already be active to start a session (checked above for a
  // selected device). We deliberately do NOT flip device status here — that is
  // an admin-only field — so field users cannot (re)activate a device by
  // starting a session.

  await writeSystemLog(admin, {
    action: "SESSION_STARTED",
    message: `Session ${session.id} started`,
    userId: ctx.profile.id,
    deviceId,
    metadata: { session_id: session.id },
  });

  return jsonOk({ session, deviceId });
}
