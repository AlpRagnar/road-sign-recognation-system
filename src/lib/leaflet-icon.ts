import L from "leaflet";

// Fix Leaflet's default marker icon paths (broken under bundlers).
// Uses the CDN-hosted marker images.
let configured = false;
export function ensureLeafletIcons() {
  if (configured) return;
  configured = true;
  // @ts-expect-error -- private API used by the common Leaflet/webpack fix
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}
