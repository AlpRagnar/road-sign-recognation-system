import type { SupabaseClient } from "@supabase/supabase-js";

// Server-only. Shared daily-metrics snapshot upsert used by both the admin
// route and the headless cron route. Calls the service-role RPC from
// migration 0006. Never import into client components.
export async function createDailyMetricsSnapshot(
  admin: SupabaseClient,
  date?: string,
): Promise<
  | { ok: true; snapshot: Record<string, unknown> }
  | { ok: false; message: string }
> {
  const args = date ? { target_date: date } : {};
  const { data, error } = await admin.rpc("admin_create_daily_metrics_snapshot", args);
  if (error || !data) {
    // Sanitized/truncated — never leak raw SQL internals.
    return { ok: false, message: (error?.message ?? "unknown").slice(0, 160) };
  }
  const snapshot = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
  return { ok: true, snapshot };
}
