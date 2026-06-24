"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraState {
  active: boolean;
  error: string | null;
  permission: "unknown" | "granted" | "denied";
}

// Manages a getUserMedia camera stream attached to a <video> element.
// `captureFrame` grabs the current video frame as a base64 JPEG data URL.
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    active: false,
    error: null,
    permission: "unknown",
  });

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setState({ active: false, error: "Camera not supported in this browser.", permission: "denied" });
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setState({ active: true, error: null, permission: "granted" });
      return true;
    } catch (err) {
      setState({
        active: false,
        error: (err as Error).message,
        permission: "denied",
      });
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState((s) => ({ ...s, active: false }));
  }, []);

  // Capture current frame as a JPEG data URL (downscaled to max 1280px wide).
  const captureFrame = useCallback((quality = 0.7): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    const maxW = 1280;
    const scale = Math.min(1, maxW / video.videoWidth);
    const w = Math.round(video.videoWidth * scale);
    const h = Math.round(video.videoHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  }, []);

  // Clean up on unmount.
  useEffect(() => () => stop(), [stop]);

  return { videoRef, state, start, stop, captureFrame };
}
