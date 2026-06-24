import type { SystemLogAction } from "@/lib/types/database";

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

export function windowToStartIso(window: AiTimeWindow): string {
  const ms = window === "1h" ? 3600_000 : window === "24h" ? 86_400_000 : 604_800_000;
  return new Date(Date.now() - ms).toISOString();
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
