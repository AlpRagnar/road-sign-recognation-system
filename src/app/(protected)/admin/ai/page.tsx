import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { AdminAiHealthClient } from "@/components/AdminAiHealthClient";
import { AdminAiSelfTestClient } from "@/components/AdminAiSelfTestClient";
import { AdminAiLogsClient } from "@/components/AdminAiLogsClient";

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
      <div className="space-y-8 p-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Connectivity
          </h2>
          <AdminAiHealthClient />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Self-test
          </h2>
          <AdminAiSelfTestClient />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Activity & logs
          </h2>
          <AdminAiLogsClient />
        </section>
      </div>
    </>
  );
}
