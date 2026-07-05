"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { UserRole } from "@/lib/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

const GENERAL_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/detection", label: "Detection Session", icon: "detection" },
  { href: "/map/signs", label: "Sign Map", icon: "signmap" },
  { href: "/map/devices", label: "Device Map", icon: "devicemap" },
  { href: "/devices", label: "Devices", icon: "devices" },
  { href: "/presentation", label: "Presentation", icon: "presentation" },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/logs", label: "Detection Logs", icon: "logs" },
  { href: "/admin/detections", label: "Detection Review", icon: "review" },
  { href: "/admin/review", label: "Sign Review", icon: "signreview" },
  { href: "/admin/devices", label: "Admin Devices", icon: "admindevices" },
  { href: "/admin/users", label: "Admin Users", icon: "users" },
  { href: "/admin/ai", label: "AI Integration", icon: "ai" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { href: "/admin/storage", label: "Admin Storage", icon: "storage" },
  { href: "/admin/demo", label: "Demo Tools", icon: "demo" },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-primary font-semibold text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon name={item.icon} size={20} className="shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar({
  role,
  email,
  fullName,
}: {
  role: UserRole;
  email: string | null;
  fullName?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const close = () => setOpen(false);
  const displayName = fullName || email?.split("@")[0] || "Account";

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="app-sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 ring-1 ring-line hover:bg-panel"
        >
          <Icon name="menu" size={18} />
        </button>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">Traffic Sign Mapping</p>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          aria-hidden="true"
          onClick={close}
        />
      )}

      {/* Sidebar (drawer on mobile, static navy rail on md+) */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/10 bg-navy transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-start justify-between px-6 py-5">
          <div className="leading-tight">
            <p className="text-base font-semibold text-white">Traffic Sign Mapping</p>
            <p className="mt-0.5 text-xs text-white/50">Road-Sign Inventory Platform</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation menu"
            className="-mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 md:hidden"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
              General
            </p>
            <div className="space-y-1">
              {GENERAL_NAV.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={close} />
              ))}
            </div>
          </div>

          {role === "admin" && (
            <div>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                Admin
              </p>
              <div className="space-y-1">
                {ADMIN_NAV.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={close} />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Account block */}
        <div className="shrink-0 border-t border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 bg-primary/20 text-primary">
              <Icon name="person" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-white">
                  {role}
                </span>
              </div>
              <p className="truncate text-[11px] text-white/40">{email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
