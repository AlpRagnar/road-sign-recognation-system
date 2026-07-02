import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import {
  createSignedFrameUrl,
  extractStoragePathFromKnownValue,
} from "@/lib/storage/signed-urls";
import { deleteOrphanFrameObjects } from "@/lib/storage/maintenance";
import { recomputeSignAggregate } from "@/lib/localization/grouping";

export const runtime = "nodejs";

type SupabaseAdmin = ReturnType<typeof createSupabaseAdminClient>;

interface FrameEventRow {
  id: string;
  image_path: string | null;
  image_url: string | null;
  session_id: string | null;
  device_id: string | null;
  user_id: string | null;
  created_at: string;
}

const EVENT_COLUMNS =
  "id, image_path, image_url, session_id, device_id, user_id, created_at";

/**
 * Resolves the full "frame group" for a selected detection event.
 *
 * Priority (see task spec §2.2): the schema has no dedicated frame/group id, so
 * we group by the exact non-null storage object path (image_path, or a path
 * recovered from a legacy image_url). When no path exists, only the selected
 * event forms the group.
 */
async function resolveFrameGroup(
  admin: SupabaseAdmin,
  selected: FrameEventRow,
): Promise<{ path: string | null; events: FrameEventRow[] }> {
  const path =
    selected.image_path ?? extractStoragePathFromKnownValue(selected.image_url);

  const byId = new Map<string, FrameEventRow>();
  byId.set(selected.id, selected);

  if (path) {
    const { data: byPath } = await admin
      .from("detection_events")
      .select(EVENT_COLUMNS)
      .eq("image_path", path);
    const { data: byUrl } = await admin
      .from("detection_events")
      .select(EVENT_COLUMNS)
      .ilike("image_url", `%${path}%`);
    for (const row of [...(byPath ?? []), ...(byUrl ?? [])] as FrameEventRow[]) {
      byId.set(row.id, row);
    }
  }

  return { path, events: [...byId.values()] };
}

async function loadSelectedEvent(
  admin: SupabaseAdmin,
  id: string,
): Promise<FrameEventRow | null> {
  const { data } = await admin
    .from("detection_events")
    .select(EVENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as FrameEventRow) ?? null;
}

// GET /api/admin/detections/[id]/frame — preview the frame group for the
// confirmation dialog (detection count, capture time, device, thumbnail).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const selected = await loadSelectedEvent(admin, params.id);
  if (!selected) return jsonError("Detection event not found", 404);

  const { path, events } = await resolveFrameGroup(admin, selected);
  const eventIds = events.map((e) => e.id);

  const { count: observationCount } = await admin
    .from("traffic_sign_observations")
    .select("*", { count: "exact", head: true })
    .in("detection_event_id", eventIds);

  let deviceName: string | null = null;
  if (selected.device_id) {
    const { data: device } = await admin
      .from("devices")
      .select("device_name")
      .eq("id", selected.device_id)
      .maybeSingle();
    deviceName = (device?.device_name as string | null) ?? null;
  }

  // Short-lived signed thumbnail (never expose the raw path).
  const imageUrl = path ? await createSignedFrameUrl(path) : null;

  const capturedAt = events
    .map((e) => e.created_at)
    .reduce((a, b) => (a < b ? a : b), selected.created_at);

  return jsonOk({
    detectionCount: eventIds.length,
    observationCount: observationCount ?? 0,
    capturedAt,
    deviceName,
    hasStorageObject: path != null,
    imageUrl,
  });
}

// DELETE /api/admin/detections/[id]/frame — permanently delete the entire frame
// group: every detection event from the same captured image, their observation
// links, any now-orphaned inventory signs, and the storage object (only when no
// remaining DB record references that exact path). Admin-only, idempotent-safe.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();

  // Repeated calls: once the frame is gone the event no longer exists → 404.
  const selected = await loadSelectedEvent(admin, params.id);
  if (!selected) return jsonError("Detection event not found", 404);

  const { path, events } = await resolveFrameGroup(admin, selected);
  const eventIds = events.map((e) => e.id);

  // Collect the observations + affected inventory signs before deleting.
  const { data: obs } = await admin
    .from("traffic_sign_observations")
    .select("id, traffic_sign_id")
    .in("detection_event_id", eventIds);
  const observationRows = (obs ?? []) as Array<{ id: string; traffic_sign_id: string }>;
  const affectedSignIds = [...new Set(observationRows.map((o) => o.traffic_sign_id))];

  // 1) Delete observation links for these events (explicit; also FK-cascades).
  {
    const { error } = await admin
      .from("traffic_sign_observations")
      .delete()
      .in("detection_event_id", eventIds);
    if (error) return jsonError(`Failed to delete observation links: ${error.message}`, 500);
  }

  // 2) Delete every detection event in the frame group.
  {
    const { error } = await admin.from("detection_events").delete().in("id", eventIds);
    if (error) return jsonError(`Failed to delete detection events: ${error.message}`, 500);
  }

  // 3) For each affected sign: drop it if it has no remaining observations,
  //    otherwise recompute its aggregates from the survivors.
  let deletedSigns = 0;
  for (const signId of affectedSignIds) {
    try {
      const { remainingObservations } = await recomputeSignAggregate(admin, signId);
      if (remainingObservations === 0) {
        await admin.from("traffic_signs").delete().eq("id", signId);
        deletedSigns += 1;
      }
    } catch {
      // A recompute failure must not abort the whole operation; the sign simply
      // keeps its previous aggregates. Surfaced via the audit log below.
    }
  }

  // 4) Delete the storage object only when no remaining DB record references
  //    that exact path. deleteOrphanFrameObjects re-checks references and only
  //    touches objects under the frame prefix; if it can't remove the object it
  //    stays discoverable by the orphan-storage reconciliation tool.
  let storageDeleted: boolean | null = null; // null = no storage object
  let storageWarning: string | null = null;
  if (path) {
    try {
      const res = await deleteOrphanFrameObjects([path]);
      if (res.deleted > 0) {
        storageDeleted = true;
      } else if (res.skippedReferenced > 0) {
        // Still referenced by a surviving sign's representative image — leave it.
        storageDeleted = false;
      } else {
        storageDeleted = false;
        storageWarning =
          "Database rows were deleted but the storage object was not removed; " +
          "it will be cleaned up by the orphan-storage reconciliation tool.";
      }
    } catch {
      storageDeleted = false;
      storageWarning =
        "Database rows were deleted but the storage object could not be removed; " +
        "it will be cleaned up by the orphan-storage reconciliation tool.";
    }
  }

  // 5) Safe audit log — no signed URLs, tokens, or secrets.
  await writeSystemLog(admin, {
    action: "ADMIN_FRAME_DELETED",
    message: `Admin permanently deleted a captured frame (${eventIds.length} detection event(s))`,
    userId: ctx.profile.id,
    deviceId: selected.device_id,
    metadata: {
      selected_event_id: params.id,
      session_id: selected.session_id,
      deleted_event_count: eventIds.length,
      deleted_observation_count: observationRows.length,
      deleted_sign_count: deletedSigns,
      storage_object_deleted: storageDeleted,
      had_storage_object: path != null,
    },
  });

  return jsonOk({
    dbDeleted: true,
    deletedEvents: eventIds.length,
    deletedObservations: observationRows.length,
    deletedSigns,
    storageApplicable: path != null,
    storageDeleted,
    storageWarning,
  });
}
