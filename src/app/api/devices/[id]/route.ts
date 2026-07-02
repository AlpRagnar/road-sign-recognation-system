import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { isValidDeviceStatus, isValidDeviceType } from "@/lib/devices";
import type { Device } from "@/lib/types/database";

// Loads a device and verifies it belongs to the current user.
async function loadOwnedDevice(admin: ReturnType<typeof createSupabaseAdminClient>, id: string, profileId: string) {
  const { data } = await admin.from("devices").select("*").eq("id", id).maybeSingle();
  const device = data as Device | null;
  if (!device) return { device: null, owned: false };
  return { device, owned: device.user_id === profileId };
}

interface PatchBody {
  device_name?: string;
  device_type?: string;
  status?: string;
}

// PATCH /api/devices/[id] — edit one of the current user's own devices.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const admin = createSupabaseAdminClient();
  const { device, owned } = await loadOwnedDevice(admin, params.id, ctx.profile.id);
  if (!device) return jsonError("Device not found", 404);
  if (!owned) return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) return jsonError("Invalid body");

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.device_name !== undefined) {
    const name = body.device_name.trim();
    if (!name) return jsonError("device_name cannot be empty");
    update.device_name = name;
  }
  if (body.device_type !== undefined) {
    if (!isValidDeviceType(body.device_type)) return jsonError("Invalid device_type");
    update.device_type = body.device_type;
  }
  if (body.status !== undefined) {
    // Device active/inactive status is admin-only. A field user (owner) may edit
    // name/type but must not activate/deactivate a device, even via a crafted
    // request. Admins manage status on the Admin → Devices page.
    if (ctx.profile.role !== "admin") {
      return jsonError("Only an admin can change device status", 403);
    }
    if (!isValidDeviceStatus(body.status)) return jsonError("Invalid status");
    update.status = body.status;
  }

  const { data: updated, error } = await admin
    .from("devices")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  await writeSystemLog(admin, {
    action: "DEVICE_UPDATED",
    message: `Device '${updated!.device_name}' updated`,
    userId: ctx.profile.id,
    deviceId: params.id,
    metadata: update,
  });

  return jsonOk({ device: updated });
}

// DELETE /api/devices/[id] — soft-deactivate (status='inactive') to preserve
// historical detection references. Admin-only: device active/inactive status is
// an admin-controlled field (a field user must not be able to deactivate a
// device, even their own, via a crafted request).
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") {
    return jsonError("Only an admin can change device status", 403);
  }

  const admin = createSupabaseAdminClient();
  const { device } = await loadOwnedDevice(admin, params.id, ctx.profile.id);
  if (!device) return jsonError("Device not found", 404);

  const { data: updated, error } = await admin
    .from("devices")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  await writeSystemLog(admin, {
    action: "DEVICE_DEACTIVATED",
    message: `Device '${device.device_name}' deactivated`,
    userId: ctx.profile.id,
    deviceId: params.id,
  });

  return jsonOk({ device: updated });
}
