import { PageHeader } from "@/components/PageHeader";
import { DeviceManager } from "@/components/DeviceManager";

export const dynamic = "force-dynamic";

export default function DevicesPage() {
  return (
    <>
      <PageHeader
        title="Devices"
        description="Register and manage the field devices you use for detection sessions."
      />
      <div className="p-8">
        <DeviceManager />
      </div>
    </>
  );
}
