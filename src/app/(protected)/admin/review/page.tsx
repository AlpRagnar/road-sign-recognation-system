import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { ReviewClient } from "./ReviewClient";
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

  return (
    <>
      <PageHeader
        title="Review"
        description="Verify, reject, or flag traffic-sign inventory records."
      />
      <div className="p-8">
        <ReviewClient initialSigns={(data ?? []) as TrafficSign[]} />
      </div>
    </>
  );
}
