import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import { PageHeader } from "@/components/PageHeader";
import { KpiTile, ConfidenceMeter } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { btnPrimary } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

// Semantic bar colour per verification status.
const STATUS_BAR: Record<string, { dot: string; bar: string; label: string }> = {
  pending: { dot: "bg-amber-500", bar: "bg-amber-500", label: "Pending" },
  auto_verified: { dot: "bg-sky-500", bar: "bg-sky-500", label: "Auto Verified" },
  manually_verified: { dot: "bg-green-500", bar: "bg-green-500", label: "Manually Verified" },
  rejected: { dot: "bg-red-500", bar: "bg-red-500", label: "Rejected" },
  duplicate: { dot: "bg-violet-500", bar: "bg-violet-500", label: "Duplicate" },
  low_confidence: { dot: "bg-orange-500", bar: "bg-orange-500", label: "Low Confidence" },
};

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

  // Prefer DB-side summary RPC (migration 0004) with safe JS fallback.
  const { metrics, source } = await getDashboardSummary();
  const { totalSigns, todayDetections, activeDevices, activeSessions, last24h, last7d } = metrics;
  const avgConfidence = metrics.avgConfidence;
  const avgAiMs = metrics.avgAiMs;

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
    .select("id, detected_class_id, detected_class_name, confidence, created_at, validation_status")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ""}.`}
        tag={
          admin ? (
            <span className="rounded bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Metrics source: {source === "rpc" ? "DB RPC" : "JS fallback"}
            </span>
          ) : undefined
        }
        actions={
          <Link href="/detection" className={btnPrimary}>
            <Icon name="detection" size={16} />
            Start detection
          </Link>
        }
      />

      <div className="space-y-6 p-4 md:p-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          <KpiTile label="Traffic signs" value={totalSigns} hint="Optimized inventory" icon="signmap" />
          <KpiTile label="Detections today" value={todayDetections} icon="detection" />
          <KpiTile label="Active devices" value={activeDevices} hint="Reporting recently" live />
          <KpiTile label="Active sessions" value={activeSessions} hint="Running now" live />
          <KpiTile label="Last 24 hours" value={last24h} hint="Detection events" icon="clock" />
          <KpiTile label="Last 7 days" value={last7d} hint="Detection events" icon="calendar" />
          <KpiTile
            label="Avg confidence"
            value={avgConfidence != null ? `${(avgConfidence * 100).toFixed(0)}%` : "—"}
            hint={source === "rpc" ? "All events" : "Recent 500 events"}
            icon="ai"
          />
          <KpiTile
            label="Avg AI time"
            value={avgAiMs != null ? `${avgAiMs.toFixed(0)} ms` : "—"}
            hint={source === "rpc" ? "All events" : "Recent 500 events"}
            icon="bolt"
          />
        </div>

        {/* Two-column region */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Verification breakdown */}
          <div className="flex flex-col rounded-md border border-line bg-white p-5 lg:col-span-4">
            <h2 className="mb-4 text-[15px] font-semibold text-slate-900">Verification Breakdown</h2>
            <div className="flex-1 space-y-3.5">
              {breakdown.map((b) => {
                const s = STATUS_BAR[b.status]!;
                return (
                  <div key={b.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <span className="font-mono tabular text-slate-600">{b.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-panel">
                      <div className={`h-full ${s.bar}`} style={{ width: `${(b.value / breakdownMax) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top sign types + inventory map link */}
          <div className="grid grid-cols-1 gap-6 lg:col-span-8 md:grid-cols-3">
            <div className="flex flex-col rounded-md border border-line bg-white p-5 md:col-span-2">
              <h2 className="mb-4 text-[15px] font-semibold text-slate-900">Top Detected Sign Types</h2>
              <div className="flex-1 space-y-3.5">
                {topTypes.length === 0 && <p className="text-sm text-slate-400">No traffic signs yet.</p>}
                {topTypes.map((t) => {
                  const label = getTrafficSignDisplayName(null, t.sign_type);
                  return (
                    <div key={t.sign_type} className="flex items-center gap-4">
                      <div className="w-28 truncate text-sm font-medium text-slate-700" title={label}>
                        {label}
                      </div>
                      <div className="h-4 flex-1 overflow-hidden rounded-sm bg-panel">
                        <div className="h-full bg-green-600" style={{ width: `${(t.total / topMax) * 100}%` }} />
                      </div>
                      <div className="w-8 text-right font-mono tabular text-sm text-slate-600">{t.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory map link card (real link — no static map screenshot) */}
            <Link
              href="/map/signs"
              className="group flex flex-col justify-between rounded-md border border-line bg-white p-4 transition-colors hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Inventory Map</span>
                <Icon name="arrowRight" size={16} className="text-slate-400 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="my-3 flex flex-1 items-center justify-center rounded-md border border-line bg-navy/95 text-white/80">
                <div className="flex flex-col items-center gap-1 py-6">
                  <Icon name="signmap" size={26} className="text-primary" />
                  <span className="font-mono text-lg font-semibold tabular">{totalSigns}</span>
                  <span className="text-[10px] uppercase tracking-wide text-white/50">Signs mapped</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-slate-400">Aalborg Region</span>
                <span className="font-mono text-[10px] text-slate-400">57.04° N, 9.89° E</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent detections */}
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <div className="border-b border-line bg-panel/40 px-5 py-3">
            <h2 className="text-[15px] font-semibold text-slate-900">Recent Detections</h2>
          </div>
          {(recent ?? []).length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-400">
              No detections yet. Start a detection session to populate data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-panel/50">
                  <tr>
                    <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Class</th>
                    <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Confidence</th>
                    <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {(recent ?? []).map((r) => (
                    <tr key={r.id} className="hover:bg-panel/40">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded border border-line bg-panel text-primary">
                            <Icon name="sign" size={16} />
                          </span>
                          <span className="font-medium text-slate-800">
                            {r.detected_class_name || r.detected_class_id != null
                              ? getTrafficSignDisplayName(r.detected_class_id, r.detected_class_name)
                              : "—"}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <ConfidenceMeter value={r.confidence} />
                      </td>
                      <td className="px-5 py-3 font-mono tabular text-sm text-slate-500">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
