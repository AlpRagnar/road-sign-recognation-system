"use client";

import { useCallback, useEffect, useState } from "react";
import { PaginationBar } from "@/components/PaginationBar";
import { KpiTile, ErrorBanner, btnPrimary, btnSecondary } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import type { DailyMetricsSnapshot } from "@/lib/types/database";

interface TrendRow {
  snapshot_date: string;
  total_detection_events: number;
  total_traffic_signs: number;
  ai_failure_rate_percent: number | null;
  active_devices_24h: number;
  detections_last_24h: number;
}

// Compact bar trend (one bar per snapshot day) with a baseline + hover tooltip.
function TrendBars({
  data,
  pick,
  color,
  unit,
}: {
  data: TrendRow[];
  pick: (r: TrendRow) => number;
  color: string;
  unit?: string;
}) {
  const max = Math.max(1, ...data.map(pick));
  return (
    <div className="relative">
      <div className="flex h-20 items-end gap-0.5 border-b border-line">
        {data.map((r) => {
          const v = pick(r);
          return (
            <div
              key={r.snapshot_date}
              title={`${r.snapshot_date}: ${v}${unit ?? ""}`}
              className="flex-1 rounded-t transition-all hover:opacity-80"
              style={{ height: `${(v / max) * 100}%`, minWidth: 2, backgroundColor: color }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-slate-400">
        <span>{data[data.length - 1]?.snapshot_date?.slice(5)}</span>
        <span>{data[0]?.snapshot_date?.slice(5)}</span>
      </div>
    </div>
  );
}

export function AdminAnalyticsClient() {
  const [rows, setRows] = useState<DailyMetricsSnapshot[]>([]);
  const [trend, setTrend] = useState<TrendRow[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshDate, setRefreshDate] = useState("");
  const [gap, setGap] = useState<{
    missingCount: number;
    latestMissingDate: string | null;
    warning: boolean;
    thresholdDays: number;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      const json = await fetch(`/api/admin/metrics/daily-snapshots?${qs}`).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setRows(json.data.items);
      setTrend(json.data.trend ?? []);
      setGap(json.data.gapSummary ?? null);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
      if (!from) setFrom(json.data.from);
      if (!to) setTo(json.data.to);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createSnapshot(date?: string) {
    setBusy(date ? "date" : "today");
    setError(null);
    setNotice(null);
    try {
      const json = await fetch("/api/admin/metrics/daily-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(date ? { date } : {}),
      }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Snapshot failed");
      setNotice(`Snapshot saved for ${json.data.snapshot.snapshot_date}.`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const latest = rows[0] ?? null;
  const dateInput =
    "mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}
      {notice && (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</p>
      )}

      {gap && gap.missingCount > 0 && (
        <div
          className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${
            gap.warning ? "border-amber-200 bg-amber-50 text-amber-800" : "border-line bg-panel text-slate-600"
          }`}
        >
          <Icon name="warning" size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Snapshot coverage {gap.warning ? "warning" : "note"}:</strong>{" "}
            {gap.missingCount} day(s) are missing in the selected range
            {gap.latestMissingDate && <> · latest missing date: {gap.latestMissingDate}</>}.
            {gap.warning && <> Threshold is {gap.thresholdDays} day(s). Use &ldquo;Create / refresh&rdquo; to fill gaps.</>}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-line bg-white p-4">
        <div>
          <label className="block text-xs text-slate-500">From</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={dateInput} />
        </div>
        <div>
          <label className="block text-xs text-slate-500">To</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={dateInput} />
        </div>
        <button onClick={() => createSnapshot()} disabled={busy != null} className={btnPrimary}>
          <Icon name="refresh" size={16} />
          {busy === "today" ? "Saving…" : "Create / refresh today"}
        </button>
        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-slate-500">Refresh a specific date</label>
            <input type="date" value={refreshDate} onChange={(e) => setRefreshDate(e.target.value)} className={dateInput} />
          </div>
          <button
            onClick={() => refreshDate && createSnapshot(refreshDate)}
            disabled={busy != null || !refreshDate}
            className={btnSecondary}
          >
            {busy === "date" ? "Saving…" : "Refresh date"}
          </button>
        </div>
      </div>

      {/* KPI tiles from the latest snapshot */}
      {latest ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiTile label="Traffic signs" value={latest.total_traffic_signs} hint={`as of ${latest.snapshot_date}`} icon="signmap" />
          <KpiTile label="Detections (total)" value={latest.total_detection_events} icon="detection" />
          <KpiTile label="Detections 24h" value={latest.detections_last_24h} icon="clock" />
          <KpiTile label="Active devices 24h" value={latest.active_devices_24h} icon="devices" />
          <KpiTile label="AI failure rate" value={latest.ai_failure_rate_percent != null ? `${latest.ai_failure_rate_percent}%` : "—"} icon="ai" />
          <KpiTile label="Quarantine pending" value={latest.storage_quarantine_pending} icon="storage" />
        </div>
      ) : (
        !loading && (
          <p className="rounded-md border border-line bg-panel px-4 py-3 text-sm text-slate-500">
            No snapshots yet. Click &ldquo;Create / refresh today&rdquo; to capture the first one.
          </p>
        )
      )}

      {/* Trend charts — colours mapped to meaning */}
      {trend.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Detection events", pick: (r: TrendRow) => r.total_detection_events, color: "#1d4ed8" },
            { title: "Traffic signs", pick: (r: TrendRow) => r.total_traffic_signs, color: "#16a34a" },
            { title: "AI failure rate %", pick: (r: TrendRow) => r.ai_failure_rate_percent ?? 0, color: "#dc2626", unit: "%" },
            { title: "Active devices 24h", pick: (r: TrendRow) => r.active_devices_24h, color: "#0d9488" },
          ].map((c) => (
            <div key={c.title} className="rounded-md border border-line bg-white p-4">
              <p className="mb-3 text-xs font-semibold text-slate-600">{c.title}</p>
              <TrendBars data={trend} pick={c.pick} color={c.color} unit={c.unit} />
            </div>
          ))}
        </div>
      )}

      {/* Snapshot history table */}
      <div className="overflow-hidden rounded-md border border-line bg-white">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No snapshots in this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-panel/60 text-left">
                <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:font-mono [&>th]:text-[11px] [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-slate-500">
                  <th className="sticky left-0 bg-panel/60">Date</th>
                  <th>Signs</th><th>Verified</th><th>Detections</th><th>24h</th><th>Low-conf</th>
                  <th>Avg conf</th><th>Avg AI ms</th><th>AI total</th><th>AI fail %</th><th>Devices 24h</th><th>Quar.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 [&_td]:px-3 [&_td]:py-2 [&_td]:font-mono [&_td]:text-xs [&_td]:tabular [&_td]:text-slate-600">
                {rows.map((r) => (
                  <tr key={r.snapshot_date} className="hover:bg-panel/40">
                    <td className="sticky left-0 bg-white font-medium text-slate-800">{r.snapshot_date}</td>
                    <td>{r.total_traffic_signs}</td>
                    <td>{r.verified_traffic_signs}</td>
                    <td>{r.total_detection_events}</td>
                    <td>{r.detections_last_24h}</td>
                    <td>{r.low_confidence_events}</td>
                    <td>{r.average_detection_confidence != null ? `${(r.average_detection_confidence * 100).toFixed(0)}%` : "—"}</td>
                    <td>{r.average_ai_response_time_ms != null ? `${r.average_ai_response_time_ms}` : "—"}</td>
                    <td>{r.ai_request_total}</td>
                    <td>{r.ai_failure_rate_percent != null ? `${r.ai_failure_rate_percent}%` : "—"}</td>
                    <td>{r.active_devices_24h}</td>
                    <td>{r.storage_quarantine_pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />
    </div>
  );
}
