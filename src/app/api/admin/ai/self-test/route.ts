import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { runDetection } from "@/lib/ai/client";
import { buildAiRequest, modelHostname } from "@/lib/ai/contract";
import { createSignedFrameUrl } from "@/lib/storage/signed-urls";
import { env } from "@/lib/env";
import type { DetectionEvent } from "@/lib/types/database";

export const runtime = "nodejs";
export const maxDuration = 30;

function rand(): string {
  return Math.random().toString(36).slice(2, 10);
}

// POST /api/admin/ai/self-test
// Validates the configured AI server contract WITHOUT creating any production
// detection_events / traffic_signs / observations.
//   - multipart/form-data with `file`  -> Option A (upload a test image)
//   - JSON { detectionEventId }         -> Option B (reuse an existing frame)
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const contentType = req.headers.get("content-type") || "";

  let signedUrl: string | null = null;
  let imageId: string | null = null;
  let uploadedPath: string | null = null;
  let source: "upload" | "detection_event" = "upload";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return jsonError("A test image file is required", 400);
      if (file.size === 0) return jsonError("The uploaded file is empty", 400);
      if (file.size > 8 * 1024 * 1024) return jsonError("Image too large (max 8MB)", 400);
      if (!file.type.startsWith("image/")) return jsonError("File must be an image", 400);

      const buffer = Buffer.from(await file.arrayBuffer());
      const path = `ai-self-tests/${ctx.profile.id}/${Date.now()}-${rand()}.jpg`;
      const { error: upErr } = await admin.storage
        .from(env.storageBucket())
        .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: false });
      if (upErr) return jsonError(`Upload failed: ${upErr.message}`, 500);
      uploadedPath = path;
      imageId = path;
      signedUrl = await createSignedFrameUrl(path);
    } else {
      const body = (await req.json().catch(() => null)) as { detectionEventId?: string } | null;
      const id = body?.detectionEventId?.trim();
      if (!id) return jsonError("Provide an image file or a detectionEventId", 400);
      source = "detection_event";
      const { data: ev } = await admin
        .from("detection_events")
        .select("image_path, image_url")
        .eq("id", id)
        .maybeSingle();
      if (!ev) return jsonError("Detection event not found", 404);
      const e = ev as Pick<DetectionEvent, "image_path" | "image_url">;
      const stored = e.image_path ?? e.image_url;
      if (!stored) return jsonError("That detection event has no image", 400);
      imageId = e.image_path ?? null;
      signedUrl = await createSignedFrameUrl(stored);
    }
  } catch (err) {
    return jsonError(`Self-test input error: ${(err as Error).message}`, 400);
  }

  if (!signedUrl) return jsonError("Could not prepare a test image URL", 500);

  await writeSystemLog(admin, {
    action: "AI_SELF_TEST_STARTED",
    message: `AI self-test started (source=${source})`,
    userId: ctx.profile.id,
    metadata: { source },
  });

  const outcome = await runDetection(
    buildAiRequest({
      imageUrl: signedUrl,
      imageId,
      sessionId: `self-test-${Date.now()}`,
      deviceId: null,
      timestamp: new Date().toISOString(),
    }),
  );

  // Clean up the uploaded test image (best-effort). The AI call already
  // completed, so the (now-deleted) object was only needed transiently.
  if (uploadedPath) {
    await admin.storage.from(env.storageBucket()).remove([uploadedPath]).catch(() => {});
  }

  // We deliberately do NOT persist outcome.logs (internal AI_REQUEST_* events)
  // so self-tests never pollute production AI request analytics. Only the
  // AI_SELF_TEST_* summary events are logged, with safe metadata.
  const host = modelHostname(env.aiModelApiUrl());

  if (!outcome.ok) {
    const category = outcome.category === "invalid_response" ? "validation" : outcome.category;
    await writeSystemLog(admin, {
      action: "AI_SELF_TEST_FAILED",
      message: `Self-test failed: ${outcome.message}`,
      userId: ctx.profile.id,
      metadata: {
        mode: outcome.mode,
        category,
        attempts: outcome.attempts,
        elapsedMs: outcome.elapsedMs,
        host,
        source,
      },
    });
    const status =
      outcome.category === "config" ? 500 : outcome.category === "timeout" ? 504 : 502;
    return jsonError(outcome.message, status, {
      category,
      attempts: outcome.attempts,
      elapsedMs: outcome.elapsedMs,
      mode: outcome.mode,
    });
  }

  const r = outcome.response;
  await writeSystemLog(admin, {
    action: "AI_SELF_TEST_SUCCEEDED",
    message: `Self-test passed: ${r.detections.length} detection(s)`,
    userId: ctx.profile.id,
    metadata: {
      mode: outcome.mode,
      attempts: outcome.attempts,
      elapsedMs: outcome.elapsedMs,
      detectionCount: r.detections.length,
      modelVersion: r.model_version,
      host,
      usedMock: outcome.usedMock,
      source,
    },
  });

  return jsonOk({
    mode: outcome.mode,
    usedMock: outcome.usedMock,
    elapsedMs: outcome.elapsedMs,
    attempts: outcome.attempts,
    modelVersion: r.model_version,
    processingTimeMs: r.processing_time_ms,
    detections: r.detections,
    message: "Contract self-test passed",
  });
}
