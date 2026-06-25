-- =====================================================================
-- TASK 010 — idempotent backfill of Storage object PATHS from legacy URL
-- columns left over before TASK 008 switched to signed URLs.
--
-- Populates:
--   detection_events.image_path           <- detection_events.image_url
--   traffic_signs.representative_image_path <- traffic_signs.representative_image_url
--
-- Only fills rows where the path column is empty AND the legacy URL contains an
-- extractable Supabase Storage object path. Old URL columns are intentionally
-- NOT dropped or nulled (kept for compatibility / re-runs). Safe to run many
-- times — the WHERE guards make it a no-op once paths are set.
--
-- Supported URL shapes (bucket name matched generically as the first path
-- segment after the access type, so this is project/host independent):
--   /storage/v1/object/public/<bucket>/<path>
--   /storage/v1/object/sign/<bucket>/<path>?token=...
--   /storage/v1/object/authenticated/<bucket>/<path>
-- The captured group stops at "?" so any signed-URL token is excluded.
-- Truly external URLs (not Supabase Storage) are left unresolved.
-- =====================================================================

update public.detection_events
set image_path = substring(
  image_url from '/object/(?:public|sign|authenticated)/[^/]+/([^?]+)'
)
where (image_path is null or image_path = '')
  and image_url is not null
  and image_url ~ '/object/(?:public|sign|authenticated)/[^/]+/[^?]+';

update public.traffic_signs
set representative_image_path = substring(
  representative_image_url from '/object/(?:public|sign|authenticated)/[^/]+/([^?]+)'
)
where (representative_image_path is null or representative_image_path = '')
  and representative_image_url is not null
  and representative_image_url ~ '/object/(?:public|sign|authenticated)/[^/]+/[^?]+';
