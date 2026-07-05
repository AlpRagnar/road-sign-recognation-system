"use client";

import { forwardRef } from "react";
import type { CameraState } from "@/lib/hooks/useCamera";

interface Props {
  state: CameraState;
  lastFrameAt: number | null;
}

// Presentational camera preview. The video ref is owned by the parent
// (via useCamera) and forwarded here.
export const CameraCapturePanel = forwardRef<HTMLVideoElement, Props>(
  function CameraCapturePanel({ state, lastFrameAt }, ref) {
    return (
      <div className="rounded-md border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Camera</h3>
          <span className="text-xs text-slate-500">
            {state.active ? "Streaming" : "Idle"}
          </span>
        </div>

        <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={ref}
            className="h-full w-full object-cover"
            muted
            playsInline
            autoPlay
          />
        </div>

        {state.error && <p className="mt-3 text-xs text-red-600">{state.error}</p>}
        {lastFrameAt && (
          <p className="mt-2 text-xs text-slate-400">
            Last frame sent: {new Date(lastFrameAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    );
  },
);
