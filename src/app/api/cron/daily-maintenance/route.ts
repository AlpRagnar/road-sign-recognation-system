import { NextRequest, NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { env } from "@/lib/env";
import { createDailyMetricsSnapshot } from "@/lib/metrics";
import { runReconciliation } from "@/lib/storage/quarantine";

export const runtime = "nodejs";
export const maxDuration = 60;

type StepResult = Record<string, unknown> & { status: "ok" | "skipped" | "failed" };

// POST /api/cron/daily-maintenance
// Headless single daily job: snapshot first, then reconciliation. Reuses the
// same shared helpers as the dedicated endpoints. NEVER deletes objects.
export async function POST(req: NextRequest) {
  const auth = checkCronAuth(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, category: auth.category, message: auth.message },
      { status: auth.status },
    );
  }

  const admin = createSupabaseAdminClient();

  // --- Step 1: daily metrics snapshot ---
  let snapshot: StepResult;
  if (!env.cronDailyMetricsEnabled()) {
    snapshot = { status: "skipped", reason: "disabled" };
  } else {
    const started = Date.now();
    await writeSystemLog(admin, {
      action: "CRON_DAILY_METRICS_SNAPSHOT_STARTED",
      message: "Cron daily maintenance: snapshot started",
      metadata: { source: "cron", job: "daily-maintenance" },
    });
    const r = await createDailyMetricsSnapshot(admin);
    if (r.ok) {
      snapshot = { status: "ok", date: r.snapshot.snapshot_date, elapsedMs: Date.now() - started };
      await writeSystemLog(admin, {
        action: "CRON_DAILY_METRICS_SNAPSHOT_SUCCEEDED",
        message: `Cron daily maintenance: snapshot for ${r.snapshot.snapshot_date}`,
        metadata: { target_date: r.snapshot.snapshot_date, source: "cron" },
      });
    } else {
      snapshot = { status: "failed", message: "snapshot rpc failed" };
      await writeSystemLog(admin, {
        action: "CRON_DAILY_METRICS_SNAPSHOT_FAILED",
        message: "Cron daily maintenance: snapshot failed",
        metadata: { reason: r.message, source: "cron" },
      });
    }
  }

  // --- Step 2: storage reconciliation (quarantine-first; no deletion) ---
  let reconciliation: StepResult;
  if (!env.cronStorageReconciliationEnabled()) {
    reconciliation = { status: "skipped", reason: "disabled" };
  } else {
    const started = Date.now();
    await writeSystemLog(admin, {
      action: "CRON_STORAGE_RECONCILIATION_STARTED",
      message: "Cron daily maintenance: reconciliation started",
      metadata: { source: "cron", job: "daily-maintenance" },
    });
    try {
      const result = await runReconciliation(null, undefined, "scheduled", {
        maxFolders: env.cronStorageReconMaxFolders(),
        maxFiles: env.cronStorageReconMaxFilesPerFolder(),
      });
      reconciliation = {
        status: "ok",
        runId: result.runId,
        scannedObjects: result.objectsScanned,
        newCandidates: result.candidatesAdded,
        existingCandidates: result.candidatesFound - result.candidatesAdded,
        scanLimited: result.scanLimited,
        elapsedMs: Date.now() - started,
      };
      await writeSystemLog(admin, {
        action: "CRON_STORAGE_RECONCILIATION_SUCCEEDED",
        message: `Cron daily maintenance: reconciliation added ${result.candidatesAdded}`,
        metadata: {
          run_id: result.runId,
          objects_scanned: result.objectsScanned,
          candidates_added: result.candidatesAdded,
          source: "cron",
        },
      });
    } catch (err) {
      reconciliation = { status: "failed", message: "reconciliation failed" };
      await writeSystemLog(admin, {
        action: "CRON_STORAGE_RECONCILIATION_FAILED",
        message: "Cron daily maintenance: reconciliation failed",
        metadata: { reason: (err as Error)?.message?.slice(0, 160) ?? "unknown", source: "cron" },
      });
    }
  }

  const ok = snapshot.status !== "failed" && reconciliation.status !== "failed";
  return NextResponse.json({ ok, steps: { snapshot, reconciliation } });
}
