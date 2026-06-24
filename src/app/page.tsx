import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

// Root: send authenticated users to the dashboard, everyone else to login.
export default async function HomePage() {
  const profile = await getCurrentProfile();
  redirect(profile ? "/dashboard" : "/login");
}
