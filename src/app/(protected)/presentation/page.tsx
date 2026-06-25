import Link from "next/link";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

interface Card {
  step: number;
  title: string;
  href: string;
  blurb: string;
  adminOnly?: boolean;
}

const CARDS: Card[] = [
  { step: 1, title: "System Overview", href: "/dashboard", blurb: "KPI cards, verification breakdown, top sign types, and recent detections." },
  { step: 2, title: "Start Detection", href: "/detection", blurb: "Select a device, capture camera frames + GPS, and run AI detection (mock or external)." },
  { step: 3, title: "Traffic Sign Map", href: "/map/signs", blurb: "Optimized sign inventory with marker / cluster / density modes and a detail panel." },
  { step: 4, title: "Live Device Map", href: "/map/devices", blurb: "Last-known device locations updated by polling." },
  { step: 5, title: "AI Integration Health", href: "/admin/ai", blurb: "Health check, model-contract self-test, and AI failure analytics.", adminOnly: true },
  { step: 6, title: "Analytics", href: "/admin/analytics", blurb: "Daily metric snapshots, trend bars, and snapshot-coverage warnings.", adminOnly: true },
  { step: 7, title: "Storage Governance", href: "/admin/storage", blurb: "Quarantine-first cleanup and reconciliation run history — nothing auto-deletes.", adminOnly: true },
];

export default async function PresentationPage() {
  const profile = await getCurrentProfile();
  const admin = isAdmin(profile);
  const cards = CARDS.filter((c) => !c.adminOnly || admin);

  return (
    <>
      <PageHeader
        title="Presentation"
        description="Guided demo flow. Open each step in order; presentation mode is on."
        actions={
          admin ? (
            <Link
              href="/admin/demo"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Demo tools
            </Link>
          ) : undefined
        }
      />
      <div className="grid grid-cols-1 gap-4 p-8 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.step}
            href={`${c.href}?presentation=1`}
            className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-brand"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                {c.step}
              </span>
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-brand">
                {c.title}
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">{c.blurb}</p>
            <p className="mt-3 text-xs font-medium text-brand">Open →</p>
          </Link>
        ))}
      </div>
    </>
  );
}
