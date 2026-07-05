import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AdminDemoClient } from "@/components/AdminDemoClient";

export const dynamic = "force-dynamic";

export default async function AdminDemoPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Admin · Demo Tools"
        description="Seed deterministic demo data, review counts, and clear demo-only records."
      />
      <div className="p-4 md:p-6">
        <AdminDemoClient />
      </div>
    </>
  );
}
