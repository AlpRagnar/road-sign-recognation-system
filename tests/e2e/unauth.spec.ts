import { test, expect } from "@playwright/test";

// These tests need no credentials — only a running app. They verify auth gating
// for protected pages, admin APIs, and cron endpoints.

const PROTECTED_PAGES = ["/dashboard", "/admin/analytics", "/admin/storage", "/admin/demo"];

test.describe("unauthenticated routing", () => {
  for (const path of PROTECTED_PAGES) {
    test(`${path} redirects to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    });
  }

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe("unauthenticated API access", () => {
  test("GET /api/admin/ai/health returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/ai/health");
    expect(res.status()).toBe(401);
  });

  test("GET /api/map/signs returns 401", async ({ request }) => {
    const res = await request.get("/api/map/signs");
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/demo/seed returns 401", async ({ request }) => {
    const res = await request.post("/api/admin/demo/seed");
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/admin/detections/:id/frame returns 401 (destructive, admin-only)", async ({
    request,
  }) => {
    const res = await request.delete(
      "/api/admin/detections/00000000-0000-0000-0000-000000000000/frame",
    );
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/devices/:id status change returns 401 unauthenticated", async ({ request }) => {
    const res = await request.patch("/api/devices/00000000-0000-0000-0000-000000000000", {
      data: { status: "inactive" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/cron/daily-maintenance returns 401 or 500 without bearer", async ({ request }) => {
    // 401 when CRON_SECRET is configured; 500 (config) when it is unset.
    const res = await request.post("/api/cron/daily-maintenance", { data: {} });
    expect([401, 500]).toContain(res.status());
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test("cron query-string secret is not accepted", async ({ request }) => {
    const res = await request.post("/api/cron/daily-maintenance?secret=anything", { data: {} });
    expect([401, 500]).toContain(res.status());
  });
});
