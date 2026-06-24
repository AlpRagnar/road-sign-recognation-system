import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { DetectionLogsTable, type DetectionLogRow } from "@/components/DetectionLogsTable";
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
  const rows = (data ?? []) as Array<{ image_path?: string | null; image_url?: string | null }>;
  const signed = await createSignedFrameUrls(rows.map((r) => r.image_path ?? r.image_url));
  rows.forEach((r, i) => {
    r.image_url = signed[i] ?? null;
  });

  return (
    <>
      <PageHeader
        title="Detection Logs"
        description="Raw AI detection events (latest 200)."
      />
      <div className="m-8 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <DetectionLogsTable events={rows as unknown as DetectionLogRow[]} />
      </div>
    </>
  );
}
