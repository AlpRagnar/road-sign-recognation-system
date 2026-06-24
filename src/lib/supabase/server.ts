import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Server-side Supabase client bound to the request cookies.
// Used in Server Components and Route Handlers; respects RLS as the logged-in user.
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` is called from a Server Component where mutating cookies
          // is not allowed. Session refresh is handled in middleware instead.
        }
      },
    },
  });
}
