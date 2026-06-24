"use client";

import { useState } from "react";

interface AiHealthResult {
  mode: string;
  externalConfigured: boolean;
  hostname: string | null;
  timeoutMs: number;
  maxRetries: number;
  retryBackoffMs: number;
  status: string;
  detail: string;
  checkedAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  "mock-ready": "bg-blue-100 text-blue-700",
  healthy: "bg-green-100 text-green-700",
  reachable: "bg-green-100 text-green-700",
  unreachable: "bg-red-100 text-red-700",
  misconfigured: "bg-amber-100 text-amber-700",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function AdminAiHealthClient() {
  const [result, setResult] = useState<AiHealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const json = await fetch("/api/admin/ai/health").then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Health check failed");
      setResult(json.data.health);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <button
        onClick={run}
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Checking…" : "Run health check"}
      </button>

      {result && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">AI integration status</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                STATUS_STYLE[result.status] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {result.status}
            </span>
          </div>
          <div className="px-5 py-3">
            <dl className="divide-y divide-slate-100">
              <Row label="Mode" value={result.mode} />
              <Row label="External configured" value={result.externalConfigured ? "yes" : "no"} />
              <Row label="Model host" value={result.hostname ?? "—"} />
              <Row label="Timeout" value={`${result.timeoutMs} ms`} />
              <Row label="Max retries" value={result.maxRetries} />
              <Row label="Retry backoff" value={`${result.retryBackoffMs} ms`} />
              <Row label="Checked at" value={new Date(result.checkedAt).toLocaleString()} />
            </dl>
            <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {result.detail}
            </p>
          </div>
        </div>
      )}

      {!result && !loading && (
        <p className="text-sm text-slate-400">
          Run the check to probe the configured model server. In mock mode no external
          call is made.
        </p>
      )}
    </div>
  );
}
