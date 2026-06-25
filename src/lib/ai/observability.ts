import type { SupabaseClient } from "@supabase/supabase-js";
import type { SystemLogAction } from "@/lib/types/database";

// Production AI outcome actions (self-test / health / started excluded).
export const AI_OUTCOME_ACTIONS: SystemLogAction[] = [
  "AI_REQUEST_SUCCEEDED",
  "AI_REQUEST_FAILED",
  "AI_REQUEST_TIMEOUT",
  "AI_RESPONSE_INVALID",
  "AI_MOCK_USED",
];

// AI-related system_logs actions used by the observability views.
export const AI_LOG_ACTIONS: SystemLogAction[] = [
  "AI_REQUEST_STARTED",
  "AI_REQUEST_SUCCEEDED",
  "AI_REQUEST_FAILED",
  "AI_REQUEST_TIMEOUT",
  "AI_RESPONSE_INVALID",
  "AI_MOCK_USED",
  "AI_HEALTH_CHECK_RUN",
  "AI_SELF_TEST_STARTED",
  "AI_SELF_TEST_SUCCEEDED",
  "AI_SELF_TEST_FAILED",
];

export type AiTimeWindow = "1h" | "24h" | "7d";

export function windowToHours(window: AiTimeWindow): number {
  return window === "1h" ? 1 : window === "24h" ? 24 : 168;
}

export function windowToStartIso(window: AiTimeWindow): string {
  return new Date(Date.now() - windowToHours(window) * 3600_000).toISOString();
}

export type FailureCategory = "config" | "timeout" | "network" | "http" | "validation" | "unknown";

export interface AiActivitySummary {
  total: number; // terminal detection outcomes (success + failure + timeout + invalid + mock)
  success: number;
  failure: number;
  timeout: number;
  invalid: number;
  mockUsed: number;
  avgElapsedMs: number | null;
  latestSuccessAt: string | null;
  latestFailureAt: string | null;
  failureRatePct: number; // share of external attempts that failed
}

export type AiFailureBreakdown = Record<FailureCategory, number>;

export interface AiLogRow {
  id: string;
  created_at: string;
  action_type: string;
  category: FailureCategory | null;
  status: number | null; // HTTP status if present
  attempts: number | null;
  elapsed_ms: number | null;
  message: string | null;
  session_id: string | null;
  device_id: string | null;
}

// Raw system_logs row shape this module needs.
export interface RawLogRow {
  id: string;
  created_at: string;
  action_type: string;
  message: string | null;
  device_id: string | null;
  metadata: unknown;
}

function meta(row: RawLogRow): Record<string, unknown> {
  return row.metadata && typeof row.metadata === "object"
    ? (row.metadata as Record<string, unknown>)
    : {};
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

// Derives the failure category for a failed/invalid AI log.
function categoryOf(row: RawLogRow): FailureCategory | null {
  const m = meta(row);
  if (row.action_type === "AI_RESPONSE_INVALID") return "validation";
  if (row.action_type === "AI_REQUEST_TIMEOUT") return "timeout";
  if (row.action_type === "AI_REQUEST_FAILED" || row.action_type === "AI_SELF_TEST_FAILED") {
    const c = str(m.category);
    if (c === "invalid_response") return "validation";
    if (c === "config" || c === "timeout" || c === "network" || c === "http") return c;
    return "unknown";
  }
  return null;
}

// Maps a raw log row into a safe, structured table row (no secrets/URLs).
export function toAiLogRow(row: RawLogRow): AiLogRow {
  const m = meta(row);
  return {
    id: row.id,
    created_at: row.created_at,
    action_type: row.action_type,
    category: categoryOf(row),
    status: num(m.status),
    attempts: num(m.attempts),
    elapsed_ms: num(m.elapsedMs),
    message: row.message,
    session_id: str(m.session_id),
    device_id: row.device_id,
  };
}

// Computes the activity summary + failure breakdown over a set of AI logs.
// Self-test actions are intentionally NOT counted in request totals.
export function summarizeAiLogs(rows: RawLogRow[]): {
  summary: AiActivitySummary;
  breakdown: AiFailureBreakdown;
} {
  let success = 0;
  let failure = 0;
  let timeout = 0;
  let invalid = 0;
  let mockUsed = 0;
  let elapsedSum = 0;
  let elapsedCount = 0;
  let latestSuccessAt: string | null = null;
  let latestFailureAt: string | null = null;

  const breakdown: AiFailureBreakdown = {
    config: 0,
    timeout: 0,
    network: 0,
    http: 0,
    validation: 0,
    unknown: 0,
  };

  for (const row of rows) {
    const m = meta(row);
    const elapsed = num(m.elapsedMs);
    if (elapsed != null) {
      elapsedSum += elapsed;
      elapsedCount += 1;
    }

    switch (row.action_type) {
      case "AI_REQUEST_SUCCEEDED":
        success += 1;
        if (!latestSuccessAt || row.created_at > latestSuccessAt) latestSuccessAt = row.created_at;
        break;
      case "AI_MOCK_USED":
        mockUsed += 1;
        break;
      case "AI_REQUEST_FAILED":
      case "AI_REQUEST_TIMEOUT":
      case "AI_RESPONSE_INVALID": {
        if (row.action_type === "AI_REQUEST_TIMEOUT") timeout += 1;
        else if (row.action_type === "AI_RESPONSE_INVALID") invalid += 1;
        else failure += 1;
        if (!latestFailureAt || row.created_at > latestFailureAt) latestFailureAt = row.created_at;
        const cat = categoryOf(row);
        if (cat) breakdown[cat] += 1;
        break;
      }
      default:
        break; // started/health/self-test not counted in request totals
    }
  }

  const failures = failure + timeout + invalid;
  const externalTotal = success + failures;
  const total = externalTotal + mockUsed;

  return {
    summary: {
      total,
      success,
      failure,
      timeout,
      invalid,
      mockUsed,
      avgElapsedMs: elapsedCount > 0 ? Math.round(elapsedSum / elapsedCount) : null,
      latestSuccessAt,
      latestFailureAt,
      failureRatePct: externalTotal > 0 ? Math.round((failures / externalTotal) * 100) : 0,
    },
    breakdown,
  };
}

// ---------------------------------------------------------------------
// Time-series + RPC-backed analytics (with JS fallback)
// ---------------------------------------------------------------------

export interface AiTimeSeriesBucket {
  bucketStart: string;
  total: number;
  success: number;
  failed: number;
  timeout: number;
  invalid: number;
  mock: number;
  failureRatePct: number;
  avgElapsedMs: number | null;
}

export interface AiAnalytics {
  summary: AiActivitySummary;
  breakdown: AiFailureBreakdown;
  timeSeries: AiTimeSeriesBucket[];
  source: "rpc" | "fallback";
}

function emptyBreakdown(): AiFailureBreakdown {
  return { config: 0, timeout: 0, network: 0, http: 0, validation: 0, unknown: 0 };
}

// Buckets raw logs into a zero-filled series (JS fallback path).
export function computeTimeSeries(
  rows: RawLogRow[],
  windowHours: number,
  bucketMinutes: number,
): AiTimeSeriesBucket[] {
  const bucketMs = Math.max(bucketMinutes, 1) * 60_000;
  const now = Date.now();
  const startAligned = Math.floor((now - windowHours * 3600_000) / bucketMs) * bucketMs;

  const buckets = new Map<number, AiTimeSeriesBucket & { _elapsedSum: number; _elapsedN: number }>();
  for (let t = startAligned; t <= now; t += bucketMs) {
    buckets.set(t, {
      bucketStart: new Date(t).toISOString(),
      total: 0,
      success: 0,
      failed: 0,
      timeout: 0,
      invalid: 0,
      mock: 0,
      failureRatePct: 0,
      avgElapsedMs: null,
      _elapsedSum: 0,
      _elapsedN: 0,
    });
  }

  for (const row of rows) {
    if (!AI_OUTCOME_ACTIONS.includes(row.action_type as SystemLogAction)) continue;
    const t = Math.floor(new Date(row.created_at).getTime() / bucketMs) * bucketMs;
    const b = buckets.get(t);
    if (!b) continue;
    b.total += 1;
    const elapsed = num((meta(row) as Record<string, unknown>).elapsedMs);
    if (elapsed != null) {
      b._elapsedSum += elapsed;
      b._elapsedN += 1;
    }
    switch (row.action_type) {
      case "AI_REQUEST_SUCCEEDED":
        b.success += 1;
        break;
      case "AI_REQUEST_FAILED":
        b.failed += 1;
        break;
      case "AI_REQUEST_TIMEOUT":
        b.timeout += 1;
        break;
      case "AI_RESPONSE_INVALID":
        b.invalid += 1;
        break;
      case "AI_MOCK_USED":
        b.mock += 1;
        break;
    }
  }

  return [...buckets.values()]
    .sort((a, b) => a.bucketStart.localeCompare(b.bucketStart))
    .map((b) => {
      const failures = b.failed + b.timeout + b.invalid;
      const ext = b.success + failures;
      return {
        bucketStart: b.bucketStart,
        total: b.total,
        success: b.success,
        failed: b.failed,
        timeout: b.timeout,
        invalid: b.invalid,
        mock: b.mock,
        failureRatePct: ext > 0 ? Math.round((failures / ext) * 100) : 0,
        avgElapsedMs: b._elapsedN > 0 ? Math.round(b._elapsedSum / b._elapsedN) : null,
      };
    });
}

function n(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

// Attempts RPC-backed analytics; returns null if the RPCs are unavailable
// (e.g. migration 0004 not applied), so the caller can fall back to JS.
export async function getAiAnalyticsViaRpc(
  admin: SupabaseClient,
  windowHours: number,
  bucketMinutes: number,
): Promise<AiAnalytics | null> {
  const [summaryRes, breakdownRes, seriesRes] = await Promise.all([
    admin.rpc("admin_ai_activity_summary", { p_window_hours: windowHours }),
    admin.rpc("admin_ai_failure_breakdown", { p_window_hours: windowHours }),
    admin.rpc("admin_ai_timeseries", {
      p_window_hours: windowHours,
      p_bucket_minutes: bucketMinutes,
    }),
  ]);

  if (summaryRes.error || breakdownRes.error || seriesRes.error) return null;

  const s = (Array.isArray(summaryRes.data) ? summaryRes.data[0] : summaryRes.data) as
    | Record<string, unknown>
    | undefined;
  if (!s) return null;

  const success = n(s.success_count);
  const failure = n(s.failed_count);
  const timeout = n(s.timeout_count);
  const invalid = n(s.invalid_count);
  const mockUsed = n(s.mock_count);

  const summary: AiActivitySummary = {
    total: n(s.total_requests),
    success,
    failure,
    timeout,
    invalid,
    mockUsed,
    avgElapsedMs: s.avg_elapsed_ms == null ? null : n(s.avg_elapsed_ms),
    latestSuccessAt: (s.latest_success_at as string | null) ?? null,
    latestFailureAt: (s.latest_failure_at as string | null) ?? null,
    failureRatePct: Math.round(n(s.failure_rate)),
  };

  const breakdown = emptyBreakdown();
  for (const row of (breakdownRes.data ?? []) as Array<{ category: string; count: number }>) {
    if (row.category in breakdown) breakdown[row.category as FailureCategory] = n(row.count);
  }

  const timeSeries: AiTimeSeriesBucket[] = (
    (seriesRes.data ?? []) as Array<Record<string, unknown>>
  ).map((r) => ({
    bucketStart: r.bucket_start as string,
    total: n(r.total_requests),
    success: n(r.success_count),
    failed: n(r.failed_count),
    timeout: n(r.timeout_count),
    invalid: n(r.invalid_count),
    mock: n(r.mock_count),
    failureRatePct: Math.round(n(r.failure_rate)),
    avgElapsedMs: r.avg_elapsed_ms == null ? null : n(r.avg_elapsed_ms),
  }));

  return { summary, breakdown, timeSeries, source: "rpc" };
}

// JS fallback: aggregate from a fetched window of system_logs rows.
export function getAiAnalyticsViaJs(
  rows: RawLogRow[],
  windowHours: number,
  bucketMinutes: number,
): AiAnalytics {
  const { summary, breakdown } = summarizeAiLogs(rows);
  const timeSeries = computeTimeSeries(rows, windowHours, bucketMinutes);
  return { summary, breakdown, timeSeries, source: "fallback" };
}
