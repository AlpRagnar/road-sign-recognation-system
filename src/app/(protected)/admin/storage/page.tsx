import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AdminStorageClient } from "@/components/AdminStorageClient";
import { AdminQuarantineClient } from "@/components/AdminQuarantineClient";

export const dynamic = "force-dynamic";

export default async function AdminStoragePage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Admin · Storage"
        description="Backfill status, quarantine-first reconciliation, and safe orphan cleanup."
      />
      <div className="space-y-8 p-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Backfill & legacy tools
          </h2>
          <AdminStorageClient />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Quarantine reconciliation (recommended)
          </h2>
          <AdminQuarantineClient />
        </section>
      </div>
    </>
  );
}
