"use client";

import { Icon, type IconName } from "@/components/ui/Icon";

// Shared style helpers + small primitives for the Stitch redesign.

// ---- Button class helpers (use with <button>/<a>/<Link>) ----
export const btn =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";
export const btnPrimary = `${btn} bg-primary px-4 py-2 text-white hover:bg-primary-dark`;
export const btnSecondary = `${btn} border border-line bg-white px-4 py-2 text-slate-700 hover:bg-panel`;
export const btnDanger = `${btn} bg-red-600 px-4 py-2 text-white hover:bg-red-700`;
export const btnDangerOutline = `${btn} border border-red-300 px-3 py-1.5 text-red-700 hover:bg-red-50`;
export const btnGhost = `${btn} px-3 py-1.5 text-slate-600 hover:bg-panel`;

// ---- Card / panel ----
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-md border border-line bg-white ${className}`}>{children}</div>
  );
}

// ---- KPI tile ----
export function KpiTile({
  label,
  value,
  hint,
  icon,
  live = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: IconName;
  live?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-md border border-line bg-white p-3">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {live ? (
          <span className="pulse-dot mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        ) : icon ? (
          <Icon name={icon} size={18} className="text-primary" />
        ) : null}
      </div>
      <div className="mt-2">
        <div className="font-mono text-xl font-semibold tabular text-slate-900">{value}</div>
        {hint && <div className="mt-0.5 text-[10px] text-slate-400">{hint}</div>}
      </div>
    </div>
  );
}

// ---- Confidence meter (bar + %) ----
export function ConfidenceMeter({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="font-mono text-xs text-slate-400">—</span>;
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  const color = pct >= 75 ? "bg-green-500" : pct >= 55 ? "bg-amber-500" : "bg-red-500";
  const text = pct >= 75 ? "text-slate-600" : pct >= 55 ? "text-slate-600" : "text-red-600";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-panel">
        <span className={`block h-full ${color}`} style={{ width: `${pct}%` }} />
      </span>
      <span className={`font-mono text-xs tabular ${text}`}>{pct}%</span>
    </span>
  );
}

// ---- Empty state ----
export function EmptyState({
  icon = "sign",
  title,
  hint,
  action,
}: {
  icon?: IconName;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel text-slate-400">
        <Icon name={icon} size={20} />
      </span>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="max-w-sm text-xs text-slate-400">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ---- Error banner ----
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
      <Icon name="warning" size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ---- Loading skeleton row ----
export function SkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3 animate-pulse rounded bg-panel"
              style={{ width: `${100 / cols - 4}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
