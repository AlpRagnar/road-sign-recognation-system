// Resilient normalization for the mobile live-detection results.
//
// The /api/detection/frame response is turned into a safe, render-ready shape
// here so a single malformed/optional field can never throw during rendering
// (which on iOS Safari surfaces as an opaque "The string did not match the
// expected pattern." DOMException) or stall the capture loop / frame counter.
//
// Rules:
// - never call `new URL()` on empty/relative/object-path values; only accept
//   absolute http(s) URLs (safeHttpUrl);
// - missing imageUrl / bbox stay null;
// - class name is resolved through getTrafficSignDisplayName and is robust to
//   the real response field name (className / class_name / class_display_name);
// - confidence is coerced to a finite value or null;
// - a malformed detection item is dropped (null) instead of failing the frame.

import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";

// Bounded live-results window kept in React state (field-performance).
export const MAX_LIVE_RESULTS = 30;

export interface LiveDetection {
  key: string; // stable React key (server id when present, else synthesized)
  id: string | null;
  classId: number | null;
  className: string; // resolved friendly label, never empty
  confidence: number | null; // finite 0..1, or null when unknown
  validationStatus: string;
  bbox: { x: number; y: number; width: number; height: number } | null;
  imageUrl: string | null; // absolute http(s) URL or null
  at: number; // client receipt time (for display)
}

/**
 * Returns the value only if it is a parseable absolute http(s) URL. Never
 * throws — anything else (empty, relative, object path, blob:, garbage) → null.
 */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (v === "") return null;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function firstDefined(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function normalizeClassId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Math.round(Number(v));
  }
  return null;
}

function normalizeConfidence(v: unknown): number | null {
  let n: number | null = null;
  if (typeof v === "number" && Number.isFinite(v)) n = v;
  else if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) n = Number(v);
  if (n === null) return null;
  return Math.max(0, Math.min(1, n));
}

function normalizeBbox(v: unknown): LiveDetection["bbox"] {
  const b = asRecord(v);
  if (!b) return null;
  const nums = ["x", "y", "width", "height"].map((k) => {
    const val = b[k];
    return typeof val === "number" && Number.isFinite(val) ? val : NaN;
  });
  const [x, y, width, height] = nums as [number, number, number, number];
  if ([x, y, width, height].some((n) => Number.isNaN(n))) return null;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

/**
 * Normalizes one raw detection item into a LiveDetection. Returns null when the
 * item is not an object — a single bad sibling is dropped, never fatal.
 * Optional display fields degrade to null rather than throwing.
 */
export function normalizeLiveDetection(
  raw: unknown,
  fallbackImageUrl: string | null,
  at: number,
  index: number,
): LiveDetection | null {
  const d = asRecord(raw);
  if (!d) return null;

  const classId = normalizeClassId(firstDefined(d, ["classId", "class_id"]));

  // Robust to the real response field name.
  const rawName = firstDefined(d, [
    "className",
    "class_name",
    "class_display_name",
    "classDisplayName",
    "detected_class_name",
  ]);
  const storedName = typeof rawName === "string" ? rawName : null;
  const className = getTrafficSignDisplayName(classId, storedName);

  const idVal = firstDefined(d, ["id", "detection_event_id"]);
  const id = typeof idVal === "string" && idVal !== "" ? idVal : null;

  const validationVal = firstDefined(d, ["validationStatus", "validation_status"]);
  const validationStatus = typeof validationVal === "string" ? validationVal : "pending";

  const imageUrl =
    safeHttpUrl(firstDefined(d, ["imageUrl", "image_url"])) ?? safeHttpUrl(fallbackImageUrl);

  return {
    key: id ?? `live-${at}-${index}`,
    id,
    classId,
    className,
    confidence: normalizeConfidence(firstDefined(d, ["confidence", "score"])),
    validationStatus,
    bbox: normalizeBbox(firstDefined(d, ["bbox", "bounding_box"])),
    imageUrl,
    at,
  };
}

/**
 * Normalizes the `data` object of a successful /api/detection/frame response
 * into an array of LiveDetection. Never throws; malformed items are dropped.
 */
export function normalizeFrameDetections(data: unknown, at: number): LiveDetection[] {
  const obj = asRecord(data);
  if (!obj) return [];
  const list = Array.isArray(obj.detections) ? obj.detections : [];
  const fallbackImageUrl = safeHttpUrl(obj.imageUrl);
  const out: LiveDetection[] = [];
  list.forEach((item, i) => {
    try {
      const norm = normalizeLiveDetection(item, fallbackImageUrl, at, i);
      if (norm) out.push(norm);
    } catch {
      // One malformed item must never discard its valid siblings.
    }
  });
  return out;
}
