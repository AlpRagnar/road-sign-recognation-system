"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorBanner, btnPrimary } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function AdminAiHealthClient({
  onHealth,
  autoRun = false,
}: {
  onHealth?: (status: string) => void;
  autoRun?: boolean;
}) {
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
      onHealth?.(json.data.health.status);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoRun) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  return (
    <div className="max-w-xl space-y-4">
      {error && <ErrorBanner message={error} />}

      <button onClick={run} disabled={loading} className={btnPrimary}>
        <Icon name="refresh" size={16} />
        {loading ? "Checking…" : "Run health check"}
      </button>

      {result && (
        <div className="rounded-md border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-[15px] font-semibold text-slate-900">Integration configuration</h2>
            <StatusBadge status={result.status} />
          </div>
          <div className="px-5 py-3">
            <dl className="divide-y divide-line/70">
              <Row label="Mode" value={<span className="font-mono">{result.mode}</span>} />
              <Row label="External configured" value={result.externalConfigured ? "yes" : "no"} />
              <Row label="Model host" value={<span className="font-mono">{result.hostname ?? "—"}</span>} />
              <Row label="Timeout" value={<span className="font-mono tabular">{result.timeoutMs} ms</span>} />
              <Row label="Max retries" value={<span className="font-mono tabular">{result.maxRetries}</span>} />
              <Row label="Retry backoff" value={<span className="font-mono tabular">{result.retryBackoffMs} ms</span>} />
              <Row label="Checked at" value={<span className="font-mono tabular">{new Date(result.checkedAt).toLocaleString()}</span>} />
            </dl>
            <p className="mt-3 rounded-md bg-panel px-3 py-2 text-xs text-slate-600">{result.detail}</p>
          </div>
        </div>
      )}

      {!result && !loading && (
        <p className="text-sm text-slate-400">
          Run the check to probe the configured model server. In mock mode no external call is made.
        </p>
      )}
    </div>
  );
}
