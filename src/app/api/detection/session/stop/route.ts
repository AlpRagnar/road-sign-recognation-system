import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import type { DetectionSession } from "@/lib/types/database";

// POST /api/detection/session/stop
// Body: { sessionId: string }
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
  if (!body.sessionId) return jsonError("sessionId is required");

  const admin = createSupabaseAdminClient();

  const { data: session } = await admin
    .from("detection_sessions")
    .select("*")
    .eq("id", body.sessionId)
    .maybeSingle();

  if (!session) return jsonError("Session not found", 404);
  const typed = session as DetectionSession;

  // Owners (or admins) may stop a session.
  if (typed.user_id !== ctx.profile.id && ctx.profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const { data: updated, error } = await admin
    .from("detection_sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.sessionId)
    .select("*")
    .single();

  if (error) return jsonError(`Could not stop session: ${error.message}`, 500);

  if (typed.device_id) {
    await admin
      .from("devices")
      .update({ status: "inactive", updated_at: new Date().toISOString() })
      .eq("id", typed.device_id);
  }

  await writeSystemLog(admin, {
    action: "SESSION_STOPPED",
    message: `Session ${body.sessionId} stopped`,
    userId: ctx.profile.id,
    deviceId: typed.device_id,
    metadata: { session_id: body.sessionId },
  });

  return jsonOk({ session: updated });
}
