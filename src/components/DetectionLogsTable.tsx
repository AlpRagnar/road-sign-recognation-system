import { getTrafficSignDisplayName } from "@/lib/traffic-sign-classes";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfidenceMeter } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import type { DetectionEvent } from "@/lib/types/database";

export type DetectionLogRow = DetectionEvent & {
  profiles?: { full_name: string | null; email: string | null } | null;
  devices?: { device_name: string | null; device_type: string | null } | null;
};

function className(e: DetectionLogRow) {
  return e.detected_class_name || e.detected_class_id != null
    ? getTrafficSignDisplayName(e.detected_class_id, e.detected_class_name)
    : "—";
}

export function DetectionLogsTable({ events }: { events: DetectionLogRow[] }) {
  if (events.length === 0) {
    return <p className="px-6 py-8 text-sm text-slate-400">No detection events yet.</p>;
  }
  return (
    <>
      {/* Desktop: dense read-only table (sticky header, frozen Class column) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-panel/70 text-left">
            <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:font-mono [&>th]:text-[11px] [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-slate-500">
              <th className="sticky left-0 z-10 bg-panel/70">Class</th>
              <th>Conf.</th>
              <th>User</th>
              <th>Device</th>
              <th>Lat</th>
              <th>Lng</th>
              <th>Acc.</th>
              <th>AI ms</th>
              <th>Status</th>
              <th>Time</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-panel/40">
                <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-slate-800">
                  {className(e)}
                </td>
                <td className="px-3 py-2"><ConfidenceMeter value={e.confidence} /></td>
                <td className="px-3 py-2 text-slate-600">{e.profiles?.full_name ?? e.profiles?.email ?? "—"}</td>
                <td className="px-3 py-2 text-slate-600">{e.devices?.device_name ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-xs tabular">{e.latitude != null ? e.latitude.toFixed(5) : "—"}</td>
                <td className="px-3 py-2 font-mono text-xs tabular">{e.longitude != null ? e.longitude.toFixed(5) : "—"}</td>
                <td className="px-3 py-2 font-mono text-xs tabular">{e.gps_accuracy != null ? `${e.gps_accuracy.toFixed(0)}m` : "—"}</td>
                <td className="px-3 py-2 font-mono text-xs tabular">{e.ai_response_time_ms ?? "—"}</td>
                <td className="px-3 py-2"><StatusBadge status={e.validation_status} /></td>
                <td className="px-3 py-2 font-mono text-xs tabular text-slate-500">{new Date(e.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  {e.image_url ? (
                    <a href={e.image_url} target="_blank" rel="noreferrer" className="text-primary underline">
                      view
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: event cards (read-only) */}
      <div className="divide-y divide-line md:hidden">
        {events.map((e) => (
          <div key={e.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded border border-line bg-panel text-primary">
                  <Icon name="sign" size={16} />
                </span>
                <span className="font-medium text-slate-800">{className(e)}</span>
              </div>
              <StatusBadge status={e.validation_status} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <ConfidenceMeter value={e.confidence} />
              {e.image_url ? (
                <a href={e.image_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                  view image
                </a>
              ) : null}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[11px] tabular text-slate-500">
              <span>{e.devices?.device_name ?? "—"}</span>
              <span className="text-right">{e.profiles?.full_name ?? e.profiles?.email ?? "—"}</span>
              <span>
                {e.latitude != null ? e.latitude.toFixed(5) : "—"}, {e.longitude != null ? e.longitude.toFixed(5) : "—"}
              </span>
              <span className="text-right">{e.ai_response_time_ms != null ? `${e.ai_response_time_ms} ms` : "—"}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-slate-400">{new Date(e.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </>
  );
}
