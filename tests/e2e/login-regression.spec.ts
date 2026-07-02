import { test, expect } from "@playwright/test";

// Login-page regression (no credentials needed). Verifies the "create user"
// helper explanation was removed while the login form itself still works.

test.describe("login page", () => {
  test("shows the working form without the 'create user' explanation", async ({ page }) => {
    await page.goto("/login");

    // Core form still present and functional.
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    // The removed helper text must not appear.
    await expect(page.getByText(/create user/i)).toHaveCount(0);
    await expect(page.getByText(/supabase dashboard/i)).toHaveCount(0);
    await expect(page.getByText(/add user/i)).toHaveCount(0);
  });

  test("shows a validation error for bad credentials (auth logic intact)", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("nobody@example.com");
    await page.locator('input[type="password"]').fill("wrong-password-123");
    await page.getByRole("button", { name: /sign in/i }).click();
    // An error banner appears and we stay on /login (no redirect to dashboard).
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator(".bg-red-50")).toBeVisible({ timeout: 15_000 });
  });
});
