import { env } from "@/lib/env";

// ===========================================================================
// Canonical AI model integration contract.
// See docs/AI_MODEL_INTEGRATION.md for the full spec.
// ===========================================================================

export type AiMode = "mock" | "external" | "auto";

export type AiErrorCategory =
  | "config" // misconfiguration (e.g. external mode with no URL)
  | "timeout" // request aborted by timeout
  | "network" // fetch/DNS/connection failure
  | "http" // non-2xx HTTP status
  | "invalid_response"; // 2xx but failed validation/normalization

// ---- Request contract (app -> model server) ----
export interface AiRequestLocation {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface AiRequest {
  image_url: string;
  image_id: string | null;
  session_id: string;
  device_id: string | null;
  timestamp: string;
  location: AiRequestLocation;
  metadata: { source: string; app: string };
}

export interface BuildRequestInput {
  imageUrl: string;
  imageId?: string | null;
  sessionId: string;
  deviceId: string | null;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

// Builds the canonical request payload. Never includes secrets.
export function buildAiRequest(input: BuildRequestInput): AiRequest {
  return {
    image_url: input.imageUrl,
    image_id: input.imageId ?? null,
    session_id: input.sessionId,
    device_id: input.deviceId,
    timestamp: input.timestamp,
    location: {
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      accuracy: input.gpsAccuracy ?? null,
      heading: input.heading ?? null,
      speed: input.speed ?? null,
    },
    metadata: { source: "web-camera", app: "traffic-sign-mapping-dashboard" },
  };
}

// ---- Normalized response contract (internal, post-validation) ----
export interface NormalizedDetection {
  class_id: number | null;
  class_name: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number } | null;
}

export interface NormalizedAiResponse {
  detections: NormalizedDetection[];
  processing_time_ms: number | null;
  model_version: string | null;
  raw: unknown;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function normalizeClassId(v: unknown): number | null {
  if (isFiniteNumber(v)) return Math.round(v);
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Math.round(Number(v));
  }
  return null;
}

function normalizeBbox(raw: unknown): NormalizedDetection["bbox"] {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const x = b.x;
  const y = b.y;
  const width = b.width;
  const height = b.height;
  if (![x, y, width, height].every(isFiniteNumber)) return null;
  // Reject non-positive boxes rather than storing garbage geometry.
  if ((width as number) <= 0 || (height as number) <= 0) return null;
  return {
    x: x as number,
    y: y as number,
    width: width as number,
    height: height as number,
  };
}

/**
 * Validates + normalizes an arbitrary model-server response into the internal
 * shape. Accepts snake_case or camelCase for processing time / model version.
 * Returns a discriminated result; never throws on bad data.
 */
export function normalizeAiResponse(
  raw: unknown,
): { ok: true; value: NormalizedAiResponse } | { ok: false; message: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, message: "Response was not a JSON object." };
  }
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.detections)) {
    return { ok: false, message: "Missing required `detections` array." };
  }

  const detections: NormalizedDetection[] = [];
  for (const item of obj.detections) {
    if (!item || typeof item !== "object") {
      return { ok: false, message: "A detection entry was not an object." };
    }
    const d = item as Record<string, unknown>;

    const className = typeof d.class_name === "string" ? d.class_name.trim() : "";
    if (!className) {
      return { ok: false, message: "A detection is missing a non-empty `class_name`." };
    }

    const confidence = d.confidence;
    if (!isFiniteNumber(confidence) || confidence < 0 || confidence > 1) {
      return {
        ok: false,
        message: `Detection "${className}" has invalid confidence (must be 0–1).`,
      };
    }

    detections.push({
      class_id: normalizeClassId(d.class_id),
      class_name: className,
      confidence,
      bbox: normalizeBbox(d.bbox),
    });
  }

  const processingTime = isFiniteNumber(obj.processing_time_ms)
    ? obj.processing_time_ms
    : isFiniteNumber(obj.processingTimeMs)
      ? obj.processingTimeMs
      : null;

  const modelVersion =
    typeof obj.model_version === "string"
      ? obj.model_version
      : typeof obj.modelVersion === "string"
        ? obj.modelVersion
        : null;

  return {
    ok: true,
    value: {
      detections,
      processing_time_ms: processingTime,
      model_version: modelVersion,
      raw,
    },
  };
}

// Resolves the effective AI mode from env. Defaults to "auto".
// Accepts legacy "live" as an alias for "external".
export function resolveAiMode(): AiMode {
  const raw = env.aiModelMode();
  if (raw === "mock") return "mock";
  if (raw === "external" || raw === "live") return "external";
  return "auto";
}

// Returns the model URL hostname (safe to log) or null.
export function modelHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
