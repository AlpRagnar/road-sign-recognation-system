import { PageHeader } from "@/components/PageHeader";
import { DetectionClient } from "./DetectionClient";

export default function DetectionPage() {
  return (
    <>
      <PageHeader
        title="Detection Session"
        description="Capture frames from the camera and GPS, and run AI traffic-sign detection."
      />
      <DetectionClient />
    </>
  );
}
