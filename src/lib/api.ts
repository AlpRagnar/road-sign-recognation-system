import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export interface AuthedContext {
  authUserId: string;
  profile: Profile;
}

// Resolves the authenticated profile for a Route Handler.
// Returns null when unauthenticated (caller should return 401).
export async function getAuthedContext(): Promise<AuthedContext | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) return null;
  return { authUserId: user.id, profile: profile as Profile };
}
