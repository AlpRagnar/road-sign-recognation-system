import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import type { ValidationStatus } from "@/lib/types/database";

const ALLOWED: ValidationStatus[] = [
  "pending",
  "auto_verified",
  "manually_verified",
  "rejected",
  "duplicate",
  "low_confidence",
];

interface ReviewBody {
  target: "traffic_sign" | "detection_event";
  id: string;
  status: ValidationStatus;
}

// POST /api/admin/review-detection
// Admin sets the verification/validation status of a traffic sign or detection event.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as ReviewBody | null;
  if (!body?.id || !body.status || !body.target) {
    return jsonError("target, id and status are required");
  }
  if (!ALLOWED.includes(body.status)) return jsonError("Invalid status");

  const admin = createSupabaseAdminClient();

  if (body.target === "traffic_sign") {
    const { error } = await admin
      .from("traffic_signs")
      .update({ verification_status: body.status, updated_at: new Date().toISOString() })
      .eq("id", body.id);
    if (error) return jsonError(error.message, 500);
  } else {
    const { error } = await admin
      .from("detection_events")
      .update({ validation_status: body.status })
      .eq("id", body.id);
    if (error) return jsonError(error.message, 500);
  }

  await writeSystemLog(admin, {
    action: "ADMIN_REVIEW_UPDATED",
    message: `${body.target} ${body.id} → ${body.status}`,
    userId: ctx.profile.id,
    metadata: { target: body.target, id: body.id, status: body.status },
  });

  return jsonOk({ updated: true });
}
