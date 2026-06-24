import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AdminUsersClient } from "@/components/AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Admin · Users"
        description="All profiles. Update display name and role. Auth-level user creation is out of scope."
      />
      <div className="p-8">
        <AdminUsersClient currentProfileId={profile!.id} />
      </div>
    </>
  );
}
