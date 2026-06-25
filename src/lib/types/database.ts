// Hand-written database types for the MVP.
// In a full project you would generate these with `supabase gen types typescript`.

export type UserRole = "user" | "admin";

export type SessionStatus = "active" | "completed" | "failed" | "cancelled";

export type ValidationStatus =
  | "pending"
  | "auto_verified"
  | "manually_verified"
  | "rejected"
  | "duplicate"
  | "low_confidence";

export type DeviceType =
  | "mobile_phone"
  | "vehicle_camera"
  | "dashcam"
  | "custom_iot_device"
  | "test_device";

export type DeviceStatus = "active" | "inactive";

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  user_id: string | null;
  device_name: string;
  device_type: DeviceType;
  device_identifier: string | null;
  last_latitude: number | null;
  last_longitude: number | null;
  last_seen_at: string | null;
  status: DeviceStatus;
  created_at: string;
  updated_at: string;
}

export interface DetectionSession {
  id: string;
  user_id: string;
  device_id: string | null;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
  total_frames: number;
  total_detections: number;
  average_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface DetectionEvent {
  id: string;
  session_id: string | null;
  user_id: string | null;
  device_id: string | null;
  image_url: string | null;
  image_path: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_accuracy: number | null;
  heading: number | null;
  speed: number | null;
  detected_class_id: number | null;
  detected_class_name: string | null;
  confidence: number | null;
  bbox_x: number | null;
  bbox_y: number | null;
  bbox_width: number | null;
  bbox_height: number | null;
  ai_response_raw: unknown;
  ai_response_time_ms: number | null;
  validation_status: ValidationStatus;
  created_at: string;
}

export interface TrafficSign {
  id: string;
  sign_type: string;
  latitude: number;
  longitude: number;
  confidence_score: number | null;
  first_detected_at: string | null;
  last_detected_at: string | null;
  detection_count: number;
  verification_status: ValidationStatus;
  representative_image_url: string | null;
  representative_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrafficSignObservation {
  id: string;
  traffic_sign_id: string;
  detection_event_id: string;
  distance_to_sign_meters: number | null;
  confidence: number | null;
  created_at: string;
}

export interface DeviceLocationLog {
  id: string;
  device_id: string | null;
  user_id: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  recorded_at: string;
}

export type SystemLogAction =
  | "LOGIN"
  | "LOGOUT"
  | "SESSION_STARTED"
  | "SESSION_STOPPED"
  | "IMAGE_UPLOADED"
  | "AI_RESPONSE_RECEIVED"
  | "AI_RESPONSE_FAILED"
  | "AI_REQUEST_STARTED"
  | "AI_REQUEST_SUCCEEDED"
  | "AI_REQUEST_FAILED"
  | "AI_REQUEST_TIMEOUT"
  | "AI_RESPONSE_INVALID"
  | "AI_MOCK_USED"
  | "AI_HEALTH_CHECK_RUN"
  | "AI_SELF_TEST_STARTED"
  | "AI_SELF_TEST_SUCCEEDED"
  | "AI_SELF_TEST_FAILED"
  | "DETECTION_SAVED"
  | "TRAFFIC_SIGN_CREATED"
  | "TRAFFIC_SIGN_UPDATED"
  | "LOCATION_UPDATED"
  | "ADMIN_REVIEW_UPDATED"
  | "DEVICE_CREATED"
  | "DEVICE_UPDATED"
  | "DEVICE_DEACTIVATED"
  | "ADMIN_DEVICE_UPDATED"
  | "ADMIN_PROFILE_UPDATED"
  | "ADMIN_AUTH_USER_CREATED"
  | "ADMIN_AUTH_PASSWORD_RESET"
  | "ADMIN_DETECTION_REVIEW_UPDATED"
  | "ADMIN_STORAGE_BACKFILL"
  | "ADMIN_STORAGE_CLEANUP"
  | "ADMIN_STORAGE_RECONCILIATION_STARTED"
  | "ADMIN_STORAGE_RECONCILIATION_COMPLETED"
  | "ADMIN_STORAGE_QUARANTINE_UPDATED"
  | "ADMIN_STORAGE_QUARANTINE_DELETED"
  | "ADMIN_DAILY_METRICS_SNAPSHOT_CREATED"
  | "ADMIN_DAILY_METRICS_SNAPSHOT_FAILED"
  | "CRON_DAILY_METRICS_SNAPSHOT_STARTED"
  | "CRON_DAILY_METRICS_SNAPSHOT_SUCCEEDED"
  | "CRON_DAILY_METRICS_SNAPSHOT_FAILED"
  | "CRON_STORAGE_RECONCILIATION_STARTED"
  | "CRON_STORAGE_RECONCILIATION_SUCCEEDED"
  | "CRON_STORAGE_RECONCILIATION_FAILED"
  | "ADMIN_DEMO_SEEDED"
  | "ADMIN_DEMO_CLEARED"
  | "ERROR";

export interface SystemLog {
  id: string;
  user_id: string | null;
  device_id: string | null;
  action_type: SystemLogAction;
  message: string | null;
  metadata: unknown;
  created_at: string;
}

export interface DailyMetricsSnapshot {
  snapshot_date: string;
  total_traffic_signs: number;
  verified_traffic_signs: number;
  pending_traffic_signs: number;
  rejected_traffic_signs: number;
  duplicate_traffic_signs: number;
  total_detection_events: number;
  detections_last_24h: number;
  low_confidence_events: number;
  average_detection_confidence: number | null;
  average_ai_response_time_ms: number | null;
  active_devices_24h: number;
  active_sessions: number;
  ai_request_total: number;
  ai_request_success: number;
  ai_request_failed: number;
  ai_failure_rate_percent: number | null;
  storage_quarantine_pending: number;
  created_at: string;
  updated_at: string;
}
