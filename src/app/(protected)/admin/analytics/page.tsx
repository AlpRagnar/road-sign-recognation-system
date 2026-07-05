import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AdminAnalyticsClient } from "@/components/AdminAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Admin · Analytics"
        description="Daily operational metric snapshots and long-range trends."
      />
      <div className="p-4 md:p-6">
        <AdminAnalyticsClient />
      </div>
    </>
  );
}
