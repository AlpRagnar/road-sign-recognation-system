import type { DeviceType, DeviceStatus } from "@/lib/types/database";

// Allowed device types — MUST match the CHECK constraint in
// supabase/migrations/0001_init.sql (devices.device_type).
export const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: "mobile_phone", label: "Mobile phone" },
  { value: "vehicle_camera", label: "Vehicle camera" },
  { value: "dashcam", label: "Dashcam" },
  { value: "custom_iot_device", label: "Custom IoT device" },
  { value: "test_device", label: "Test device" },
];

export const DEVICE_STATUSES: DeviceStatus[] = ["active", "inactive"];

export function isValidDeviceType(value: unknown): value is DeviceType {
  return DEVICE_TYPES.some((t) => t.value === value);
}

export function isValidDeviceStatus(value: unknown): value is DeviceStatus {
  return value === "active" || value === "inactive";
}

// Generate a stable-ish identifier when the user leaves it blank.
export function generateDeviceIdentifier(deviceType: string): string {
  const prefix = deviceType.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "DEV";
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}
