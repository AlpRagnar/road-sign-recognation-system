import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AiConsole } from "@/components/AiConsole";

export const dynamic = "force-dynamic";

export default async function AdminAiPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile)) redirect("/dashboard");

  return (
    <>
      <PageHeader
        title="Admin · AI integration"
        description="Health, model-contract self-test, and AI activity observability."
      />
      <div className="p-4 md:p-6">
        <AiConsole />
      </div>
    </>
  );
}
