"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "@/lib/hooks/useCamera";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { CameraCapturePanel } from "@/components/CameraCapturePanel";
import { LocationStatusPanel } from "@/components/LocationStatusPanel";
import { DetectionSessionControls } from "@/components/DetectionSessionControls";
import { DeviceSelectPanel } from "@/components/DeviceSelectPanel";
import { DetectionResultCard } from "@/components/DetectionResultCard";
import {
  normalizeFrameDetections,
  MAX_LIVE_RESULTS,
  type LiveDetection,
} from "@/lib/detection/live-results";
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
  const [results, setResults] = useState<LiveDetection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usedMock, setUsedMock] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const sessionRef = useRef<string | null>(null);
  const deviceRef = useRef<string | null>(null);
  const captureTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Single-flight guard: at most one frame upload/inference in flight at a time.
  const inFlight = useRef(false);
  // Aborts the in-flight request when the session stops or the page unmounts.
  const abortRef = useRef<AbortController | null>(null);

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
    // Single-flight: if a request is still in flight, skip this interval tick
    // entirely (no growing queue). AI can take longer than the capture interval.
    if (inFlight.current || !sessionRef.current) return;
    const dataUrl = camera.captureFrame();
    if (!dataUrl) return;

    // Snapshot the session so a response arriving after Stop/restart is ignored.
    const sessionId = sessionRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    inFlight.current = true;
    const g = geoLatest.current;

    // True once the session is no longer the one this request was started for.
    const isStale = () => sessionRef.current !== sessionId;

    try {
      let res: Response;
      try {
        res = await fetch("/api/detection/frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            sessionId,
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
      } catch (err) {
        // An intentional abort (Stop pressed) or a late/stale request is ignored.
        if (controller.signal.aborted || isStale()) return;
        setError("Frame upload failed. Check your connection; the capture loop is still running.");
        return;
      }

      if (isStale()) return;

      let json: { ok?: boolean; error?: string; category?: string; data?: Record<string, unknown> };
      try {
        json = await res.json();
      } catch {
        if (isStale()) return;
        setError("Response parsing failed. The frame reached the server but the reply was unreadable.");
        return;
      }

      // A response that arrived after the session stopped must not touch state.
      if (isStale()) return;

      // The frame round-trip completed: count it BEFORE any optional display
      // work so a rendering/parsing problem can never stall the counter.
      setFramesSent((n) => n + 1);
      setLastFrameAt(Date.now());

      if (!res.ok || !json?.ok) {
        const category = json?.category;
        const friendly =
          category === "timeout"
            ? "AI request timed out. The frame was uploaded but no detection was saved."
            : category === "invalid_response"
              ? "AI response was invalid. Please check the model server response contract."
              : category === "config"
                ? "AI model is not configured. Set AI_MODEL_API_URL or use mock mode."
                : category === "http" || category === "network"
                  ? "AI request failed. The frame was uploaded but no detection was saved."
                  : json?.error || `Frame failed (${res.status})`;
        setError(friendly);
        return;
      }

      setError(null);
      setUsedMock(Boolean(json.data?.usedMock));

      // Optional, fully-guarded display processing. Per-item normalization means
      // one malformed detection never discards its valid siblings or throws.
      try {
        const newResults = normalizeFrameDetections(json.data, Date.now());
        if (newResults.length > 0) {
          setResults((prev) => [...newResults, ...prev].slice(0, MAX_LIVE_RESULTS));
        }
      } catch {
        // A counted, successful frame must never be undone by a display error.
      }
    } finally {
      inFlight.current = false;
      if (abortRef.current === controller) abortRef.current = null;
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
    // Clear the session ref first so any in-flight/late response is ignored,
    // then abort the current request so it can't update the stopped session.
    sessionRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    inFlight.current = false;
    setRunning(false);

    if (sessionId) {
      await fetch("/api/detection/session/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }
    camera.stop();
  }, [camera]);

  // Clean up timers + any in-flight request + media resources on unmount.
  useEffect(() => {
    return () => {
      sessionRef.current = null;
      abortRef.current?.abort();
      abortRef.current = null;
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
              <DetectionResultCard key={r.key} result={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
