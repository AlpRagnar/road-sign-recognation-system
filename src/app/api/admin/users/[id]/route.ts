import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import type { Profile } from "@/lib/types/database";

interface PatchBody {
  full_name?: string | null;
  role?: string;
}

// PATCH /api/admin/users/[id] — admin can update a profile's role / full_name.
// NOTE: this updates the application `profiles` row only. Supabase Auth-level
// user creation / password resets are intentionally out of scope (see README).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const profile = target as Profile | null;
  if (!profile) return jsonError("Profile not found", 404);

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) return jsonError("Invalid body");

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.full_name !== undefined) {
    update.full_name = body.full_name?.trim() || null;
  }
  if (body.role !== undefined) {
    if (body.role !== "user" && body.role !== "admin") return jsonError("Invalid role");
    // Guard: prevent an admin from removing their own admin role (lockout safety).
    if (profile.id === ctx.profile.id && body.role !== "admin") {
      return jsonError("You cannot remove your own admin role", 400);
    }
    update.role = body.role;
  }

  const { data: updated, error } = await admin
    .from("profiles")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  await writeSystemLog(admin, {
    action: "ADMIN_PROFILE_UPDATED",
    message: `Admin updated profile ${profile.email ?? profile.id}`,
    userId: ctx.profile.id,
    metadata: { target_profile_id: params.id, ...update },
  });

  return jsonOk({ profile: updated });
}
