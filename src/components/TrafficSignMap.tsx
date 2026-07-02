"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { ensureLeafletIcons } from "@/lib/leaflet-icon";
import { cellSizeForZoom, gridCluster } from "@/lib/cluster";
import { SignDetailPanel } from "@/components/SignDetailPanel";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import type { TrafficSign } from "@/lib/types/database";

ensureLeafletIcons();

const DEFAULT_CENTER: [number, number] = [57.0488, 9.9217]; // Aalborg, DK (matches docs sample)

type ViewMode = "markers" | "clustered" | "density";

function clusterDivIcon(count: number): L.DivIcon {
  const size = count < 10 ? 34 : count < 100 ? 42 : 50;
  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:rgba(29,78,216,0.85);color:#fff;font-size:12px;font-weight:600;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function densityColor(count: number): string {
  if (count >= 50) return "#b91c1c";
  if (count >= 20) return "#ea580c";
  if (count >= 8) return "#f59e0b";
  if (count >= 3) return "#eab308";
  return "#22c55e";
}

// Renders the sign layer for the active view mode. Lives inside MapContainer so
// it can read the live zoom level for clustering/density cell sizing.
function SignLayer({
  signs,
  mode,
  onSelect,
}: {
  signs: TrafficSign[];
  mode: ViewMode;
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  if (mode === "markers") {
    return (
      <>
        {signs.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            eventHandlers={{ click: () => onSelect(s.id) }}
          />
        ))}
      </>
    );
  }

  // Clustered + density both bucket points to a zoom-dependent grid.
  const cell = cellSizeForZoom(zoom) * (mode === "density" ? 1.6 : 1);
  const clusters = gridCluster(
    signs.map((s) => ({ id: s.id, lat: s.latitude, lng: s.longitude, sign: s })),
    cell,
  );

  if (mode === "density") {
    return (
      <>
        {clusters.map((c) => (
          <CircleMarker
            key={c.key}
            center={[c.lat, c.lng]}
            radius={Math.min(8 + c.items.length * 2, 40)}
            pathOptions={{
              color: densityColor(c.items.length),
              fillColor: densityColor(c.items.length),
              fillOpacity: 0.4,
              weight: 1,
            }}
            eventHandlers={{
              click: () => c.items.length === 1 && onSelect(c.items[0]!.id),
            }}
          />
        ))}
      </>
    );
  }

  // Clustered markers
  return (
    <>
      {clusters.map((c) => {
        if (c.items.length === 1) {
          const only = c.items[0]!;
          return (
            <Marker
              key={c.key}
              position={[only.lat, only.lng]}
              eventHandlers={{ click: () => onSelect(only.id) }}
            />
          );
        }
        return (
          <Marker
            key={c.key}
            position={[c.lat, c.lng]}
            icon={clusterDivIcon(c.items.length)}
            eventHandlers={{
              click: () => map.setView([c.lat, c.lng], Math.min(zoom + 2, 18)),
            }}
          />
        );
      })}
    </>
  );
}

export function TrafficSignMap() {
  const [signs, setSigns] = useState<TrafficSign[]>([]);
  const [signType, setSignType] = useState("");
  const [status, setStatus] = useState("");
  const [minConfidence, setMinConfidence] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<ViewMode>("clustered");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (signType) params.set("signType", signType);
    if (status) params.set("status", status);
    if (minConfidence) params.set("minConfidence", minConfidence);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());

    setLoading(true);
    fetch(`/api/map/signs?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => setSigns(j.ok ? j.data.signs : []))
      .finally(() => setLoading(false));
  }, [signType, status, minConfidence, from, to]);

  const center = useMemo<[number, number]>(() => {
    if (signs.length > 0) return [signs[0]!.latitude, signs[0]!.longitude];
    return DEFAULT_CENTER;
  }, [signs]);

  const signTypes = useMemo(
    () => Array.from(new Set(signs.map((s) => s.sign_type))).sort(),
    [signs],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-8 py-3 text-sm">
        <select
          value={signType}
          onChange={(e) => setSignType(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1"
        >
          <option value="">All sign types</option>
          {signTypes.map((t) => (
            <option key={t} value={t}>
              {getTrafficSignDisplayName(null, t)}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="auto_verified">Auto verified</option>
          <option value="manually_verified">Manually verified</option>
          <option value="rejected">Rejected</option>
          <option value="duplicate">Duplicate</option>
        </select>
        <select
          value={minConfidence}
          onChange={(e) => setMinConfidence(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1"
        >
          <option value="">Any confidence</option>
          <option value="0.5">≥ 50%</option>
          <option value="0.75">≥ 75%</option>
          <option value="0.9">≥ 90%</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1"
          title="Last detected from"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1"
          title="Last detected to"
        />

        <div className="ml-auto flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-slate-300">
            {(["markers", "clustered", "density"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs capitalize ${
                  mode === m ? "bg-brand text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {loading ? "Loading…" : `${signs.length} signs`}
          </span>
        </div>
      </div>

      <div className="relative flex-1">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SignLayer signs={signs} mode={mode} onSelect={setSelectedId} />
        </MapContainer>

        {selectedId && (
          <SignDetailPanel signId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
