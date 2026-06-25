import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parsePageParams, paginate } from "@/lib/pagination";

export const runtime = "nodejs";

interface RunRow {
  id: string;
  started_at: string;
  completed_at: string | null;
  mode: string;
  objects_scanned: number;
  candidates_found: number;
  candidates_added: number;
  scan_limited: boolean;
}

// GET /api/admin/storage/reconciliation-runs?page=&pageSize=&status=
// Admin-only history of storage reconciliation runs. No signed URLs/secrets.
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const sp = req.nextUrl.searchParams;
  const params = parsePageParams(sp);
  const status = sp.get("status"); // "completed" | "incomplete"

  const admin = createSupabaseAdminClient();
  let q = admin
    .from("storage_reconciliation_runs")
    .select(
      "id, started_at, completed_at, mode, objects_scanned, candidates_found, candidates_added, scan_limited",
      { count: "exact" },
    );

  if (status === "completed") q = q.not("completed_at", "is", null);
  else if (status === "incomplete") q = q.is("completed_at", null);

  const { data, error, count } = await q
    .order("started_at", { ascending: false })
    .range(params.from, params.to);

  if (error) {
    return jsonError("Could not read reconciliation runs (is migration 0005 applied?)", 500);
  }

  const items = ((data ?? []) as RunRow[]).map((r) => ({
    id: r.id,
    started_at: r.started_at,
    completed_at: r.completed_at,
    status: r.completed_at ? "completed" : "incomplete",
    mode: r.mode,
    objects_scanned: r.objects_scanned,
    candidates_found: r.candidates_found,
    candidates_added: r.candidates_added,
    scan_limited: r.scan_limited,
  }));

  return jsonOk(paginate(items, params, count ?? 0));
}
