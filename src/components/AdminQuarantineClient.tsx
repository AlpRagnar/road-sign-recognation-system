"use client";

import { useCallback, useEffect, useState } from "react";
import { PaginationBar } from "@/components/PaginationBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ErrorBanner } from "@/components/ui/primitives";

interface Candidate {
  id: string;
  object_path: string;
  size_bytes: number | null;
  detected_at: string;
  quarantine_status: string;
  reason: string;
  scan_run_id: string | null;
  eligible: boolean;
}

interface Config {
  graceDays: number;
  maxFolders: number;
  maxFilesPerFolder: number;
  deleteBatchLimit: number;
  prefix: string;
}

interface RunSummary {
  runId: string;
  objectsScanned: number;
  candidatesFound: number;
  candidatesAdded: number;
  scanLimited: boolean;
}

interface ReconRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  mode: string;
  objects_scanned: number;
  candidates_found: number;
  candidates_added: number;
  scan_limited: boolean;
}

const STATUSES = ["pending", "ignored", "restored", "deleted"];

function fmtBytes(n: number | null): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function ageOf(iso: string): string {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (days < 1) return `${Math.round(days * 24)}h`;
  return `${Math.floor(days)}d`;
}

export function AdminQuarantineClient() {
  const [config, setConfig] = useState<Config | null>(null);
  const [rows, setRows] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<RunSummary | null>(null);
  const [runs, setRuns] = useState<ReconRun[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (status) qs.set("status", status);
      if (debouncedSearch) qs.set("search", debouncedSearch);
      if (eligibleOnly) qs.set("eligibleOnly", "true");
      const json = await fetch(`/api/admin/storage/quarantine?${qs}`).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setRows(json.data.items);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
      setConfig(json.data.config);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, debouncedSearch, eligibleOnly]);

  const loadRuns = useCallback(async () => {
    try {
      const json = await fetch("/api/admin/storage/reconciliation-runs?pageSize=10").then((r) =>
        r.json(),
      );
      if (json.ok) setRuns(json.data.items);
    } catch {
      // history is non-critical; ignore load errors
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  async function runReconcile() {
    setBusy("reconcile");
    setError(null);
    setNotice(null);
    try {
      const json = await fetch("/api/admin/storage/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "manual" }),
      }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Reconciliation failed");
      setLastRun(json.data);
      setNotice(
        `Reconciliation complete: scanned ${json.data.objectsScanned}, found ${json.data.candidatesFound}, added ${json.data.candidatesAdded}. Nothing was deleted.`,
      );
      await load();
      await loadRuns();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function patchStatus(id: string, next: "ignored" | "restored") {
    setBusy(id);
    setError(null);
    try {
      const json = await fetch(`/api/admin/storage/quarantine/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Update failed");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function deleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBusy("delete");
    setError(null);
    setNotice(null);
    try {
      const json = await fetch("/api/admin/storage/quarantine/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateIds: ids }),
      }).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Delete failed");
      setNotice(`Deleted ${json.data.deleted}, skipped ${json.data.skipped}.`);
      setSelected(new Set());
      await load();
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

      {/* Reconciliation section */}
      <div className="rounded-md border border-line bg-white">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Reconciliation</h2>
        </div>
        <div className="space-y-3 px-5 py-4">
          {config && (
            <p className="text-xs text-slate-500">
              Grace period: <strong>{config.graceDays} day(s)</strong> · scan caps:{" "}
              {config.maxFolders} folders × {config.maxFilesPerFolder} files · delete batch ≤{" "}
              {config.deleteBatchLimit} · prefix <code>{config.prefix}</code>
            </p>
          )}
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Reconciliation only records unreferenced objects as pending quarantine candidates. It
            never deletes anything.
          </p>
          <button
            onClick={runReconcile}
            disabled={busy != null}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {busy === "reconcile" ? "Scanning…" : "Run reconciliation scan"}
          </button>
          {lastRun && (
            <p className="text-xs text-slate-500">
              Last run {lastRun.runId.slice(0, 8)}: scanned {lastRun.objectsScanned}, found{" "}
              {lastRun.candidatesFound}, added {lastRun.candidatesAdded}
              {lastRun.scanLimited && " (scan limited)"}.
            </p>
          )}

          {/* Reconciliation run history (incl. scheduled/cron runs) */}
          <div className="mt-2">
            <p className="mb-1 text-xs font-semibold text-slate-600">Recent runs</p>
            {runs.length === 0 ? (
              <p className="text-xs text-slate-400">No reconciliation runs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="min-w-full divide-y divide-line text-xs">
                  <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Run</th>
                      <th className="px-3 py-2">Mode</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Started</th>
                      <th className="px-3 py-2">Completed</th>
                      <th className="px-3 py-2">Scanned</th>
                      <th className="px-3 py-2">Found</th>
                      <th className="px-3 py-2">Added</th>
                      <th className="px-3 py-2">Limited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {runs.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-1.5 font-mono">{r.id.slice(0, 8)}</td>
                        <td className="px-3 py-1.5">{r.mode}</td>
                        <td className="px-3 py-1.5">{r.status}</td>
                        <td className="px-3 py-1.5 text-slate-500">
                          {new Date(r.started_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500">
                          {r.completed_at ? new Date(r.completed_at).toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-1.5">{r.objects_scanned}</td>
                        <td className="px-3 py-1.5">{r.candidates_found}</td>
                        <td className="px-3 py-1.5">{r.candidates_added}</td>
                        <td className="px-3 py-1.5">{r.scan_limited ? "yes" : "no"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quarantine candidates section */}
      <div className="rounded-md border border-line bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Quarantine candidates</h2>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search path…"
              className="w-48 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => {
                  setEligibleOnly(e.target.checked);
                  setPage(1);
                }}
              />
              Eligible only
            </label>
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={busy != null || selected.size === 0}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy === "delete" ? "Deleting…" : `Delete selected (${selected.size})`}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-6 text-sm text-slate-400">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">No quarantine candidates.</p>
          ) : (
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-panel/60 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3"></th>
                  <th className="px-3 py-3">Object path</th>
                  <th className="px-3 py-3">Size</th>
                  <th className="px-3 py-3">Detected</th>
                  <th className="px-3 py-3">Age</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Reason</th>
                  <th className="px-3 py-3">Eligible</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((c) => (
                  <tr key={c.id} className={busy === c.id ? "opacity-50" : ""}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        disabled={!(c.quarantine_status === "pending" && c.eligible)}
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        title={
                          c.quarantine_status === "pending" && c.eligible
                            ? "Select for deletion"
                            : "Only eligible pending candidates can be deleted"
                        }
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">{c.object_path}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{fmtBytes(c.size_bytes)}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {new Date(c.detected_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{ageOf(c.detected_at)}</td>
                    <td className="px-3 py-2 text-xs">{c.quarantine_status}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{c.reason}</td>
                    <td className="px-3 py-2 text-xs">
                      {c.quarantine_status === "pending" ? (c.eligible ? "yes" : "no") : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {c.quarantine_status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => patchStatus(c.id, "ignored")}
                            disabled={busy != null}
                            className="text-xs text-slate-500 underline hover:text-slate-800 disabled:opacity-50"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => patchStatus(c.id, "restored")}
                            disabled={busy != null}
                            className="text-xs text-brand underline hover:text-brand-dark disabled:opacity-50"
                          >
                            Restore
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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

      <ConfirmModal
        open={confirmDelete}
        title="Delete quarantined objects?"
        confirmLabel={`Delete ${selected.size} object(s)`}
        destructive
        busy={busy === "delete"}
        onConfirm={deleteSelected}
        onCancel={() => setConfirmDelete(false)}
      >
        This permanently deletes Storage objects. Only eligible, still-unreferenced pending candidates
        are deleted; anything that has become referenced again is skipped.
      </ConfirmModal>
    </div>
  );
}
