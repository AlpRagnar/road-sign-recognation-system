"use client";

import dynamic from "next/dynamic";

// Leaflet must only run in the browser.
const TrafficSignMap = dynamic(
  () => import("@/components/TrafficSignMap").then((m) => m.TrafficSignMap),
  { ssr: false, loading: () => <div className="p-8 text-sm text-slate-400">Loading map…</div> },
);

export default function SignMapPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col md:h-screen">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-lg font-semibold text-slate-900">Traffic Sign Map</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Optimized sign inventory (grouped detections), not raw events.
        </p>
      </div>
      <div className="flex-1">
        <TrafficSignMap />
      </div>
    </div>
  );
}
