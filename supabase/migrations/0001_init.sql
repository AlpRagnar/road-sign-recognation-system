-- =====================================================================
-- Traffic Sign Detection Mapping System — initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- devices
-- ---------------------------------------------------------------------
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  device_name text not null,
  device_type text not null default 'mobile_phone'
    check (device_type in ('mobile_phone','vehicle_camera','dashcam','custom_iot_device','test_device')),
  device_identifier text unique,
  last_latitude double precision,
  last_longitude double precision,
  last_seen_at timestamptz,
  status text not null default 'inactive' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_devices_user on public.devices(user_id);

-- ---------------------------------------------------------------------
-- detection_sessions
-- ---------------------------------------------------------------------
create table if not exists public.detection_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active','completed','failed','cancelled')),
  total_frames integer not null default 0,
  total_detections integer not null default 0,
  average_confidence double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sessions_user on public.detection_sessions(user_id);

-- ---------------------------------------------------------------------
-- detection_events  (raw AI responses)
-- ---------------------------------------------------------------------
create table if not exists public.detection_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.detection_sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  device_id uuid references public.devices(id) on delete set null,
  image_url text,
  latitude double precision,
  longitude double precision,
  gps_accuracy double precision,
  heading double precision,
  speed double precision,
  detected_class_id integer,
  detected_class_name text,
  confidence double precision,
  bbox_x double precision,
  bbox_y double precision,
  bbox_width double precision,
  bbox_height double precision,
  ai_response_raw jsonb,
  ai_response_time_ms integer,
  validation_status text not null default 'pending'
    check (validation_status in ('pending','auto_verified','manually_verified','rejected','duplicate','low_confidence')),
  created_at timestamptz not null default now()
);
create index if not exists idx_events_session on public.detection_events(session_id);
create index if not exists idx_events_created on public.detection_events(created_at desc);
create index if not exists idx_events_class on public.detection_events(detected_class_name);

-- ---------------------------------------------------------------------
-- traffic_signs  (optimized inventory shown on the map)
-- ---------------------------------------------------------------------
create table if not exists public.traffic_signs (
  id uuid primary key default gen_random_uuid(),
  sign_type text not null,
  latitude double precision not null,
  longitude double precision not null,
  confidence_score double precision,
  first_detected_at timestamptz,
  last_detected_at timestamptz,
  detection_count integer not null default 1,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','auto_verified','manually_verified','rejected','duplicate','low_confidence')),
  representative_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_signs_type on public.traffic_signs(sign_type);
create index if not exists idx_signs_status on public.traffic_signs(verification_status);

-- ---------------------------------------------------------------------
-- traffic_sign_observations  (links events ↔ signs)
-- ---------------------------------------------------------------------
create table if not exists public.traffic_sign_observations (
  id uuid primary key default gen_random_uuid(),
  traffic_sign_id uuid not null references public.traffic_signs(id) on delete cascade,
  detection_event_id uuid not null references public.detection_events(id) on delete cascade,
  distance_to_sign_meters double precision,
  confidence double precision,
  created_at timestamptz not null default now(),
  unique (traffic_sign_id, detection_event_id)
);
create index if not exists idx_obs_sign on public.traffic_sign_observations(traffic_sign_id);

-- ---------------------------------------------------------------------
-- device_location_logs
-- ---------------------------------------------------------------------
create table if not exists public.device_location_logs (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  speed double precision,
  heading double precision,
  recorded_at timestamptz not null default now()
);
create index if not exists idx_loc_device on public.device_location_logs(device_id, recorded_at desc);

-- ---------------------------------------------------------------------
-- system_logs
-- ---------------------------------------------------------------------
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  device_id uuid references public.devices(id) on delete set null,
  action_type text not null,
  message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_syslogs_created on public.system_logs(created_at desc);

-- =====================================================================
-- Auto-create a profile row when a new auth user signs up
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- The backend uses the SERVICE ROLE key for writes (bypasses RLS).
-- These policies cover client-side reads via the anon key.
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.detection_sessions enable row level security;
alter table public.detection_events enable row level security;
alter table public.traffic_signs enable row level security;
alter table public.traffic_sign_observations enable row level security;
alter table public.device_location_logs enable row level security;
alter table public.system_logs enable row level security;

-- Helper: is the current auth user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: a user can read/update their own row; admins read all.
create policy "profiles self read" on public.profiles
  for select using (auth_user_id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles
  for update using (auth_user_id = auth.uid());

-- devices: owner or admin can read.
create policy "devices read" on public.devices
  for select using (
    public.is_admin()
    or user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- detection_sessions: owner or admin can read.
create policy "sessions read" on public.detection_sessions
  for select using (
    public.is_admin()
    or user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- detection_events: owner or admin can read.
create policy "events read" on public.detection_events
  for select using (
    public.is_admin()
    or user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- traffic_signs: readable by any authenticated user (shared map inventory).
create policy "signs read" on public.traffic_signs
  for select using (auth.uid() is not null);

-- traffic_sign_observations: readable by any authenticated user.
create policy "observations read" on public.traffic_sign_observations
  for select using (auth.uid() is not null);

-- device_location_logs: owner or admin can read.
create policy "location logs read" on public.device_location_logs
  for select using (
    public.is_admin()
    or user_id in (select id from public.profiles where auth_user_id = auth.uid())
  );

-- system_logs: admin only.
create policy "system logs admin read" on public.system_logs
  for select using (public.is_admin());
