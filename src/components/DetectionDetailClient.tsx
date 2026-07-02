"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DetectionImagePreview } from "@/components/DetectionImagePreview";
import { DeleteFrameDialog } from "@/components/DeleteFrameDialog";
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
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

  if (loading) return <p className="p-8 text-sm text-slate-400">Loading detection…</p>;
  if (error) return <p className="m-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!detail) return null;

  const { event: e, linkedSign } = detail;
  const rawJson = (() => {
    try {
      return JSON.stringify(e.ai_response_raw, null, 2);
    } catch {
      return "Unable to format AI response.";
    }
  })();

  return (
    <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
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
              className="mt-2 inline-block text-xs text-brand underline"
            >
              Open original image
            </a>
          )}
        </Card>

        <Card title="AI response (raw)">
          <details>
            <summary className="cursor-pointer text-sm text-slate-600">
              Show raw AI response JSON
            </summary>
            <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
              {rawJson}
            </pre>
          </details>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Detection">
          <dl className="divide-y divide-slate-100">
            <Row
              label="Class name"
              value={getTrafficSignDisplayName(e.detected_class_id, e.detected_class_name)}
            />
            <Row label="Class ID" value={e.detected_class_id} />
            <Row label="Confidence" value={pct(e.confidence)} />
            <Row label="Validation status" value={e.validation_status} />
            <Row label="AI response time" value={e.ai_response_time_ms != null ? `${e.ai_response_time_ms} ms` : "—"} />
            <Row label="Created" value={new Date(e.created_at).toLocaleString()} />
          </dl>
        </Card>

        <Card title="Location">
          <dl className="divide-y divide-slate-100">
            <Row label="Latitude" value={e.latitude != null ? e.latitude.toFixed(6) : "—"} />
            <Row label="Longitude" value={e.longitude != null ? e.longitude.toFixed(6) : "—"} />
            <Row label="GPS accuracy" value={e.gps_accuracy != null ? `${e.gps_accuracy.toFixed(1)} m` : "—"} />
            <Row label="Heading" value={e.heading != null ? `${e.heading.toFixed(0)}°` : "—"} />
            <Row label="Speed" value={e.speed != null ? `${e.speed.toFixed(1)} m/s` : "—"} />
          </dl>
        </Card>

        <Card title="Device & user">
          <dl className="divide-y divide-slate-100">
            <Row label="Device" value={e.devices?.device_name} />
            <Row label="Device type" value={e.devices?.device_type} />
            <Row label="Identifier" value={e.devices?.device_identifier} />
            <Row label="User" value={e.profiles?.full_name ?? e.profiles?.email} />
          </dl>
        </Card>

        {linkedSign && (
          <Card title="Linked traffic sign">
            <dl className="divide-y divide-slate-100">
              <Row label="Sign type" value={getTrafficSignDisplayName(null, linkedSign.sign_type)} />
              <Row
                label="Coordinates"
                value={`${linkedSign.latitude.toFixed(5)}, ${linkedSign.longitude.toFixed(5)}`}
              />
              <Row label="Confidence" value={pct(linkedSign.confidence_score)} />
              <Row label="Detections" value={linkedSign.detection_count} />
              <Row label="Status" value={linkedSign.verification_status} />
            </dl>
            <Link href="/map/signs" className="mt-3 inline-block text-xs text-brand underline">
              View on sign map
            </Link>
          </Card>
        )}

        {isAdmin && (
          <Card title="Admin actions">
            <p className="text-sm text-slate-600">
              Permanently remove this captured frame and every detection produced from it.
              This is different from <span className="font-medium">Reject</span>, which only
              changes the review status and keeps the image.
            </p>
            {deleteError && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}
            <button
              onClick={() => setShowDelete(true)}
              className="mt-3 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete frame
            </button>
          </Card>
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
