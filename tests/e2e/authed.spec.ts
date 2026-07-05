import { test, expect } from "@playwright/test";
import { hasAdminCreds, SKIP_AUTH_MSG } from "./helpers/env";
import { loginAsAdmin } from "./helpers/auth";

// All tests here require admin credentials; they skip cleanly otherwise.
test.describe("authenticated smoke", () => {
  test.skip(!hasAdminCreds, SKIP_AUTH_MSG);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("dashboard loads with KPIs and no fatal error", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Traffic signs")).toBeVisible();
    // Next.js error boundary text should not be present.
    await expect(page.getByText(/Application error|Unhandled Runtime Error/i)).toHaveCount(0);
  });

  const ADMIN_PAGES: Array<[string, string]> = [
    ["/admin/ai", "Admin · AI integration"],
    ["/admin/analytics", "Admin · Analytics"],
    ["/admin/storage", "Admin · Storage"],
    ["/admin/demo", "Admin · Demo Tools"],
    ["/admin/detections", "Admin · Detections"],
    ["/admin/users", "Admin · Users"],
    ["/admin/devices", "Admin · Devices"],
  ];

  for (const [path, heading] of ADMIN_PAGES) {
    test(`admin page ${path} renders`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    });
  }

  test("/map/signs loads without Leaflet/SSR crash", async ({ page }) => {
    await page.goto("/map/signs");
    await expect(page.getByRole("heading", { name: "Traffic Sign Map" })).toBeVisible();
    // Leaflet renders its tile attribution once the map mounts.
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15_000 });
  });

  test("/map/devices loads without Leaflet/SSR crash", async ({ page }) => {
    await page.goto("/map/devices");
    await expect(page.getByRole("heading", { name: "Live Device Map" })).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15_000 });
  });

  test("/presentation shows guided cards and presentation badge", async ({ page }) => {
    await page.goto("/presentation?presentation=1");
    await expect(page.getByRole("heading", { name: "Presentation" })).toBeVisible();
    // The presentation badge is uniquely identified by its Exit control (avoids
    // matching the page description text that also contains "presentation mode").
    await expect(page.getByRole("link", { name: "Exit" })).toBeVisible();
    // Guided step cards are present (first step links to the Dashboard).
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("/detection renders with device selector (camera/GPS mocked)", async ({ page }) => {
    await page.goto("/detection");
    await expect(page.getByRole("heading", { name: "Detection Session" })).toBeVisible();
    // The Device panel and Start control should be present (Start is gated on device selection).
    await expect(page.getByRole("heading", { name: "Device" })).toBeVisible();
    await expect(page.getByRole("button", { name: /start detection/i })).toBeVisible();
  });
});
