"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminAiHealthClient } from "@/components/AdminAiHealthClient";
import { AdminAiSelfTestClient } from "@/components/AdminAiSelfTestClient";
import { AdminAiLogsClient } from "@/components/AdminAiLogsClient";

type TabId = "connectivity" | "selftest" | "activity";

const TABS: { id: TabId; label: string }[] = [
  { id: "connectivity", label: "Connectivity" },
  { id: "selftest", label: "Self-Test" },
  { id: "activity", label: "Activity & Logs" },
];

// AI operations console: persistent health chip + tabbed sections. All values
// come from the real health/self-test/logs endpoints (no invented metrics).
export function AiConsole() {
  const [tab, setTab] = useState<TabId>("connectivity");
  const [health, setHealth] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Persistent health chip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Current health</span>
          {health ? (
            <StatusBadge status={health} />
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-badge bg-panel px-2 py-0.5 text-xs font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Checking…
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">AI operations console</span>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="pt-1">
        {/* Keep Connectivity mounted (auto-runs the health check for the chip);
            hide inactive tabs so the health state persists across tab switches. */}
        <div className={tab === "connectivity" ? "" : "hidden"}>
          <AdminAiHealthClient autoRun onHealth={setHealth} />
        </div>
        {tab === "selftest" && <AdminAiSelfTestClient />}
        {tab === "activity" && <AdminAiLogsClient />}
      </div>
    </div>
  );
}
