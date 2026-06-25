import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { seedDemoData } from "@/lib/demo/seed";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/demo/seed — admin-only. Clears existing demo data then seeds
// a fresh deterministic set owned by the current admin profile. The seed helper
// writes the authoritative ADMIN_DEMO_SEEDED manifest (with snapshot dates).
export async function POST() {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  try {
    const created = await seedDemoData(admin, ctx.profile.id);
    return jsonOk({ created });
  } catch (err) {
    return jsonError(`Demo seed failed: ${(err as Error).message.slice(0, 160)}`, 500);
  }
}
