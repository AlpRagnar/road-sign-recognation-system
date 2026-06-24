"use client";

import type { GeoState } from "@/lib/hooks/useGeolocation";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-green-500" : "bg-slate-300"}`}
    />
  );
}

export function LocationStatusPanel({ geo }: { geo: GeoState }) {
  const hasFix = geo.latitude != null && geo.longitude != null;
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Location</h3>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <StatusDot ok={geo.permission === "granted"} />
          {geo.permission === "granted"
            ? "Granted"
            : geo.permission === "denied"
              ? "Denied"
              : "Unknown"}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-400">Latitude</dt>
          <dd className="font-mono text-slate-800">{hasFix ? geo.latitude!.toFixed(6) : "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Longitude</dt>
          <dd className="font-mono text-slate-800">{hasFix ? geo.longitude!.toFixed(6) : "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Accuracy</dt>
          <dd className="text-slate-800">{geo.accuracy != null ? `${geo.accuracy.toFixed(1)} m` : "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Speed</dt>
          <dd className="text-slate-800">{geo.speed != null ? `${geo.speed.toFixed(1)} m/s` : "—"}</dd>
        </div>
      </dl>

      {geo.error && <p className="mt-3 text-xs text-red-600">{geo.error}</p>}
    </div>
  );
}
