import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { writeSystemLog } from "@/lib/logging";
import { extractStoragePathFromKnownValue } from "@/lib/storage/signed-urls";
import { haversineMeters } from "./haversine";
import type {
  DetectionEvent,
  TrafficSign,
  TrafficSignObservation,
} from "@/lib/types/database";

const AUTO_VERIFY_MIN_OBSERVATIONS = 3;
const AUTO_VERIFY_MIN_AVG_CONFIDENCE = 0.75;

export interface GroupingResult {
  trafficSignId: string;
  created: boolean;
  distanceMeters: number | null;
  verificationStatus: string;
}

// Weighted average where weight = confidence / max(gps_accuracy, 1).
// Falls back to a simple mean when no usable weights are present.
function weightedAverage(
  rows: Array<{ value: number; confidence: number | null; accuracy: number | null }>,
): number {
  let weightSum = 0;
  let acc = 0;
  for (const r of rows) {
    const conf = r.confidence ?? 0.5;
    const accuracy = Math.max(r.accuracy ?? 1, 1);
    const w = conf / accuracy;
    weightSum += w;
    acc += w * r.value;
  }
  if (weightSum === 0) {
    return rows.reduce((s, r) => s + r.value, 0) / Math.max(rows.length, 1);
  }
  return acc / weightSum;
}

/**
 * Groups a freshly-saved detection event into the optimized `traffic_signs`
 * inventory (see ARCHITECTURE.md §10).
 *
 * - Matches by identical sign type within SIGN_MATCH_RADIUS_METERS (Haversine).
 * - Attaches the event as a `traffic_sign_observation` or creates a new sign.
 * - Recomputes the sign location via weighted averaging of its observations.
 * - Auto-verifies when >= 3 observations and avg confidence > 0.75.
 *
 * Requires an admin (service-role) client so it can write across tables.
 * Returns null when the event lacks the data needed for grouping.
 */
export async function groupDetectionIntoSign(
  admin: SupabaseClient,
  event: DetectionEvent,
): Promise<GroupingResult | null> {
  const { latitude, longitude, detected_class_name, confidence } = event;

  if (
    latitude == null ||
    longitude == null ||
    !detected_class_name ||
    confidence == null
  ) {
    return null;
  }

  // Skip very low-confidence detections from the inventory entirely.
  if (confidence < env.minGroupingConfidence()) {
    return null;
  }

  const radius = env.signMatchRadiusMeters();

  // Candidate signs of the same type. For an MVP this full-type scan is fine;
  // at scale, replace with a PostGIS spatial index query.
  const { data: candidates } = await admin
    .from("traffic_signs")
    .select("*")
    .eq("sign_type", detected_class_name);

  let matched: TrafficSign | null = null;
  let matchedDistance = Number.POSITIVE_INFINITY;

  for (const sign of (candidates ?? []) as TrafficSign[]) {
    const d = haversineMeters(latitude, longitude, sign.latitude, sign.longitude);
    if (d <= radius && d < matchedDistance) {
      matched = sign;
      matchedDistance = d;
    }
  }

  if (!matched) {
    // No nearby sign of this type → create a new inventory record.
    const { data: inserted, error } = await admin
      .from("traffic_signs")
      .insert({
        sign_type: detected_class_name,
        latitude,
        longitude,
        confidence_score: confidence,
        first_detected_at: event.created_at,
        last_detected_at: event.created_at,
        detection_count: 1,
        verification_status: "pending",
        // Store the object PATH; signed URLs are minted on read.
        representative_image_path:
          event.image_path ?? extractStoragePathFromKnownValue(event.image_url),
        representative_image_url: null,
      })
      .select("*")
      .single();

    if (error || !inserted) {
      throw new Error(`Failed to create traffic sign: ${error?.message}`);
    }

    const sign = inserted as TrafficSign;

    await admin.from("traffic_sign_observations").insert({
      traffic_sign_id: sign.id,
      detection_event_id: event.id,
      distance_to_sign_meters: 0,
      confidence,
    });

    await writeSystemLog(admin, {
      action: "TRAFFIC_SIGN_CREATED",
      message: `Created sign '${detected_class_name}'`,
      userId: event.user_id,
      deviceId: event.device_id,
      metadata: { traffic_sign_id: sign.id, latitude, longitude, confidence },
    });

    return {
      trafficSignId: sign.id,
      created: true,
      distanceMeters: 0,
      verificationStatus: sign.verification_status,
    };
  }

  // Attach as a new observation of the matched sign.
  await admin.from("traffic_sign_observations").insert({
    traffic_sign_id: matched.id,
    detection_event_id: event.id,
    distance_to_sign_meters: matchedDistance,
    confidence,
  });

  // Recompute location + confidence from all observations of this sign.
  const { data: observations } = await admin
    .from("traffic_sign_observations")
    .select("*, detection_events(latitude, longitude, gps_accuracy, confidence)")
    .eq("traffic_sign_id", matched.id);

  type ObsRow = TrafficSignObservation & {
    detection_events: {
      latitude: number | null;
      longitude: number | null;
      gps_accuracy: number | null;
      confidence: number | null;
    } | null;
  };

  const obsRows = (observations ?? []) as unknown as ObsRow[];
  const usable = obsRows
    .map((o) => o.detection_events)
    .filter((e): e is NonNullable<ObsRow["detection_events"]> =>
      e != null && e.latitude != null && e.longitude != null,
    );

  const latPoints = usable.map((e) => ({
    value: e.latitude!,
    confidence: e.confidence,
    accuracy: e.gps_accuracy,
  }));
  const lonPoints = usable.map((e) => ({
    value: e.longitude!,
    confidence: e.confidence,
    accuracy: e.gps_accuracy,
  }));

  const newLat = usable.length > 0 ? weightedAverage(latPoints) : matched.latitude;
  const newLon = usable.length > 0 ? weightedAverage(lonPoints) : matched.longitude;

  const confValues = usable
    .map((e) => e.confidence)
    .filter((c): c is number => c != null);
  const avgConfidence =
    confValues.length > 0
      ? confValues.reduce((s, c) => s + c, 0) / confValues.length
      : matched.confidence_score;

  const detectionCount = obsRows.length;

  let verificationStatus = matched.verification_status;
  // Only auto-promote while still pending; never override a human decision.
  if (
    verificationStatus === "pending" &&
    detectionCount >= AUTO_VERIFY_MIN_OBSERVATIONS &&
    (avgConfidence ?? 0) > AUTO_VERIFY_MIN_AVG_CONFIDENCE
  ) {
    verificationStatus = "auto_verified";
  }

  await admin
    .from("traffic_signs")
    .update({
      latitude: newLat,
      longitude: newLon,
      confidence_score: avgConfidence,
      detection_count: detectionCount,
      last_detected_at: event.created_at,
      verification_status: verificationStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matched.id);

  await writeSystemLog(admin, {
    action: "TRAFFIC_SIGN_UPDATED",
    message: `Updated sign '${detected_class_name}' (${detectionCount} observations)`,
    userId: event.user_id,
    deviceId: event.device_id,
    metadata: {
      traffic_sign_id: matched.id,
      detection_count: detectionCount,
      avg_confidence: avgConfidence,
      verification_status: verificationStatus,
      distance_meters: matchedDistance,
    },
  });

  return {
    trafficSignId: matched.id,
    created: false,
    distanceMeters: matchedDistance,
    verificationStatus,
  };
}
