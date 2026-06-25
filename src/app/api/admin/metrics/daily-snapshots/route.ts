import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { parsePageParams, paginate } from "@/lib/pagination";
import type { DailyMetricsSnapshot } from "@/lib/types/database";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// GET /api/admin/metrics/daily-snapshots?from=&to=&page=&pageSize=
// Admin-only. Returns paginated snapshots (desc) + an ascending trend array.
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const sp = req.nextUrl.searchParams;
  const params = parsePageParams(sp);

  const defaultDays = env.dailyMetricsDefaultDays();
  const toParam = sp.get("to");
  const fromParam = sp.get("from");
  const to = toParam && DATE_RE.test(toParam) ? toParam : isoDate(new Date());
  const defaultFrom = isoDate(new Date(Date.now() - (defaultDays - 1) * 86_400_000));
  const from = fromParam && DATE_RE.test(fromParam) ? fromParam : defaultFrom;

  const admin = createSupabaseAdminClient();

  const { data: rows, error, count } = await admin
    .from("daily_metrics_snapshots")
    .select("*", { count: "exact" })
    .gte("snapshot_date", from)
    .lte("snapshot_date", to)
    .order("snapshot_date", { ascending: false })
    .range(params.from, params.to);

  if (error) {
    return jsonError("Could not read snapshots (is migration 0006 applied?)", 500);
  }

  // Ascending trend for chart usage (capped to the range).
  const { data: trendRows } = await admin
    .from("daily_metrics_snapshots")
    .select(
      "snapshot_date, total_detection_events, total_traffic_signs, ai_failure_rate_percent, active_devices_24h, detections_last_24h",
    )
    .gte("snapshot_date", from)
    .lte("snapshot_date", to)
    .order("snapshot_date", { ascending: true })
    .limit(366);

  // Snapshot gap detection over [from, min(to, today)].
  const gapSummary = detectGaps(
    from,
    to,
    ((trendRows ?? []) as Array<{ snapshot_date: string }>).map((r) => r.snapshot_date),
    env.snapshotGapWarningDays(),
  );

  return jsonOk({
    from,
    to,
    trend: trendRows ?? [],
    gapSummary,
    ...paginate((rows ?? []) as DailyMetricsSnapshot[], params, count ?? 0),
  });
}

const MAX_ENUM_DAYS = 366;
const MISSING_LIST_CAP = 60;

function detectGaps(from: string, to: string, presentDates: string[], thresholdDays: number) {
  const today = isoDate(new Date());
  // Don't flag future days; the latest legitimately-expected snapshot is today.
  const effectiveTo = to < today ? to : today;
  const present = new Set(presentDates);
  const missing: string[] = [];

  let cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${effectiveTo}T00:00:00Z`);
  let iterations = 0;
  while (cursor <= end && iterations < MAX_ENUM_DAYS) {
    const d = isoDate(cursor);
    if (!present.has(d)) missing.push(d);
    cursor = new Date(cursor.getTime() + 86_400_000);
    iterations += 1;
  }

  return {
    missingCount: missing.length,
    missingDates: missing.slice(-MISSING_LIST_CAP), // most recent missing days
    latestMissingDate: missing.length > 0 ? missing[missing.length - 1] : null,
    warning: missing.length >= thresholdDays,
    thresholdDays,
  };
}
