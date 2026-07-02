import { test, expect, type Browser } from "@playwright/test";
import { hasAdminCreds, SKIP_AUTH_MSG } from "./helpers/env";
import { loginAsAdmin } from "./helpers/auth";
import {
  hasServiceRole,
  SKIP_SERVICE_MSG,
  serviceClient,
  adminProfileId,
} from "./helpers/service";

// Integration tests for device active-status behavior (task §3.3):
// stopping detection must NOT deactivate the device, and only admins may change
// device status. Gated on admin creds + service-role key.

test.describe("device status + session lifecycle", () => {
  test.skip(!hasAdminCreds, SKIP_AUTH_MSG);
  test.skip(!hasServiceRole, SKIP_SERVICE_MSG);

  const admin = serviceClient();
  let deviceId: string | null = null;
  let profileId: string | null = null;
  const sessionIds: string[] = [];

  test.beforeAll(async () => {
    profileId = await adminProfileId(admin);
    expect(profileId).toBeTruthy();
    const { data: device } = await admin
      .from("devices")
      .insert({
        user_id: profileId,
        device_name: "E2E status device",
        device_type: "test_device",
        status: "active",
      })
      .select("id")
      .single();
    deviceId = device!.id as string;
  });

  test.afterAll(async () => {
    if (sessionIds.length) await admin.from("detection_sessions").delete().in("id", sessionIds);
    if (deviceId) await admin.from("devices").delete().eq("id", deviceId);
  });

  async function deviceStatus(): Promise<string | null> {
    const { data } = await admin.from("devices").select("status").eq("id", deviceId!).maybeSingle();
    return (data?.status as string) ?? null;
  }

  test("stop session ends the session but leaves the device ACTIVE; a second session starts", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    expect(await deviceStatus()).toBe("active");

    // Start session 1.
    const start1 = await page.request.post("/api/detection/session/start", {
      data: { deviceId },
    });
    expect(start1.status()).toBe(200);
    const s1 = (await start1.json()).data.session.id as string;
    sessionIds.push(s1);

    // Stop session 1.
    const stop1 = await page.request.post("/api/detection/session/stop", {
      data: { sessionId: s1 },
    });
    expect(stop1.status()).toBe(200);
    expect((await stop1.json()).data.session.status).toBe("completed");

    // Device remains active — this is the core fix.
    expect(await deviceStatus()).toBe("active");

    // A second session starts immediately, with no admin reactivation.
    const start2 = await page.request.post("/api/detection/session/start", {
      data: { deviceId },
    });
    expect(start2.status()).toBe(200);
    const s2 = (await start2.json()).data.session.id as string;
    sessionIds.push(s2);
    await page.request.post("/api/detection/session/stop", { data: { sessionId: s2 } });
    expect(await deviceStatus()).toBe("active");
  });

  test("admin CAN deactivate the device", async ({ page }) => {
    await loginAsAdmin(page);
    const res = await page.request.patch(`/api/devices/${deviceId}`, {
      data: { status: "inactive" },
    });
    expect(res.status()).toBe(200);
    expect(await deviceStatus()).toBe("inactive");
    // Restore for other tests.
    await admin.from("devices").update({ status: "active" }).eq("id", deviceId!);
  });

  test("a non-admin cannot change device status via a crafted request (403)", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    // Create a throwaway non-admin user and a device they own.
    const email = `e2e-fielduser-${Date.now()}@example.com`;
    const password = `Fld-${Date.now()}-pw`;
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    const authUserId = created!.user!.id;

    // Ensure the profile is a plain user.
    await admin
      .from("profiles")
      .update({ role: "user" })
      .eq("auth_user_id", authUserId);
    const { data: prof } = await admin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    const fieldProfileId = prof!.id as string;

    const { data: fieldDevice } = await admin
      .from("devices")
      .insert({
        user_id: fieldProfileId,
        device_name: "E2E field device",
        device_type: "test_device",
        status: "active",
      })
      .select("id")
      .single();
    const fieldDeviceId = fieldDevice!.id as string;

    const ctx = await browser.newContext();
    try {
      const p = await ctx.newPage();
      await p.goto("/login");
      await p.locator('input[type="email"]').fill(email);
      await p.locator('input[type="password"]').fill(password);
      await p.getByRole("button", { name: /sign in/i }).click();
      await p.waitForURL(/\/dashboard/, { timeout: 20_000 });

      // Field user tries to deactivate their OWN device → must be forbidden.
      const res = await p.request.patch(`/api/devices/${fieldDeviceId}`, {
        data: { status: "inactive" },
      });
      expect(res.status()).toBe(403);
      // Status unchanged in the DB.
      const { data: d } = await admin
        .from("devices")
        .select("status")
        .eq("id", fieldDeviceId)
        .maybeSingle();
      expect(d!.status).toBe("active");

      // The DELETE (soft-deactivate) path is also admin-only.
      const del = await p.request.delete(`/api/devices/${fieldDeviceId}`);
      expect(del.status()).toBe(403);
    } finally {
      await ctx.close();
      await admin.from("devices").delete().eq("id", fieldDeviceId);
      await admin.auth.admin.deleteUser(authUserId);
    }
  });
});
