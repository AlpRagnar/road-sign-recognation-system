import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { extractStoragePathFromKnownValue } from "@/lib/storage/signed-urls";

// =====================================================================
// SERVER-ONLY storage maintenance helpers. Never import into client
// components. Uses the service-role client. Never returns signed URLs.
// =====================================================================

// Only object paths under this prefix are eligible for orphan cleanup.
const FRAME_PREFIX = "sessions/";
const APPLY_CAP = 500; // max rows updated per backfill apply call
const SCAN_FOLDER_CAP = 60; // session folders inspected per orphan scan
const SCAN_FILES_PER_FOLDER = 100;
const ORPHAN_CANDIDATE_CAP = 200;
const DELETE_BATCH_CAP = 100;

function bucket(): string {
  return env.storageBucket();
}

// Generic extractor that takes the bucket explicitly (helper variant).
export function extractStoragePathFromUrl(url: string, bkt: string): string | null {
  if (!url) return null;
  for (const access of ["public", "sign", "authenticated"]) {
    const marker = `/object/${access}/${bkt}/`;
    const i = url.indexOf(marker);
    if (i >= 0) return decodeURIComponent(url.slice(i + marker.length).split("?")[0]!);
  }
  return null;
}

async function headCount(
  table: string,
  modify?: (q: any) => any,
): Promise<number> {
  const admin = createSupabaseAdminClient();
  let q = admin.from(table).select("*", { count: "exact", head: true });
  if (modify) q = modify(q);
  const { count } = await q;
  return count ?? 0;
}

export interface ImageBackfillStatus {
  detectionEvents: { total: number; withPath: number; legacyMissingPath: number };
  trafficSigns: { total: number; withPath: number; legacyMissingPath: number };
}

export async function getImageBackfillStatus(): Promise<ImageBackfillStatus> {
  const [deTotal, deWithPath, deLegacy, tsTotal, tsWithPath, tsLegacy] = await Promise.all([
    headCount("detection_events"),
    headCount("detection_events", (q) => q.not("image_path", "is", null)),
    headCount("detection_events", (q) => q.is("image_path", null).not("image_url", "is", null)),
    headCount("traffic_signs"),
    headCount("traffic_signs", (q) => q.not("representative_image_path", "is", null)),
    headCount("traffic_signs", (q) =>
      q.is("representative_image_path", null).not("representative_image_url", "is", null),
    ),
  ]);
  return {
    detectionEvents: { total: deTotal, withPath: deWithPath, legacyMissingPath: deLegacy },
    trafficSigns: { total: tsTotal, withPath: tsWithPath, legacyMissingPath: tsLegacy },
  };
}

export interface BackfillResult {
  mode: "dry-run" | "apply";
  detectionEvents: { candidates: number; updated: number };
  trafficSigns: { candidates: number; updated: number };
  capped: boolean;
}

// Backfills one table's path column from its legacy URL column.
async function backfillTable(
  table: string,
  urlCol: string,
  pathCol: string,
  apply: boolean,
): Promise<{ candidates: number; updated: number; capped: boolean }> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from(table)
    .select(`id, ${urlCol}`)
    .is(pathCol, null)
    .not(urlCol, "is", null)
    .limit(APPLY_CAP + 1);

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const capped = rows.length > APPLY_CAP;
  const batch = rows.slice(0, APPLY_CAP);

  let candidates = 0;
  let updated = 0;
  for (const row of batch) {
    const path = extractStoragePathFromKnownValue(row[urlCol] as string | null);
    if (!path) continue;
    candidates += 1;
    if (apply) {
      const { error } = await admin
        .from(table)
        .update({ [pathCol]: path })
        .eq("id", row.id as string);
      if (!error) updated += 1;
    }
  }
  return { candidates, updated, capped };
}

export async function runImageBackfill(apply: boolean): Promise<BackfillResult> {
  const de = await backfillTable("detection_events", "image_url", "image_path", apply);
  const ts = await backfillTable(
    "traffic_signs",
    "representative_image_url",
    "representative_image_path",
    apply,
  );
  return {
    mode: apply ? "apply" : "dry-run",
    detectionEvents: { candidates: de.candidates, updated: de.updated },
    trafficSigns: { candidates: ts.candidates, updated: ts.updated },
    capped: de.capped || ts.capped,
  };
}

// ---- Orphan scan / cleanup (conservative, capped) ----

export interface OrphanScanResult {
  scanned: number;
  referenced: number;
  candidateOrphans: string[];
  scanLimited: boolean;
  prefix: string;
}

// Builds the set of currently-referenced object paths (path columns + any path
// extractable from legacy URL columns). Exported for reuse by the quarantine
// reconciliation helper.
export async function buildReferencedPaths(): Promise<Set<string>> {
  const admin = createSupabaseAdminClient();
  const set = new Set<string>();

  const { data: de } = await admin
    .from("detection_events")
    .select("image_path, image_url")
    .or("image_path.not.is.null,image_url.not.is.null")
    .limit(20000);
  for (const r of (de ?? []) as Array<{ image_path: string | null; image_url: string | null }>) {
    const p = r.image_path ?? extractStoragePathFromKnownValue(r.image_url);
    if (p) set.add(p);
  }

  const { data: ts } = await admin
    .from("traffic_signs")
    .select("representative_image_path, representative_image_url")
    .or("representative_image_path.not.is.null,representative_image_url.not.is.null")
    .limit(20000);
  for (const r of (ts ?? []) as Array<{
    representative_image_path: string | null;
    representative_image_url: string | null;
  }>) {
    const p = r.representative_image_path ?? extractStoragePathFromKnownValue(r.representative_image_url);
    if (p) set.add(p);
  }

  return set;
}

export async function scanOrphanedFrameObjects(): Promise<OrphanScanResult> {
  const admin = createSupabaseAdminClient();
  const referenced = await buildReferencedPaths();

  // List session folders, then files within each (both capped).
  const { data: folders } = await admin.storage
    .from(bucket())
    .list("sessions", { limit: SCAN_FOLDER_CAP });
  const folderNames = (folders ?? []).map((f) => f.name);
  const scanLimited = folderNames.length >= SCAN_FOLDER_CAP;

  let scanned = 0;
  const candidates: string[] = [];

  for (const folder of folderNames) {
    if (candidates.length >= ORPHAN_CANDIDATE_CAP) break;
    const { data: files } = await admin.storage
      .from(bucket())
      .list(`sessions/${folder}`, { limit: SCAN_FILES_PER_FOLDER });
    for (const file of files ?? []) {
      // Skip nested "folders" (no file id).
      if (!file.id) continue;
      const path = `${FRAME_PREFIX}${folder}/${file.name}`;
      scanned += 1;
      if (!referenced.has(path) && candidates.length < ORPHAN_CANDIDATE_CAP) {
        candidates.push(path);
      }
    }
  }

  return {
    scanned,
    referenced: referenced.size,
    candidateOrphans: candidates,
    scanLimited,
    prefix: FRAME_PREFIX,
  };
}

export interface DeleteResult {
  requested: number;
  deleted: number;
  skippedReferenced: number;
  rejected: number;
}

// Deletes selected orphan objects. Rejects anything outside the frame prefix,
// and re-checks each path is still unreferenced immediately before deleting.
export async function deleteOrphanFrameObjects(paths: string[]): Promise<DeleteResult> {
  const admin = createSupabaseAdminClient();
  const requested = paths.length;
  const safe = paths
    .slice(0, DELETE_BATCH_CAP)
    .filter((p) => typeof p === "string" && p.startsWith(FRAME_PREFIX) && !p.includes(".."));
  const rejected = requested - safe.length;

  const toDelete: string[] = [];
  let skippedReferenced = 0;

  for (const path of safe) {
    // Re-check references right before deleting.
    const { count: byPath } = await admin
      .from("detection_events")
      .select("*", { count: "exact", head: true })
      .eq("image_path", path);
    const { count: byUrl } = await admin
      .from("detection_events")
      .select("*", { count: "exact", head: true })
      .ilike("image_url", `%${path}%`);
    const { count: bySignPath } = await admin
      .from("traffic_signs")
      .select("*", { count: "exact", head: true })
      .eq("representative_image_path", path);
    if ((byPath ?? 0) > 0 || (byUrl ?? 0) > 0 || (bySignPath ?? 0) > 0) {
      skippedReferenced += 1;
      continue;
    }
    toDelete.push(path);
  }

  let deleted = 0;
  if (toDelete.length > 0) {
    const { data } = await admin.storage.from(bucket()).remove(toDelete);
    deleted = data?.length ?? 0;
  }

  return { requested, deleted, skippedReferenced, rejected };
}
