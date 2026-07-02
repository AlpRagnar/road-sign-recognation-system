"use client";

import { useState } from "react";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import type { TrafficSign, ValidationStatus } from "@/lib/types/database";

const ACTIONS: { label: string; status: ValidationStatus; className: string }[] = [
  { label: "Verify", status: "manually_verified", className: "bg-green-600 hover:bg-green-700" },
  { label: "Reject", status: "rejected", className: "bg-red-600 hover:bg-red-700" },
  { label: "Duplicate", status: "duplicate", className: "bg-slate-500 hover:bg-slate-600" },
];

export function ReviewClient({ initialSigns }: { initialSigns: TrafficSign[] }) {
  const [signs, setSigns] = useState(initialSigns);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(id: string, status: ValidationStatus) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/review-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "traffic_sign", id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Update failed");
        return;
      }
      setSigns((prev) =>
        prev.map((s) => (s.id === id ? { ...s, verification_status: status } : s)),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (signs.length === 0) {
    return <p className="px-8 py-6 text-sm text-slate-400">No traffic signs to review yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      {signs.map((s) => (
        <div
          key={s.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div>
            <p className="font-medium text-slate-800">
              {getTrafficSignDisplayName(null, s.sign_type)}
            </p>
            <p className="text-xs text-slate-500">
              {s.detection_count} detections ·{" "}
              {s.confidence_score != null ? `${(s.confidence_score * 100).toFixed(0)}% avg` : "—"} ·{" "}
              {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {s.verification_status}
            </span>
            {ACTIONS.map((a) => (
              <button
                key={a.status}
                onClick={() => review(s.id, a.status)}
                disabled={busyId === s.id}
                className={`rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 ${a.className}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
