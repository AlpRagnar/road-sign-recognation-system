import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { attachDetectionCounts } from "@/lib/device-stats";
import { writeSystemLog } from "@/lib/logging";
import {
  generateDeviceIdentifier,
  isValidDeviceType,
} from "@/lib/devices";
import type { Device } from "@/lib/types/database";

// GET /api/devices — list the current user's own devices (with detection counts).
export async function GET() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("devices")
    .select("*")
    .eq("user_id", ctx.profile.id)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  const devices = await attachDetectionCounts(admin, (data ?? []) as Device[]);
  return jsonOk({ devices });
}

interface CreateBody {
  device_name?: string;
  device_type?: string;
  device_identifier?: string | null;
}

// POST /api/devices — create a device owned by the current user.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const body = (await req.json().catch(() => null)) as CreateBody | null;
  const name = body?.device_name?.trim();
  const type = body?.device_type;
  let identifier = body?.device_identifier?.trim() || "";

  if (!name) return jsonError("device_name is required");
  if (!isValidDeviceType(type)) return jsonError("Invalid device_type");
  if (!identifier) identifier = generateDeviceIdentifier(type);

  const admin = createSupabaseAdminClient();

  // device_identifier is UNIQUE in the schema; surface conflicts clearly.
  const { data: existing } = await admin
    .from("devices")
    .select("id")
    .eq("device_identifier", identifier)
    .maybeSingle();
  if (existing) return jsonError("A device with this identifier already exists", 409);

  const { data: created, error } = await admin
    .from("devices")
    .insert({
      user_id: ctx.profile.id,
      device_name: name,
      device_type: type,
      device_identifier: identifier,
      status: "active",
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  await writeSystemLog(admin, {
    action: "DEVICE_CREATED",
    message: `Device '${name}' created`,
    userId: ctx.profile.id,
    deviceId: created!.id as string,
    metadata: { device_type: type, device_identifier: identifier },
  });

  return jsonOk({ device: created });
}
