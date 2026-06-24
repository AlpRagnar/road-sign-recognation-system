"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  imageUrl: string | null | undefined;
  bbox_x?: number | null;
  bbox_y?: number | null;
  bbox_width?: number | null;
  bbox_height?: number | null;
  className?: string;
  alt?: string;
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
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [rendered, setRendered] = useState<{ w: number; h: number } | null>(null);

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

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400 ${className ?? "aspect-video w-full"}`}
      >
        No image captured
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
        src={imageUrl}
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
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm text-red-600">
          Failed to load image
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
