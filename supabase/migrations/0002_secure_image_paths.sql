-- =====================================================================
-- TASK 008 — store Storage object PATHS (not public URLs) so the app can
-- serve short-lived signed URLs and the bucket can be private in production.
--
-- Backward compatible: existing rows keep their public URL in *_image_url;
-- the app extracts the object path from those URLs when signing.
-- =====================================================================

alter table public.detection_events
  add column if not exists image_path text;

alter table public.traffic_signs
  add column if not exists representative_image_path text;
