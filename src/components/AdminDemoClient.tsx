"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePresentationMode } from "@/components/PresentationBadge";

interface Counts {
  devices: number;
  sessions: number;
  events: number;
  signs: number;
  observations: number;
  locationLogs: number;
  systemLogs: number;
  snapshots: number;
}

interface Status {
  hasDemoData: boolean;
  counts: Counts;
  lastSeededAt: string | null;
}

const COUNT_LABELS: Array<[keyof Counts, string]> = [
  ["devices", "Devices"],
  ["sessions", "Sessions"],
  ["events", "Detections"],
  ["signs", "Signs"],
  ["observations", "Observations"],
  ["locationLogs", "Location logs"],
  ["systemLogs", "System logs"],
  ["snapshots", "Snapshots"],
];

const QUICK_LINKS: Array<[string, string]> = [
  ["/dashboard", "Dashboard"],
  ["/detection", "Detection"],
  ["/map/signs", "Sign Map"],
  ["/map/devices", "Device Map"],
  ["/admin/detections", "Admin Detections"],
  ["/admin/ai", "Admin AI"],
  ["/admin/analytics", "Admin Analytics"],
  ["/admin/storage", "Admin Storage"],
];

const CHECKLIST = [
  "Seed demo data (button above) before presenting.",
  "Open /presentation for the guided demo flow.",
  "Show Dashboard KPIs, then the Sign Map (cluster/density modes).",
  "Open a detection detail to show metadata + bounding-box overlay.",
  "Show Admin AI health/self-test and Analytics trends.",
  "Show Storage governance (quarantine) — explain nothing auto-deletes.",
  "Clear demo data afterwards if needed.",
];

export function AdminDemoClient() {
  const presentation = usePresentationMode();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetch("/api/admin/demo/status").then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load status");
      setStatus(json.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seed() {
    setBusy("seed");
    setError(null);
    setNotice(null);
    try {
      const json = await fetch("/api/admin/demo/seed", { method: "POST" }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Seed failed");
      const c = json.data.created as Counts;
      setNotice(
        `Seeded ${c.devices} devices, ${c.sessions} sessions, ${c.events} detections, ${c.signs} signs, ${c.snapshots} snapshots.`,
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function clear() {
    if (!confirm("Clear ALL demo-marked data? Real user data is not affected.")) return;
    setBusy("clear");
    setError(null);
    setNotice(null);
    try {
      const json = await fetch("/api/admin/demo/clear", { method: "POST" }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Clear failed");
      setNotice("Demo data cleared.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      {notice && <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</p>}

      {/* Status + actions */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Demo data</h2>
            <p className="text-xs text-slate-500">
              {loading
                ? "Loading…"
                : status?.hasDemoData
                  ? `Present${status.lastSeededAt ? ` · last seeded ${new Date(status.lastSeededAt).toLocaleString()}` : ""}`
                  : "No demo data present"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={seed}
              disabled={busy != null}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {busy === "seed" ? "Seeding…" : status?.hasDemoData ? "Refresh demo data" : "Seed demo data"}
            </button>
            {presentation ? (
              <span
                title="Disabled in presentation mode"
                className="cursor-not-allowed rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-300"
              >
                Clear demo data
              </span>
            ) : (
              <button
                onClick={clear}
                disabled={busy != null}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {busy === "clear" ? "Clearing…" : "Clear demo data"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {COUNT_LABELS.map(([key, label]) => (
            <div key={key} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {status?.counts[key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Key pages</h2>
        </div>
        <div className="flex flex-wrap gap-2 p-5">
          <Link
            href="/presentation?presentation=1"
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Open presentation mode →
          </Link>
          {QUICK_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Presentation checklist</h2>
        </div>
        <ol className="list-decimal space-y-1 py-4 pl-9 pr-5 text-sm text-slate-600">
          {CHECKLIST.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
