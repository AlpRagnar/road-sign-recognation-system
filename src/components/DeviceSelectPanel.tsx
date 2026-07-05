"use client";

import Link from "next/link";
import type { Device } from "@/lib/types/database";

interface Props {
  devices: Device[];
  loading: boolean;
  selectedDeviceId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

// Lets the field user pick which registered (active) device the session runs on.
export function DeviceSelectPanel({
  devices,
  loading,
  selectedDeviceId,
  disabled,
  onSelect,
}: Props) {
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">Device</h3>

      {loading ? (
        <p className="mt-3 text-sm text-slate-400">Loading your devices…</p>
      ) : devices.length === 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-slate-500">
            You have no active devices. Register one before starting a session.
          </p>
          <Link
            href="/devices"
            className="inline-block rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
          >
            Go to Devices
          </Link>
        </div>
      ) : (
        <select
          value={selectedDeviceId ?? ""}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-60"
        >
          <option value="" disabled>
            Select a device…
          </option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.device_name} ({d.device_type})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
