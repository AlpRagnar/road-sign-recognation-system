-- =====================================================================
-- TASK 013 — durable daily metrics snapshots for long-range KPI reporting.
--
-- One row per calendar day captures cumulative + 24h operational metrics so
-- trends survive even as system_logs / detection_events are pruned. Written
-- only by the server (service-role) via admin_create_daily_metrics_snapshot();
-- RLS is enabled with no client policies.
--
-- Idempotent: IF NOT EXISTS table, CREATE OR REPLACE functions, upsert on
-- snapshot_date.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.daily_metrics_snapshots (
  snapshot_date date primary key,
  total_traffic_signs bigint not null default 0,
  verified_traffic_signs bigint not null default 0,
  pending_traffic_signs bigint not null default 0,
  rejected_traffic_signs bigint not null default 0,
  duplicate_traffic_signs bigint not null default 0,
  total_detection_events bigint not null default 0,
  detections_last_24h bigint not null default 0,
  low_confidence_events bigint not null default 0,
  average_detection_confidence numeric,
  average_ai_response_time_ms numeric,
  active_devices_24h bigint not null default 0,
  active_sessions bigint not null default 0,
  ai_request_total bigint not null default 0,
  ai_request_success bigint not null default 0,
  ai_request_failed bigint not null default 0,
  ai_failure_rate_percent numeric,
  storage_quarantine_pending bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_daily_metrics_date on public.daily_metrics_snapshots(snapshot_date desc);

alter table public.daily_metrics_snapshots enable row level security;

-- ---------------------------------------------------------------------
-- Snapshot upsert RPC. Computes "as-of end of target_date" metrics from
-- existing tables. service_role only; does not depend on auth.uid().
-- ---------------------------------------------------------------------
create or replace function public.admin_create_daily_metrics_snapshot(target_date date default current_date)
returns public.daily_metrics_snapshots
language sql
volatile
as $$
  insert into public.daily_metrics_snapshots as d (
    snapshot_date,
    total_traffic_signs,
    verified_traffic_signs,
    pending_traffic_signs,
    rejected_traffic_signs,
    duplicate_traffic_signs,
    total_detection_events,
    detections_last_24h,
    low_confidence_events,
    average_detection_confidence,
    average_ai_response_time_ms,
    active_devices_24h,
    active_sessions,
    ai_request_total,
    ai_request_success,
    ai_request_failed,
    ai_failure_rate_percent,
    storage_quarantine_pending
  )
  select
    target_date,
    (select count(*) from public.traffic_signs),
    (select count(*) from public.traffic_signs where verification_status in ('auto_verified','manually_verified')),
    (select count(*) from public.traffic_signs where verification_status = 'pending'),
    (select count(*) from public.traffic_signs where verification_status = 'rejected'),
    (select count(*) from public.traffic_signs where verification_status = 'duplicate'),
    (select count(*) from public.detection_events),
    (select count(*) from public.detection_events
       where created_at >= least(now(), (target_date + 1)::timestamptz) - interval '24 hours'
         and created_at <  least(now(), (target_date + 1)::timestamptz)),
    (select count(*) from public.detection_events where validation_status = 'low_confidence'),
    (select round(avg(confidence)::numeric, 4) from public.detection_events
       where confidence is not null
         and created_at >= target_date::timestamptz
         and created_at <  (target_date + 1)::timestamptz),
    (select round(avg(ai_response_time_ms)::numeric, 0) from public.detection_events
       where ai_response_time_ms is not null
         and created_at >= target_date::timestamptz
         and created_at <  (target_date + 1)::timestamptz),
    (select count(distinct device_id) from public.detection_events
       where device_id is not null
         and created_at >= least(now(), (target_date + 1)::timestamptz) - interval '24 hours'
         and created_at <  least(now(), (target_date + 1)::timestamptz)),
    (select count(*) from public.detection_sessions where status = 'active'),
    -- AI request totals over the trailing 24h window (external attempts only).
    (select count(*) from public.system_logs
       where action_type in ('AI_REQUEST_SUCCEEDED','AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')
         and created_at >= least(now(), (target_date + 1)::timestamptz) - interval '24 hours'
         and created_at <  least(now(), (target_date + 1)::timestamptz)),
    (select count(*) from public.system_logs
       where action_type = 'AI_REQUEST_SUCCEEDED'
         and created_at >= least(now(), (target_date + 1)::timestamptz) - interval '24 hours'
         and created_at <  least(now(), (target_date + 1)::timestamptz)),
    (select count(*) from public.system_logs
       where action_type in ('AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')
         and created_at >= least(now(), (target_date + 1)::timestamptz) - interval '24 hours'
         and created_at <  least(now(), (target_date + 1)::timestamptz)),
    (select case when t.total > 0 then round(100.0 * t.failed / t.total, 2) else 0 end
       from (
         select
           count(*) filter (where action_type in ('AI_REQUEST_SUCCEEDED','AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')) as total,
           count(*) filter (where action_type in ('AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')) as failed
         from public.system_logs
         where created_at >= least(now(), (target_date + 1)::timestamptz) - interval '24 hours'
           and created_at <  least(now(), (target_date + 1)::timestamptz)
       ) t),
    (select count(*) from public.storage_quarantine_candidates where quarantine_status = 'pending')
  on conflict (snapshot_date) do update set
    total_traffic_signs = excluded.total_traffic_signs,
    verified_traffic_signs = excluded.verified_traffic_signs,
    pending_traffic_signs = excluded.pending_traffic_signs,
    rejected_traffic_signs = excluded.rejected_traffic_signs,
    duplicate_traffic_signs = excluded.duplicate_traffic_signs,
    total_detection_events = excluded.total_detection_events,
    detections_last_24h = excluded.detections_last_24h,
    low_confidence_events = excluded.low_confidence_events,
    average_detection_confidence = excluded.average_detection_confidence,
    average_ai_response_time_ms = excluded.average_ai_response_time_ms,
    active_devices_24h = excluded.active_devices_24h,
    active_sessions = excluded.active_sessions,
    ai_request_total = excluded.ai_request_total,
    ai_request_success = excluded.ai_request_success,
    ai_request_failed = excluded.ai_request_failed,
    ai_failure_rate_percent = excluded.ai_failure_rate_percent,
    storage_quarantine_pending = excluded.storage_quarantine_pending,
    updated_at = now()
  returning d.*;
$$;

-- Optional read RPC (the admin API reads the table directly, but this is handy).
create or replace function public.admin_daily_metrics_snapshots(from_date date, to_date date)
returns setof public.daily_metrics_snapshots
language sql
stable
as $$
  select * from public.daily_metrics_snapshots
  where snapshot_date between from_date and to_date
  order by snapshot_date desc;
$$;

revoke all on function public.admin_create_daily_metrics_snapshot(date) from public;
revoke all on function public.admin_daily_metrics_snapshots(date, date) from public;
grant execute on function public.admin_create_daily_metrics_snapshot(date) to service_role;
grant execute on function public.admin_daily_metrics_snapshots(date, date) to service_role;
