import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { generateTempPassword } from "@/lib/password";
import type { Profile } from "@/lib/types/database";

export const runtime = "nodejs";

// POST /api/admin/users/[id]/reset-password — set a new temporary password for
// the target user (admin only). Returns the password ONCE; never stored/logged.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
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
  if (!profile.auth_user_id) return jsonError("Profile has no linked auth user", 400);

  const tempPassword = generateTempPassword();

  const { error } = await admin.auth.admin.updateUserById(profile.auth_user_id, {
    password: tempPassword,
  });
  if (error) return jsonError(error.message, 400);

  await writeSystemLog(admin, {
    action: "ADMIN_AUTH_PASSWORD_RESET",
    message: `Admin reset password for ${profile.email ?? profile.id}`,
    userId: ctx.profile.id,
    metadata: {
      target_profile_id: profile.id,
      target_user_id: profile.auth_user_id,
      self_reset: profile.id === ctx.profile.id,
    },
  });

  return jsonOk({ email: profile.email, tempPassword });
}
