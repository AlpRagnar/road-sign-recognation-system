// Lightweight, dependency-free grid clustering for map points.
// Snaps points to a zoom-dependent lat/lng grid so the static sign map stays
// readable when many signs exist — no leaflet.markercluster dependency needed.

export interface ClusterablePoint {
  id: string;
  lat: number;
  lng: number;
}

export interface Cluster<T extends ClusterablePoint> {
  key: string;
  lat: number; // centroid
  lng: number;
  items: T[];
}

// Grid cell size in degrees for a given map zoom. Larger cells at low zoom
// merge distant points; smaller cells at high zoom separate them.
export function cellSizeForZoom(zoom: number): number {
  return 80 / Math.pow(2, Math.max(1, zoom));
}

export function gridCluster<T extends ClusterablePoint>(
  points: T[],
  cellDeg: number,
): Cluster<T>[] {
  const buckets = new Map<string, T[]>();
  for (const p of points) {
    const gx = Math.round(p.lat / cellDeg);
    const gy = Math.round(p.lng / cellDeg);
    const key = `${gx}:${gy}`;
    const arr = buckets.get(key);
    if (arr) arr.push(p);
    else buckets.set(key, [p]);
  }

  const clusters: Cluster<T>[] = [];
  for (const [key, items] of buckets) {
    const lat = items.reduce((s, i) => s + i.lat, 0) / items.length;
    const lng = items.reduce((s, i) => s + i.lng, 0) / items.length;
    clusters.push({ key, lat, lng, items });
  }
  return clusters;
}
