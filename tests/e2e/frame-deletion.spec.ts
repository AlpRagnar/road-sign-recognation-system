import { test, expect, type APIRequestContext } from "@playwright/test";
import { hasAdminCreds, SKIP_AUTH_MSG } from "./helpers/env";
import { loginAsAdmin } from "./helpers/auth";
import {
  hasServiceRole,
  SKIP_SERVICE_MSG,
  serviceClient,
  adminProfileId,
} from "./helpers/service";

// Integration tests for permanent frame deletion (task §2.4). They seed real
// rows with the service-role client, drive the admin-only endpoint through an
// authenticated browser session, and verify the exact deletion semantics.
// They skip cleanly unless admin creds + a service-role key are provided.

test.describe("permanent frame deletion", () => {
  test.skip(!hasAdminCreds, SKIP_AUTH_MSG);
  test.skip(!hasServiceRole, SKIP_SERVICE_MSG);

  const admin = serviceClient();
  const createdEventIds: string[] = [];
  const createdSignIds: string[] = [];
  let sessionId: string | null = null;
  let deviceId: string | null = null;
  let profileId: string | null = null;

  test.beforeAll(async () => {
    profileId = await adminProfileId(admin);
    expect(profileId, "admin profile must exist").toBeTruthy();

    const { data: device } = await admin
      .from("devices")
      .insert({
        user_id: profileId,
        device_name: "E2E frame-delete device",
        device_type: "test_device",
        status: "active",
      })
      .select("id")
      .single();
    deviceId = device!.id as string;

    const { data: session } = await admin
      .from("detection_sessions")
      .insert({ user_id: profileId, device_id: deviceId, status: "active" })
      .select("id")
      .single();
    sessionId = session!.id as string;
  });

  test.afterAll(async () => {
    // Best-effort teardown (order respects FKs; cascades cover the rest).
    if (createdEventIds.length) {
      await admin.from("traffic_sign_observations").delete().in("detection_event_id", createdEventIds);
      await admin.from("detection_events").delete().in("id", createdEventIds);
    }
    if (createdSignIds.length) await admin.from("traffic_signs").delete().in("id", createdSignIds);
    if (sessionId) await admin.from("detection_sessions").delete().eq("id", sessionId);
    if (deviceId) await admin.from("devices").delete().eq("id", deviceId);
  });

  // Seeds a frame: N detection events sharing one image_path, grouped into one
  // traffic_sign with one observation each. Returns ids.
  async function seedFrame(
    imagePath: string,
    count: number,
  ): Promise<{ eventIds: string[]; signId: string }> {
    const baseRow = {
      session_id: sessionId,
      user_id: profileId,
      device_id: deviceId,
      image_path: imagePath,
      image_url: null,
      latitude: 57.05,
      longitude: 9.92,
      confidence: 0.9,
      detected_class_id: 150,
      detected_class_name: "Maximum Speed Limit 60",
      validation_status: "pending",
    };
    const eventIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const { data } = await admin.from("detection_events").insert(baseRow).select("id").single();
      eventIds.push(data!.id as string);
      createdEventIds.push(data!.id as string);
    }
    const { data: sign } = await admin
      .from("traffic_signs")
      .insert({
        sign_type: "Maximum Speed Limit 60",
        latitude: 57.05,
        longitude: 9.92,
        confidence_score: 0.9,
        detection_count: count,
        verification_status: "pending",
        representative_image_path: imagePath,
      })
      .select("id")
      .single();
    const signId = sign!.id as string;
    createdSignIds.push(signId);
    for (const eid of eventIds) {
      await admin.from("traffic_sign_observations").insert({
        traffic_sign_id: signId,
        detection_event_id: eid,
        confidence: 0.9,
      });
    }
    return { eventIds, signId };
  }

  async function deleteFrame(request: APIRequestContext, eventId: string) {
    const res = await request.delete(`/api/admin/detections/${eventId}/frame`);
    return { status: res.status(), body: await res.json() };
  }

  test("deletes a single-detection frame and its observation + orphan sign", async ({ page }) => {
    await loginAsAdmin(page);
    const path = `sessions/${sessionId}/e2e-single-${Date.now()}.jpg`;
    const { eventIds, signId } = await seedFrame(path, 1);

    const { status, body } = await deleteFrame(page.request, eventIds[0]!);
    expect(status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.deletedEvents).toBe(1);
    expect(body.data.deletedObservations).toBe(1);
    expect(body.data.deletedSigns).toBe(1);

    const { count: evCount } = await admin
      .from("detection_events")
      .select("*", { count: "exact", head: true })
      .in("id", eventIds);
    expect(evCount).toBe(0);
    const { data: sign } = await admin.from("traffic_signs").select("id").eq("id", signId).maybeSingle();
    expect(sign).toBeNull();
  });

  test("deletes ALL detections that share one image (frame group)", async ({ page }) => {
    await loginAsAdmin(page);
    const path = `sessions/${sessionId}/e2e-multi-${Date.now()}.jpg`;
    const { eventIds } = await seedFrame(path, 3);

    // Deleting via ONE of the rows must remove the whole group.
    const { status, body } = await deleteFrame(page.request, eventIds[0]!);
    expect(status).toBe(200);
    expect(body.data.deletedEvents).toBe(3);
    expect(body.data.deletedObservations).toBe(3);

    const { count } = await admin
      .from("detection_events")
      .select("*", { count: "exact", head: true })
      .in("id", eventIds);
    expect(count).toBe(0);
  });

  test("retains + recomputes a sign that still has observations from another frame", async ({ page }) => {
    await loginAsAdmin(page);
    // Two frames grouped into the SAME sign.
    const pathA = `sessions/${sessionId}/e2e-keepA-${Date.now()}.jpg`;
    const pathB = `sessions/${sessionId}/e2e-keepB-${Date.now()}.jpg`;
    const { eventIds: aEvents, signId } = await seedFrame(pathA, 1);
    // Second frame → new events + observation attached to the SAME sign.
    const { data: evB } = await admin
      .from("detection_events")
      .insert({
        session_id: sessionId,
        user_id: profileId,
        device_id: deviceId,
        image_path: pathB,
        latitude: 57.05,
        longitude: 9.92,
        confidence: 0.8,
        detected_class_id: 150,
        detected_class_name: "Maximum Speed Limit 60",
        validation_status: "pending",
      })
      .select("id")
      .single();
    createdEventIds.push(evB!.id as string);
    await admin.from("traffic_sign_observations").insert({
      traffic_sign_id: signId,
      detection_event_id: evB!.id as string,
      confidence: 0.8,
    });

    // Delete frame A only.
    const { status, body } = await deleteFrame(page.request, aEvents[0]!);
    expect(status).toBe(200);
    expect(body.data.deletedSigns).toBe(0); // sign kept — still has frame B

    const { data: sign } = await admin
      .from("traffic_signs")
      .select("id, detection_count")
      .eq("id", signId)
      .maybeSingle();
    expect(sign).not.toBeNull();
    expect(sign!.detection_count).toBe(1); // recomputed from remaining observation
  });

  test("missing event returns a clean 404", async ({ page }) => {
    await loginAsAdmin(page);
    const res = await page.request.delete(
      "/api/admin/detections/00000000-0000-0000-0000-000000000000/frame",
    );
    expect(res.status()).toBe(404);
    expect((await res.json()).ok).toBe(false);
  });

  test("Reject only changes status; it does NOT delete the image/row", async ({ page }) => {
    await loginAsAdmin(page);
    const path = `sessions/${sessionId}/e2e-reject-${Date.now()}.jpg`;
    const { eventIds } = await seedFrame(path, 1);

    const res = await page.request.patch(`/api/admin/detections/${eventIds[0]}`, {
      data: { status: "rejected" },
    });
    expect(res.status()).toBe(200);

    const { data: ev } = await admin
      .from("detection_events")
      .select("id, validation_status, image_path")
      .eq("id", eventIds[0]!)
      .maybeSingle();
    expect(ev).not.toBeNull();
    expect(ev!.validation_status).toBe("rejected");
    expect(ev!.image_path).toBe(path); // image reference preserved
  });
});
