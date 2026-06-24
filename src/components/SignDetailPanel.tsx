"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TrafficSign } from "@/lib/types/database";

interface LatestEvent {
  id: string;
  detected_class_name: string | null;
  confidence: number | null;
  image_url: string | null;
  gps_accuracy: number | null;
  created_at: string;
}

interface Detail {
  sign: TrafficSign;
  observationCount: number;
  latestEvent: LatestEvent | null;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function SignDetailPanel({ signId, onClose }: { signId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  const s = detail?.sign;

  return (
    <div className="absolute right-0 top-0 z-[1000] h-full w-80 overflow-y-auto border-l border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Sign detail</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
          ✕
        </button>
      </div>

      <div className="p-4">
        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {s && (
          <>
            <p className="text-base font-semibold text-slate-900">{s.sign_type}</p>
            {s.representative_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.representative_image_url}
                alt={s.sign_type}
                className="mt-3 h-32 w-full rounded-md object-cover"
              />
            )}
            <dl className="mt-3 divide-y divide-slate-100">
              <Row label="Latitude" value={s.latitude.toFixed(6)} />
              <Row label="Longitude" value={s.longitude.toFixed(6)} />
              <Row
                label="Confidence"
                value={s.confidence_score != null ? `${(s.confidence_score * 100).toFixed(0)}%` : "—"}
              />
              <Row label="Status" value={s.verification_status} />
              <Row label="Detections" value={s.detection_count} />
              <Row label="Observations" value={detail.observationCount} />
              <Row
                label="First detected"
                value={s.first_detected_at ? new Date(s.first_detected_at).toLocaleString() : "—"}
              />
              <Row
                label="Last detected"
                value={s.last_detected_at ? new Date(s.last_detected_at).toLocaleString() : "—"}
              />
            </dl>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Latest related event
              </p>
              {detail.latestEvent ? (
                <dl className="mt-1 divide-y divide-slate-100">
                  <Row label="Class" value={detail.latestEvent.detected_class_name ?? "—"} />
                  <Row
                    label="Confidence"
                    value={
                      detail.latestEvent.confidence != null
                        ? `${(detail.latestEvent.confidence * 100).toFixed(0)}%`
                        : "—"
                    }
                  />
                  <Row
                    label="GPS accuracy"
                    value={
                      detail.latestEvent.gps_accuracy != null
                        ? `${detail.latestEvent.gps_accuracy.toFixed(0)} m`
                        : "—"
                    }
                  />
                  <Row label="At" value={new Date(detail.latestEvent.created_at).toLocaleString()} />
                </dl>
              ) : null}
              {detail.latestEvent && (
                <Link
                  href={`/detections/${detail.latestEvent.id}`}
                  className="mt-2 inline-block text-xs text-brand underline hover:text-brand-dark"
                >
                  View latest detection →
                </Link>
              )}
              {!detail.latestEvent && (
                <p className="mt-1 text-sm text-slate-400">No related event visible.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
