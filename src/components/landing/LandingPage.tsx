import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";

const NAV = ["Product", "Workflow", "Features", "Security", "Research"];

const TRUST = [
  "Browser-based field collection",
  "Private image storage",
  "AI-assisted classification",
  "Geospatial de-duplication",
  "Human-in-the-loop review",
  "Audit-ready records",
];

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "camera", title: "Capture", text: "Camera + GPS streaming via the mobile browser." },
  { icon: "ai", title: "Detect", text: "FastAPI + Triton two-stage detection and classification." },
  { icon: "signmap", title: "Group", text: "Confidence & GPS-accuracy weighted de-duplication." },
  { icon: "review", title: "Review", text: "Verify, reject, or flag records on a dashboard." },
  { icon: "storage", title: "Maintain", text: "Inventory map, analytics, and secure media." },
];

const MODULES: { icon: IconName; title: string; text: string }[] = [
  { icon: "detection", title: "Mobile Field Collection", text: "Browser-based camera + GPS capture for registered devices." },
  { icon: "signmap", title: "Traffic-Sign Inventory Map", text: "Grouped signage entities with full observation history." },
  { icon: "review", title: "Detection Review", text: "Confirm AI classifications and spatial placements." },
  { icon: "ai", title: "AI Integration Monitoring", text: "Health, contract self-test, and failure analytics." },
  { icon: "analytics", title: "Inventory Analytics", text: "Daily snapshots and observation-frequency trends." },
  { icon: "shield", title: "Secure Media Governance", text: "Private storage, signed URLs, reference-safe deletion." },
];

const ARCH = [
  "Smartphone Browser",
  "Next.js Server",
  "Private Storage",
  "FastAPI Adapter",
  "Triton Inference",
  "Inventory Records",
];

const SECURITY: { icon: IconName; title: string; text: string }[] = [
  { icon: "lock", title: "Private object storage", text: "Frames live in private storage; access via short-lived signed URLs." },
  { icon: "shield", title: "Server-side secrets", text: "Credentials never reach the client or browser cache." },
  { icon: "logs", title: "Audit logs", text: "Administrative operations are recorded for review." },
  { icon: "users", title: "Role-based access", text: "Field users and administrators see only what they should." },
];

const ROLES: { icon: IconName; title: string; text: string }[] = [
  { icon: "detection", title: "Field User", text: "Capture road imagery with real-time GPS feedback and session status." },
  { icon: "review", title: "Administrator", text: "Manage inventory, verify detections, and generate audit-ready reports." },
  { icon: "analytics", title: "Research / Authority Stakeholder", text: "Use maps, analytics, and exports for operational and research review." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
              <Icon name="signmap" size={18} />
            </span>
            <span className="text-sm font-semibold">Traffic Sign Mapping</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="text-sm text-slate-600 hover:text-slate-900">
                {n}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md border border-line px-3 py-1.5 text-sm text-slate-700 hover:bg-panel">
              Sign In
            </Link>
            <Link href="/login" className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark">
              View the Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="product" className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Turn smartphone road imagery into an auditable, de-duplicated traffic-sign inventory.
            </h1>
            <p className="mt-4 max-w-xl text-slate-600">
              Field crews capture with a browser. AI detects and classifies signs. The platform groups
              repeated observations into geospatial inventory records that administrators review on a map.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
                View the Platform
              </Link>
              <Link href="/login" className="rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-panel">
                Sign In
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ui-previews/inventory-map.png"
              alt="Traffic-sign inventory map preview with markers over an urban basemap"
              className="w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 px-4 py-4 md:px-6">
          {TRUST.map((t) => (
            <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-slate-600">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="text-center text-2xl font-semibold">The Operational Workflow</h2>
        <p className="mt-1 text-center text-sm text-slate-500">Engineered for precision from capture to maintenance.</p>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name={s.icon} size={22} />
              </span>
              <p className="mt-3 text-sm font-semibold">
                <span className="font-mono text-slate-400">{i + 1} </span>
                {s.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="features" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-semibold">Core Product Modules</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <div key={m.title} className="rounded-md border border-line p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-panel text-primary">
                  <Icon name={m.icon} size={18} />
                </span>
                <p className="mt-3 text-sm font-semibold">{m.title}</p>
                <p className="mt-1 text-xs text-slate-500">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ui-previews/map-dashboard-showcase.png"
            alt="Sign map paired with the operational dashboard"
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="mt-3 text-center font-mono text-xs uppercase tracking-wide text-slate-400">
          One operational picture — inventory on the map, health in the numbers.
        </p>
      </section>

      {/* Architecture */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-semibold">System Architecture</h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {ARCH.map((node, i) => (
              <div key={node} className="flex items-center gap-3">
                <span
                  className={`rounded-md border px-3 py-2 text-xs font-medium ${
                    i === ARCH.length - 1
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-panel text-slate-700"
                  }`}
                >
                  {node}
                </span>
                {i < ARCH.length - 1 && <Icon name="arrowRight" size={16} className="text-slate-300" />}
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-slate-400">
            Signed, short-lived media URLs; secrets stay server-side.
          </p>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="text-2xl font-semibold">Security by design</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {SECURITY.map((s) => (
            <div key={s.title} className="flex gap-3 rounded-md border border-line bg-white p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-panel text-primary">
                <Icon name={s.icon} size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="mt-1 text-xs text-slate-500">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-semibold">Engineered for every stakeholder</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.title} className="rounded-md border border-line p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon name={r.icon} size={18} />
                </span>
                <p className="mt-3 text-sm font-semibold">{r.title}</p>
                <p className="mt-1 text-xs text-slate-500">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6">
        <p className="font-mono text-xs uppercase tracking-wide text-primary">
          Operational validation and research
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Evidence-based methodology</h2>
        <p className="mt-4 text-sm italic text-slate-600">
          &ldquo;The platform validates the operational end-to-end web workflow. Detector benchmarking,
          localization evaluation, and labelled field experiments remain separate research activities.&rdquo;
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">Aalborg University</p>
        <p className="text-xs text-slate-400">Department of Computer Science</p>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl font-semibold">Ready to modernize your sign inventory?</h2>
          <p className="mt-2 text-sm text-white/70">
            Start collecting road imagery today with our browser-native capture toolkit.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90">
              Sign In
            </Link>
            <Link href="/login" className="rounded-md border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
              Explore the Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                  <Icon name="signmap" size={15} />
                </span>
                <span className="text-sm font-semibold">Traffic Sign Mapping</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Engineering-grade geospatial precision for modern infrastructure management.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Platform</p>
                <ul className="space-y-1.5 text-slate-600">
                  <li><a href="#workflow" className="hover:text-slate-900">Workflow</a></li>
                  <li><a href="#features" className="hover:text-slate-900">Features</a></li>
                  <li><a href="#security" className="hover:text-slate-900">Security</a></li>
                  <li><a href="#research" className="hover:text-slate-900">Research</a></li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Access</p>
                <ul className="space-y-1.5 text-slate-600">
                  <li><Link href="/login" className="hover:text-slate-900">Sign In</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-line pt-6 font-mono text-xs text-slate-400">
            © 2026 Traffic Sign Mapping — A research and operations project, Aalborg University.
          </p>
        </div>
      </footer>
    </div>
  );
}
