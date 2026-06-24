import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { DashboardMetricCard } from "@/components/DashboardMetricCard";

export const dynamic = "force-dynamic";

async function count(table: string, modify?: (q: any) => any): Promise<number> {
  const supabase = createSupabaseServerClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (modify) q = modify(q);
  const { count } = await q;
  return count ?? 0;
}

const VERIFICATION_STATUSES = [
  "pending",
  "auto_verified",
  "manually_verified",
  "rejected",
  "duplicate",
  "low_confidence",
] as const;

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const admin = isAdmin(profile);
  const supabase = createSupabaseServerClient();

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString();

  const [totalSigns, todayDetections, activeDevices, activeSessions, last24h, last7d] =
    await Promise.all([
      count("traffic_signs"),
      count("detection_events", (q) => q.gte("created_at", startOfToday.toISOString())),
      count("devices", (q) => q.eq("status", "active")),
      count("detection_sessions", (q) => q.eq("status", "active")),
      count("detection_events", (q) => q.gte("created_at", dayAgo)),
      count("detection_events", (q) => q.gte("created_at", weekAgo)),
    ]);

  // Verification breakdown (raw detection events).
  const breakdownCounts = await Promise.all(
    VERIFICATION_STATUSES.map((s) =>
      count("detection_events", (q) => q.eq("validation_status", s)),
    ),
  );
  const breakdown = VERIFICATION_STATUSES.map((s, i) => ({
    status: s,
    value: breakdownCounts[i]!,
  }));
  const breakdownMax = Math.max(1, ...breakdown.map((b) => b.value));

  // Averages from a recent window (approximate; avoids server-side aggregates).
  const { data: recentForAvg } = await supabase
    .from("detection_events")
    .select("confidence, ai_response_time_ms")
    .order("created_at", { ascending: false })
    .limit(500);
  const confVals = (recentForAvg ?? [])
    .map((r) => r.confidence)
    .filter((c): c is number => c != null);
  const aiVals = (recentForAvg ?? [])
    .map((r) => r.ai_response_time_ms)
    .filter((c): c is number => c != null);
  const avgConfidence =
    confVals.length > 0 ? confVals.reduce((a, b) => a + b, 0) / confVals.length : null;
  const avgAiMs = aiVals.length > 0 ? aiVals.reduce((a, b) => a + b, 0) / aiVals.length : null;

  // Top detected sign types (from the optimized inventory).
  const { data: signRows } = await supabase
    .from("traffic_signs")
    .select("sign_type, detection_count")
    .limit(2000);
  const typeTotals = new Map<string, number>();
  for (const r of signRows ?? []) {
    typeTotals.set(r.sign_type, (typeTotals.get(r.sign_type) ?? 0) + (r.detection_count ?? 0));
  }
  const topTypes = [...typeTotals.entries()]
    .map(([sign_type, total]) => ({ sign_type, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const topMax = Math.max(1, ...topTypes.map((t) => t.total));

  const { data: recent } = await supabase
    .from("detection_events")
    .select("id, detected_class_name, confidence, created_at, validation_status")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ""}.`}
        actions={
          <Link
            href="/detection"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Start detection
          </Link>
        }
      />

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardMetricCard label="Traffic signs" value={totalSigns} hint="Optimized inventory" />
          <DashboardMetricCard label="Detections today" value={todayDetections} />
          <DashboardMetricCard label="Active devices" value={activeDevices} />
          <DashboardMetricCard label="Active sessions" value={activeSessions} />
          <DashboardMetricCard label="Last 24 hours" value={last24h} hint="Detection events" />
          <DashboardMetricCard label="Last 7 days" value={last7d} hint="Detection events" />
          <DashboardMetricCard
            label="Avg confidence"
            value={avgConfidence != null ? `${(avgConfidence * 100).toFixed(0)}%` : "—"}
            hint="Recent 500 events"
          />
          <DashboardMetricCard
            label="Avg AI time"
            value={avgAiMs != null ? `${avgAiMs.toFixed(0)} ms` : "—"}
            hint="Recent 500 events"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Verification breakdown */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Verification breakdown</h2>
            </div>
            <div className="space-y-2 p-5">
              {breakdown.map((b) => (
                <div key={b.status} className="flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 text-slate-600">{b.status}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(b.value / breakdownMax) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-700">{b.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top sign types */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Top detected sign types</h2>
            </div>
            <div className="space-y-2 p-5">
              {topTypes.length === 0 && (
                <p className="text-sm text-slate-400">No traffic signs yet.</p>
              )}
              {topTypes.map((t) => (
                <div key={t.sign_type} className="flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 truncate text-slate-600" title={t.sign_type}>
                    {t.sign_type}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${(t.total / topMax) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-700">{t.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Recent detections</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(recent ?? []).length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400">
                No detections yet. Start a detection session to populate data.
              </p>
            )}
            {(recent ?? []).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-slate-800">{r.detected_class_name ?? "—"}</span>
                <span className="text-slate-500">
                  {r.confidence != null ? `${(r.confidence * 100).toFixed(0)}%` : "—"}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {admin && (
          <p className="text-xs text-slate-400">
            You are signed in as an admin — admin pages are available in the sidebar.
          </p>
        )}
      </div>
    </>
  );
}
