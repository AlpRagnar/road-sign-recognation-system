"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ensureLeafletIcons } from "@/lib/leaflet-icon";

ensureLeafletIcons();

const DEFAULT_CENTER: [number, number] = [57.0488, 9.9217];
const POLL_MS = 7000; // 5-10s polling per the MVP spec

interface DeviceRow {
  id: string;
  device_name: string;
  device_type: string;
  status: string;
  last_latitude: number | null;
  last_longitude: number | null;
  last_seen_at: string | null;
  profiles?: { full_name: string | null; email: string | null } | null;
}

export function LiveDevicesMap() {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const j = await fetch("/api/map/devices").then((r) => r.json()).catch(() => null);
      if (!cancelled && j?.ok) {
        setDevices(j.data.devices);
        setUpdatedAt(Date.now());
      }
    }
    void load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const withLocation = devices.filter(
    (d) => d.last_latitude != null && d.last_longitude != null,
  );
  const center = useMemo<[number, number]>(() => {
    const first = withLocation[0];
    return first ? [first.last_latitude!, first.last_longitude!] : DEFAULT_CENTER;
  }, [withLocation]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-8 py-3 text-sm">
        <span className="text-slate-500">Polling every {POLL_MS / 1000}s</span>
        <span className="ml-auto text-xs text-slate-400">
          {withLocation.length} device(s)
          {updatedAt && ` · updated ${new Date(updatedAt).toLocaleTimeString()}`}
        </span>
      </div>

      <div className="flex-1">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {withLocation.map((d) => (
            <Marker key={d.id} position={[d.last_latitude!, d.last_longitude!]}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{d.device_name}</p>
                  <p>Type: {d.device_type}</p>
                  <p>Status: {d.status}</p>
                  {d.profiles && (
                    <p>Owner: {d.profiles.full_name ?? d.profiles.email ?? "—"}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Last seen: {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
