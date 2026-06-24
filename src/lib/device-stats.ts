import type { SupabaseClient } from "@supabase/supabase-js";

// Attaches a detection_events count to each device. Server-only (needs a
// trusted client). Device counts are small for the MVP, so a per-device
// head count query is acceptable.
export async function attachDetectionCounts<T extends { id: string }>(
  client: SupabaseClient,
  devices: T[],
): Promise<(T & { detection_count: number })[]> {
  return Promise.all(
    devices.map(async (d) => {
      const { count } = await client
        .from("detection_events")
        .select("*", { count: "exact", head: true })
        .eq("device_id", d.id);
      return { ...d, detection_count: count ?? 0 };
    }),
  );
}
