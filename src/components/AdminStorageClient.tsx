"use client";

import { useCallback, useEffect, useState } from "react";
import { KpiTile, ErrorBanner, btnPrimary, btnSecondary } from "@/components/ui/primitives";
import { ConfirmModal, DangerZone } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";

interface Status {
  detectionEvents: { total: number; withPath: number; legacyMissingPath: number };
  trafficSigns: { total: number; withPath: number; legacyMissingPath: number };
}

interface BackfillResult {
  mode: string;
  detectionEvents: { candidates: number; updated: number };
  trafficSigns: { candidates: number; updated: number };
  capped: boolean;
}

interface OrphanScan {
  scanned: number;
  referenced: number;
  candidateOrphans: string[];
  scanLimited: boolean;
  prefix: string;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-white">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export function AdminStorageClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [backfill, setBackfill] = useState<BackfillResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [scan, setScan] = useState<OrphanScan | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmApply, setConfirmApply] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetch("/api/admin/storage/status").then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load status");
      setStatus(json.data.status);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function runBackfill(mode: "dry-run" | "apply") {
    setBusy(mode);
    setError(null);
    setNotice(null);
    try {
      const json = await fetch("/api/admin/storage/backfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Backfill failed");
      setBackfill(json.data.result);
      if (mode === "apply") {
        setNotice("Backfill applied.");
        await loadStatus();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
      setConfirmApply(false);
    }
  }

  async function runScan() {
    setBusy("scan");
    setError(null);
    setSelected(new Set());
    try {
      const json = await fetch("/api/admin/storage/orphans").then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Scan failed");
      setScan(json.data.scan);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function toggle(path: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  async function deleteSelected() {
    const paths = [...selected];
    if (paths.length === 0) return;
    setBusy("delete");
    setError(null);
    setNotice(null);
    try {
      const json = await fetch("/api/admin/storage/orphans/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths }),
      }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Delete failed");
      const r = json.data.result;
      setNotice(`Deleted ${r.deleted}, skipped ${r.skippedReferenced} referenced, rejected ${r.rejected}.`);
      await runScan();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}
      {notice && (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</p>
      )}

      {/* Section A — status */}
      <Card title="Image path backfill status">
        {loading || !status ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <KpiTile label="Events total" value={status.detectionEvents.total} />
            <KpiTile label="Events w/ path" value={status.detectionEvents.withPath} />
            <KpiTile label="Events legacy-only" value={status.detectionEvents.legacyMissingPath} />
            <KpiTile label="Signs total" value={status.trafficSigns.total} />
            <KpiTile label="Signs w/ path" value={status.trafficSigns.withPath} />
            <KpiTile label="Signs legacy-only" value={status.trafficSigns.legacyMissingPath} />
          </div>
        )}
      </Card>

      {/* Section B — backfill */}
      <Card title="Backfill actions">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => runBackfill("dry-run")} disabled={busy != null} className={btnSecondary}>
            {busy === "dry-run" ? "Running…" : "Dry run"}
          </button>
          <button onClick={() => setConfirmApply(true)} disabled={busy != null} className={btnPrimary}>
            {busy === "apply" ? "Applying…" : "Apply backfill"}
          </button>
        </div>
        {backfill && (
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-medium">{backfill.mode}</span>: events{" "}
            {backfill.detectionEvents.candidates} candidate(s)
            {backfill.mode === "apply" && `, ${backfill.detectionEvents.updated} updated`}; signs{" "}
            {backfill.trafficSigns.candidates} candidate(s)
            {backfill.mode === "apply" && `, ${backfill.trafficSigns.updated} updated`}.
            {backfill.capped && " (capped — run again or use migration 0003 for bulk)"}
          </p>
        )}
      </Card>

      {/* Section C — orphan scan */}
      <Card title="Orphaned storage scan">
        <button onClick={runScan} disabled={busy != null} className={btnSecondary}>
          <Icon name="search" size={16} />
          {busy === "scan" ? "Scanning…" : "Scan orphans"}
        </button>

        {scan && (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-600">
              Scanned {scan.scanned} object(s) · {scan.referenced} referenced ·{" "}
              {scan.candidateOrphans.length} candidate orphan(s) under <code className="font-mono text-xs">{scan.prefix}</code>.
            </p>
            <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <Icon name="warning" size={14} className="mt-0.5 shrink-0" />
              <span>
                Cleanup is conservative and limited to the configured scan scope. Each path is re-verified as
                unreferenced immediately before deletion.
                {scan.scanLimited && " Scan was limited — not all folders were inspected."}
              </span>
            </p>
            {scan.candidateOrphans.length > 0 && (
              <div className="max-h-60 overflow-auto rounded-md border border-line">
                <ul className="divide-y divide-line/70 text-xs">
                  {scan.candidateOrphans.map((p) => (
                    <li key={p} className="flex items-center gap-2 px-3 py-1.5">
                      <input type="checkbox" checked={selected.has(p)} onChange={() => toggle(p)} />
                      <span className="break-all font-mono text-slate-600">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Destructive cleanup — separated danger zone */}
            {scan.candidateOrphans.length > 0 && (
              <DangerZone title="Danger zone — permanent deletion">
                <p className="text-sm text-red-700/90">
                  Permanently delete the selected unreferenced objects from storage. Each path is
                  re-checked as unreferenced immediately before removal; referenced paths are skipped.
                </p>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={busy != null || selected.size === 0}
                  className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {busy === "delete" ? "Deleting…" : `Delete selected (${selected.size})`}
                </button>
              </DangerZone>
            )}
          </div>
        )}
      </Card>

      {/* Section D — security notes */}
      <Card title="Storage security notes">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>The bucket should be <strong>private</strong> in production.</li>
          <li>Images are served via short-lived signed URLs minted server-side.</li>
          <li>Expired image URLs can be refreshed in-app (no full page reload needed).</li>
          <li>CSV exports never include signed URLs; logs never store signed URLs.</li>
          <li>Cleanup only touches unreferenced objects under <code className="font-mono">sessions/</code>.</li>
        </ul>
      </Card>

      <ConfirmModal
        open={confirmApply}
        title="Apply backfill?"
        confirmLabel="Apply backfill"
        busy={busy === "apply"}
        onConfirm={() => runBackfill("apply")}
        onCancel={() => setConfirmApply(false)}
      >
        This updates the <code className="font-mono">image_path</code> columns for matching detection-event and
        traffic-sign rows. It does not delete any data.
      </ConfirmModal>

      <ConfirmModal
        open={confirmDelete}
        title="Delete orphaned objects?"
        confirmLabel={`Delete ${selected.size} object(s)`}
        destructive
        busy={busy === "delete"}
        onConfirm={deleteSelected}
        onCancel={() => setConfirmDelete(false)}
      >
        This permanently deletes {selected.size} selected unreferenced object(s) from storage. Each path is
        re-verified as unreferenced immediately before deletion; still-referenced paths are skipped.
      </ConfirmModal>
    </div>
  );
}
