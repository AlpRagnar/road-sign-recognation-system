"use client";

import dynamic from "next/dynamic";

// Leaflet must only run in the browser.
const TrafficSignMap = dynamic(
  () => import("@/components/TrafficSignMap").then((m) => m.TrafficSignMap),
  { ssr: false, loading: () => <div className="p-6 text-sm text-slate-400">Loading map…</div> },
);

export function SignMapView({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col md:h-screen">
      <div className="border-b border-line bg-white px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold text-primary md:text-xl">Traffic Sign Map</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Optimized sign inventory (grouped detections), not raw events.
        </p>
      </div>
      <div className="flex-1">
        <TrafficSignMap isAdmin={isAdmin} />
      </div>
    </div>
  );
}
