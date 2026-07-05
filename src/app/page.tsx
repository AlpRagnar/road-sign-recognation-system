import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { LandingPage } from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";

// Public root: authenticated users go straight to the dashboard; everyone else
// sees the public landing page (no self-registration; Sign In → /login).
export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (profile) redirect("/dashboard");
  return <LandingPage />;
}
