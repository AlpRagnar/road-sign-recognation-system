import { test, expect } from "@playwright/test";
import {
  safeHttpUrl,
  normalizeLiveDetection,
  normalizeFrameDetections,
  MAX_LIVE_RESULTS,
  type LiveDetection,
} from "@/lib/detection/live-results";

// Pure, deterministic tests for the resilient live-results normalization.
// No app/camera/credentials needed. Runs on chromium and (via the webkit
// project) WebKit, since the observed error was iOS-Safari behavior.

test.describe("safeHttpUrl", () => {
  test("accepts absolute http(s) URLs only", () => {
    expect(safeHttpUrl("https://example.com/a.jpg?token=abc")).toContain("https://example.com/a.jpg");
    expect(safeHttpUrl("http://x.io/y")).toBe("http://x.io/y");
  });

  test("returns null for empty / relative / object-path / junk / non-strings", () => {
    // These are the values that make WebKit's `new URL()` throw the opaque
    // "The string did not match the expected pattern." DOMException.
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl("   ")).toBeNull();
    expect(safeHttpUrl("sessions/abc/123.jpg")).toBeNull(); // Supabase object path
    expect(safeHttpUrl("/detections/undefined")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
    expect(safeHttpUrl("blob:xyz")).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
    expect(safeHttpUrl(123)).toBeNull();
    expect(safeHttpUrl({})).toBeNull();
  });
});

test.describe("normalizeLiveDetection", () => {
  const at = 1_700_000_000_000;

  test("missing image URL stays null (no throw)", () => {
    const d = normalizeLiveDetection(
      { id: "a", className: "No Entry", confidence: 0.9 },
      null,
      at,
      0,
    );
    expect(d).not.toBeNull();
    expect(d!.imageUrl).toBeNull();
  });

  test("relative/object-path image URL stays null (no throw)", () => {
    const d = normalizeLiveDetection(
      { id: "a", className: "No Entry", confidence: 0.9, imageUrl: "sessions/s/1.jpg" },
      null,
      at,
      0,
    );
    expect(d!.imageUrl).toBeNull();
  });

  test("invalid URL string does not throw and yields null image", () => {
    const d = normalizeLiveDetection(
      { className: "No Entry", confidence: 0.9, imageUrl: "%%%not-a-url%%%" },
      null,
      at,
      0,
    );
    expect(d!.imageUrl).toBeNull();
  });

  test("falls back to the frame-level image URL when the item has none", () => {
    const d = normalizeLiveDetection(
      { className: "No Entry", confidence: 0.9 },
      "https://cdn.example.com/frame.jpg",
      at,
      0,
    );
    expect(d!.imageUrl).toContain("https://cdn.example.com/frame.jpg");
  });

  test("legacy 'Sign 150' resolves to 'Maximum Speed Limit 60'", () => {
    expect(normalizeLiveDetection({ classId: 150, className: "Sign 150" }, null, at, 0)!.className).toBe(
      "Maximum Speed Limit 60",
    );
    // Even when only the placeholder string is present:
    expect(normalizeLiveDetection({ className: "Sign 150" }, null, at, 0)!.className).toBe(
      "Maximum Speed Limit 60",
    );
  });

  test("already-friendly name remains friendly", () => {
    expect(normalizeLiveDetection({ className: "Other Danger" }, null, at, 0)!.className).toBe(
      "Other Danger",
    );
  });

  test("resolver reads whichever field name the response uses", () => {
    // class_name (snake), class_display_name, classId as numeric string.
    expect(normalizeLiveDetection({ class_name: "regulatory--no-entry--g1" }, null, at, 0)!.className).toBe(
      "No Entry",
    );
    expect(normalizeLiveDetection({ class_display_name: "Roadworks" }, null, at, 0)!.className).toBe(
      "Roadworks",
    );
    expect(normalizeLiveDetection({ classId: "150" }, null, at, 0)!.className).toBe(
      "Maximum Speed Limit 60",
    );
  });

  test("never throws on null id / unknown id / malformed name", () => {
    expect(() => normalizeLiveDetection({ classId: null, className: null }, null, at, 0)).not.toThrow();
    expect(normalizeLiveDetection({ classId: 999999 }, null, at, 0)!.className).toBe("Sign 999999");
    expect(normalizeLiveDetection({ className: {} as unknown as string }, null, at, 0)!.className).toBe(
      "Unknown sign",
    );
  });

  test("confidence is clamped or null; bbox is validated or null", () => {
    expect(normalizeLiveDetection({ className: "X", confidence: 1.7 }, null, at, 0)!.confidence).toBe(1);
    expect(normalizeLiveDetection({ className: "X", confidence: "0.5" }, null, at, 0)!.confidence).toBe(0.5);
    expect(normalizeLiveDetection({ className: "X", confidence: "n/a" }, null, at, 0)!.confidence).toBeNull();
    expect(normalizeLiveDetection({ className: "X", bbox: { x: 1, y: 2 } }, null, at, 0)!.bbox).toBeNull();
    expect(
      normalizeLiveDetection({ className: "X", bbox: { x: 1, y: 2, width: 3, height: 4 } }, null, at, 0)!.bbox,
    ).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  });

  test("non-object item returns null (dropped, not fatal)", () => {
    expect(normalizeLiveDetection(null, null, at, 0)).toBeNull();
    expect(normalizeLiveDetection("nope", null, at, 0)).toBeNull();
  });
});

test.describe("normalizeFrameDetections", () => {
  test("zero detections → empty array", () => {
    expect(normalizeFrameDetections({ detections: [] }, 1)).toEqual([]);
    expect(normalizeFrameDetections({}, 1)).toEqual([]);
    expect(normalizeFrameDetections(null, 1)).toEqual([]);
  });

  test("one malformed item does not discard valid siblings", () => {
    const data = {
      imageUrl: "https://cdn.example.com/f.jpg",
      detections: [
        { id: "d1", className: "Maximum Speed Limit 60", confidence: 0.97 },
        null, // malformed
        "garbage", // malformed
        { id: "d2", className: "No Entry", confidence: 0.9, imageUrl: "sessions/bad/path.jpg" },
      ],
    };
    const out = normalizeFrameDetections(data, 123);
    expect(out).toHaveLength(2);
    expect(out.map((d) => d.className)).toEqual(["Maximum Speed Limit 60", "No Entry"]);
    // Bad per-item path falls back to the valid frame-level URL.
    expect(out[1]!.imageUrl).toContain("https://cdn.example.com/f.jpg");
  });

  test("keys are stable and unique even without server ids", () => {
    const out = normalizeFrameDetections(
      { detections: [{ className: "A" }, { className: "B" }, { className: "C" }] },
      555,
    );
    const keys = out.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test("accumulated live results stay bounded to MAX_LIVE_RESULTS", () => {
    // Mirror the component's accumulation: newest first, capped.
    let results: LiveDetection[] = [];
    for (let frame = 0; frame < 10; frame++) {
      const batch = normalizeFrameDetections(
        { detections: Array.from({ length: 8 }, (_, i) => ({ className: `Sign ${i}` })) },
        1000 + frame,
      );
      results = [...batch, ...results].slice(0, MAX_LIVE_RESULTS);
    }
    expect(results.length).toBe(MAX_LIVE_RESULTS);
    expect(MAX_LIVE_RESULTS).toBeLessThanOrEqual(50);
  });
});
