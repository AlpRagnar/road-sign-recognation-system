"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DetectionImagePreview } from "@/components/DetectionImagePreview";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import type { TrafficSign } from "@/lib/types/database";

interface LatestEvent {
  id: string;
  detected_class_name: string | null;
  confidence: number | null;
  image_url: string | null;
  gps_accuracy: number | null;
  created_at: string;
}

export interface SignDetail {
  sign: TrafficSign;
  observationCount: number;
  latestEvent: LatestEvent | null;
}

// Shared data fetch — lifted so desktop panel + mobile sheet reuse one request.
export function useSignDetail(signId: string | null) {
  const [detail, setDetail] = useState<SignDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signId) {
      setDetail(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);
    fetch(`/api/map/signs/${signId}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (!j.ok) throw new Error(j.error || "Failed to load");
        setDetail(j.data);
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [signId]);

  return { detail, loading, error };
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

// Presentational content shared by the desktop panel and the mobile sheet.
export function SignDetailContent({
  detail,
  loading,
  error,
  isAdmin = false,
}: {
  detail: SignDetail | null;
  loading: boolean;
  error: string | null;
  isAdmin?: boolean;
}) {
  if (loading) return <p className="py-4 text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="py-4 text-sm text-red-600">{error}</p>;
  if (!detail) return null;
  const s = detail.sign;
  const label = getTrafficSignDisplayName(null, s.sign_type);

  return (
    <>
      {/* Collapsed-state summary */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-900">{label}</p>
        <StatusBadge status={s.verification_status} />
      </div>
      <p className="mt-0.5 font-mono text-[11px] tabular text-slate-400">Inventory ID {s.id.slice(0, 8)}</p>

      {s.representative_image_url && (
        <div className="mt-3">
          <DetectionImagePreview
            imageUrl={s.representative_image_url}
            alt={label}
            refreshRequest={{ kind: "traffic_sign", id: s.id }}
          />
        </div>
      )}

      {/* Fact grid (medium state) */}
      <dl className="mt-3 divide-y divide-line/70">
        <Row label="Average confidence" value={s.confidence_score != null ? `${(s.confidence_score * 100).toFixed(0)}%` : "—"} />
        <Row label="Supporting observations" value={<span className="font-mono tabular">{detail.observationCount}</span>} />
        <Row label="Representative location" value={<span className="font-mono tabular text-[13px]">{s.latitude.toFixed(6)}, {s.longitude.toFixed(6)}</span>} />
        <Row label="First detected" value={s.first_detected_at ? new Date(s.first_detected_at).toLocaleString() : "—"} />
        <Row label="Last detected" value={s.last_detected_at ? new Date(s.last_detected_at).toLocaleString() : "—"} />
      </dl>

      {/* Latest observation + actions (expanded state) */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest supporting observation</p>
        {detail.latestEvent ? (
          <>
            <dl className="mt-1 divide-y divide-line/70">
              <Row label="Class" value={getTrafficSignDisplayName(null, detail.latestEvent.detected_class_name)} />
              <Row label="Confidence" value={detail.latestEvent.confidence != null ? `${(detail.latestEvent.confidence * 100).toFixed(0)}%` : "—"} />
              <Row label="Observation GPS accuracy" value={detail.latestEvent.gps_accuracy != null ? `${detail.latestEvent.gps_accuracy.toFixed(0)} m` : "—"} />
              <Row label="Observed at" value={new Date(detail.latestEvent.created_at).toLocaleString()} />
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/detections/${detail.latestEvent.id}`}
                className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-primary hover:bg-panel"
              >
                <Icon name="external" size={12} /> View Detection Detail
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/review"
                  className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-panel"
                >
                  <Icon name="signreview" size={12} /> Open in Sign Review
                </Link>
              )}
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-400">No supporting observation visible.</p>
        )}
      </div>
    </>
  );
}

// Desktop right-side panel (props-driven; data fetched by the parent).
export function SignDetailPanel({
  detail,
  loading,
  error,
  isAdmin = false,
  onClose,
}: {
  detail: SignDetail | null;
  loading: boolean;
  error: string | null;
  isAdmin?: boolean;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-0 z-[1000] hidden h-full w-80 overflow-y-auto border-l border-line bg-white shadow-lg md:block">
      <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Sign detail</h3>
        <button
          onClick={onClose}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-panel hover:text-slate-700"
          aria-label="Close"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      <div className="p-4">
        <SignDetailContent detail={detail} loading={loading} error={error} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
