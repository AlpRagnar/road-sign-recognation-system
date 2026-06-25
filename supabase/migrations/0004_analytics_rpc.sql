-- =====================================================================
-- TASK 011 — DB-side analytics RPCs for admin AI observability + dashboard.
--
-- These functions aggregate public.system_logs (AI actions) and core tables
-- entirely in the database, so the admin dashboard does not have to pull and
-- aggregate large windows in JS.
--
-- SECURITY MODEL
--   The app calls these only from server-side admin Route Handlers using the
--   service-role client (the route already checks role = 'admin'). We therefore
--   REVOKE execute from PUBLIC and GRANT only to service_role, so anon /
--   authenticated clients cannot call them directly. Functions are SECURITY
--   INVOKER (run as service_role) and never return raw metadata / ai_response_raw.
--
-- Idempotent: uses CREATE OR REPLACE; safe to re-run.
-- =====================================================================

-- Production AI request outcome actions (self-test/health/started excluded).
-- Inlined in each function for clarity.

-- ---------------------------------------------------------------------
-- 2.1 admin_ai_activity_summary
-- ---------------------------------------------------------------------
create or replace function public.admin_ai_activity_summary(p_window_hours integer default 24)
returns table (
  total_requests bigint,
  success_count bigint,
  failed_count bigint,
  timeout_count bigint,
  invalid_count bigint,
  mock_count bigint,
  failure_rate numeric,
  avg_elapsed_ms numeric,
  latest_success_at timestamptz,
  latest_failure_at timestamptz
)
language sql
stable
as $$
  with logs as (
    select
      action_type,
      created_at,
      case
        when (metadata->>'elapsedMs') ~ '^[0-9]+(\.[0-9]+)?$'
          then (metadata->>'elapsedMs')::numeric
      end as elapsed
    from public.system_logs
    where created_at >= now() - make_interval(hours => greatest(p_window_hours, 1))
      and action_type in (
        'AI_REQUEST_SUCCEEDED','AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT',
        'AI_RESPONSE_INVALID','AI_MOCK_USED'
      )
  ),
  agg as (
    select
      count(*) as total_requests,
      count(*) filter (where action_type = 'AI_REQUEST_SUCCEEDED') as success_count,
      count(*) filter (where action_type = 'AI_REQUEST_FAILED') as failed_count,
      count(*) filter (where action_type = 'AI_REQUEST_TIMEOUT') as timeout_count,
      count(*) filter (where action_type = 'AI_RESPONSE_INVALID') as invalid_count,
      count(*) filter (where action_type = 'AI_MOCK_USED') as mock_count,
      round(avg(elapsed)) as avg_elapsed_ms,
      max(created_at) filter (where action_type = 'AI_REQUEST_SUCCEEDED') as latest_success_at,
      max(created_at) filter (where action_type in
        ('AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')) as latest_failure_at
    from logs
  )
  select
    total_requests,
    success_count,
    failed_count,
    timeout_count,
    invalid_count,
    mock_count,
    case
      when (success_count + failed_count + timeout_count + invalid_count) > 0
        then round(100.0 * (failed_count + timeout_count + invalid_count)
             / (success_count + failed_count + timeout_count + invalid_count), 2)
      else 0
    end as failure_rate,
    avg_elapsed_ms,
    latest_success_at,
    latest_failure_at
  from agg;
$$;

-- ---------------------------------------------------------------------
-- 2.2 admin_ai_failure_breakdown
-- ---------------------------------------------------------------------
create or replace function public.admin_ai_failure_breakdown(p_window_hours integer default 24)
returns table (category text, count bigint)
language sql
stable
as $$
  select category, count(*)::bigint as count
  from (
    select case
      when action_type = 'AI_REQUEST_TIMEOUT' then 'timeout'
      when action_type = 'AI_RESPONSE_INVALID' then 'validation'
      when action_type = 'AI_REQUEST_FAILED' then
        case
          when (metadata->>'category') in ('config','network','http') then metadata->>'category'
          when (metadata->>'category') = 'timeout' then 'timeout'
          when (metadata->>'category') = 'invalid_response' then 'validation'
          else 'unknown'
        end
      else null
    end as category
    from public.system_logs
    where created_at >= now() - make_interval(hours => greatest(p_window_hours, 1))
      and action_type in ('AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')
  ) t
  where category is not null
  group by category;
$$;

-- ---------------------------------------------------------------------
-- 2.3 admin_ai_timeseries (zero-filled buckets via generate_series)
-- ---------------------------------------------------------------------
create or replace function public.admin_ai_timeseries(
  p_window_hours integer default 24,
  p_bucket_minutes integer default 60
)
returns table (
  bucket_start timestamptz,
  total_requests bigint,
  success_count bigint,
  failed_count bigint,
  timeout_count bigint,
  invalid_count bigint,
  mock_count bigint,
  failure_rate numeric,
  avg_elapsed_ms numeric
)
language sql
stable
as $$
  with bucket_secs as (
    select (greatest(p_bucket_minutes, 1) * 60)::numeric as s
  ),
  logs as (
    select
      to_timestamp(floor(extract(epoch from created_at) / (select s from bucket_secs))
        * (select s from bucket_secs)) as bucket_start,
      action_type,
      case
        when (metadata->>'elapsedMs') ~ '^[0-9]+(\.[0-9]+)?$'
          then (metadata->>'elapsedMs')::numeric
      end as elapsed
    from public.system_logs
    where created_at >= now() - make_interval(hours => greatest(p_window_hours, 1))
      and action_type in (
        'AI_REQUEST_SUCCEEDED','AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT',
        'AI_RESPONSE_INVALID','AI_MOCK_USED'
      )
  ),
  series as (
    select generate_series(
      to_timestamp(floor(extract(epoch from (now() - make_interval(hours => greatest(p_window_hours, 1))))
        / (select s from bucket_secs)) * (select s from bucket_secs)),
      now(),
      make_interval(mins => greatest(p_bucket_minutes, 1))
    ) as bucket_start
  )
  select
    s.bucket_start,
    count(l.action_type)::bigint as total_requests,
    count(*) filter (where l.action_type = 'AI_REQUEST_SUCCEEDED')::bigint as success_count,
    count(*) filter (where l.action_type = 'AI_REQUEST_FAILED')::bigint as failed_count,
    count(*) filter (where l.action_type = 'AI_REQUEST_TIMEOUT')::bigint as timeout_count,
    count(*) filter (where l.action_type = 'AI_RESPONSE_INVALID')::bigint as invalid_count,
    count(*) filter (where l.action_type = 'AI_MOCK_USED')::bigint as mock_count,
    case
      when count(*) filter (where l.action_type in
        ('AI_REQUEST_SUCCEEDED','AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')) > 0
      then round(100.0 * count(*) filter (where l.action_type in
        ('AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID'))
        / count(*) filter (where l.action_type in
        ('AI_REQUEST_SUCCEEDED','AI_REQUEST_FAILED','AI_REQUEST_TIMEOUT','AI_RESPONSE_INVALID')), 2)
      else 0
    end as failure_rate,
    round(avg(l.elapsed)) as avg_elapsed_ms
  from series s
  left join logs l on l.bucket_start = s.bucket_start
  group by s.bucket_start
  order by s.bucket_start;
$$;

-- ---------------------------------------------------------------------
-- 2.4 admin_detection_dashboard_summary
-- ---------------------------------------------------------------------
create or replace function public.admin_detection_dashboard_summary()
returns table (
  total_signs bigint,
  today_detections bigint,
  last_24h_detections bigint,
  last_7d_detections bigint,
  active_devices bigint,
  active_sessions bigint,
  low_confidence_detections bigint,
  avg_confidence numeric,
  avg_ai_response_time_ms numeric
)
language sql
stable
as $$
  select
    (select count(*) from public.traffic_signs)::bigint,
    (select count(*) from public.detection_events where created_at >= date_trunc('day', now()))::bigint,
    (select count(*) from public.detection_events where created_at >= now() - interval '24 hours')::bigint,
    (select count(*) from public.detection_events where created_at >= now() - interval '7 days')::bigint,
    (select count(*) from public.devices where status = 'active')::bigint,
    (select count(*) from public.detection_sessions where status = 'active')::bigint,
    (select count(*) from public.detection_events where validation_status = 'low_confidence')::bigint,
    (select round(avg(confidence)::numeric, 4) from public.detection_events where confidence is not null),
    (select round(avg(ai_response_time_ms)::numeric, 0) from public.detection_events where ai_response_time_ms is not null);
$$;

-- ---------------------------------------------------------------------
-- Grants: restrict to service_role only (called from server admin routes).
-- ---------------------------------------------------------------------
revoke all on function public.admin_ai_activity_summary(integer) from public;
revoke all on function public.admin_ai_failure_breakdown(integer) from public;
revoke all on function public.admin_ai_timeseries(integer, integer) from public;
revoke all on function public.admin_detection_dashboard_summary() from public;

grant execute on function public.admin_ai_activity_summary(integer) to service_role;
grant execute on function public.admin_ai_failure_breakdown(integer) to service_role;
grant execute on function public.admin_ai_timeseries(integer, integer) to service_role;
grant execute on function public.admin_detection_dashboard_summary() to service_role;
