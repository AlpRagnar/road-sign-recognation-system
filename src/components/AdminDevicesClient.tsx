"use client";

import { useCallback, useEffect, useState } from "react";
import { DEVICE_TYPES } from "@/lib/devices";
import { PaginationBar } from "@/components/PaginationBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { ErrorBanner, EmptyState, SkeletonRows } from "@/components/ui/primitives";
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
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" size={16} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or identifier…"
            className="w-64 rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Desktop fleet table */}
      <div className="hidden overflow-hidden rounded-md border border-line bg-white md:block">
        {loading ? (
          <SkeletonRows rows={5} cols={8} />
        ) : devices.length === 0 ? (
          <EmptyState icon="admindevices" title="No devices match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-panel/60 text-left">
                <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:font-mono [&>th]:text-[11px] [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-slate-500">
                  <th>Name</th>
                  <th>Type</th>
                  <th>Identifier</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Det.</th>
                  <th>Last loc.</th>
                  <th>Last seen</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {devices.map((d) => (
                  <tr key={d.id} className={`hover:bg-panel/40 ${savingId === d.id ? "opacity-50" : ""}`}>
                    <td className="px-3 py-2">
                      <input
                        defaultValue={d.device_name}
                        key={d.device_name}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== d.device_name) patch(d.id, { device_name: v });
                        }}
                        className="w-36 rounded border border-transparent px-1 py-0.5 hover:border-slate-300 focus:border-primary focus:outline-none"
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
                    <td className="px-3 py-2 font-mono text-xs tabular text-slate-500">{d.device_identifier ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-600">{d.profiles?.full_name ?? d.profiles?.email ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={d.status} />
                        <select
                          value={d.status}
                          onChange={(e) => patch(d.id, { status: e.target.value })}
                          title="Change operational status (admin only)"
                          className="rounded border border-slate-300 px-1 py-0.5 text-xs"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono tabular text-slate-600">{d.detection_count ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-xs tabular text-slate-500">
                      {d.last_latitude != null && d.last_longitude != null
                        ? `${d.last_latitude.toFixed(4)}, ${d.last_longitude.toFixed(4)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular text-slate-500">
                      {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular text-slate-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile fleet cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-md border border-line bg-white"><SkeletonRows rows={3} cols={2} /></div>
        ) : devices.length === 0 ? (
          <div className="rounded-md border border-line bg-white">
            <EmptyState icon="admindevices" title="No devices match your filters." />
          </div>
        ) : (
          devices.map((d) => (
            <div key={d.id} className={`rounded-md border border-line bg-white p-4 ${savingId === d.id ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{d.device_name}</p>
                  <p className="text-xs text-slate-500">
                    {d.device_type} · {d.profiles?.full_name ?? d.profiles?.email ?? "—"}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] tabular text-slate-500">{d.detection_count ?? 0} detections</span>
                <select
                  value={d.status}
                  onChange={(e) => patch(d.id, { status: e.target.value })}
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          ))
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
