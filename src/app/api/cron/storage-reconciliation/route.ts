import { NextRequest, NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { env } from "@/lib/env";
import { runReconciliation } from "@/lib/storage/quarantine";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/cron/storage-reconciliation
// Headless: requires Authorization: Bearer <CRON_SECRET>. No user session.
// Records unreferenced objects as PENDING quarantine candidates. NEVER deletes.
export async function POST(req: NextRequest) {
  const auth = checkCronAuth(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, category: auth.category, message: auth.message },
      { status: auth.status },
    );
  }

  if (!env.cronStorageReconciliationEnabled()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "disabled" });
  }

  const admin = createSupabaseAdminClient();
  const started = Date.now();

  await writeSystemLog(admin, {
    action: "CRON_STORAGE_RECONCILIATION_STARTED",
    message: "Cron storage reconciliation started",
    metadata: { source: "cron" },
  });

  try {
    const result = await runReconciliation(null, undefined, "scheduled", {
      maxFolders: env.cronStorageReconMaxFolders(),
      maxFiles: env.cronStorageReconMaxFilesPerFolder(),
    });

    await writeSystemLog(admin, {
      action: "CRON_STORAGE_RECONCILIATION_SUCCEEDED",
      message: `Cron reconciliation: ${result.candidatesAdded} added of ${result.candidatesFound} found`,
      metadata: {
        run_id: result.runId,
        objects_scanned: result.objectsScanned,
        candidates_found: result.candidatesFound,
        candidates_added: result.candidatesAdded,
        scan_limited: result.scanLimited,
        source: "cron",
      },
    });

    return NextResponse.json({
      ok: true,
      skipped: false,
      runId: result.runId,
      scannedObjects: result.objectsScanned,
      newCandidates: result.candidatesAdded,
      existingCandidates: result.candidatesFound - result.candidatesAdded,
      scanLimited: result.scanLimited,
      elapsedMs: Date.now() - started,
    });
  } catch (err) {
    await writeSystemLog(admin, {
      action: "CRON_STORAGE_RECONCILIATION_FAILED",
      message: "Cron storage reconciliation failed",
      metadata: {
        elapsed_ms: Date.now() - started,
        reason: (err as Error)?.message?.slice(0, 160) ?? "unknown",
        source: "cron",
      },
    });
    return NextResponse.json(
      { ok: false, category: "unknown", message: "Storage reconciliation failed." },
      { status: 500 },
    );
  }
}
