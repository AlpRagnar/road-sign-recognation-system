"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// Detects presentation mode via the `?presentation=1` query param.
export function usePresentationMode(): boolean {
  const sp = useSearchParams();
  return sp.get("presentation") === "1";
}

function BadgeInner() {
  const sp = useSearchParams();
  const pathname = usePathname();
  if (sp.get("presentation") !== "1") return null;

  return (
    <div className="pointer-events-auto fixed right-4 top-4 z-[2000] flex items-center gap-2 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/30">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
      Presentation Mode
      <Link
        href={pathname}
        className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium hover:bg-white/30"
      >
        Exit
      </Link>
    </div>
  );
}

// Fixed badge shown across protected pages when presentation mode is active.
export function PresentationBadge() {
  return (
    <Suspense fallback={null}>
      <BadgeInner />
    </Suspense>
  );
}
