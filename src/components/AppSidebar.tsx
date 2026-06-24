"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/detection", label: "Detection Session" },
  { href: "/map/signs", label: "Sign Map" },
  { href: "/map/devices", label: "Device Map" },
  { href: "/devices", label: "Devices" },
  { href: "/admin/logs", label: "Detection Logs", adminOnly: true },
  { href: "/admin/detections", label: "Detection Review", adminOnly: true },
  { href: "/admin/review", label: "Sign Review", adminOnly: true },
  { href: "/admin/devices", label: "Admin Devices", adminOnly: true },
  { href: "/admin/users", label: "Admin Users", adminOnly: true },
  { href: "/admin/ai", label: "AI Integration", adminOnly: true },
];

export function AppSidebar({
  role,
  email,
}: {
  role: UserRole;
  email: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const items = NAV.filter((i) => !i.adminOnly || role === "admin");

  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="px-5 py-5">
        <p className="text-sm font-semibold text-slate-900">Traffic Sign Mapping</p>
        <p className="mt-0.5 text-xs text-slate-400">MVP dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-brand text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="truncate text-xs text-slate-500">{email}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-brand">{role}</p>
        <button
          onClick={signOut}
          className="mt-2 text-xs text-slate-500 underline hover:text-slate-800"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
