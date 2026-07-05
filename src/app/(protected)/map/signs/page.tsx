import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { SignMapView } from "./SignMapView";

export const dynamic = "force-dynamic";

export default async function SignMapPage() {
  const profile = await getCurrentProfile();
  return <SignMapView isAdmin={isAdmin(profile)} />;
}
