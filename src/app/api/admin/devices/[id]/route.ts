import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { isValidDeviceStatus, isValidDeviceType } from "@/lib/devices";

interface PatchBody {
  device_name?: string;
  device_type?: string;
  status?: string;
}

// PATCH /api/admin/devices/[id] — admin can update any device's name/type/status.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("devices")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();
  if (!existing) return jsonError("Device not found", 404);

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
    action: "ADMIN_DEVICE_UPDATED",
    message: `Admin updated device '${updated!.device_name}'`,
    userId: ctx.profile.id,
    deviceId: params.id,
    metadata: update,
  });

  return jsonOk({ device: updated });
}
