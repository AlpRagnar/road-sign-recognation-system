import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parsePageParams, paginate } from "@/lib/pagination";
import {
  AI_LOG_ACTIONS,
  type AiTimeWindow,
  type RawLogRow,
  summarizeAiLogs,
  toAiLogRow,
  windowToStartIso,
} from "@/lib/ai/observability";

export const runtime = "nodejs";

const SELECT = "id, created_at, action_type, message, device_id, metadata";

function parseWindow(v: string | null): AiTimeWindow {
  return v === "1h" || v === "7d" ? v : "24h";
}

// GET /api/admin/ai/logs?window=&action=&category=&page=&pageSize=
// Admin-only AI observability: activity summary, failure breakdown, recent logs.
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const sp = req.nextUrl.searchParams;
  const window = parseWindow(sp.get("window"));
  const startIso = windowToStartIso(window);
  const params = parsePageParams(sp);

  // 1) Window-wide set for summary + breakdown (unfiltered by action/category).
  const { data: summaryData, error: sErr } = await admin
    .from("system_logs")
    .select(SELECT)
    .in("action_type", AI_LOG_ACTIONS)
    .gte("created_at", startIso)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (sErr) return jsonError(sErr.message, 500);

  const { summary, breakdown } = summarizeAiLogs((summaryData ?? []) as unknown as RawLogRow[]);

  // 2) Paginated, filterable table rows.
  let q = admin
    .from("system_logs")
    .select(SELECT, { count: "exact" })
    .in("action_type", AI_LOG_ACTIONS)
    .gte("created_at", startIso);

  const category = sp.get("category");
  const action = sp.get("action");
  if (category) {
    // Category is derived from action_type (+ metadata.category for failures).
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

  return jsonOk({
    window,
    summary,
    breakdown,
    ...paginate(items, params, count ?? 0),
  });
}
