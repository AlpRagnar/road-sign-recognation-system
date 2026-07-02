import { defineConfig, devices } from "@playwright/test";

// E2E smoke-test configuration. Tests target a running app at E2E_BASE_URL,
// or Playwright starts `npm run dev` automatically when E2E_BASE_URL is unset.
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // Aalborg — for pages that read geolocation (e.g. /detection).
    geolocation: { latitude: 57.0488, longitude: 9.9217 },
    permissions: ["geolocation"],
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Auto-accept and fake camera/mic so /detection renders without hardware.
        launchOptions: {
          args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
        },
      },
    },
    {
      // iOS-Safari (WebKit) engine — the engine that produced the original
      // "The string did not match the expected pattern." DOMException. Scoped to
      // the pure live-results normalization/URL spec (which is exactly the bug
      // surface). The auth-dependent mobile integration spec runs on chromium
      // because Supabase SSR cookie auth is unreliable under Playwright WebKit.
      name: "webkit",
      testMatch: /live-results\.spec\.ts/,
      use: { ...devices["iPhone 13"] },
    },
  ],
  // When E2E_BASE_URL is provided we assume the server is already running.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
