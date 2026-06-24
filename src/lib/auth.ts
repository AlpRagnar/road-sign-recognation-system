import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

// Returns the authenticated user's profile (or null if not logged in).
// Server-only helper for Server Components and Route Handlers.
export async function getCurrentProfile(): Promise<Profile | null> {
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

  return (profile as Profile) ?? null;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  return profile;
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin";
}
