import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { DetectionLogsTable, type DetectionLogRow } from "@/components/DetectionLogsTable";
import { KpiTile } from "@/components/ui/primitives";
import { createSignedFrameUrls } from "@/lib/storage/signed-urls";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("detection_events")
    .select("*, profiles(full_name, email), devices(device_name, device_type)")
    .order("created_at", { ascending: false })
    .limit(200);

  // Sign images server-side (admin already verified above).
  const rows = (data ?? []) as Array<{
    image_path?: string | null;
    image_url?: string | null;
    validation_status?: string;
    device_id?: string | null;
  }>;
  const signed = await createSignedFrameUrls(rows.map((r) => r.image_path ?? r.image_url));
  rows.forEach((r, i) => {
    r.image_url = signed[i] ?? null;
  });

  // Compact KPI summary computed from the currently loaded rows only.
  const shown = rows.length;
  const lowConf = rows.filter((r) => r.validation_status === "low_confidence").length;
  const pending = rows.filter((r) => r.validation_status === "pending").length;
  const devices = new Set(rows.map((r) => r.device_id).filter(Boolean)).size;

  return (
    <>
      <PageHeader
        title="Detection Logs"
        description="Raw AI detection events (latest 200)."
        tag={
          <span className="rounded bg-panel px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Read-only
          </span>
        }
      />
      <div className="space-y-6 p-4 md:p-6">
        {shown > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiTile label="Events shown" value={shown} hint="Latest 200 max" icon="logs" />
            <KpiTile label="Devices" value={devices} hint="In this window" icon="devices" />
            <KpiTile label="Pending" value={pending} hint="In this window" icon="clock" />
            <KpiTile label="Low confidence" value={lowConf} hint="In this window" icon="warning" />
          </div>
        )}
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <DetectionLogsTable events={rows as unknown as DetectionLogRow[]} />
        </div>
      </div>
    </>
  );
}
