import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { parsePageParams, paginate } from "@/lib/pagination";
import {
  AI_LOG_ACTIONS,
  type AiTimeWindow,
  type RawLogRow,
  getAiAnalyticsViaJs,
  getAiAnalyticsViaRpc,
  toAiLogRow,
  windowToHours,
  windowToStartIso,
} from "@/lib/ai/observability";

export const runtime = "nodejs";

const SELECT = "id, created_at, action_type, message, device_id, metadata";

function parseWindow(v: string | null): AiTimeWindow {
  return v === "1h" || v === "7d" ? v : "24h";
}

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

// GET /api/admin/ai/logs?window=&action=&category=&page=&pageSize=&bucketMinutes=&failureThresholdPercent=
// Admin-only AI observability: summary, breakdown, time-series, recent logs.
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const sp = req.nextUrl.searchParams;
  const window = parseWindow(sp.get("window"));
  const windowHours = windowToHours(window);
  const startIso = windowToStartIso(window);
  const params = parsePageParams(sp);

  const bucketMinutes = clampInt(
    sp.get("bucketMinutes"),
    env.aiTimeseriesBucketMinutes(),
    5,
    1440,
  );
  const failureThresholdPercent = clampInt(
    sp.get("failureThresholdPercent"),
    env.aiFailureWarnPct(),
    1,
    100,
  );

  // Prefer DB-side RPC analytics; fall back to JS aggregation if unavailable
  // (e.g. migration 0004 not applied yet).
  let analytics = await getAiAnalyticsViaRpc(admin, windowHours, bucketMinutes);
  if (!analytics) {
    const { data: summaryData, error: sErr } = await admin
      .from("system_logs")
      .select(SELECT)
      .in("action_type", AI_LOG_ACTIONS)
      .gte("created_at", startIso)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (sErr) return jsonError(sErr.message, 500);
    analytics = getAiAnalyticsViaJs(
      (summaryData ?? []) as unknown as RawLogRow[],
      windowHours,
      bucketMinutes,
    );
  }

  // Paginated, filterable table rows.
  let q = admin
    .from("system_logs")
    .select(SELECT, { count: "exact" })
    .in("action_type", AI_LOG_ACTIONS)
    .gte("created_at", startIso);

  const category = sp.get("category");
  const action = sp.get("action");
  if (category) {
    if (category === "validation") q = q.eq("action_type", "AI_RESPONSE_INVALID");
    else if (category === "timeout") q = q.eq("action_type", "AI_REQUEST_TIMEOUT");
    else if (["config", "network", "http"].includes(category)) {
      q = q.eq("action_type", "AI_REQUEST_FAILED").filter("metadata->>category", "eq", category);
    } else if (category === "unknown") {
      q = q.eq("action_type", "AI_REQUEST_FAILED");
    }
  } else if (action) {
    q = q.eq("action_type", action);
  }

  const { data: rows, error: tErr, count } = await q
    .order("created_at", { ascending: false })
    .range(params.from, params.to);
  if (tErr) return jsonError(tErr.message, 500);

  const items = ((rows ?? []) as unknown as RawLogRow[]).map(toAiLogRow);

  const { summary } = analytics;
  const externalAttempts = summary.success + summary.failure + summary.timeout + summary.invalid;
  const exceeded = externalAttempts > 0 && summary.failureRatePct >= failureThresholdPercent;

  return jsonOk({
    window,
    bucketMinutes,
    summary,
    breakdown: analytics.breakdown,
    timeSeries: analytics.timeSeries,
    source: analytics.source,
    threshold: { failureRateWarningPercent: failureThresholdPercent, exceeded },
    rows: items,
    ...paginate(items, params, count ?? 0),
  });
}
