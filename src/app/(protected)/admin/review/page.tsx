import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { ReviewClient, type ReviewSign } from "./ReviewClient";
import { createSignedFrameUrls } from "@/lib/storage/signed-urls";
import type { TrafficSign } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("traffic_signs")
    .select("*")
    .order("last_detected_at", { ascending: false, nullsFirst: false })
    .limit(200);

  const signs = (data ?? []) as TrafficSign[];

  // Sign representative images server-side (admin verified above).
  const signed = await createSignedFrameUrls(
    signs.map((s) => s.representative_image_path ?? s.representative_image_url),
  );
  const withImages: ReviewSign[] = signs.map((s, i) => ({
    ...s,
    representativeUrl: signed[i] ?? null,
  }));

  return (
    <>
      <PageHeader
        title="Sign Review"
        description="Verify, reject, or flag grouped traffic-sign inventory records."
      />
      <div className="p-4 md:p-6">
        <ReviewClient initialSigns={withImages} />
      </div>
    </>
  );
}
