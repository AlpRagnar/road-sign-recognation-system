"use client";

import { useCallback, useEffect, useState } from "react";
import { PaginationBar } from "@/components/PaginationBar";
import type { DailyMetricsSnapshot } from "@/lib/types/database";

interface TrendRow {
  snapshot_date: string;
  total_detection_events: number;
  total_traffic_signs: number;
  ai_failure_rate_percent: number | null;
  active_devices_24h: number;
  detections_last_24h: number;
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// Compact div-bar trend (one bar per snapshot day), normalized to its own max.
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
    <div className="flex h-20 items-end gap-0.5">
      {data.map((r) => {
        const v = pick(r);
        return (
          <div
            key={r.snapshot_date}
            title={`${r.snapshot_date}: ${v}${unit ?? ""}`}
            className="flex-1 rounded-t"
            style={{ height: `${(v / max) * 100}%`, minWidth: 2, backgroundColor: color }}
          />
        );
      })}
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

  return (
    <div className="space-y-6">
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      {notice && <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</p>}

      {gap && gap.missingCount > 0 && (
        <div
          className={`rounded-md px-4 py-3 text-sm ring-1 ${
            gap.warning
              ? "bg-amber-50 text-amber-800 ring-amber-200"
              : "bg-slate-50 text-slate-600 ring-slate-200"
          }`}
        >
          <strong>Snapshot coverage {gap.warning ? "warning" : "note"}:</strong>{" "}
          {gap.missingCount} day(s) are missing in the selected range
          {gap.latestMissingDate && <> · latest missing date: {gap.latestMissingDate}</>}.
          {gap.warning && (
            <> Threshold is {gap.thresholdDays} day(s). Use “Create / refresh” to fill gaps.</>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="block text-xs text-slate-500">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={() => createSnapshot()}
          disabled={busy != null}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {busy === "today" ? "Saving…" : "Create / refresh today"}
        </button>
        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-slate-500">Refresh a specific date</label>
            <input
              type="date"
              value={refreshDate}
              onChange={(e) => setRefreshDate(e.target.value)}
              className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={() => refreshDate && createSnapshot(refreshDate)}
            disabled={busy != null || !refreshDate}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "date" ? "Saving…" : "Refresh date"}
          </button>
        </div>
      </div>

      {/* KPI cards from latest snapshot */}
      {latest ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Traffic signs" value={latest.total_traffic_signs} hint={`as of ${latest.snapshot_date}`} />
          <Stat label="Detections (total)" value={latest.total_detection_events} />
          <Stat label="Detections 24h" value={latest.detections_last_24h} />
          <Stat label="Active devices 24h" value={latest.active_devices_24h} />
          <Stat
            label="AI failure rate"
            value={latest.ai_failure_rate_percent != null ? `${latest.ai_failure_rate_percent}%` : "—"}
          />
          <Stat label="Quarantine pending" value={latest.storage_quarantine_pending} />
        </div>
      ) : (
        !loading && (
          <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No snapshots yet. Click “Create / refresh today” to capture the first one.
          </p>
        )
      )}

      {/* Trend bars */}
      {trend.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Detection events", pick: (r: TrendRow) => r.total_detection_events, color: "#1d4ed8" },
            { title: "Traffic signs", pick: (r: TrendRow) => r.total_traffic_signs, color: "#16a34a" },
            { title: "AI failure rate %", pick: (r: TrendRow) => r.ai_failure_rate_percent ?? 0, color: "#dc2626", unit: "%" },
            { title: "Active devices 24h", pick: (r: TrendRow) => r.active_devices_24h, color: "#9333ea" },
          ].map((c) => (
            <div key={c.title} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="mb-2 text-xs font-semibold text-slate-600">{c.title}</p>
              <TrendBars data={trend} pick={c.pick} color={c.color} unit={c.unit} />
            </div>
          ))}
        </div>
      )}

      {/* Snapshot table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No snapshots in this range.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Signs</th>
                <th className="px-3 py-3">Verified</th>
                <th className="px-3 py-3">Detections</th>
                <th className="px-3 py-3">24h</th>
                <th className="px-3 py-3">Low-conf</th>
                <th className="px-3 py-3">Avg conf</th>
                <th className="px-3 py-3">Avg AI ms</th>
                <th className="px-3 py-3">AI total</th>
                <th className="px-3 py-3">AI fail %</th>
                <th className="px-3 py-3">Devices 24h</th>
                <th className="px-3 py-3">Quar.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.snapshot_date}>
                  <td className="px-3 py-2 font-medium text-slate-800">{r.snapshot_date}</td>
                  <td className="px-3 py-2">{r.total_traffic_signs}</td>
                  <td className="px-3 py-2">{r.verified_traffic_signs}</td>
                  <td className="px-3 py-2">{r.total_detection_events}</td>
                  <td className="px-3 py-2">{r.detections_last_24h}</td>
                  <td className="px-3 py-2">{r.low_confidence_events}</td>
                  <td className="px-3 py-2">
                    {r.average_detection_confidence != null
                      ? `${(r.average_detection_confidence * 100).toFixed(0)}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.average_ai_response_time_ms != null ? `${r.average_ai_response_time_ms}` : "—"}
                  </td>
                  <td className="px-3 py-2">{r.ai_request_total}</td>
                  <td className="px-3 py-2">
                    {r.ai_failure_rate_percent != null ? `${r.ai_failure_rate_percent}%` : "—"}
                  </td>
                  <td className="px-3 py-2">{r.active_devices_24h}</td>
                  <td className="px-3 py-2">{r.storage_quarantine_pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
