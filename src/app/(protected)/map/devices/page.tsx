"use client";

import dynamic from "next/dynamic";

const LiveDevicesMap = dynamic(
  () => import("@/components/LiveDevicesMap").then((m) => m.LiveDevicesMap),
  { ssr: false, loading: () => <div className="p-8 text-sm text-slate-400">Loading map…</div> },
);

export default function DeviceMapPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col md:h-screen">
      <div className="border-b border-line bg-white px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold text-primary md:text-xl">Live Device Map</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Last-known device locations, refreshed by polling.
        </p>
      </div>
      <div className="flex-1">
        <LiveDevicesMap />
      </div>
    </div>
  );
}
