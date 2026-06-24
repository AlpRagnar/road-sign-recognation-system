import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AdminDevicesClient } from "@/components/AdminDevicesClient";

export const dynamic = "force-dynamic";

export default async function AdminDevicesPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Admin · Devices"
        description="All devices across users. Edit name, type, or status inline."
      />
      <div className="p-8">
        <AdminDevicesClient />
      </div>
    </>
  );
}
