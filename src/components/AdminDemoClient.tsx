"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePresentationMode } from "@/components/PresentationBadge";
import { KpiTile, ErrorBanner, btnPrimary, btnSecondary } from "@/components/ui/primitives";
import { ConfirmModal, DangerZone } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";

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
  "Show Storage governance — explain nothing auto-deletes.",
  "Clear demo data afterwards if needed.",
];

export function AdminDemoClient() {
  const presentation = usePresentationMode();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

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
      setConfirmClear(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}
      {notice && (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}

      {/* Demo data control card */}
      <div className="rounded-md border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Demo data</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              {!loading && status?.hasDemoData && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              )}
              {loading
                ? "Loading…"
                : status?.hasDemoData
                  ? `Present${status.lastSeededAt ? ` · last seeded ${new Date(status.lastSeededAt).toLocaleString()}` : ""}`
                  : "No demo data present"}
            </p>
          </div>
          <button onClick={seed} disabled={busy != null} className={btnPrimary}>
            <Icon name="demo" size={16} />
            {busy === "seed" ? "Seeding…" : status?.hasDemoData ? "Refresh demo data" : "Seed demo data"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {COUNT_LABELS.map(([key, label]) => (
            <KpiTile key={key} label={label} value={status?.counts[key] ?? 0} />
          ))}
        </div>

        {/* Separated danger zone */}
        <div className="border-t border-line p-5">
          <DangerZone title="Danger zone">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-red-700/90">
                Permanently clear all demo-marked data. Real user data is not affected.
              </p>
              {presentation ? (
                <span
                  title="Disabled in presentation mode"
                  className="cursor-not-allowed rounded-md border border-red-200 px-4 py-2 text-sm text-red-300"
                >
                  Clear demo data
                </span>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  disabled={busy != null}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {busy === "clear" ? "Clearing…" : "Clear demo data"}
                </button>
              )}
            </div>
          </DangerZone>
        </div>
      </div>

      {/* Key pages */}
      <div className="rounded-md border border-line bg-white">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-[15px] font-semibold text-slate-900">Key pages</h2>
        </div>
        <div className="flex flex-wrap gap-2 p-5">
          <Link href="/presentation?presentation=1" className={btnPrimary}>
            <Icon name="presentation" size={16} />
            Open presentation mode
          </Link>
          {QUICK_LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={btnSecondary}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-md border border-line bg-white">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-[15px] font-semibold text-slate-900">Presentation checklist</h2>
        </div>
        <ol className="list-decimal space-y-1.5 py-4 pl-9 pr-5 text-sm text-slate-600">
          {CHECKLIST.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear demo data?"
        confirmLabel="Clear demo data"
        destructive
        busy={busy === "clear"}
        onConfirm={clear}
        onCancel={() => setConfirmClear(false)}
      >
        This permanently deletes all demo-marked devices, sessions, detections, signs, observations,
        logs, and snapshots. Real user data is not affected.
      </ConfirmModal>
    </div>
  );
}
