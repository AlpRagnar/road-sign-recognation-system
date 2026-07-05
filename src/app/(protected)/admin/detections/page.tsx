import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AdminDetectionsClient } from "@/components/AdminDetectionsClient";

export const dynamic = "force-dynamic";

export default async function AdminDetectionsPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Admin · Detections"
        description="Review raw AI detection events: verify, reject, mark duplicate, or reset."
        actions={
          <div className="flex gap-2">
            <a
              href="/api/admin/export/detection-events.csv"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Export events CSV
            </a>
            <a
              href="/api/admin/export/traffic-signs.csv"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Export signs CSV
            </a>
          </div>
        }
      />
      <div className="p-4 md:p-6">
        <AdminDetectionsClient />
      </div>
    </>
  );
}
