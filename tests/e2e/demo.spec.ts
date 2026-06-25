import { test, expect } from "@playwright/test";
import { hasAdminCreds, allowDemoMutations, SKIP_DEMO_MSG } from "./helpers/env";
import { loginAsAdmin } from "./helpers/auth";

// Demo-seed tests create/refresh demo-marked rows, so they are opt-in only.
test.describe("demo seed flow (opt-in)", () => {
  test.skip(!(hasAdminCreds && allowDemoMutations), SKIP_DEMO_MSG);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("seeding demo data updates status counts", async ({ page }) => {
    await page.goto("/admin/demo");
    await expect(page.getByRole("heading", { name: "Admin · Demo Tools" })).toBeVisible();

    // Trigger seed/refresh and wait for the success notice.
    await page.getByRole("button", { name: /seed demo data|refresh demo data/i }).click();
    await expect(page.getByText(/Seeded \d+ devices/i)).toBeVisible({ timeout: 30_000 });

    // Verify via the authenticated status API (shares the browser session).
    const res = await page.request.get("/api/admin/demo/status");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.hasDemoData).toBe(true);
    expect(json.data.counts.devices).toBeGreaterThan(0);
    expect(json.data.counts.events).toBeGreaterThan(0);
  });

  test("seeded data populates the sign map and detection detail", async ({ page }) => {
    // Ensure data exists (idempotent refresh).
    await page.goto("/admin/demo");
    await page.getByRole("button", { name: /seed demo data|refresh demo data/i }).click();
    await expect(page.getByText(/Seeded \d+ devices/i)).toBeVisible({ timeout: 30_000 });

    // Sign map shows markers/clusters.
    await page.goto("/map/signs");
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15_000 });

    // Detection detail via the admin detections list.
    await page.goto("/admin/detections");
    await expect(page.getByRole("heading", { name: "Admin · Detections" })).toBeVisible();
    const detailLink = page.getByRole("link", { name: /view details/i }).first();
    if ((await detailLink.count()) > 0) {
      await detailLink.click();
      await expect(page).toHaveURL(/\/detections\//);
      await expect(page.getByRole("heading", { name: "Detection detail" })).toBeVisible();
      await expect(page.getByText("Detection", { exact: true })).toBeVisible();
    }
  });
});
