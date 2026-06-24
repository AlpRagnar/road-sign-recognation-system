import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import type { ValidationStatus } from "@/lib/types/database";

// Statuses an admin may set for a raw detection event.
const ALLOWED: ValidationStatus[] = [
  "pending",
  "manually_verified",
  "rejected",
  "duplicate",
];

interface PatchBody {
  status?: string;
}

// PATCH /api/admin/detections/[id] — admin sets validation_status of one event.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body?.status) return jsonError("status is required");
  if (!ALLOWED.includes(body.status as ValidationStatus)) return jsonError("Invalid status");

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("detection_events")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();
  if (!existing) return jsonError("Detection event not found", 404);

  const { data: updated, error } = await admin
    .from("detection_events")
    .update({ validation_status: body.status })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  await writeSystemLog(admin, {
    action: "ADMIN_DETECTION_REVIEW_UPDATED",
    message: `Detection ${params.id} → ${body.status}`,
    userId: ctx.profile.id,
    metadata: { detection_event_id: params.id, status: body.status },
  });

  return jsonOk({ event: updated });
}
