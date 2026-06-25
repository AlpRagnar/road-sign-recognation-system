import { NextRequest, NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { env } from "@/lib/env";
import { createDailyMetricsSnapshot } from "@/lib/metrics";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/cron/daily-metrics-snapshot  { date?: "YYYY-MM-DD" }
// Headless: requires Authorization: Bearer <CRON_SECRET>. No user session.
export async function POST(req: NextRequest) {
  const auth = checkCronAuth(req);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, category: auth.category, message: auth.message },
      { status: auth.status },
    );
  }

  if (!env.cronDailyMetricsEnabled()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "disabled" });
  }

  const body = (await req.json().catch(() => ({}))) as { date?: string };
  const date = body.date?.trim();
  if (date && !DATE_RE.test(date)) {
    return NextResponse.json(
      { ok: false, category: "unknown", message: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();
  const started = Date.now();

  await writeSystemLog(admin, {
    action: "CRON_DAILY_METRICS_SNAPSHOT_STARTED",
    message: "Cron daily metrics snapshot started",
    metadata: { target_date: date ?? "current_date", source: "cron" },
  });

  const result = await createDailyMetricsSnapshot(admin, date);

  if (!result.ok) {
    await writeSystemLog(admin, {
      action: "CRON_DAILY_METRICS_SNAPSHOT_FAILED",
      message: "Cron daily metrics snapshot failed",
      metadata: {
        target_date: date ?? "current_date",
        elapsed_ms: Date.now() - started,
        reason: result.message,
      },
    });
    return NextResponse.json(
      { ok: false, category: "rpc", message: "Could not create snapshot (is migration 0006 applied?)" },
      { status: 500 },
    );
  }

  const snapshot = result.snapshot;
  await writeSystemLog(admin, {
    action: "CRON_DAILY_METRICS_SNAPSHOT_SUCCEEDED",
    message: `Cron daily metrics snapshot for ${snapshot.snapshot_date}`,
    metadata: {
      target_date: snapshot.snapshot_date,
      elapsed_ms: Date.now() - started,
      source: "cron",
    },
  });

  return NextResponse.json({
    ok: true,
    skipped: false,
    date: snapshot.snapshot_date,
    snapshot,
    elapsedMs: Date.now() - started,
  });
}
