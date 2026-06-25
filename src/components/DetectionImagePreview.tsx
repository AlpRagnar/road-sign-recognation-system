"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ImageRefreshRequest {
  kind: "detection_event" | "traffic_sign";
  id: string;
}

interface Props {
  imageUrl: string | null | undefined;
  bbox_x?: number | null;
  bbox_y?: number | null;
  bbox_width?: number | null;
  bbox_height?: number | null;
  className?: string;
  alt?: string;
  // When provided, an expired/failed image can be re-signed via POST /api/images/sign.
  refreshRequest?: ImageRefreshRequest;
}

// Shows a captured frame with an optional bounding-box overlay.
// The bbox fields are pixel coordinates relative to the captured (natural)
// image, so the overlay is scaled by rendered-size / natural-size.
export function DetectionImagePreview({
  imageUrl,
  bbox_x,
  bbox_y,
  bbox_width,
  bbox_height,
  className,
  alt = "Captured frame",
  refreshRequest,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<string | null | undefined>(imageUrl);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [rendered, setRendered] = useState<{ w: number; h: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Keep internal src in sync when the incoming prop changes.
  useEffect(() => {
    setSrc(imageUrl);
    setStatus("loading");
    setNatural(null);
    setRefreshError(null);
  }, [imageUrl]);

  const measure = useCallback(() => {
    const img = imgRef.current;
    if (img && img.clientWidth > 0) {
      setRendered({ w: img.clientWidth, h: img.clientHeight });
    }
  }, []);

  // Keep the overlay aligned when the layout/image resizes.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(img);
    return () => ro.disconnect();
  }, [measure, status]);

  const refresh = useCallback(async () => {
    if (!refreshRequest) return;
    setRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch("/api/images/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refreshRequest),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not refresh image");
      setNatural(null);
      setStatus("loading");
      // Cache-bust so the browser refetches even if the path is identical.
      setSrc(`${json.data.imageUrl}${json.data.imageUrl.includes("?") ? "&" : "?"}r=${Date.now()}`);
    } catch (err) {
      setRefreshError((err as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [refreshRequest]);

  if (!src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-lg bg-slate-100 text-sm text-slate-400 ${className ?? "aspect-video w-full"}`}
      >
        <span>No image captured</span>
        {refreshRequest && (
          <button
            onClick={refresh}
            disabled={refreshing}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-white disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh image"}
          </button>
        )}
      </div>
    );
  }

  const hasBbox =
    bbox_x != null &&
    bbox_y != null &&
    bbox_width != null &&
    bbox_height != null &&
    bbox_width > 0 &&
    bbox_height > 0;

  const canScale = natural != null && rendered != null && natural.w > 0;
  const scale = canScale ? rendered!.w / natural!.w : 1;
  const showBox = status === "loaded" && hasBbox && canScale;

  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-900 ${className ?? "w-full"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="block h-auto w-full"
        onLoad={(e) => {
          const el = e.currentTarget;
          setNatural({ w: el.naturalWidth, h: el.naturalHeight });
          setRendered({ w: el.clientWidth, h: el.clientHeight });
          setStatus("loaded");
        }}
        onError={() => setStatus("error")}
      />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-xs text-white">
          Loading image…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 text-sm text-red-600">
          <span>Image failed to load (the signed URL may have expired).</span>
          {refreshRequest && (
            <button
              onClick={refresh}
              disabled={refreshing}
              className="rounded-md bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh image"}
            </button>
          )}
          {refreshError && <span className="text-xs text-red-500">{refreshError}</span>}
        </div>
      )}

      {showBox && (
        <div
          className="pointer-events-none absolute border-2 border-emerald-400 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{
            left: bbox_x! * scale,
            top: bbox_y! * scale,
            width: bbox_width! * scale,
            height: bbox_height! * scale,
          }}
        >
          <span className="absolute -top-5 left-0 rounded bg-emerald-500 px-1 text-[10px] font-medium text-white">
            detection
          </span>
        </div>
      )}

      {status === "loaded" && hasBbox && !canScale && (
        <p className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
          Bounding box unavailable until image loads.
        </p>
      )}
    </div>
  );
}
