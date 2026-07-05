import Link from "next/link";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnSecondary } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

interface Step {
  step: number;
  title: string;
  href: string;
  blurb: string;
  icon: IconName;
  adminOnly?: boolean;
}

const STEPS: Step[] = [
  { step: 1, title: "Dashboard", href: "/dashboard", icon: "dashboard", blurb: "KPI cards, verification breakdown, top sign types, and recent detections." },
  { step: 2, title: "Detection Session", href: "/detection", icon: "detection", blurb: "Select a device, capture camera frames + GPS, and run AI detection." },
  { step: 3, title: "Sign Map", href: "/map/signs", icon: "signmap", blurb: "Optimized sign inventory with marker / cluster / density modes and a detail panel." },
  { step: 4, title: "Detection Review", href: "/admin/detections", icon: "review", blurb: "Review raw AI detection events: verify, reject, mark duplicate, or reset.", adminOnly: true },
  { step: 5, title: "AI Integration", href: "/admin/ai", icon: "ai", blurb: "Health check, model-contract self-test, and AI activity analytics.", adminOnly: true },
  { step: 6, title: "Analytics", href: "/admin/analytics", icon: "analytics", blurb: "Daily metric snapshots, trend charts, and snapshot-coverage warnings.", adminOnly: true },
  { step: 7, title: "Admin Storage", href: "/admin/storage", icon: "storage", blurb: "Image-path backfill status, reference/orphan scan, and safe cleanup.", adminOnly: true },
];

export default async function PresentationPage() {
  const profile = await getCurrentProfile();
  const admin = isAdmin(profile);
  const steps = STEPS.filter((c) => !c.adminOnly || admin);

  return (
    <>
      <PageHeader
        title="Presentation"
        description="Guided demo flow. Open each step in order; presentation mode is on."
        actions={
          admin ? (
            <Link href="/admin/demo" className={btnSecondary}>
              <Icon name="demo" size={16} />
              Demo Tools
            </Link>
          ) : undefined
        }
      />

      <div className="p-4 md:p-6">
        <div className="relative mx-auto max-w-3xl">
          {/* Connecting rail */}
          <div className="absolute left-[27px] top-6 bottom-6 hidden w-px bg-line sm:block" aria-hidden="true" />
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.step} className="relative">
                <Link
                  href={`${s.href}?presentation=1`}
                  className="group flex items-start gap-4 rounded-md border border-line bg-white p-4 transition-colors hover:border-primary"
                >
                  <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white ring-4 ring-canvas">
                    {s.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon name={s.icon} size={18} className="text-primary" />
                      <h2 className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                        {s.title}
                      </h2>
                      {s.adminOnly && (
                        <span className="rounded bg-panel px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{s.blurb}</p>
                  </div>
                  <span className="flex items-center gap-1 self-center text-xs font-medium text-primary">
                    Open
                    <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
