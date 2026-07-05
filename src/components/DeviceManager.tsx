"use client";

import { useCallback, useEffect, useState } from "react";
import { DEVICE_TYPES } from "@/lib/devices";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Drawer } from "@/components/ui/Drawer";
import { OverflowMenu } from "@/components/ui/OverflowMenu";
import { Icon } from "@/components/ui/Icon";
import { ErrorBanner, EmptyState, SkeletonRows, btnPrimary, btnSecondary } from "@/components/ui/primitives";
import type { Device } from "@/lib/types/database";

type DeviceRow = Device & { detection_count?: number };

interface FormState {
  id: string | null; // null = creating
  device_name: string;
  device_type: string;
  device_identifier: string;
  status: string;
}

const EMPTY_FORM: FormState = {
  id: null,
  device_name: "",
  device_type: "mobile_phone",
  device_identifier: "",
  status: "active",
};

const inputCls =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function DeviceManager({ isAdmin = false }: { isAdmin?: boolean }) {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetch("/api/devices").then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load devices");
      setDevices(json.data.devices);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const isEdit = form.id !== null;
      const res = await fetch(isEdit ? `/api/devices/${form.id}` : "/api/devices", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_name: form.device_name,
          device_type: form.device_type,
          ...(isEdit
            ? isAdmin
              ? { status: form.status }
              : {}
            : { device_identifier: form.device_identifier }),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      setNotice(isEdit ? "Device updated." : "Device registered.");
      setForm(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(d: DeviceRow) {
    if (!confirm(`Deactivate "${d.device_name}"? It will be hidden from new sessions.`)) return;
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/devices/${d.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json.error || "Deactivate failed");
      return;
    }
    setNotice("Device deactivated.");
    await load();
  }

  const editForm = (d: DeviceRow): FormState => ({
    id: d.id,
    device_name: d.device_name,
    device_type: d.device_type,
    device_identifier: d.device_identifier ?? "",
    status: d.status,
  });

  function rowActions(d: DeviceRow) {
    return [
      { label: "Edit", onClick: () => setForm(editForm(d)) },
      ...(isAdmin && d.status === "active"
        ? [{ label: "Deactivate", onClick: () => deactivate(d), destructive: true, dividerBefore: true }]
        : []),
    ];
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {notice && (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {loading ? "Loading…" : `${devices.length} device${devices.length === 1 ? "" : "s"}`}
        </p>
        <button onClick={() => setForm({ ...EMPTY_FORM })} className={`${btnPrimary} max-sm:hidden`}>
          <Icon name="plus" size={16} />
          Register device
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-md border border-line bg-white md:block">
        {loading ? (
          <SkeletonRows rows={4} cols={7} />
        ) : devices.length === 0 ? (
          <EmptyState
            icon="devices"
            title="You have no devices yet."
            hint="Register a device to use it in detection sessions."
            action={
              <button onClick={() => setForm({ ...EMPTY_FORM })} className={btnPrimary}>
                Register device
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-panel/60 text-left">
                <tr className="[&>th]:px-4 [&>th]:py-2.5 [&>th]:font-mono [&>th]:text-[11px] [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-slate-500">
                  <th>Name</th>
                  <th>Type</th>
                  <th>Identifier</th>
                  <th>Status</th>
                  <th>Detections</th>
                  <th>Last seen</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {devices.map((d) => (
                  <tr key={d.id} className="hover:bg-panel/40">
                    <td className="px-4 py-3 font-medium text-slate-800">{d.device_name}</td>
                    <td className="px-4 py-3 text-slate-600">{d.device_type}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular text-slate-500">{d.device_identifier ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 font-mono tabular text-slate-600">{d.detection_count ?? 0}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular text-slate-500">
                      {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular text-slate-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setForm(editForm(d))} className="text-xs font-medium text-primary hover:underline">
                          Edit
                        </button>
                        {isAdmin && d.status === "active" && <OverflowMenu items={rowActions(d).slice(1)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-md border border-line bg-white"><SkeletonRows rows={3} cols={2} /></div>
        ) : devices.length === 0 ? (
          <div className="rounded-md border border-line bg-white">
            <EmptyState icon="devices" title="You have no devices yet." hint="Register a device to get started." />
          </div>
        ) : (
          devices.map((d) => (
            <div key={d.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{d.device_name}</p>
                  <p className="text-xs text-slate-500">{d.device_type}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={d.status} />
                  <OverflowMenu items={rowActions(d)} />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[11px] tabular text-slate-500">
                <span>{d.detection_count ?? 0} detections</span>
                <span className="text-right">{d.device_identifier ?? "—"}</span>
                <span>{d.last_seen_at ? new Date(d.last_seen_at).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sticky mobile register */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 pb-safe md:hidden">
        <button onClick={() => setForm({ ...EMPTY_FORM })} className={`${btnPrimary} w-full`}>
          <Icon name="plus" size={16} />
          Register device
        </button>
      </div>
      <div className="h-16 md:hidden" aria-hidden="true" />

      {/* Register / edit drawer */}
      <Drawer
        open={form !== null}
        title={form?.id ? "Edit device" : "Register a new device"}
        onClose={() => setForm(null)}
        footer={
          <div className="flex gap-2">
            <button type="submit" form="device-form" disabled={saving} className={`${btnPrimary} flex-1`}>
              {saving ? "Saving…" : form?.id ? "Save changes" : "Create device"}
            </button>
            <button type="button" onClick={() => setForm(null)} className={btnSecondary}>
              Cancel
            </button>
          </div>
        }
      >
        {form && (
          <form id="device-form" onSubmit={submitForm} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Device name *</label>
              <input
                required
                value={form.device_name}
                onChange={(e) => setForm({ ...form, device_name: e.target.value })}
                className={inputCls}
                placeholder="My dashcam"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Device type *</label>
              <select
                value={form.device_type}
                onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                className={inputCls}
              >
                {DEVICE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {form.id === null ? (
              <div>
                <label className="block text-xs font-medium text-slate-600">Identifier (optional)</label>
                <input
                  value={form.device_identifier}
                  onChange={(e) => setForm({ ...form, device_identifier: e.target.value })}
                  className={inputCls}
                  placeholder="Auto-generated if left blank"
                />
              </div>
            ) : isAdmin ? (
              <div>
                <label className="block text-xs font-medium text-slate-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputCls}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            ) : (
              <p className="rounded-md bg-panel px-3 py-2 text-xs text-slate-500">
                Status is managed by an administrator.
              </p>
            )}
          </form>
        )}
      </Drawer>
    </div>
  );
}
