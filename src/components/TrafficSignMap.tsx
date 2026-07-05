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
import { SignDetailPanel, SignDetailContent, useSignDetail } from "@/components/SignDetailPanel";
import { BottomSheet, type SheetSnap } from "@/components/ui/BottomSheet";
import { Icon } from "@/components/ui/Icon";
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

// Blue normal pin; amber pin with a white halo when selected.
function signPinIcon(selected: boolean): L.DivIcon {
  const color = selected ? "#f59e0b" : "#1d4ed8";
  const ring = selected ? "box-shadow:0 0 0 4px rgba(245,158,11,0.35);" : "box-shadow:0 1px 3px rgba(0,0,0,0.4);";
  const size = selected ? 22 : 18;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid #fff;${ring}"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Renders the sign layer for the active view mode. Lives inside MapContainer so
// it can read the live zoom level for clustering/density cell sizing.
function SignLayer({
  signs,
  mode,
  onSelect,
  selectedId,
}: {
  signs: TrafficSign[];
  mode: ViewMode;
  onSelect: (id: string) => void;
  selectedId: string | null;
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
            icon={signPinIcon(s.id === selectedId)}
            zIndexOffset={s.id === selectedId ? 1000 : 0}
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
              icon={signPinIcon(only.id === selectedId)}
              zIndexOffset={only.id === selectedId ? 1000 : 0}
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

export function TrafficSignMap({ isAdmin = false }: { isAdmin?: boolean }) {
  const [signs, setSigns] = useState<TrafficSign[]>([]);
  const [signType, setSignType] = useState("");
  const [status, setStatus] = useState("");
  const [minConfidence, setMinConfidence] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<ViewMode>("clustered");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("medium");
  const { detail, loading: detailLoading, error: detailError } = useSignDetail(selectedId);

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

  const selectCls =
    "rounded-md border border-line bg-white px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const activeFilters = [signType, status, minConfidence, from, to].filter(Boolean).length;

  const filterControls = (
    <>
      <select value={signType} onChange={(e) => setSignType(e.target.value)} className={selectCls}>
        <option value="">All sign types</option>
        {signTypes.map((t) => (
          <option key={t} value={t}>
            {getTrafficSignDisplayName(null, t)}
          </option>
        ))}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="auto_verified">Auto verified</option>
        <option value="manually_verified">Manually verified</option>
        <option value="rejected">Rejected</option>
        <option value="duplicate">Duplicate</option>
      </select>
      <select value={minConfidence} onChange={(e) => setMinConfidence(e.target.value)} className={selectCls}>
        <option value="">Any confidence</option>
        <option value="0.5">≥ 50%</option>
        <option value="0.75">≥ 75%</option>
        <option value="0.9">≥ 90%</option>
      </select>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls} title="Last detected from" />
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectCls} title="Last detected to" />
    </>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-4 py-2.5 text-sm md:px-6">
        {/* Desktop filters */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">{filterControls}</div>
        {/* Mobile filters button */}
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-sm text-slate-700 md:hidden"
        >
          <Icon name="filter" size={16} />
          Filters
          {activeFilters > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">{activeFilters}</span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-line">
            {(["markers", "clustered", "density"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1.5 text-xs capitalize transition-colors sm:px-3 ${
                  mode === m ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-panel"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs tabular text-slate-500">
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
          <SignLayer signs={signs} mode={mode} onSelect={setSelectedId} selectedId={selectedId} />
        </MapContainer>

        {/* Density legend overlay */}
        {mode === "density" && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-md border border-line bg-white/95 px-3 py-2 shadow-sm">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-500">Density</p>
            <div className="flex items-center gap-1.5">
              {["#22c55e", "#eab308", "#f59e0b", "#ea580c", "#b91c1c"].map((c) => (
                <span key={c} className="h-3 w-5 rounded-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-slate-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}

        {/* Desktop right detail panel */}
        {selectedId && (
          <SignDetailPanel
            detail={detail}
            loading={detailLoading}
            error={detailError}
            isAdmin={isAdmin}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* Mobile: draggable sign-detail bottom sheet */}
      <BottomSheet
        open={selectedId != null}
        snap={sheetSnap}
        onSnapChange={setSheetSnap}
        onClose={() => setSelectedId(null)}
        ariaLabel="Sign detail"
      >
        <SignDetailContent detail={detail} loading={detailLoading} error={detailError} isAdmin={isAdmin} />
      </BottomSheet>

      {/* Mobile: filter bottom sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[950] md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-lg border-t border-line bg-white p-4 pb-safe">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-panel"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 [&>select]:w-full [&>input]:w-full">{filterControls}</div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setSignType("");
                  setStatus("");
                  setMinConfidence("");
                  setFrom("");
                  setTo("");
                }}
                className="rounded-md border border-line px-4 py-2.5 text-sm text-slate-700 hover:bg-panel"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
