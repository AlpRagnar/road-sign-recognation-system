"use client";

import { useCallback, useEffect, useState } from "react";
import { DEVICE_TYPES } from "@/lib/devices";
import { PaginationBar } from "@/components/PaginationBar";
import type { Device } from "@/lib/types/database";

type AdminDeviceRow = Device & {
  detection_count?: number;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export function AdminDevicesClient() {
  const [devices, setDevices] = useState<AdminDeviceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
      if (typeFilter) qs.set("type", typeFilter);
      if (statusFilter) qs.set("status", statusFilter);
      const json = await fetch(`/api/admin/devices?${qs}`).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setDevices(json.data.items);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, typeFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, body: Record<string, unknown>) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/devices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
      setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...json.data.device } : d)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or identifier…"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">All types</option>
          {DEVICE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading devices…</p>
        ) : devices.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No devices match your filters.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Identifier</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Det.</th>
                <th className="px-3 py-3">Last loc.</th>
                <th className="px-3 py-3">Last seen</th>
                <th className="px-3 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d) => (
                <tr key={d.id} className={savingId === d.id ? "opacity-50" : ""}>
                  <td className="px-3 py-2">
                    <input
                      defaultValue={d.device_name}
                      key={d.device_name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== d.device_name) patch(d.id, { device_name: v });
                      }}
                      className="w-36 rounded border border-transparent px-1 py-0.5 hover:border-slate-300 focus:border-brand focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={d.device_type}
                      onChange={(e) => patch(d.id, { device_type: e.target.value })}
                      className="rounded border border-slate-300 px-1 py-0.5 text-xs"
                    >
                      {DEVICE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    {d.device_identifier ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {d.profiles?.full_name ?? d.profiles?.email ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={d.status}
                      onChange={(e) => patch(d.id, { status: e.target.value })}
                      className="rounded border border-slate-300 px-1 py-0.5 text-xs"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{d.detection_count ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    {d.last_latitude != null && d.last_longitude != null
                      ? `${d.last_latitude.toFixed(4)}, ${d.last_longitude.toFixed(4)}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(d.created_at).toLocaleDateString()}
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
    </div>
  );
}
