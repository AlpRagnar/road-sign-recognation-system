import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";

// Auth guard for all protected pages. Middleware already redirects
// unauthenticated requests; this is the defence-in-depth check that also
// provides the profile (role/email) to the sidebar.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <AppSidebar role={profile.role} email={profile.email} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
