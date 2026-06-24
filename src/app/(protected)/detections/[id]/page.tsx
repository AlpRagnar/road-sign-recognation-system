import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DetectionDetailClient } from "@/components/DetectionDetailClient";

export const dynamic = "force-dynamic";

// Protected by the (protected) layout auth guard; the API enforces owner/admin
// access to the specific detection event.
export default function DetectionDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageHeader
        title="Detection detail"
        description="Captured frame, bounding box, metadata, and AI response."
        actions={
          <Link
            href="/admin/detections"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Back to detections
          </Link>
        }
      />
      <DetectionDetailClient id={params.id} />
    </>
  );
}
