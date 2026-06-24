import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { writeSystemLog } from "@/lib/logging";
import { runDetection } from "@/lib/ai/client";
import { buildAiRequest } from "@/lib/ai/contract";
import { createSignedFrameUrl } from "@/lib/storage/signed-urls";
import { groupDetectionIntoSign } from "@/lib/localization/grouping";
import type { DetectionEvent, DetectionSession } from "@/lib/types/database";

export const runtime = "nodejs";
// Frames can be large; allow a slightly bigger body for base64 images.
export const maxDuration = 30;

interface FrameBody {
  sessionId: string;
  deviceId?: string | null;
  // data URL ("data:image/jpeg;base64,...") or raw base64
  imageBase64: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  capturedAt?: string;
}

function base64ToBuffer(input: string): Buffer {
  const comma = input.indexOf(",");
  const raw = input.startsWith("data:") && comma >= 0 ? input.slice(comma + 1) : input;
  return Buffer.from(raw, "base64");
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// POST /api/detection/frame
// Receives a captured frame + GPS metadata, runs the full pipeline:
// upload → AI detect → save events → device log → grouping → session counters.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);

  const body = (await req.json().catch(() => null)) as FrameBody | null;
  if (!body?.sessionId) return jsonError("sessionId is required");
  if (!body.imageBase64) return jsonError("imageBase64 is required");

  const admin = createSupabaseAdminClient();

  // Validate the session belongs to the caller and is active.
  const { data: sessionRow } = await admin
    .from("detection_sessions")
    .select("*")
    .eq("id", body.sessionId)
    .maybeSingle();
  if (!sessionRow) return jsonError("Session not found", 404);
  const session = sessionRow as DetectionSession;
  if (session.user_id !== ctx.profile.id && ctx.profile.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const deviceId = body.deviceId ?? session.device_id ?? null;
  const capturedAt = body.capturedAt ?? new Date().toISOString();

  // 1) Upload frame to Supabase Storage.
  let imageUrl: string | null = null;
  let imagePath: string | null = null;
  try {
    const buffer = base64ToBuffer(body.imageBase64);
    const path = `sessions/${body.sessionId}/${Date.now()}-${randomId()}.jpg`;
    imagePath = path;
    const { error: uploadErr } = await admin.storage
      .from(env.storageBucket())
      .upload(path, buffer, { contentType: "image/jpeg", upsert: false });
    if (uploadErr) throw uploadErr;

    // Short-lived signed URL for AI inference + immediate preview.
    // The bucket may be private; only the object PATH is persisted (below).
    imageUrl = await createSignedFrameUrl(path);

    await writeSystemLog(admin, {
      action: "IMAGE_UPLOADED",
      message: `Frame uploaded for session ${body.sessionId}`,
      userId: ctx.profile.id,
      deviceId,
      metadata: { path },
    });
  } catch (err) {
    await writeSystemLog(admin, {
      action: "ERROR",
      message: `Image upload failed: ${(err as Error).message}`,
      userId: ctx.profile.id,
      deviceId,
    });
    return jsonError(`Image upload failed: ${(err as Error).message}`, 500);
  }

  // 2) Save device location log + update device last-known position.
  if (body.latitude != null && body.longitude != null && deviceId) {
    await admin.from("device_location_logs").insert({
      device_id: deviceId,
      user_id: ctx.profile.id,
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.gpsAccuracy ?? null,
      speed: body.speed ?? null,
      heading: body.heading ?? null,
      recorded_at: capturedAt,
    });
    await admin
      .from("devices")
      .update({
        last_latitude: body.latitude,
        last_longitude: body.longitude,
        last_seen_at: capturedAt,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", deviceId);
    await writeSystemLog(admin, {
      action: "LOCATION_UPDATED",
      userId: ctx.profile.id,
      deviceId,
      metadata: { latitude: body.latitude, longitude: body.longitude },
    });
  }

  // 3) Call the AI model (mock | external | auto) with timeout + retry.
  const outcome = await runDetection(
    buildAiRequest({
      imageUrl: imageUrl!,
      imageId: imagePath,
      sessionId: body.sessionId,
      deviceId,
      timestamp: capturedAt,
      latitude: body.latitude,
      longitude: body.longitude,
      gpsAccuracy: body.gpsAccuracy,
      heading: body.heading,
      speed: body.speed,
    }),
  );

  // Persist the AI log events (added context). Best-effort.
  for (const log of outcome.logs) {
    await writeSystemLog(admin, { ...log, userId: ctx.profile.id, deviceId });
  }

  if (!outcome.ok) {
    // No fake detections are saved. The frame was still uploaded.
    // Map the error category to an appropriate HTTP status.
    const status =
      outcome.category === "config"
        ? 500
        : outcome.category === "timeout"
          ? 504
          : 502;
    return jsonError(outcome.message, status, {
      category: outcome.category,
      attempts: outcome.attempts,
      elapsedMs: outcome.elapsedMs,
      imageUrl,
    });
  }

  const ai = outcome.response;
  const usedMock = outcome.usedMock;

  // 4) Persist a detection_event per detection (or one empty event if none).
  const savedEvents: DetectionEvent[] = [];

  const baseRow = {
    session_id: body.sessionId,
    user_id: ctx.profile.id,
    device_id: deviceId,
    // Persist the object PATH (signed URLs are minted on read, never stored).
    image_path: imagePath,
    image_url: null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    gps_accuracy: body.gpsAccuracy ?? null,
    heading: body.heading ?? null,
    speed: body.speed ?? null,
    ai_response_raw: { ...ai, used_mock: usedMock } as unknown,
    ai_response_time_ms: ai.processing_time_ms ?? null,
  };

  for (const det of ai.detections) {
    const validationStatus = det.confidence < 0.45 ? "low_confidence" : "pending";
    const { data: inserted, error } = await admin
      .from("detection_events")
      .insert({
        ...baseRow,
        detected_class_id: det.class_id,
        detected_class_name: det.class_name,
        confidence: det.confidence,
        bbox_x: det.bbox?.x ?? null,
        bbox_y: det.bbox?.y ?? null,
        bbox_width: det.bbox?.width ?? null,
        bbox_height: det.bbox?.height ?? null,
        validation_status: validationStatus,
      })
      .select("*")
      .single();
    if (error) {
      await writeSystemLog(admin, {
        action: "ERROR",
        message: `Failed to save detection event: ${error.message}`,
        userId: ctx.profile.id,
        deviceId,
      });
      continue;
    }
    savedEvents.push(inserted as DetectionEvent);
  }

  await writeSystemLog(admin, {
    action: "DETECTION_SAVED",
    message: `Saved ${savedEvents.length} detection event(s)`,
    userId: ctx.profile.id,
    deviceId,
    metadata: { session_id: body.sessionId },
  });

  // 5) Group each detection into the optimized traffic-sign inventory.
  const grouping = [];
  for (const ev of savedEvents) {
    try {
      const result = await groupDetectionIntoSign(admin, ev);
      if (result) grouping.push(result);
    } catch (err) {
      await writeSystemLog(admin, {
        action: "ERROR",
        message: `Grouping failed: ${(err as Error).message}`,
        userId: ctx.profile.id,
        deviceId,
      });
    }
  }

  // 6) Update session counters.
  const newTotalFrames = session.total_frames + 1;
  const newTotalDetections = session.total_detections + savedEvents.length;
  const confidences = savedEvents
    .map((e) => e.confidence)
    .filter((c): c is number => c != null);
  const batchAvg =
    confidences.length > 0 ? confidences.reduce((s, c) => s + c, 0) / confidences.length : null;
  // Running average across the session (approximate, weighted by detections).
  const prevAvg = session.average_confidence;
  const avgConfidence =
    batchAvg == null
      ? prevAvg
      : prevAvg == null
        ? batchAvg
        : (prevAvg * session.total_detections + batchAvg * confidences.length) /
          Math.max(newTotalDetections, 1);

  await admin
    .from("detection_sessions")
    .update({
      total_frames: newTotalFrames,
      total_detections: newTotalDetections,
      average_confidence: avgConfidence,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.sessionId);

  return jsonOk({
    imageUrl,
    usedMock,
    processingTimeMs: ai.processing_time_ms,
    detections: savedEvents.map((e) => ({
      id: e.id,
      className: e.detected_class_name,
      confidence: e.confidence,
      validationStatus: e.validation_status,
      // All detections in a frame share the one signed preview URL.
      imageUrl,
      bbox: {
        x: e.bbox_x,
        y: e.bbox_y,
        width: e.bbox_width,
        height: e.bbox_height,
      },
    })),
    grouping,
  });
}
