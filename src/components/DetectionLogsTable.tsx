import type { DetectionEvent } from "@/lib/types/database";

export type DetectionLogRow = DetectionEvent & {
  profiles?: { full_name: string | null; email: string | null } | null;
  devices?: { device_name: string | null; device_type: string | null } | null;
};

export function DetectionLogsTable({ events }: { events: DetectionLogRow[] }) {
  if (events.length === 0) {
    return <p className="px-8 py-6 text-sm text-slate-400">No detection events yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-3">Class</th>
            <th className="px-3 py-3">Conf.</th>
            <th className="px-3 py-3">User</th>
            <th className="px-3 py-3">Device</th>
            <th className="px-3 py-3">Lat</th>
            <th className="px-3 py-3">Lng</th>
            <th className="px-3 py-3">Acc.</th>
            <th className="px-3 py-3">AI ms</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Time</th>
            <th className="px-3 py-3">Image</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((e) => (
            <tr key={e.id}>
              <td className="px-3 py-2 font-medium text-slate-800">{e.detected_class_name ?? "—"}</td>
              <td className="px-3 py-2">{e.confidence != null ? `${(e.confidence * 100).toFixed(0)}%` : "—"}</td>
              <td className="px-3 py-2 text-slate-600">{e.profiles?.full_name ?? e.profiles?.email ?? "—"}</td>
              <td className="px-3 py-2 text-slate-600">{e.devices?.device_name ?? "—"}</td>
              <td className="px-3 py-2 font-mono text-xs">{e.latitude != null ? e.latitude.toFixed(5) : "—"}</td>
              <td className="px-3 py-2 font-mono text-xs">{e.longitude != null ? e.longitude.toFixed(5) : "—"}</td>
              <td className="px-3 py-2 text-xs">{e.gps_accuracy != null ? `${e.gps_accuracy.toFixed(0)}m` : "—"}</td>
              <td className="px-3 py-2 text-xs">{e.ai_response_time_ms ?? "—"}</td>
              <td className="px-3 py-2 text-xs">{e.validation_status}</td>
              <td className="px-3 py-2 text-xs text-slate-500">{new Date(e.created_at).toLocaleString()}</td>
              <td className="px-3 py-2">
                {e.image_url ? (
                  <a href={e.image_url} target="_blank" rel="noreferrer" className="text-brand underline">
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
  );
}
