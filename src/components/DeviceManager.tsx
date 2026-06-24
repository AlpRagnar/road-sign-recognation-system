"use client";

import { useCallback, useEffect, useState } from "react";
import { DEVICE_TYPES } from "@/lib/devices";
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

export function DeviceManager() {
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
          ...(isEdit ? { status: form.status } : { device_identifier: form.device_identifier }),
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

  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      {notice && <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</p>}

      <div className="flex justify-end">
        {!form && (
          <button
            onClick={() => setForm({ ...EMPTY_FORM })}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Register device
          </button>
        )}
      </div>

      {form && (
        <form
          onSubmit={submitForm}
          className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {form.id ? "Edit device" : "Register a new device"}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">Device name *</label>
              <input
                required
                value={form.device_name}
                onChange={(e) => setForm({ ...form, device_name: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="My dashcam"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Device type *</label>
              <select
                value={form.device_type}
                onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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
                <label className="block text-xs font-medium text-slate-600">
                  Identifier (optional)
                </label>
                <input
                  value={form.device_identifier}
                  onChange={(e) => setForm({ ...form, device_identifier: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Auto-generated if left blank"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : form.id ? "Save changes" : "Create device"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="px-8 py-6 text-sm text-slate-400">Loading devices…</p>
        ) : devices.length === 0 ? (
          <p className="px-8 py-6 text-sm text-slate-400">
            You have no devices yet. Click “Register device” to add one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Identifier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Detections</th>
                  <th className="px-4 py-3">Last seen</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.device_name}</td>
                    <td className="px-4 py-3 text-slate-600">{d.device_type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {d.device_identifier ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          d.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.detection_count ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          setForm({
                            id: d.id,
                            device_name: d.device_name,
                            device_type: d.device_type,
                            device_identifier: d.device_identifier ?? "",
                            status: d.status,
                          })
                        }
                        className="text-xs text-brand underline hover:text-brand-dark"
                      >
                        Edit
                      </button>
                      {d.status === "active" && (
                        <button
                          onClick={() => deactivate(d)}
                          className="ml-3 text-xs text-red-600 underline hover:text-red-700"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
