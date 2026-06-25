import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

// Server-only dashboard summary. Prefers the DB-side RPC
// (admin_detection_dashboard_summary from migration 0004) and falls back to
// per-table JS counts if the RPC is unavailable.

export interface DashboardSummary {
  totalSigns: number;
  todayDetections: number;
  last24h: number;
  last7d: number;
  activeDevices: number;
  activeSessions: number;
  lowConfidence: number;
  avgConfidence: number | null;
  avgAiMs: number | null;
}

export interface DashboardSummaryResult {
  metrics: DashboardSummary;
  source: "rpc" | "fallback";
}

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function toNumOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function fromRpc(): Promise<DashboardSummary | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("admin_detection_dashboard_summary");
  if (error || !data) return null;
  const r = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  if (!r) return null;
  return {
    totalSigns: toNum(r.total_signs),
    todayDetections: toNum(r.today_detections),
    last24h: toNum(r.last_24h_detections),
    last7d: toNum(r.last_7d_detections),
    activeDevices: toNum(r.active_devices),
    activeSessions: toNum(r.active_sessions),
    lowConfidence: toNum(r.low_confidence_detections),
    avgConfidence: toNumOrNull(r.avg_confidence),
    avgAiMs: toNumOrNull(r.avg_ai_response_time_ms),
  };
}

async function fromFallback(): Promise<DashboardSummary> {
  const supabase = createSupabaseServerClient();
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString();

  const count = async (table: string, modify?: (q: any) => any): Promise<number> => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (modify) q = modify(q);
    const { count } = await q;
    return count ?? 0;
  };

  const [totalSigns, todayDetections, activeDevices, activeSessions, last24h, last7d, lowConfidence] =
    await Promise.all([
      count("traffic_signs"),
      count("detection_events", (q) => q.gte("created_at", startOfToday.toISOString())),
      count("devices", (q) => q.eq("status", "active")),
      count("detection_sessions", (q) => q.eq("status", "active")),
      count("detection_events", (q) => q.gte("created_at", dayAgo)),
      count("detection_events", (q) => q.gte("created_at", weekAgo)),
      count("detection_events", (q) => q.eq("validation_status", "low_confidence")),
    ]);

  const { data: recentForAvg } = await supabase
    .from("detection_events")
    .select("confidence, ai_response_time_ms")
    .order("created_at", { ascending: false })
    .limit(500);
  const confVals = (recentForAvg ?? []).map((r) => r.confidence).filter((c): c is number => c != null);
  const aiVals = (recentForAvg ?? [])
    .map((r) => r.ai_response_time_ms)
    .filter((c): c is number => c != null);

  return {
    totalSigns,
    todayDetections,
    last24h,
    last7d,
    activeDevices,
    activeSessions,
    lowConfidence,
    avgConfidence: confVals.length > 0 ? confVals.reduce((a, b) => a + b, 0) / confVals.length : null,
    avgAiMs: aiVals.length > 0 ? aiVals.reduce((a, b) => a + b, 0) / aiVals.length : null,
  };
}

export async function getDashboardSummary(): Promise<DashboardSummaryResult> {
  const src = env.dashboardAnalyticsSource();
  if (src !== "fallback") {
    const rpc = await fromRpc();
    if (rpc) return { metrics: rpc, source: "rpc" };
  }
  return { metrics: await fromFallback(), source: "fallback" };
}
