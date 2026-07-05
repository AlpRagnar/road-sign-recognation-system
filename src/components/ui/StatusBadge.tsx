// Shared semantic status badge (dot + Title-Case label). Used everywhere a
// review/validation/device/service status appears. Never renders raw snake_case.

interface StatusStyle {
  label: string;
  dot: string;
  text: string;
  bg: string;
}

const STYLES: Record<string, StatusStyle> = {
  // Review / validation statuses
  pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  auto_verified: { label: "Auto Verified", dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50" },
  manually_verified: { label: "Manually Verified", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  rejected: { label: "Rejected", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  duplicate: { label: "Duplicate", dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50" },
  low_confidence: { label: "Low Confidence", dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
  // Device / service states
  active: { label: "Active", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  inactive: { label: "Inactive", dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100" },
  offline: { label: "Offline", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  healthy: { label: "Healthy", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  "mock-ready": { label: "Mock Ready", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  reachable: { label: "Reachable", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  degraded: { label: "Degraded", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  misconfigured: { label: "Misconfigured", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  unavailable: { label: "Unavailable", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  unreachable: { label: "Unreachable", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

function titleCase(raw: string): string {
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function StatusBadge({
  status,
  className = "",
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const key = (status ?? "").toLowerCase();
  const style: StatusStyle =
    STYLES[key] ?? {
      label: status ? titleCase(status) : "—",
      dot: "bg-slate-400",
      text: "text-slate-600",
      bg: "bg-slate-100",
    };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}
