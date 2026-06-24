"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "@/lib/hooks/useCamera";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { CameraCapturePanel } from "@/components/CameraCapturePanel";
import { LocationStatusPanel } from "@/components/LocationStatusPanel";
import { DetectionSessionControls } from "@/components/DetectionSessionControls";
import { DeviceSelectPanel } from "@/components/DeviceSelectPanel";
import {
  DetectionResultCard,
  type DetectionResult,
} from "@/components/DetectionResultCard";
import type { Device } from "@/lib/types/database";

export function DetectionClient() {
  const camera = useCamera();
  const [running, setRunning] = useState(false);
  const { state: geo, latest: geoLatest } = useGeolocation(true);

  const [starting, setStarting] = useState(false);
  const [intervalMs, setIntervalMs] = useState(2000);
  const [framesSent, setFramesSent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastFrameAt, setLastFrameAt] = useState<number | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usedMock, setUsedMock] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const sessionRef = useRef<string | null>(null);
  const deviceRef = useRef<string | null>(null);
  const captureTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlight = useRef(false);

  // Request camera permission on mount so the preview is visible before start.
  useEffect(() => {
    void camera.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the user's active registered devices for the session selector.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDevicesLoading(true);
      try {
        const json = await fetch("/api/devices").then((r) => r.json());
        if (cancelled) return;
        const active: Device[] = (json.ok ? json.data.devices : []).filter(
          (d: Device) => d.status === "active",
        );
        setDevices(active);
        if (active.length === 1) setSelectedDeviceId(active[0]!.id);
      } finally {
        if (!cancelled) setDevicesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendFrame = useCallback(async () => {
    if (inFlight.current || !sessionRef.current) return;
    const dataUrl = camera.captureFrame();
    if (!dataUrl) return;

    inFlight.current = true;
    const g = geoLatest.current;
    try {
      const res = await fetch("/api/detection/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          deviceId: deviceRef.current,
          imageBase64: dataUrl,
          latitude: g.latitude,
          longitude: g.longitude,
          gpsAccuracy: g.accuracy,
          heading: g.heading,
          speed: g.speed,
          capturedAt: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      setFramesSent((n) => n + 1);
      setLastFrameAt(Date.now());

      if (!res.ok || !json.ok) {
        // Category-aware, non-crashing message. The capture loop keeps running.
        const category = json.category as string | undefined;
        const friendly =
          category === "timeout"
            ? "AI request timed out. The frame was uploaded but no detection was saved."
            : category === "invalid_response"
              ? "AI response was invalid. Please check the model server response contract."
              : category === "config"
                ? "AI model is not configured. Set AI_MODEL_API_URL or use mock mode."
                : category === "http" || category === "network"
                  ? "AI model request failed. The frame was uploaded but no detection was saved."
                  : json.error || `Frame failed (${res.status})`;
        setError(friendly);
        return;
      }
      setError(null);
      setUsedMock(Boolean(json.data.usedMock));
      const newResults: DetectionResult[] = (json.data.detections ?? []).map(
        (d: {
          id: string;
          className: string | null;
          confidence: number | null;
          validationStatus: string;
          imageUrl?: string | null;
          bbox?: { x: number | null; y: number | null; width: number | null; height: number | null } | null;
        }) => ({
          id: d.id,
          className: d.className,
          confidence: d.confidence,
          validationStatus: d.validationStatus,
          imageUrl: d.imageUrl ?? json.data.imageUrl ?? null,
          bbox: d.bbox ?? null,
          at: Date.now(),
        }),
      );
      if (newResults.length > 0) {
        setResults((prev) => [...newResults, ...prev].slice(0, 20));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      inFlight.current = false;
    }
  }, [camera, geoLatest]);

  const handleStart = useCallback(async () => {
    if (!selectedDeviceId) {
      setError("Select a registered device before starting detection.");
      return;
    }
    setError(null);
    setStarting(true);
    try {
      if (!camera.state.active) await camera.start();

      const res = await fetch("/api/detection/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: selectedDeviceId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not start session");
        return;
      }
      sessionRef.current = json.data.session.id;
      deviceRef.current = json.data.deviceId;
      setRunning(true);
      setFramesSent(0);
      setDuration(0);

      captureTimer.current = setInterval(() => void sendFrame(), intervalMs);
      durationTimer.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStarting(false);
    }
  }, [camera, intervalMs, sendFrame, selectedDeviceId]);

  const handleStop = useCallback(async () => {
    if (captureTimer.current) clearInterval(captureTimer.current);
    if (durationTimer.current) clearInterval(durationTimer.current);
    captureTimer.current = null;
    durationTimer.current = null;

    const sessionId = sessionRef.current;
    setRunning(false);

    if (sessionId) {
      await fetch("/api/detection/session/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }
    sessionRef.current = null;
    camera.stop();
  }, [camera]);

  // Clean up timers on unmount.
  useEffect(() => {
    return () => {
      if (captureTimer.current) clearInterval(captureTimer.current);
      if (durationTimer.current) clearInterval(durationTimer.current);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <CameraCapturePanel ref={camera.videoRef} state={camera.state} lastFrameAt={lastFrameAt} />
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {usedMock && running && (
          <p className="rounded-md bg-amber-50 px-4 py-2 text-xs text-amber-700">
            Using development mock detector (no AI_MODEL_API_URL configured).
          </p>
        )}
      </div>

      <div className="space-y-6">
        <DeviceSelectPanel
          devices={devices}
          loading={devicesLoading}
          selectedDeviceId={selectedDeviceId}
          disabled={running}
          onSelect={setSelectedDeviceId}
        />
        <DetectionSessionControls
          running={running}
          starting={starting}
          startDisabled={!selectedDeviceId}
          durationSeconds={duration}
          framesSent={framesSent}
          intervalMs={intervalMs}
          onIntervalChange={setIntervalMs}
          onStart={handleStart}
          onStop={handleStop}
        />
        <LocationStatusPanel geo={geo} />

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Recent results</h3>
          <div className="space-y-2">
            {results.length === 0 && (
              <p className="text-sm text-slate-400">No detections yet this session.</p>
            )}
            {results.map((r) => (
              <DetectionResultCard key={r.id} result={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
