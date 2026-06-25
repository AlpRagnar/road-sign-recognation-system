"use client";

import { useEffect, useState } from "react";
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
  { href: "/presentation", label: "Presentation" },
  { href: "/admin/logs", label: "Detection Logs", adminOnly: true },
  { href: "/admin/detections", label: "Detection Review", adminOnly: true },
  { href: "/admin/review", label: "Sign Review", adminOnly: true },
  { href: "/admin/devices", label: "Admin Devices", adminOnly: true },
  { href: "/admin/users", label: "Admin Users", adminOnly: true },
  { href: "/admin/ai", label: "AI Integration", adminOnly: true },
  { href: "/admin/analytics", label: "Analytics", adminOnly: true },
  { href: "/admin/storage", label: "Admin Storage", adminOnly: true },
  { href: "/admin/demo", label: "Demo Tools", adminOnly: true },
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
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const items = NAV.filter((i) => !i.adminOnly || role === "admin");

  return (
    <>
      {/* Mobile top bar with hamburger (hidden on md+). */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-slate-900">Traffic Sign Mapping</p>
      </div>

      {/* Backdrop for the mobile drawer. */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: slide-in drawer on mobile, static column on md+. */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-start justify-between px-5 py-5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Traffic Sign Mapping</p>
            <p className="mt-0.5 text-xs text-slate-400">MVP dashboard</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="-mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
    </>
  );
}
