"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PaginationBar } from "@/components/PaginationBar";
import { DeleteFrameDialog } from "@/components/DeleteFrameDialog";
import { OverflowMenu } from "@/components/ui/OverflowMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import type { DetectionEvent, ValidationStatus } from "@/lib/types/database";

type Row = DetectionEvent & {
  profiles?: { full_name: string | null; email: string | null } | null;
  devices?: { device_name: string | null; device_type: string | null } | null;
};

const STATUS_OPTIONS = [
  "pending",
  "auto_verified",
  "manually_verified",
  "rejected",
  "duplicate",
  "low_confidence",
];

export function AdminDetectionsClient() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
      if (debouncedSearch) qs.set("search", debouncedSearch);
      if (status) qs.set("status", status);
      const json = await fetch(`/api/admin/detections?${qs}`).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setRows(json.data.items);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(id: string, newStatus: ValidationStatus) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/detections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, validation_status: newStatus } : r)),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      {notice && (
        <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search class name…"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading detections…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No detection events match your filters.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Frame</th>
                <th className="px-3 py-3">Class</th>
                <th className="px-3 py-3">Conf.</th>
                <th className="px-3 py-3">Device</th>
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">Lat</th>
                <th className="px-3 py-3">Lng</th>
                <th className="px-3 py-3">Acc.</th>
                <th className="px-3 py-3">AI ms</th>
                <th className="px-3 py-3">Img</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => (
                <tr key={e.id} className={savingId === e.id ? "opacity-50" : ""}>
                  <td className="px-3 py-2">
                    {e.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.image_url}
                        alt=""
                        loading="lazy"
                        className="h-10 w-14 rounded object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {e.detected_class_name || e.detected_class_id != null
                      ? getTrafficSignDisplayName(e.detected_class_id, e.detected_class_name)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {e.confidence != null ? `${(e.confidence * 100).toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{e.devices?.device_name ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {e.profiles?.full_name ?? e.profiles?.email ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {e.latitude != null ? e.latitude.toFixed(5) : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {e.longitude != null ? e.longitude.toFixed(5) : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {e.gps_accuracy != null ? `${e.gps_accuracy.toFixed(0)}m` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">{e.ai_response_time_ms ?? "—"}</td>
                  <td className="px-3 py-2">
                    {e.image_url ? (
                      <a
                        href={e.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand underline"
                      >
                        view
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs"><StatusBadge status={e.validation_status} /></td>
                  <td className="px-3 py-2 font-mono text-xs tabular text-slate-500">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Primary action */}
                      <button
                        onClick={() => review(e.id, "manually_verified")}
                        disabled={savingId === e.id || e.validation_status === "manually_verified"}
                        className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-40"
                      >
                        Verify
                      </button>
                      {/* Secondary actions in an overflow menu */}
                      <OverflowMenu
                        items={[
                          { label: "Reject", onClick: () => review(e.id, "rejected"), disabled: e.validation_status === "rejected" },
                          { label: "Mark duplicate", onClick: () => review(e.id, "duplicate"), disabled: e.validation_status === "duplicate" },
                          { label: "Reset to pending", onClick: () => review(e.id, "pending"), disabled: e.validation_status === "pending" },
                          { label: "View details", onClick: () => router.push(`/detections/${e.id}`) },
                          { label: "Delete frame", onClick: () => setDeleteTarget(e), destructive: true, dividerBefore: true },
                        ]}
                      />
                    </div>
                  </td>
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

      {deleteTarget && (
        <DeleteFrameDialog
          detectionId={deleteTarget.id}
          fallbackImageUrl={deleteTarget.image_url}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={(summary) => {
            setDeleteTarget(null);
            setError(null);
            setNotice(
              summary.storageWarning
                ? `Frame deleted (${summary.deletedEvents} detection(s)). Note: ${summary.storageWarning}`
                : `Frame deleted: ${summary.deletedEvents} detection(s), ${summary.deletedObservations} observation link(s), ${summary.deletedSigns} sign(s) removed.`,
            );
            void load();
          }}
          onError={(msg) => {
            setDeleteTarget(null);
            setNotice(null);
            setError(msg);
          }}
        />
      )}
    </div>
  );
}
