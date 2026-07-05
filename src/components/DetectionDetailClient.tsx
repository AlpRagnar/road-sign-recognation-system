"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DetectionImagePreview } from "@/components/DetectionImagePreview";
import { DeleteFrameDialog } from "@/components/DeleteFrameDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfidenceMeter, ErrorBanner } from "@/components/ui/primitives";
import { DangerZone } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import type { DetectionEvent, TrafficSign } from "@/lib/types/database";

type EventWithContext = DetectionEvent & {
  devices?: { device_name: string | null; device_type: string | null; device_identifier: string | null } | null;
  profiles?: { full_name: string | null; email: string | null } | null;
};

interface Detail {
  event: EventWithContext;
  linkedSign: TrafficSign | null;
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right font-medium text-slate-800 ${mono ? "font-mono tabular text-[13px]" : ""}`}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-white">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

const pct = (v: number | null) => (v != null ? `${(v * 100).toFixed(0)}%` : "—");

export function DetectionDetailClient({ id, isAdmin = false }: { id: string; isAdmin?: boolean }) {
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/detections/${id}`)
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
  }, [id]);

  if (loading) return <p className="p-6 text-sm text-slate-400">Loading detection…</p>;
  if (error) return <div className="m-4 md:m-6"><ErrorBanner message={error} /></div>;
  if (!detail) return null;

  const { event: e, linkedSign } = detail;
  const label = getTrafficSignDisplayName(e.detected_class_id, e.detected_class_name);
  const rawJson = (() => {
    try {
      return JSON.stringify(e.ai_response_raw, null, 2);
    } catch {
      return "Unable to format AI response.";
    }
  })();

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-3">
      {/* Evidence (hero) */}
      <div className="space-y-6 lg:col-span-2">
        <Card title="Captured frame">
          <DetectionImagePreview
            imageUrl={e.image_url}
            bbox_x={e.bbox_x}
            bbox_y={e.bbox_y}
            bbox_width={e.bbox_width}
            bbox_height={e.bbox_height}
            refreshRequest={{ kind: "detection_event", id: e.id }}
          />
          {e.image_url && (
            <a
              href={e.image_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Icon name="external" size={12} /> Open original image
            </a>
          )}
        </Card>

        <Card title="AI response (raw)">
          <details>
            <summary className="cursor-pointer text-sm text-slate-600">Show raw AI response JSON</summary>
            <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-navy p-3 font-mono text-xs text-slate-100">
              {rawJson}
            </pre>
          </details>
        </Card>
      </div>

      {/* Fact sheet */}
      <div className="space-y-6">
        {/* Hero facts header */}
        <div className="rounded-md border border-line bg-white p-5">
          <p className="text-lg font-semibold text-slate-900">{label}</p>
          <p className="mt-0.5 font-mono text-xs tabular text-slate-500">Class ID {e.detected_class_id ?? "—"}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <ConfidenceMeter value={e.confidence} />
            <StatusBadge status={e.validation_status} />
          </div>
        </div>

        <Card title="Detection">
          <dl className="divide-y divide-line/70">
            <Row label="Confidence" value={pct(e.confidence)} mono />
            <Row label="AI response time" value={e.ai_response_time_ms != null ? `${e.ai_response_time_ms} ms` : "—"} mono />
            <Row label="Created" value={new Date(e.created_at).toLocaleString()} mono />
          </dl>
        </Card>

        <Card title="Location">
          <dl className="divide-y divide-line/70">
            <Row label="Latitude" value={e.latitude != null ? e.latitude.toFixed(6) : "—"} mono />
            <Row label="Longitude" value={e.longitude != null ? e.longitude.toFixed(6) : "—"} mono />
            <Row label="GPS accuracy" value={e.gps_accuracy != null ? `${e.gps_accuracy.toFixed(1)} m` : "—"} mono />
            <Row label="Heading" value={e.heading != null ? `${e.heading.toFixed(0)}°` : "—"} mono />
            <Row label="Speed" value={e.speed != null ? `${e.speed.toFixed(1)} m/s` : "—"} mono />
          </dl>
        </Card>

        <Card title="Device & user">
          <dl className="divide-y divide-line/70">
            <Row label="Device" value={e.devices?.device_name} />
            <Row label="Device type" value={e.devices?.device_type} />
            <Row label="Identifier" value={e.devices?.device_identifier} mono />
            <Row label="User" value={e.profiles?.full_name ?? e.profiles?.email} />
          </dl>
        </Card>

        {linkedSign && (
          <Card title="Linked traffic sign">
            <dl className="divide-y divide-line/70">
              <Row label="Sign type" value={getTrafficSignDisplayName(null, linkedSign.sign_type)} />
              <Row
                label="Coordinates"
                value={`${linkedSign.latitude.toFixed(5)}, ${linkedSign.longitude.toFixed(5)}`}
                mono
              />
              <Row label="Confidence" value={pct(linkedSign.confidence_score)} mono />
              <Row label="Detections" value={linkedSign.detection_count} mono />
              <Row label="Status" value={<StatusBadge status={linkedSign.verification_status} />} />
            </dl>
            <Link href="/map/signs" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <Icon name="signmap" size={12} /> View on Sign Map
            </Link>
          </Card>
        )}

        {isAdmin && (
          <DangerZone title="Admin actions">
            <p className="text-sm text-red-700/90">
              Permanently remove this captured frame and every detection produced from it. This is different
              from <span className="font-medium">Reject</span>, which only changes the review status and keeps the image.
            </p>
            {deleteError && <p className="mt-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">{deleteError}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowDelete(true)}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete frame
              </button>
              <Link href="/admin/detections" className="rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-700 hover:bg-panel">
                Open in Detection Review
              </Link>
            </div>
          </DangerZone>
        )}
      </div>

      {showDelete && (
        <DeleteFrameDialog
          detectionId={e.id}
          fallbackImageUrl={e.image_url}
          onCancel={() => setShowDelete(false)}
          onDeleted={() => {
            setShowDelete(false);
            router.push("/admin/detections");
          }}
          onError={(msg) => {
            setShowDelete(false);
            setDeleteError(msg);
          }}
        />
      )}
    </div>
  );
}
