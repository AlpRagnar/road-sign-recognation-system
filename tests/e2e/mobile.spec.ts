import { test, expect, type Page } from "@playwright/test";
import { hasAdminCreds, SKIP_AUTH_MSG } from "./helpers/env";
import { loginAsAdmin } from "./helpers/auth";

// Lightweight, structural mobile-responsive smoke tests. These verify there is no
// horizontal overflow, the mobile navigation works, and key pages render without an
// SSR/hydration crash at common mobile/tablet viewport sizes. They intentionally do
// NOT assert on exact pixel layout (which is brittle).

const MOBILE_VIEWPORTS = [
  { name: "iphone-13", width: 390, height: 844 },
  { name: "pixel-5", width: 393, height: 851 },
  { name: "small-375", width: 375, height: 667 },
  { name: "tablet-768", width: 768, height: 1024 },
];

// Allow a tiny tolerance for sub-pixel rounding / scrollbar widths.
const OVERFLOW_TOLERANCE = 2;

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(overflow.scrollWidth).toBeLessThanOrEqual(
    overflow.clientWidth + OVERFLOW_TOLERANCE,
  );
}

test.describe("mobile responsive — public", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`/login has no horizontal overflow @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe("mobile responsive — authenticated", () => {
  test.skip(!hasAdminCreds, SKIP_AUTH_MSG);

  test("mobile navigation drawer opens and links work @ 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsAdmin(page);

    // The hamburger (mobile top bar) is visible; the desktop sidebar links are not
    // in the initial accessibility tree as visible tap targets until opened.
    const openBtn = page.getByRole("button", { name: /open navigation menu/i });
    await expect(openBtn).toBeVisible();

    await openBtn.click();
    const signMapLink = page.getByRole("link", { name: "Sign Map" });
    await expect(signMapLink).toBeVisible();
    await signMapLink.click();
    await page.waitForURL(/\/map\/signs/);
    await expect(page.getByRole("heading", { name: "Traffic Sign Map" })).toBeVisible();
  });

  const AUTH_PAGES = [
    { path: "/dashboard", ready: () => /Dashboard/ },
    { path: "/devices", ready: () => /Devices/ },
    { path: "/detection", ready: () => /Detection Session/ },
    { path: "/map/signs", ready: () => /Traffic Sign Map/ },
    { path: "/map/devices", ready: () => /Live Device Map/ },
    { path: "/admin/ai", ready: () => /AI/ },
    { path: "/admin/analytics", ready: () => /Analytics/ },
    { path: "/admin/storage", ready: () => /Storage/ },
    { path: "/admin/demo", ready: () => /Demo/ },
    { path: "/presentation?presentation=1", ready: () => /Presentation/ },
  ];

  for (const vp of [
    { name: "iphone-13", width: 390, height: 844 },
    { name: "small-375", width: 375, height: 667 },
  ]) {
    test(`authed pages render without overflow @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginAsAdmin(page);

      for (const p of AUTH_PAGES) {
        await page.goto(p.path);
        // Page settled: body has visible text and no Next.js error overlay.
        await expect(page.locator("body")).toBeVisible();
        await expect(
          page.getByText(/Application error|client-side exception/i),
        ).toHaveCount(0);
        // Give async map/data a moment, then check overflow.
        await page.waitForTimeout(800);
        await expectNoHorizontalOverflow(page);
        // Mobile top bar hamburger is present on every protected page.
        await expect(
          page.getByRole("button", { name: /open navigation menu/i }),
        ).toBeVisible();
      }
    });
  }
});
