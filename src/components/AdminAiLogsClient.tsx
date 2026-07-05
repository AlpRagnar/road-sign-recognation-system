"use client";

import { useCallback, useEffect, useState } from "react";
import { PaginationBar } from "@/components/PaginationBar";

interface Summary {
  total: number;
  success: number;
  failure: number;
  timeout: number;
  invalid: number;
  mockUsed: number;
  avgElapsedMs: number | null;
  latestSuccessAt: string | null;
  latestFailureAt: string | null;
  failureRatePct: number;
}

type Breakdown = Record<string, number>;

interface TimeSeriesBucket {
  bucketStart: string;
  total: number;
  success: number;
  failed: number;
  timeout: number;
  invalid: number;
  mock: number;
  failureRatePct: number;
  avgElapsedMs: number | null;
}

interface Threshold {
  failureRateWarningPercent: number;
  exceeded: boolean;
}

interface LogRow {
  id: string;
  created_at: string;
  action_type: string;
  category: string | null;
  status: number | null;
  attempts: number | null;
  elapsed_ms: number | null;
  message: string | null;
  session_id: string | null;
  device_id: string | null;
}

const WINDOWS: { value: string; label: string }[] = [
  { value: "1h", label: "Last 1 hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
];

const ACTIONS = [
  "AI_REQUEST_STARTED",
  "AI_REQUEST_SUCCEEDED",
  "AI_REQUEST_FAILED",
  "AI_REQUEST_TIMEOUT",
  "AI_RESPONSE_INVALID",
  "AI_MOCK_USED",
  "AI_HEALTH_CHECK_RUN",
  "AI_SELF_TEST_STARTED",
  "AI_SELF_TEST_SUCCEEDED",
  "AI_SELF_TEST_FAILED",
];

const CATEGORIES = ["config", "timeout", "network", "http", "validation", "unknown"];

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg bg-white p-4 border border-line">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function AdminAiLogsClient() {
  const [window, setWindow] = useState("24h");
  const [action, setAction] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [breakdown, setBreakdown] = useState<Breakdown>({});
  const [timeSeries, setTimeSeries] = useState<TimeSeriesBucket[]>([]);
  const [threshold, setThreshold] = useState<Threshold | null>(null);
  const [source, setSource] = useState<"rpc" | "fallback" | null>(null);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ window, page: String(page), pageSize: String(pageSize) });
      if (action) qs.set("action", action);
      if (category) qs.set("category", category);
      const json = await fetch(`/api/admin/ai/logs?${qs}`).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setSummary(json.data.summary);
      setBreakdown(json.data.breakdown);
      setTimeSeries(json.data.timeSeries ?? []);
      setThreshold(json.data.threshold ?? null);
      setSource(json.data.source ?? null);
      setRows(json.data.rows ?? json.data.items ?? []);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [window, action, category, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");
  const externalAttempts = summary
    ? summary.success + summary.failure + summary.timeout + summary.invalid
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={window}
          onChange={(e) => {
            setWindow(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          {WINDOWS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => void load()}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
        {source && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              source === "rpc" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
            }`}
            title={
              source === "rpc"
                ? "Computed by database RPC (migration 0004)"
                : "Computed in JS — apply migration 0004 for DB-side analytics"
            }
          >
            source: {source === "rpc" ? "DB RPC" : "JS fallback"}
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {/* Failure-rate threshold warning */}
      {summary && threshold && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ring-1 ${
            externalAttempts === 0
              ? "bg-slate-50 text-slate-600 ring-slate-200"
              : threshold.exceeded
                ? "bg-red-50 text-red-800 ring-red-200"
                : "bg-green-50 text-green-800 ring-green-200"
          }`}
        >
          {externalAttempts === 0 ? (
            <span>No production AI requests in this window — nothing to evaluate.</span>
          ) : threshold.exceeded ? (
            <span>
              <strong>Warning:</strong> failure rate is {summary.failureRatePct}% over{" "}
              {externalAttempts} external attempt(s) — at or above the{" "}
              {threshold.failureRateWarningPercent}% threshold. Check the failure breakdown and
              recent logs below.
            </span>
          ) : (
            <span>
              <strong>Healthy:</strong> failure rate is {summary.failureRatePct}% over{" "}
              {externalAttempts} external attempt(s) — below the{" "}
              {threshold.failureRateWarningPercent}% threshold.
            </span>
          )}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total requests" value={summary.total} />
          <Stat label="Succeeded" value={summary.success} />
          <Stat
            label="Failed"
            value={summary.failure + summary.timeout + summary.invalid}
            hint={`${summary.timeout} timeout · ${summary.invalid} invalid`}
          />
          <Stat label="Mock used" value={summary.mockUsed} />
          <Stat label="Avg elapsed" value={summary.avgElapsedMs != null ? `${summary.avgElapsedMs} ms` : "—"} />
          <Stat label="Failure rate" value={`${summary.failureRatePct}%`} hint="of external attempts" />
        </div>
      )}

      {/* Time-series visualization (div bars) */}
      {timeSeries.length > 0 && (
        <div className="rounded-md bg-white p-5 border border-line">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Request volume & failure rate</h3>
            <span className="text-xs text-slate-400">
              {timeSeries.length} buckets · failed portion shaded
            </span>
          </div>
          <TimeSeriesChart data={timeSeries} />
        </div>
      )}

      {summary && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-white px-4 py-2 text-xs text-slate-500 border border-line">
          <span>Latest success: {fmt(summary.latestSuccessAt)}</span>
          <span>Latest failure: {fmt(summary.latestFailureAt)}</span>
          <span className="ml-auto">
            Failure breakdown: {CATEGORIES.map((c) => `${c} ${breakdown[c] ?? 0}`).join(" · ")}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setCategory("");
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setAction("");
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-md bg-white border border-line">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading logs…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No AI logs in this window.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Attempts</th>
                <th className="px-3 py-3">Elapsed</th>
                <th className="px-3 py-3">Message</th>
                <th className="px-3 py-3">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">{r.action_type}</td>
                  <td className="px-3 py-2 text-xs">{r.category ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.status ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.attempts ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.elapsed_ms != null ? `${r.elapsed_ms} ms` : "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{r.message ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{r.device_id ?? "—"}</td>
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

// Compact Tailwind/div bar chart: bar height = total requests, shaded portion
// = failed requests; a faint line of failure-rate % labels on hover via title.
function TimeSeriesChart({ data }: { data: TimeSeriesBucket[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div className="flex h-32 items-end gap-0.5">
      {data.map((b) => {
        const failed = b.timeout + b.invalid + b.failed;
        const totalH = (b.total / max) * 100;
        const failedH = b.total > 0 ? (failed / b.total) * totalH : 0;
        const label = `${new Date(b.bucketStart).toLocaleString()}\n${b.total} req · ${failed} failed · ${b.failureRatePct}% · ${b.mock} mock`;
        return (
          <div
            key={b.bucketStart}
            title={label}
            className="group relative flex flex-1 flex-col justify-end"
            style={{ minWidth: 2 }}
          >
            <div
              className="w-full rounded-t bg-slate-300"
              style={{ height: `${totalH}%` }}
            >
              <div
                className="w-full rounded-t bg-red-400"
                style={{ height: `${b.total > 0 ? (failedH / totalH) * 100 : 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
