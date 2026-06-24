import type { Device } from "@/lib/types/database";

type DeviceWithCount = Device & { detection_count?: number };

export function DevicesTable({ devices }: { devices: DeviceWithCount[] }) {
  if (devices.length === 0) {
    return <p className="px-8 py-6 text-sm text-slate-400">No devices yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last latitude</th>
            <th className="px-4 py-3">Last longitude</th>
            <th className="px-4 py-3">Last seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {devices.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-3 font-medium text-slate-800">{d.device_name}</td>
              <td className="px-4 py-3 text-slate-600">{d.device_type}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    d.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {d.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-slate-600">
                {d.last_latitude != null ? d.last_latitude.toFixed(5) : "—"}
              </td>
              <td className="px-4 py-3 font-mono text-slate-600">
                {d.last_longitude != null ? d.last_longitude.toFixed(5) : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
