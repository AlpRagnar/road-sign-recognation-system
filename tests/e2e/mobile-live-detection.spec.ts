import { test, expect, type Page } from "@playwright/test";
import { hasAdminCreds, SKIP_AUTH_MSG } from "./helpers/env";
import { loginAsAdmin } from "./helpers/auth";

// Mobile live-detection regression (task §8/§9). Drives the /detection capture
// loop with a faked camera and fully-mocked detection APIs (no Triton needed),
// on a mobile viewport. Runs on chromium and (via the webkit project) WebKit —
// the observed error was iOS-Safari behavior.

test.use({ viewport: { width: 390, height: 844 } });

// Deterministic fake camera: a live canvas stream so captureFrame() produces a
// real JPEG data URL in any engine (WebKit has no --use-fake-device support).
const FAKE_CAMERA = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext("2d")!;
  let hue = 0;
  const draw = () => {
    hue = (hue + 7) % 360;
    ctx.fillStyle = `hsl(${hue},60%,50%)`;
    ctx.fillRect(0, 0, 320, 240);
    requestAnimationFrame(draw);
  };
  draw();
  const stream = canvas.captureStream(10);
  const fake = async () => stream;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator.mediaDevices as any).getUserMedia = fake;
  } catch {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: fake, enumerateDevices: async () => [] },
    });
  }
};

const DEVICE = {
  id: "dev-e2e-1",
  user_id: "p1",
  device_name: "E2E Mobile",
  device_type: "mobile_phone",
  device_identifier: "e2e-mobile",
  status: "active",
  last_latitude: null,
  last_longitude: null,
  last_seen_at: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

function frameResponse(detections: unknown[], imageUrl: string | null = null) {
  return {
    ok: true,
    data: {
      imageUrl,
      usedMock: false,
      processingTimeMs: 1200,
      detections,
      grouping: [],
    },
  };
}

// Registers deterministic mocks for the detection APIs. `frameHandler` lets each
// test control timing/shape of the /api/detection/frame reply.
async function mockDetectionApis(
  page: Page,
  frameHandler: (route: import("@playwright/test").Route) => Promise<void> | void,
) {
  await page.route("**/api/devices", (route) =>
    route.fulfill({ json: { ok: true, data: { devices: [DEVICE] } } }),
  );
  await page.route("**/api/detection/session/start", (route) =>
    route.fulfill({ json: { ok: true, data: { session: { id: "sess-e2e-1" }, deviceId: DEVICE.id } } }),
  );
  await page.route("**/api/detection/session/stop", (route) =>
    route.fulfill({ json: { ok: true, data: { session: { id: "sess-e2e-1", status: "completed" } } } }),
  );
  await page.route("**/api/detection/frame", frameHandler);
}

async function startDetection(page: Page) {
  await page.goto("/detection");
  await expect(page.getByRole("heading", { name: "Detection Session" })).toBeVisible();
  await page.getByRole("button", { name: /start detection/i }).click();
}

const ERROR_BANNER = ".bg-red-50";

test.describe("mobile live detection", () => {
  test.skip(!hasAdminCreds, SKIP_AUTH_MSG);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(FAKE_CAMERA);
    await loginAsAdmin(page);
  });

  test("multiple detections appear immediately and the frame counter increments (no error banner)", async ({
    page,
  }) => {
    await mockDetectionApis(page, (route) =>
      route.fulfill({
        json: frameResponse([
          { id: "d1", className: "Maximum Speed Limit 60", confidence: 0.97, validationStatus: "pending", bbox: null },
          { id: "d2", className: "No Entry", confidence: 0.9, validationStatus: "pending", bbox: null },
        ]),
      }),
    );
    await startDetection(page);

    // Frame count moves off 0…
    await expect(page.getByText(/\b[1-9]\d* frames sent/)).toBeVisible({ timeout: 15_000 });
    // …and the live cards show FRIENDLY names immediately.
    await expect(page.getByText("Maximum Speed Limit 60").first()).toBeVisible();
    await expect(page.getByText("No Entry").first()).toBeVisible();
    // The Safari DOMException banner must never appear.
    await expect(page.locator(ERROR_BANNER)).toHaveCount(0);

    await page.getByRole("button", { name: /stop detection/i }).click();
  });

  test("zero-detection frame still increments the counter without error", async ({ page }) => {
    await mockDetectionApis(page, (route) => route.fulfill({ json: frameResponse([]) }));
    await startDetection(page);
    await expect(page.getByText(/\b[1-9]\d* frames sent/)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(ERROR_BANNER)).toHaveCount(0);
    await page.getByRole("button", { name: /stop detection/i }).click();
  });

  test("legacy 'Sign 150' resolves to a friendly name in the live card", async ({ page }) => {
    await mockDetectionApis(page, (route) =>
      route.fulfill({
        json: frameResponse([
          { id: "d1", className: "Sign 150", classId: 150, confidence: 0.8, validationStatus: "pending", bbox: null },
        ]),
      }),
    );
    await startDetection(page);
    await expect(page.getByText("Maximum Speed Limit 60").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Sign 150")).toHaveCount(0);
    await page.getByRole("button", { name: /stop detection/i }).click();
  });

  test("a bad image URL + one malformed detection do not throw or drop valid siblings", async ({
    page,
  }) => {
    await mockDetectionApis(page, (route) =>
      route.fulfill({
        json: frameResponse(
          [
            { id: "d1", className: "Roadworks", confidence: 0.9, imageUrl: "sessions/x/1.jpg", bbox: null },
            null,
            { id: "d2", className: "Other Danger", confidence: 0.7, bbox: { x: 1, y: 2 } },
          ],
          "sessions/frame/relative.jpg", // relative frame URL (would break `new URL`)
        ),
      }),
    );
    await startDetection(page);
    await expect(page.getByText("Roadworks").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Other Danger").first()).toBeVisible();
    await expect(page.locator(ERROR_BANNER)).toHaveCount(0);
    await page.getByRole("button", { name: /stop detection/i }).click();
  });

  test("slow 4s AI response with a 2s interval does not create overlapping requests", async ({
    page,
  }) => {
    let inFlight = 0;
    let maxConcurrent = 0;
    await mockDetectionApis(page, async (route) => {
      inFlight += 1;
      maxConcurrent = Math.max(maxConcurrent, inFlight);
      await new Promise((r) => setTimeout(r, 4000));
      inFlight -= 1;
      await route.fulfill({
        json: frameResponse([
          { id: "d1", className: "No Entry", confidence: 0.9, validationStatus: "pending", bbox: null },
        ]),
      });
    });
    await startDetection(page);
    // Let several 2s ticks elapse against a 4s backend.
    await page.waitForTimeout(9000);
    await page.getByRole("button", { name: /stop detection/i }).click();
    // Single-flight: never more than one frame request in flight at once.
    expect(maxConcurrent).toBeLessThanOrEqual(1);
  });

  test("Stop prevents a late response from updating the stopped session", async ({ page }) => {
    await mockDetectionApis(page, async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.fulfill({
        json: frameResponse([
          { id: "late", className: "Wild Animals", confidence: 0.9, validationStatus: "pending", bbox: null },
        ]),
      });
    });
    await startDetection(page);
    // Stop while the first (slow) request is still in flight.
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: /stop detection/i }).click();
    // Let the late response resolve; it must be ignored (aborted / stale).
    await page.waitForTimeout(3500);
    await expect(page.getByText("Wild Animals")).toHaveCount(0);
    await expect(page.locator(ERROR_BANNER)).toHaveCount(0);
    await expect(page.getByText(/Stopped ·/)).toBeVisible();
  });

  test("no horizontal overflow while live cards are shown", async ({ page }) => {
    await mockDetectionApis(page, (route) =>
      route.fulfill({
        json: frameResponse([
          { id: "d1", className: "Maximum Speed Limit 60", confidence: 0.97, bbox: null },
        ]),
      }),
    );
    await startDetection(page);
    await expect(page.getByText("Maximum Speed Limit 60").first()).toBeVisible({ timeout: 15_000 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: /stop detection/i }).click();
  });
});
