import type { SupabaseClient } from "@supabase/supabase-js";

// =====================================================================
// SERVER-ONLY deterministic demo data generator. Never import into client
// components. Uses the service-role client (passed in by the admin route).
//
// Demo identification (no schema changes):
//   - devices:        device_identifier starts with "DEMO-"
//   - sessions:       device_id ∈ demo devices
//   - events:         session_id ∈ demo sessions (also ai_response_raw.demo=true)
//   - observations:   detection_event_id ∈ demo events
//   - traffic_signs:  signs whose observations are ALL demo
//   - location logs:  device_id ∈ demo devices
//   - system_logs:    metadata.demo = true
//   - snapshots:      dates recorded in the latest ADMIN_DEMO_SEEDED manifest
// =====================================================================

export const DEMO_VERSION = "task-015";
export const DEMO_DEVICE_PREFIX = "DEMO-";

const AALBORG = { lat: 57.0488, lng: 9.9217 };

const SIGN_TYPES = [
  "Speed Limit 30",
  "Speed Limit 50",
  "Stop",
  "Yield",
  "No Entry",
  "Pedestrian Crossing",
  "Roundabout",
  "Parking",
  "School Zone",
  "Road Work",
];

const SIGN_CLASS_ID: Record<string, number> = {
  "Speed Limit 30": 11,
  "Speed Limit 50": 14,
  Stop: 1,
  Yield: 13,
  "No Entry": 17,
  "Pedestrian Crossing": 27,
  Roundabout: 40,
  Parking: 38,
  "School Zone": 28,
  "Road Work": 25,
};

const DEVICE_SPECS: Array<{ name: string; type: string }> = [
  { name: "Vehicle Cam – Patrol 1", type: "vehicle_camera" },
  { name: "Field Phone – Surveyor", type: "mobile_phone" },
  { name: "Dashcam – Van 7", type: "dashcam" },
  { name: "IoT Node – Bridge", type: "custom_iot_device" },
];

export interface DemoCounts {
  devices: number;
  sessions: number;
  events: number;
  signs: number;
  observations: number;
  locationLogs: number;
  systemLogs: number;
  snapshots: number;
}

// Deterministic PRNG (mulberry32) so repeated seeds produce the same layout.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDaysAgo(days: number, rng?: () => number): string {
  const ms = days * 86_400_000 - (rng ? Math.floor(rng() * 86_400_000) : 0);
  return new Date(Date.now() - ms).toISOString();
}

function dateOnlyDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------
// Clear (only demo-marked rows, FK-safe order)
// ---------------------------------------------------------------------
export async function clearDemoData(admin: SupabaseClient): Promise<DemoCounts> {
  const counts: DemoCounts = {
    devices: 0,
    sessions: 0,
    events: 0,
    signs: 0,
    observations: 0,
    locationLogs: 0,
    systemLogs: 0,
    snapshots: 0,
  };

  // Read snapshot dates from the latest manifest BEFORE deleting system_logs.
  const { data: manifest } = await admin
    .from("system_logs")
    .select("metadata")
    .eq("action_type", "ADMIN_DEMO_SEEDED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const snapshotDates: string[] = Array.isArray(
    (manifest?.metadata as Record<string, unknown> | undefined)?.snapshotDates,
  )
    ? ((manifest!.metadata as Record<string, unknown>).snapshotDates as string[])
    : [];

  // 1) demo device ids
  const { data: devs } = await admin
    .from("devices")
    .select("id")
    .like("device_identifier", `${DEMO_DEVICE_PREFIX}%`);
  const deviceIds = (devs ?? []).map((d) => d.id as string);

  // 2) demo session ids
  let sessionIds: string[] = [];
  if (deviceIds.length > 0) {
    const { data: sess } = await admin
      .from("detection_sessions")
      .select("id")
      .in("device_id", deviceIds);
    sessionIds = (sess ?? []).map((s) => s.id as string);
  }

  // 3) demo event ids
  let eventIds: string[] = [];
  if (sessionIds.length > 0) {
    const { data: evs } = await admin
      .from("detection_events")
      .select("id")
      .in("session_id", sessionIds);
    eventIds = (evs ?? []).map((e) => e.id as string);
  }

  // 4) demo sign ids = signs whose observations are ALL demo
  let signIds: string[] = [];
  if (eventIds.length > 0) {
    const eventSet = new Set(eventIds);
    const { data: candObs } = await admin
      .from("traffic_sign_observations")
      .select("traffic_sign_id, detection_event_id")
      .in("detection_event_id", eventIds);
    const candidateSignIds = [...new Set((candObs ?? []).map((o) => o.traffic_sign_id as string))];
    if (candidateSignIds.length > 0) {
      const { data: allObs } = await admin
        .from("traffic_sign_observations")
        .select("traffic_sign_id, detection_event_id")
        .in("traffic_sign_id", candidateSignIds);
      const nonDemo = new Set<string>();
      for (const o of allObs ?? []) {
        if (!eventSet.has(o.detection_event_id as string)) nonDemo.add(o.traffic_sign_id as string);
      }
      signIds = candidateSignIds.filter((id) => !nonDemo.has(id));
    }
  }

  // 5) observations of demo events
  if (eventIds.length > 0) {
    const { count } = await admin
      .from("traffic_sign_observations")
      .delete({ count: "exact" })
      .in("detection_event_id", eventIds);
    counts.observations = count ?? 0;
  }
  // 6) demo signs
  if (signIds.length > 0) {
    const { count } = await admin
      .from("traffic_signs")
      .delete({ count: "exact" })
      .in("id", signIds);
    counts.signs = count ?? 0;
  }
  // 7) demo events
  if (eventIds.length > 0) {
    const { count } = await admin
      .from("detection_events")
      .delete({ count: "exact" })
      .in("id", eventIds);
    counts.events = count ?? 0;
  }
  // 8) demo location logs
  if (deviceIds.length > 0) {
    const { count } = await admin
      .from("device_location_logs")
      .delete({ count: "exact" })
      .in("device_id", deviceIds);
    counts.locationLogs = count ?? 0;
  }
  // 9) demo sessions
  if (sessionIds.length > 0) {
    const { count } = await admin
      .from("detection_sessions")
      .delete({ count: "exact" })
      .in("id", sessionIds);
    counts.sessions = count ?? 0;
  }
  // 10) demo devices
  if (deviceIds.length > 0) {
    const { count } = await admin
      .from("devices")
      .delete({ count: "exact" })
      .in("id", deviceIds);
    counts.devices = count ?? 0;
  }
  // 11) demo snapshots (only dates we created)
  if (snapshotDates.length > 0) {
    const { count } = await admin
      .from("daily_metrics_snapshots")
      .delete({ count: "exact" })
      .in("snapshot_date", snapshotDates);
    counts.snapshots = count ?? 0;
  }
  // 12) demo system logs (incl. manifest)
  {
    const { count } = await admin
      .from("system_logs")
      .delete({ count: "exact" })
      .filter("metadata->>demo", "eq", "true");
    counts.systemLogs = count ?? 0;
  }

  return counts;
}

// ---------------------------------------------------------------------
// Seed (clear-then-insert for safe repeatability)
// ---------------------------------------------------------------------
export async function seedDemoData(
  admin: SupabaseClient,
  ownerProfileId: string,
): Promise<DemoCounts> {
  await clearDemoData(admin);

  const rng = makeRng(20150601);
  const counts: DemoCounts = {
    devices: 0,
    sessions: 0,
    events: 0,
    signs: 0,
    observations: 0,
    locationLogs: 0,
    systemLogs: 0,
    snapshots: 0,
  };

  // --- Devices ---
  const deviceRows = DEVICE_SPECS.map((d, i) => ({
    user_id: ownerProfileId,
    device_name: d.name,
    device_type: d.type,
    device_identifier: `${DEMO_DEVICE_PREFIX}${1001 + i}`,
    last_latitude: AALBORG.lat + (rng() - 0.5) * 0.05,
    last_longitude: AALBORG.lng + (rng() - 0.5) * 0.05,
    last_seen_at: isoDaysAgo(0, rng),
    status: i < 3 ? "active" : "inactive",
  }));
  const { data: devices } = await admin.from("devices").insert(deviceRows).select("id");
  const deviceIds = (devices ?? []).map((d) => d.id as string);
  counts.devices = deviceIds.length;

  // --- Sessions (6, across recent dates) ---
  const sessionRows = Array.from({ length: 6 }, (_, i) => {
    const started = isoDaysAgo(i, rng);
    return {
      user_id: ownerProfileId,
      device_id: deviceIds[i % deviceIds.length] ?? null,
      started_at: started,
      ended_at: i === 0 ? null : isoDaysAgo(i, rng),
      status: i === 0 ? "active" : "completed",
      total_frames: 20 + Math.floor(rng() * 30),
      total_detections: 10 + Math.floor(rng() * 20),
      average_confidence: Number((0.7 + rng() * 0.25).toFixed(3)),
      created_at: started,
    };
  });
  const { data: sessions } = await admin
    .from("detection_sessions")
    .insert(sessionRows)
    .select("id");
  const sessionIds = (sessions ?? []).map((s) => s.id as string);
  counts.sessions = sessionIds.length;

  // --- Traffic signs (35, scattered ~3km around Aalborg) ---
  const signRows = Array.from({ length: 35 }, (_, i) => {
    const signType = SIGN_TYPES[i % SIGN_TYPES.length]!;
    const lat = AALBORG.lat + (rng() - 0.5) * 0.05;
    const lng = AALBORG.lng + (rng() - 0.5) * 0.08;
    const detCount = 1 + Math.floor(rng() * 6);
    const conf = Number((0.6 + rng() * 0.39).toFixed(3));
    const first = isoDaysAgo(6, rng);
    const last = isoDaysAgo(Math.floor(rng() * 3), rng);
    // Realistic verification mix.
    const roll = rng();
    const status =
      detCount >= 3 && conf > 0.75
        ? "auto_verified"
        : roll < 0.15
          ? "rejected"
          : roll < 0.25
            ? "duplicate"
            : roll < 0.5
              ? "manually_verified"
              : "pending";
    return {
      sign_type: signType,
      latitude: lat,
      longitude: lng,
      confidence_score: conf,
      first_detected_at: first,
      last_detected_at: last,
      detection_count: detCount,
      verification_status: status,
      representative_image_url: null,
      representative_image_path: null,
      created_at: first,
    };
  });
  const { data: signs } = await admin
    .from("traffic_signs")
    .insert(signRows)
    .select("id, sign_type, latitude, longitude");
  const signList = (signs ?? []) as Array<{
    id: string;
    sign_type: string;
    latitude: number;
    longitude: number;
  }>;
  counts.signs = signList.length;

  // --- Detection events (~120) + observations (one per event, linked to a sign) ---
  const eventRows: Record<string, unknown>[] = [];
  const eventSignPairs: number[] = []; // index into signList for each event
  const EVENT_COUNT = 120;
  for (let i = 0; i < EVENT_COUNT; i++) {
    const signIdx = Math.floor(rng() * signList.length);
    const sign = signList[signIdx]!;
    const conf = Number((0.4 + rng() * 0.59).toFixed(3));
    const lowConf = conf < 0.45;
    const roll = rng();
    const validation = lowConf
      ? "low_confidence"
      : roll < 0.08
        ? "rejected"
        : roll < 0.16
          ? "manually_verified"
          : "pending";
    const createdAt = isoDaysAgo(Math.floor(rng() * 7), rng);
    eventRows.push({
      session_id: sessionIds[i % sessionIds.length] ?? null,
      user_id: ownerProfileId,
      device_id: deviceIds[i % deviceIds.length] ?? null,
      image_url: null,
      image_path: null,
      latitude: sign.latitude + (rng() - 0.5) * 0.0004,
      longitude: sign.longitude + (rng() - 0.5) * 0.0004,
      gps_accuracy: Number((3 + rng() * 12).toFixed(1)),
      heading: Number((rng() * 360).toFixed(1)),
      speed: Number((rng() * 18).toFixed(1)),
      detected_class_id: SIGN_CLASS_ID[sign.sign_type] ?? 0,
      detected_class_name: sign.sign_type,
      confidence: conf,
      bbox_x: Math.floor(rng() * 400),
      bbox_y: Math.floor(rng() * 300),
      bbox_width: 48 + Math.floor(rng() * 80),
      bbox_height: 48 + Math.floor(rng() * 80),
      ai_response_raw: { demo: true, demoSeedVersion: DEMO_VERSION, used_mock: true },
      ai_response_time_ms: 60 + Math.floor(rng() * 240),
      validation_status: validation,
      created_at: createdAt,
    });
    eventSignPairs.push(signIdx);
  }
  const { data: events } = await admin.from("detection_events").insert(eventRows).select("id");
  const eventIds = (events ?? []).map((e) => e.id as string);
  counts.events = eventIds.length;

  // Observations: link each event to its sign.
  const obsRows = eventIds.map((eventId, i) => {
    const sign = signList[eventSignPairs[i]!]!;
    return {
      traffic_sign_id: sign.id,
      detection_event_id: eventId,
      distance_to_sign_meters: Number((rng() * 18).toFixed(1)),
      confidence: eventRows[i]!.confidence as number,
    };
  });
  const { count: obsCount } = await admin
    .from("traffic_sign_observations")
    .insert(obsRows, { count: "exact" });
  counts.observations = obsCount ?? obsRows.length;

  // --- Device location logs (~80 along a plausible route) ---
  const locRows: Record<string, unknown>[] = [];
  for (let i = 0; i < 80; i++) {
    const dev = i % deviceIds.length;
    const t = i / 80;
    locRows.push({
      device_id: deviceIds[dev] ?? null,
      user_id: ownerProfileId,
      latitude: AALBORG.lat + t * 0.02 + (rng() - 0.5) * 0.001,
      longitude: AALBORG.lng + t * 0.03 + (rng() - 0.5) * 0.001,
      accuracy: Number((3 + rng() * 10).toFixed(1)),
      speed: Number((rng() * 16).toFixed(1)),
      heading: Number((rng() * 360).toFixed(1)),
      recorded_at: isoDaysAgo(Math.floor(rng() * 2), rng),
    });
  }
  const { count: locCount } = await admin
    .from("device_location_logs")
    .insert(locRows, { count: "exact" });
  counts.locationLogs = locCount ?? locRows.length;

  // --- System logs (AI mix; all marked demo) ---
  const host = "demo-model.local";
  const logRows: Record<string, unknown>[] = [];
  const pushLog = (action: string, metadata: Record<string, unknown>, daysAgo: number) =>
    logRows.push({
      user_id: ownerProfileId,
      action_type: action,
      message: `[demo] ${action}`,
      metadata: { demo: true, demoSeedVersion: DEMO_VERSION, host, ...metadata },
      created_at: isoDaysAgo(daysAgo, rng),
    });
  for (let i = 0; i < 14; i++)
    pushLog("AI_REQUEST_SUCCEEDED", { elapsedMs: 80 + Math.floor(rng() * 200), attempts: 1 }, rng() * 2);
  for (let i = 0; i < 4; i++) pushLog("AI_MOCK_USED", { elapsedMs: 40 + Math.floor(rng() * 60) }, rng() * 2);
  pushLog("AI_REQUEST_FAILED", { category: "http", status: 502, elapsedMs: 300, attempts: 2 }, 0.5);
  pushLog("AI_REQUEST_FAILED", { category: "network", elapsedMs: 1200, attempts: 2 }, 1.2);
  pushLog("AI_REQUEST_TIMEOUT", { category: "timeout", elapsedMs: 15000, attempts: 2 }, 0.8);
  pushLog("AI_RESPONSE_INVALID", { elapsedMs: 90, attempts: 1 }, 1.5);
  const { count: logCount } = await admin.from("system_logs").insert(logRows, { count: "exact" });
  counts.systemLogs = logCount ?? logRows.length;

  // --- Daily metrics snapshots (last 7 days, insert-if-absent only) ---
  const candidateDates = Array.from({ length: 7 }, (_, i) => dateOnlyDaysAgo(i + 1));
  const { data: existingSnap } = await admin
    .from("daily_metrics_snapshots")
    .select("snapshot_date")
    .in("snapshot_date", candidateDates);
  const existingDates = new Set((existingSnap ?? []).map((s) => s.snapshot_date as string));
  const snapDates = candidateDates.filter((d) => !existingDates.has(d));
  if (snapDates.length > 0) {
    const snapRows = snapDates.map((d, i) => {
      const total = 18 + Math.floor(rng() * 40);
      const failed = Math.floor(rng() * 4);
      return {
        snapshot_date: d,
        total_traffic_signs: 30 + i,
        verified_traffic_signs: 12 + Math.floor(rng() * 8),
        pending_traffic_signs: 6 + Math.floor(rng() * 5),
        rejected_traffic_signs: Math.floor(rng() * 3),
        duplicate_traffic_signs: Math.floor(rng() * 3),
        total_detection_events: 100 + i * 12,
        detections_last_24h: total,
        low_confidence_events: Math.floor(rng() * 6),
        average_detection_confidence: Number((0.7 + rng() * 0.2).toFixed(4)),
        average_ai_response_time_ms: 100 + Math.floor(rng() * 120),
        active_devices_24h: 2 + Math.floor(rng() * 3),
        active_sessions: 1 + Math.floor(rng() * 2),
        ai_request_total: total,
        ai_request_success: total - failed,
        ai_request_failed: failed,
        ai_failure_rate_percent: total > 0 ? Number(((failed / total) * 100).toFixed(2)) : 0,
        storage_quarantine_pending: Math.floor(rng() * 4),
      };
    });
    const { count: snapCount } = await admin
      .from("daily_metrics_snapshots")
      .insert(snapRows, { count: "exact" });
    counts.snapshots = snapCount ?? snapRows.length;
  }

  // --- Manifest log (records snapshot dates for safe clearing) ---
  await admin.from("system_logs").insert({
    user_id: ownerProfileId,
    action_type: "ADMIN_DEMO_SEEDED",
    message: "[demo] seeded",
    metadata: {
      demo: true,
      demoSeedVersion: DEMO_VERSION,
      seededAt: new Date().toISOString(),
      snapshotDates: snapDates,
    },
  });
  counts.systemLogs += 1;

  return counts;
}

// ---------------------------------------------------------------------
// Status (counts of currently-present demo-marked rows)
// ---------------------------------------------------------------------
export async function getDemoStatus(
  admin: SupabaseClient,
): Promise<{ hasDemoData: boolean; counts: DemoCounts; lastSeededAt: string | null }> {
  const counts: DemoCounts = {
    devices: 0,
    sessions: 0,
    events: 0,
    signs: 0,
    observations: 0,
    locationLogs: 0,
    systemLogs: 0,
    snapshots: 0,
  };

  const { data: devs } = await admin
    .from("devices")
    .select("id")
    .like("device_identifier", `${DEMO_DEVICE_PREFIX}%`);
  const deviceIds = (devs ?? []).map((d) => d.id as string);
  counts.devices = deviceIds.length;

  let sessionIds: string[] = [];
  if (deviceIds.length > 0) {
    const { data: sess } = await admin
      .from("detection_sessions")
      .select("id")
      .in("device_id", deviceIds);
    sessionIds = (sess ?? []).map((s) => s.id as string);
    counts.sessions = sessionIds.length;

    const { count: locCount } = await admin
      .from("device_location_logs")
      .select("*", { count: "exact", head: true })
      .in("device_id", deviceIds);
    counts.locationLogs = locCount ?? 0;
  }

  let eventIds: string[] = [];
  if (sessionIds.length > 0) {
    const { data: evs } = await admin
      .from("detection_events")
      .select("id")
      .in("session_id", sessionIds);
    eventIds = (evs ?? []).map((e) => e.id as string);
    counts.events = eventIds.length;
  }

  if (eventIds.length > 0) {
    const { count: obsCount } = await admin
      .from("traffic_sign_observations")
      .select("*", { count: "exact", head: true })
      .in("detection_event_id", eventIds);
    counts.observations = obsCount ?? 0;

    const { data: candObs } = await admin
      .from("traffic_sign_observations")
      .select("traffic_sign_id")
      .in("detection_event_id", eventIds);
    counts.signs = new Set((candObs ?? []).map((o) => o.traffic_sign_id as string)).size;
  }

  const { count: logCount } = await admin
    .from("system_logs")
    .select("*", { count: "exact", head: true })
    .filter("metadata->>demo", "eq", "true");
  counts.systemLogs = logCount ?? 0;

  const { data: manifest } = await admin
    .from("system_logs")
    .select("created_at, metadata")
    .eq("action_type", "ADMIN_DEMO_SEEDED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const snapshotDates: string[] = Array.isArray(
    (manifest?.metadata as Record<string, unknown> | undefined)?.snapshotDates,
  )
    ? ((manifest!.metadata as Record<string, unknown>).snapshotDates as string[])
    : [];
  if (snapshotDates.length > 0) {
    const { count: snapCount } = await admin
      .from("daily_metrics_snapshots")
      .select("*", { count: "exact", head: true })
      .in("snapshot_date", snapshotDates);
    counts.snapshots = snapCount ?? 0;
  }

  const hasDemoData = Object.values(counts).some((v) => v > 0);
  const lastSeededAt = (manifest?.created_at as string | undefined) ?? null;
  return { hasDemoData, counts, lastSeededAt };
}
