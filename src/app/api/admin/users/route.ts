import { NextRequest } from "next/server";
import { getAuthedContext, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeSystemLog } from "@/lib/logging";
import { parsePageParams, paginate } from "@/lib/pagination";
import { generateTempPassword, isAcceptablePassword } from "@/lib/password";
import type { Profile } from "@/lib/types/database";

export const runtime = "nodejs";

// Strip characters that would break a PostgREST .or() filter expression.
function sanitizeSearch(raw: string): string {
  return raw.replace(/[,()%]/g, " ").trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/admin/users?search=&role=&page=&pageSize= — paginated profile list.
export async function GET(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const admin = createSupabaseAdminClient();
  const sp = req.nextUrl.searchParams;
  const params = parsePageParams(sp);

  let query = admin.from("profiles").select("*", { count: "exact" });

  const role = sp.get("role");
  if (role === "user" || role === "admin") query = query.eq("role", role);

  const search = sanitizeSearch(sp.get("search") ?? "");
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (error) return jsonError(error.message, 500);

  return jsonOk(paginate((data ?? []) as Profile[], params, count ?? 0));
}

interface CreateBody {
  full_name?: string;
  email?: string;
  role?: string;
  password?: string;
}

// POST /api/admin/users — create a real Supabase Auth user (admin only).
// Returns the temporary password ONCE; it is never stored or logged.
export async function POST(req: NextRequest) {
  const ctx = await getAuthedContext();
  if (!ctx) return jsonError("Unauthenticated", 401);
  if (ctx.profile.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => null)) as CreateBody | null;
  const fullName = body?.full_name?.trim() || null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const role = body?.role === "admin" ? "admin" : "user";

  if (!email || !EMAIL_RE.test(email)) return jsonError("A valid email is required");
  if (body?.role && body.role !== "user" && body.role !== "admin") {
    return jsonError("Invalid role");
  }

  // Generate a temp password unless a valid one was supplied.
  let tempPassword = body?.password?.trim() || "";
  if (tempPassword) {
    if (!isAcceptablePassword(tempPassword)) {
      return jsonError("Password must be at least 8 characters");
    }
  } else {
    tempPassword = generateTempPassword();
  }

  const admin = createSupabaseAdminClient();

  // 1) Create the auth user (email pre-confirmed for local/MVP usage).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created?.user) {
    return jsonError(createErr?.message || "Could not create user", 400);
  }
  const authUserId = created.user.id;

  // 2) The handle_new_user trigger creates the profile row; set role/name on it.
  //    Fall back to an insert if the trigger did not run for any reason.
  let profile: Profile | null = null;
  const { data: updated } = await admin
    .from("profiles")
    .update({ full_name: fullName, role, email, updated_at: new Date().toISOString() })
    .eq("auth_user_id", authUserId)
    .select("*")
    .maybeSingle();
  profile = (updated as Profile) ?? null;

  if (!profile) {
    const { data: inserted, error: insErr } = await admin
      .from("profiles")
      .insert({ auth_user_id: authUserId, email, full_name: fullName, role })
      .select("*")
      .single();
    if (insErr) return jsonError(`User created but profile failed: ${insErr.message}`, 500);
    profile = inserted as Profile;
  }

  // 3) Log WITHOUT the password.
  await writeSystemLog(admin, {
    action: "ADMIN_AUTH_USER_CREATED",
    message: `Admin created auth user ${email}`,
    userId: ctx.profile.id,
    metadata: { created_user_id: authUserId, email, role },
  });

  // 4) Return the temporary password exactly once.
  return jsonOk({ profile, tempPassword });
}
