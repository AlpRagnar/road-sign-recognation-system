import type { SupabaseClient } from "@supabase/supabase-js";
import type { SystemLogAction } from "@/lib/types/database";

interface LogInput {
  action: SystemLogAction;
  message?: string;
  userId?: string | null;
  deviceId?: string | null;
  metadata?: Record<string, unknown>;
}

// Best-effort system logging. Never throws — logging failures must not break
// the main request flow. Pass an admin (service-role) client so the insert
// works regardless of the caller's RLS context.
export async function writeSystemLog(
  supabase: SupabaseClient,
  { action, message, userId = null, deviceId = null, metadata }: LogInput,
): Promise<void> {
  try {
    await supabase.from("system_logs").insert({
      action_type: action,
      message: message ?? null,
      user_id: userId,
      device_id: deviceId,
      metadata: metadata ?? null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[system_logs] failed to write log", action, err);
  }
}
