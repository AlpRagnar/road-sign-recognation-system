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
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
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
      setRows(json.data.items);
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
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total requests" value={summary.total} />
          <Stat label="Succeeded" value={summary.success} />
          <Stat label="Failed" value={summary.failure + summary.timeout + summary.invalid} hint={`${summary.timeout} timeout · ${summary.invalid} invalid`} />
          <Stat label="Mock used" value={summary.mockUsed} />
          <Stat label="Avg elapsed" value={summary.avgElapsedMs != null ? `${summary.avgElapsedMs} ms` : "—"} />
          <Stat label="Failure rate" value={`${summary.failureRatePct}%`} hint="of external attempts" />
        </div>
      )}

      {summary && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-white px-4 py-2 text-xs text-slate-500 shadow-sm ring-1 ring-slate-200">
          <span>Latest success: {fmt(summary.latestSuccessAt)}</span>
          <span>Latest failure: {fmt(summary.latestFailureAt)}</span>
          <span className="ml-auto">
            Failure breakdown:{" "}
            {CATEGORIES.map((c) => `${c} ${breakdown[c] ?? 0}`).join(" · ")}
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

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
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
