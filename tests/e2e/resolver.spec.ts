import { test, expect } from "@playwright/test";
import {
  getTrafficSignDisplayName,
  humanizeCanonicalLabel,
  trafficSignClassCount,
} from "@/lib/traffic-sign-classes";

// Pure-logic tests for the shared class display resolver. No app/credentials
// needed. Verifies the class map + humanization rules from the task spec.

test.describe("traffic-sign class display resolver", () => {
  test("class map contains all 400 classes", () => {
    expect(trafficSignClassCount()).toBe(400);
  });

  test("required id → friendly-name assertions", () => {
    const cases: Array<[number, string]> = [
      [123, "Keep Right"],
      [138, "Maximum Speed Limit 30"],
      [150, "Maximum Speed Limit 60"],
      [164, "No Entry"],
      [318, "Other Danger"],
      [354, "Roadworks"],
      [392, "Wild Animals"],
    ];
    for (const [id, expected] of cases) {
      expect(getTrafficSignDisplayName(id, null)).toBe(expected);
    }
  });

  test("resolves a 'Sign N' placeholder via the embedded id (no class id)", () => {
    expect(getTrafficSignDisplayName(null, "Sign 150")).toBe("Maximum Speed Limit 60");
    expect(getTrafficSignDisplayName(null, "Sign 164")).toBe("No Entry");
  });

  test("humanizes a raw canonical label", () => {
    expect(getTrafficSignDisplayName(null, "regulatory--maximum-speed-limit-60--g1")).toBe(
      "Maximum Speed Limit 60",
    );
    expect(getTrafficSignDisplayName(null, "warning--other-danger--g1")).toBe("Other Danger");
  });

  test("special-term humanization (u-turn / led / y-roads)", () => {
    expect(humanizeCanonicalLabel("regulatory--no-u-turn--g1")).toBe("No U-Turn");
    expect(humanizeCanonicalLabel("regulatory--maximum-speed-limit-led-100--g1")).toBe(
      "Maximum Speed Limit LED 100",
    );
    expect(humanizeCanonicalLabel("warning--y-roads--g1")).toBe("Y-Roads");
  });

  test("preserves an already-meaningful (manually reviewed) name", () => {
    expect(getTrafficSignDisplayName(150, "My Custom Verified Label")).toBe(
      "My Custom Verified Label",
    );
  });

  test("class id takes priority over a stored placeholder", () => {
    expect(getTrafficSignDisplayName(354, "Sign 354")).toBe("Roadworks");
  });

  test("falls back safely for unknown / empty input", () => {
    expect(getTrafficSignDisplayName(99999, null)).toBe("Sign 99999");
    expect(getTrafficSignDisplayName(null, null)).toBe("Unknown sign");
    // Unknown raw canonical → humanized rather than dropped.
    expect(getTrafficSignDisplayName(null, "warning--totally-made-up--g1")).toBe(
      "Totally Made Up",
    );
  });
});
