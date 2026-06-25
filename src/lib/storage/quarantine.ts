import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { extractStoragePathFromKnownValue } from "@/lib/storage/signed-urls";
import { buildReferencedPaths } from "@/lib/storage/maintenance";

// =====================================================================
// SERVER-ONLY quarantine-first storage reconciliation. Never import into
// client components. Uses the service-role client. Never returns signed URLs.
// =====================================================================

const ALLOWED_PREFIX = "sessions/";

function bucket(): string {
  return env.storageBucket();
}

// Validates an object path is safe to act on (under the frame prefix, no
// traversal / absolute / empty).
export function isSafeFramePath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    path.startsWith(ALLOWED_PREFIX) &&
    !path.includes("..") &&
    !path.startsWith("/")
  );
}

export interface ReconcileResult {
  runId: string;
  objectsScanned: number;
  candidatesFound: number;
  candidatesAdded: number;
  scanLimited: boolean;
}

/**
 * Scans Storage under the frame prefix and records unreferenced objects as
 * PENDING quarantine candidates. NEVER deletes anything.
 */
export async function runReconciliation(
  triggeredBy: string | null,
  prefix: string = ALLOWED_PREFIX,
  mode: string = "manual",
  opts?: { maxFolders?: number; maxFiles?: number },
): Promise<ReconcileResult> {
  const admin = createSupabaseAdminClient();

  // Only the frame prefix is supported (matches the safe-path guard).
  const scanPrefix = prefix === ALLOWED_PREFIX ? "sessions" : "sessions";

  const maxFolders = opts?.maxFolders ?? env.storageReconMaxFolders();
  const maxFiles = opts?.maxFiles ?? env.storageReconMaxFilesPerFolder();

  // Open a run record.
  const { data: run } = await admin
    .from("storage_reconciliation_runs")
    .insert({ triggered_by: triggeredBy, mode })
    .select("id")
    .single();
  const runId = (run?.id as string) ?? null;

  const referenced = await buildReferencedPaths();

  const { data: folders } = await admin.storage
    .from(bucket())
    .list(scanPrefix, { limit: maxFolders });
  const folderNames = (folders ?? []).map((f) => f.name);
  const scanLimited = folderNames.length >= maxFolders;

  let objectsScanned = 0;
  const unreferenced: Array<{ path: string; size: number | null; lastModified: string | null }> = [];

  for (const folder of folderNames) {
    const { data: files } = await admin.storage
      .from(bucket())
      .list(`sessions/${folder}`, { limit: maxFiles });
    for (const file of files ?? []) {
      if (!file.id) continue; // skip nested folders
      const path = `${ALLOWED_PREFIX}${folder}/${file.name}`;
      objectsScanned += 1;
      if (!referenced.has(path)) {
        const meta = (file.metadata ?? {}) as Record<string, unknown>;
        const size = typeof meta.size === "number" ? meta.size : null;
        unreferenced.push({
          path,
          size,
          lastModified: (file.updated_at as string | null) ?? null,
        });
      }
    }
  }

  const candidatesFound = unreferenced.length;
  let candidatesAdded = 0;

  if (candidatesFound > 0) {
    // Skip objects that already have an active (pending) candidate row.
    const paths = unreferenced.map((u) => u.path);
    const { data: existing } = await admin
      .from("storage_quarantine_candidates")
      .select("object_path")
      .eq("bucket", bucket())
      .eq("quarantine_status", "pending")
      .in("object_path", paths);
    const existingSet = new Set((existing ?? []).map((e) => e.object_path as string));

    const toInsert = unreferenced
      .filter((u) => !existingSet.has(u.path))
      .map((u) => ({
        bucket: bucket(),
        object_path: u.path,
        size_bytes: u.size,
        last_modified_at: u.lastModified,
        quarantine_status: "pending",
        reason: "unreferenced_orphan",
        scan_run_id: runId,
        created_by: triggeredBy,
      }));

    if (toInsert.length > 0) {
      const { data: inserted } = await admin
        .from("storage_quarantine_candidates")
        .insert(toInsert)
        .select("id");
      candidatesAdded = inserted?.length ?? 0;
    }
  }

  if (runId) {
    await admin
      .from("storage_reconciliation_runs")
      .update({
        completed_at: new Date().toISOString(),
        objects_scanned: objectsScanned,
        candidates_found: candidatesFound,
        candidates_added: candidatesAdded,
        scan_limited: scanLimited,
      })
      .eq("id", runId);
  }

  return { runId, objectsScanned, candidatesFound, candidatesAdded, scanLimited };
}

export interface QuarantineCandidate {
  id: string;
  bucket: string;
  object_path: string;
  size_bytes: number | null;
  last_modified_at: string | null;
  detected_at: string;
  quarantine_status: string;
  reason: string;
  scan_run_id: string | null;
  deleted_at: string | null;
  ignored_at: string | null;
  eligible: boolean; // pending AND past grace period
}

function graceCutoffIso(): string {
  return new Date(Date.now() - env.storageQuarantineGraceDays() * 86_400_000).toISOString();
}

export interface ListQuarantineParams {
  status?: string | null;
  search?: string | null;
  from: number;
  to: number;
  eligibleOnly?: boolean;
}

export async function listQuarantineCandidates(
  params: ListQuarantineParams,
): Promise<{ items: QuarantineCandidate[]; total: number; graceDays: number }> {
  const admin = createSupabaseAdminClient();
  const cutoff = graceCutoffIso();

  let q = admin
    .from("storage_quarantine_candidates")
    .select("*", { count: "exact" });

  if (params.status) q = q.eq("quarantine_status", params.status);
  if (params.search) {
    const s = params.search.replace(/[,()%]/g, " ").trim();
    if (s) q = q.ilike("object_path", `%${s}%`);
  }
  if (params.eligibleOnly) {
    q = q.eq("quarantine_status", "pending").lte("detected_at", cutoff);
  }

  const { data, count } = await q
    .order("detected_at", { ascending: false })
    .range(params.from, params.to);

  const items: QuarantineCandidate[] = ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    bucket: r.bucket as string,
    object_path: r.object_path as string,
    size_bytes: (r.size_bytes as number | null) ?? null,
    last_modified_at: (r.last_modified_at as string | null) ?? null,
    detected_at: r.detected_at as string,
    quarantine_status: r.quarantine_status as string,
    reason: r.reason as string,
    scan_run_id: (r.scan_run_id as string | null) ?? null,
    deleted_at: (r.deleted_at as string | null) ?? null,
    ignored_at: (r.ignored_at as string | null) ?? null,
    eligible: r.quarantine_status === "pending" && (r.detected_at as string) <= cutoff,
  }));

  return { items, total: count ?? 0, graceDays: env.storageQuarantineGraceDays() };
}

// Admin sets a candidate to 'ignored' or 'restored' (never 'deleted' here).
export async function updateQuarantineStatus(
  id: string,
  status: "ignored" | "restored",
): Promise<{ ok: boolean; error?: string }> {
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("storage_quarantine_candidates")
    .select("quarantine_status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Candidate not found" };

  const patch: Record<string, unknown> = {
    quarantine_status: status,
    updated_at: new Date().toISOString(),
  };
  if (status === "ignored") patch.ignored_at = new Date().toISOString();

  const { error } = await admin
    .from("storage_quarantine_candidates")
    .update(patch)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export interface DeleteCandidateResult {
  id: string;
  objectPath: string;
  status: "deleted" | "skipped";
  reason?: string;
}

/**
 * Deletes selected PENDING + grace-eligible candidates. Re-checks DB references
 * immediately before deleting each object; never deletes referenced objects,
 * non-pending candidates, ineligible candidates, or unsafe paths.
 */
export async function deleteQuarantineCandidates(
  candidateIds: string[],
): Promise<{ deleted: number; skipped: number; results: DeleteCandidateResult[] }> {
  const admin = createSupabaseAdminClient();
  const cutoff = graceCutoffIso();
  const batch = candidateIds.slice(0, env.storageQuarantineDeleteBatchLimit());

  // Fresh reference set built right now (immediately before deletion).
  const referenced = await buildReferencedPaths();

  const results: DeleteCandidateResult[] = [];
  let deleted = 0;

  for (const id of batch) {
    const { data: c } = await admin
      .from("storage_quarantine_candidates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!c) {
      results.push({ id, objectPath: "", status: "skipped", reason: "not_found" });
      continue;
    }
    const path = c.object_path as string;

    if (c.quarantine_status !== "pending") {
      results.push({ id, objectPath: path, status: "skipped", reason: "not_pending" });
      continue;
    }
    if ((c.detected_at as string) > cutoff) {
      results.push({ id, objectPath: path, status: "skipped", reason: "within_grace_period" });
      continue;
    }
    if (!isSafeFramePath(path)) {
      results.push({ id, objectPath: path, status: "skipped", reason: "unsafe_path" });
      continue;
    }
    if (referenced.has(path)) {
      results.push({ id, objectPath: path, status: "skipped", reason: "now_referenced" });
      continue;
    }
    // Belt-and-suspenders: direct DB re-check for this exact path.
    const { count: refByPath } = await admin
      .from("detection_events")
      .select("*", { count: "exact", head: true })
      .eq("image_path", path);
    const { count: refBySign } = await admin
      .from("traffic_signs")
      .select("*", { count: "exact", head: true })
      .eq("representative_image_path", path);
    if ((refByPath ?? 0) > 0 || (refBySign ?? 0) > 0) {
      results.push({ id, objectPath: path, status: "skipped", reason: "now_referenced" });
      continue;
    }

    const { error: rmErr } = await admin.storage.from(bucket()).remove([path]);
    if (rmErr) {
      results.push({ id, objectPath: path, status: "skipped", reason: "storage_error" });
      continue;
    }
    await admin
      .from("storage_quarantine_candidates")
      .update({ quarantine_status: "deleted", deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);
    deleted += 1;
    results.push({ id, objectPath: path, status: "deleted" });
  }

  return { deleted, skipped: results.length - deleted, results };
}

export function quarantineConfig() {
  return {
    graceDays: env.storageQuarantineGraceDays(),
    maxFolders: env.storageReconMaxFolders(),
    maxFilesPerFolder: env.storageReconMaxFilesPerFolder(),
    deleteBatchLimit: env.storageQuarantineDeleteBatchLimit(),
    prefix: ALLOWED_PREFIX,
  };
}
