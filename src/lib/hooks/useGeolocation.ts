"use client";

import { useEffect, useRef, useState } from "react";

export interface GeoState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  error: string | null;
  permission: "unknown" | "granted" | "denied";
}

const INITIAL: GeoState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  heading: null,
  speed: null,
  error: null,
  permission: "unknown",
};

// Continuously watches device geolocation while `active` is true.
// Also exposes a ref with the latest reading for use inside intervals.
export function useGeolocation(active: boolean) {
  const [state, setState] = useState<GeoState>(INITIAL);
  const latest = useRef<GeoState>(INITIAL);

  useEffect(() => {
    if (!active) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation is not supported by this browser." }));
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const next: GeoState = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: Number.isNaN(pos.coords.heading) ? null : pos.coords.heading,
          speed: pos.coords.speed,
          error: null,
          permission: "granted",
        };
        latest.current = next;
        setState(next);
      },
      (err) => {
        const permission = err.code === err.PERMISSION_DENIED ? "denied" : "unknown";
        setState((s) => ({ ...s, error: err.message, permission }));
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [active]);

  return { state, latest };
}
