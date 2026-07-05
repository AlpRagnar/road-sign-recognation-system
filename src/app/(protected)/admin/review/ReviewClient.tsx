"use client";

import { useState } from "react";
import Link from "next/link";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { OverflowMenu } from "@/components/ui/OverflowMenu";
import { ErrorBanner, EmptyState } from "@/components/ui/primitives";
import type { TrafficSign, ValidationStatus } from "@/lib/types/database";

export type ReviewSign = TrafficSign & { representativeUrl: string | null };

export function ReviewClient({ initialSigns }: { initialSigns: ReviewSign[] }) {
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
    return (
      <EmptyState
        icon="signreview"
        title="No traffic signs to review yet."
        hint="Grouped inventory records appear here once detections are collected."
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && <ErrorBanner message={error} />}
      {signs.map((s) => {
        const label = getTrafficSignDisplayName(null, s.sign_type);
        const busy = busyId === s.id;
        return (
          <div
            key={s.id}
            className="flex flex-col gap-3 rounded-md border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              {/* Representative image or icon fallback */}
              {s.representativeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.representativeUrl}
                  alt={label}
                  loading="lazy"
                  className="h-12 w-16 shrink-0 rounded object-cover ring-1 ring-line"
                />
              ) : (
                <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded border border-line bg-panel text-primary">
                  <Icon name="sign" size={20} />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{label}</p>
                <p className="font-mono text-xs tabular text-slate-500">
                  {s.detection_count} observations ·{" "}
                  {s.confidence_score != null ? `${(s.confidence_score * 100).toFixed(0)}% avg` : "—"} ·{" "}
                  {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}
                </p>
                <Link
                  href="/map/signs"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Icon name="signmap" size={12} /> View on Sign Map
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <StatusBadge status={s.verification_status} />
              <button
                onClick={() => review(s.id, "manually_verified")}
                disabled={busy || s.verification_status === "manually_verified"}
                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-40"
              >
                Verify
              </button>
              <OverflowMenu
                items={[
                  { label: "Reject", onClick: () => review(s.id, "rejected"), disabled: busy || s.verification_status === "rejected" },
                  { label: "Mark duplicate", onClick: () => review(s.id, "duplicate"), disabled: busy || s.verification_status === "duplicate" },
                  { label: "Reset to pending", onClick: () => review(s.id, "pending"), disabled: busy || s.verification_status === "pending" },
                ]}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
