"use client";

import { useEffect, useState } from "react";

export interface DeleteFrameSummary {
  deletedEvents: number;
  deletedObservations: number;
  deletedSigns: number;
  storageWarning: string | null;
}

interface FramePreview {
  detectionCount: number;
  observationCount: number;
  capturedAt: string;
  deviceName: string | null;
  hasStorageObject: boolean;
  imageUrl: string | null;
}

// Destructive confirmation dialog for permanently deleting a captured frame and
// every detection produced from it. Uses the app's modal pattern (not the
// browser confirm()). Fetches a server-side preview so the admin sees exactly
// what will be removed before confirming.
export function DeleteFrameDialog({
  detectionId,
  fallbackImageUrl,
  onCancel,
  onDeleted,
  onError,
}: {
  detectionId: string;
  fallbackImageUrl?: string | null;
  onCancel: () => void;
  onDeleted: (summary: DeleteFrameSummary) => void;
  onError: (message: string) => void;
}) {
  const [preview, setPreview] = useState<FramePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/detections/${detectionId}/frame`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (!j.ok) throw new Error(j.error || "Could not load frame details");
        setPreview(j.data as FramePreview);
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [detectionId]);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/detections/${detectionId}/frame`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Delete failed (${res.status})`);
      }
      onDeleted({
        deletedEvents: json.data.deletedEvents,
        deletedObservations: json.data.deletedObservations,
        deletedSigns: json.data.deletedSigns,
        storageWarning: json.data.storageWarning ?? null,
      });
    } catch (e) {
      // Keep the dialog open so the admin sees the failure in-context, and also
      // bubble up for the list-level banner.
      const msg = (e as Error).message;
      setError(msg);
      onError(msg);
    } finally {
      setDeleting(false);
    }
  }

  const thumb = preview?.imageUrl ?? fallbackImageUrl ?? null;
  const count = preview?.detectionCount ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg ring-1 ring-red-200">
        <h3 className="text-base font-semibold text-red-700">Permanently delete frame</h3>

        <p className="mt-3 text-sm text-slate-600">
          This permanently deletes the captured image, every detection produced from the same
          frame, related observation links, and the storage object. This cannot be undone.
        </p>

        <div className="mt-4 flex gap-4">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt="Captured frame"
              className="h-20 w-28 shrink-0 rounded object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
              No image
            </div>
          )}
          <dl className="flex-1 space-y-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Detections to delete</dt>
              <dd className="font-semibold text-slate-800">
                {loading ? "…" : count}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Observation links</dt>
              <dd className="font-medium text-slate-800">
                {loading ? "…" : preview?.observationCount ?? 0}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Captured</dt>
              <dd className="font-medium text-slate-800">
                {loading || !preview
                  ? "…"
                  : new Date(preview.capturedAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Device</dt>
              <dd className="font-medium text-slate-800">
                {loading ? "…" : preview?.deviceName ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting || loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : `Delete frame${count > 1 ? ` (${count})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
