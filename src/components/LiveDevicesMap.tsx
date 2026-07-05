"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { ensureLeafletIcons } from "@/lib/leaflet-icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BottomSheet, type SheetSnap } from "@/components/ui/BottomSheet";
import { Icon } from "@/components/ui/Icon";

ensureLeafletIcons();

const DEFAULT_CENTER: [number, number] = [57.0488, 9.9217];
const POLL_MS = 7000; // 5-10s polling per the MVP spec
const RECENT_MS = 15 * 60 * 1000;
const STALE_MS = 60 * 60 * 1000;

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

type Reporting = "recent" | "stale" | "offline";

function reportingStatus(lastSeen: string | null, now: number): Reporting {
  if (!lastSeen) return "offline";
  const age = now - new Date(lastSeen).getTime();
  if (age <= RECENT_MS) return "recent";
  if (age <= STALE_MS) return "stale";
  return "offline";
}

const REPORTING = {
  recent: { label: "Reporting Recently", color: "#16a34a", dot: "bg-green-500" },
  stale: { label: "Stale", color: "#f59e0b", dot: "bg-amber-500" },
  offline: { label: "Offline", color: "#b91c1c", dot: "bg-red-500" },
} as const;

// Marker colour represents REPORTING status (not operational status).
function deviceIcon(r: Reporting, selected: boolean): L.DivIcon {
  const size = selected ? 22 : 16;
  const ring = selected ? "box-shadow:0 0 0 4px rgba(245,158,11,0.35);" : "box-shadow:0 1px 3px rgba(0,0,0,0.35);";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:4px;background:${REPORTING[r].color};border:3px solid #fff;${ring}"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function ReportingBadge({ r }: { r: Reporting }) {
  const s = REPORTING[r];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-badge bg-panel px-2 py-0.5 text-xs font-medium text-slate-700">
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function DeviceDetail({ d, now }: { d: DeviceRow; now: number }) {
  const r = reportingStatus(d.last_seen_at, now);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-900">{d.device_name}</p>
        <ReportingBadge r={r} />
      </div>
      <dl className="mt-3 divide-y divide-line/70 text-sm">
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-slate-500">Operational status</dt>
          <dd><StatusBadge status={d.status} /></dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-slate-500">Reporting status</dt>
          <dd className="font-medium text-slate-800">{REPORTING[r].label}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-slate-500">Device type</dt>
          <dd className="font-medium text-slate-800">{d.device_type}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-slate-500">Assigned user</dt>
          <dd className="font-medium text-slate-800">{d.profiles?.full_name ?? d.profiles?.email ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-slate-500">Coordinates</dt>
          <dd className="font-mono tabular text-[13px] font-medium text-slate-800">
            {d.last_latitude != null && d.last_longitude != null
              ? `${d.last_latitude.toFixed(6)}, ${d.last_longitude.toFixed(6)}`
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-slate-500">Last seen</dt>
          <dd className="font-mono tabular text-[13px] font-medium text-slate-800">
            {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
          </dd>
        </div>
      </dl>
    </>
  );
}

export function LiveDevicesMap() {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [reportFilter, setReportFilter] = useState<"" | Reporting>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("medium");
  const now = updatedAt ?? Date.now();

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

  const withLocation = devices.filter((d) => d.last_latitude != null && d.last_longitude != null);
  const visible = reportFilter
    ? withLocation.filter((d) => reportingStatus(d.last_seen_at, now) === reportFilter)
    : withLocation;
  const center = useMemo<[number, number]>(() => {
    const first = withLocation[0];
    return first ? [first.last_latitude!, first.last_longitude!] : DEFAULT_CENTER;
  }, [withLocation]);
  const selected = devices.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5 text-sm md:px-6">
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-500" />
          Polling every {POLL_MS / 1000}s
        </span>
        <select
          value={reportFilter}
          onChange={(e) => setReportFilter(e.target.value as "" | Reporting)}
          className="rounded-md border border-line bg-white px-2 py-1.5 text-sm"
          aria-label="Reporting status filter"
        >
          <option value="">All reporting statuses</option>
          <option value="recent">Reporting Recently</option>
          <option value="stale">Stale</option>
          <option value="offline">Offline</option>
        </select>
        <span className="ml-auto font-mono text-xs tabular text-slate-500">
          {visible.length} device(s)
          {updatedAt && ` · updated ${new Date(updatedAt).toLocaleTimeString()}`}
        </span>
      </div>

      <div className="relative flex-1">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visible.map((d) => (
            <Marker
              key={d.id}
              position={[d.last_latitude!, d.last_longitude!]}
              icon={deviceIcon(reportingStatus(d.last_seen_at, now), d.id === selectedId)}
              zIndexOffset={d.id === selectedId ? 1000 : 0}
              eventHandlers={{ click: () => setSelectedId(d.id) }}
            />
          ))}
        </MapContainer>

        {/* Reporting-status legend */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-md border border-line bg-white/95 px-3 py-2 shadow-sm">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-500">Reporting status</p>
          <div className="space-y-1 text-xs">
            {(["recent", "stale", "offline"] as Reporting[]).map((r) => (
              <span key={r} className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: REPORTING[r].color }} />
                {REPORTING[r].label}
              </span>
            ))}
          </div>
        </div>

        {/* Desktop selected-device detail panel */}
        {selected && (
          <div className="absolute right-0 top-0 z-[1000] hidden h-full w-80 overflow-y-auto border-l border-line bg-white shadow-lg md:block">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Device detail</h3>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-panel hover:text-slate-700"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="p-4">
              <DeviceDetail d={selected} now={now} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile: draggable selected-device bottom sheet */}
      <BottomSheet
        open={selected != null}
        snap={sheetSnap}
        onSnapChange={setSheetSnap}
        onClose={() => setSelectedId(null)}
        ariaLabel="Device detail"
      >
        {selected && <DeviceDetail d={selected} now={now} />}
      </BottomSheet>
    </div>
  );
}
