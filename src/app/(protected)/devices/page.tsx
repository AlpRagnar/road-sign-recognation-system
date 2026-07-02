import { PageHeader } from "@/components/PageHeader";
import { DeviceManager } from "@/components/DeviceManager";
import { getCurrentProfile, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const profile = await getCurrentProfile();
  const admin = isAdmin(profile);
  return (
    <>
      <PageHeader
        title="Devices"
        description="Register and manage the field devices you use for detection sessions."
      />
      <div className="p-8">
        <DeviceManager isAdmin={admin} />
      </div>
    </>
  );
}
