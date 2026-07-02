"use client";

import Link from "next/link";
import { DetectionImagePreview } from "@/components/DetectionImagePreview";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";

export interface DetectionResult {
  id: string;
  className: string | null;
  confidence: number | null;
  validationStatus: string;
  at: number;
  imageUrl?: string | null;
  bbox?: {
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
  } | null;
}

export function DetectionResultCard({ result }: { result: DetectionResult }) {
  const conf = result.confidence != null ? `${(result.confidence * 100).toFixed(0)}%` : "—";
  const low = result.validationStatus === "low_confidence";
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800">
            {getTrafficSignDisplayName(null, result.className)}
          </p>
          <p className="text-xs text-slate-400">{new Date(result.at).toLocaleTimeString()}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            low ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
          }`}
        >
          {conf}
        </span>
      </div>

      {result.imageUrl && (
        <DetectionImagePreview
          imageUrl={result.imageUrl}
          bbox_x={result.bbox?.x}
          bbox_y={result.bbox?.y}
          bbox_width={result.bbox?.width}
          bbox_height={result.bbox?.height}
          className="w-full"
        />
      )}

      <Link href={`/detections/${result.id}`} className="inline-block text-xs text-brand underline">
        View detail
      </Link>
    </div>
  );
}
