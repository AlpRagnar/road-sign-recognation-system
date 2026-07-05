"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";

const TRUST = [
  { icon: "lock" as const, text: "Private image storage" },
  { icon: "users" as const, text: "Role-based access" },
  { icon: "logs" as const, text: "Audit-ready records" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    const redirectTo = params.get("redirectedFrom") || "/dashboard";
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen bg-canvas">
      {/* Brand / credibility panel (desktop) */}
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #1d4ed8 0, transparent 40%), radial-gradient(circle at 70% 70%, #0d9488 0, transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
              <Icon name="signmap" size={20} />
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold">Traffic Sign Mapping</p>
              <p className="text-xs text-white/50">Road-Sign Inventory Platform</p>
            </div>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-2xl font-semibold leading-snug">
            Road-sign inventory and AI operations
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Turn smartphone road imagery into an auditable, de-duplicated traffic-sign inventory —
            reviewed by administrators on a live map.
          </p>
          <ul className="mt-8 space-y-3">
            {TRUST.map((t) => (
              <li key={t.text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white/80">
                  <Icon name={t.icon} size={16} />
                </span>
                {t.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-xs text-white/30">© 2026 Traffic Sign Mapping</p>
      </div>

      {/* Sign-in card */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-lg border border-line bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
              <Icon name="signmap" size={18} />
            </span>
            <p className="text-sm font-semibold text-slate-900">Traffic Sign Mapping</p>
          </div>

          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use your assigned account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 border-t border-line pt-4 text-center">
            <p className="text-xs text-slate-500">Accounts are provisioned by an administrator.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
