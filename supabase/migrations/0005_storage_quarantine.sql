-- =====================================================================
-- TASK 012 — quarantine-first storage cleanup.
--
-- Instead of deleting unreferenced Storage objects immediately, a
-- reconciliation scan records them as PENDING quarantine candidates. An admin
-- reviews them and may ignore/restore them, or delete them only after a grace
-- period (and a re-check that they are still unreferenced).
--
-- Tables are written exclusively by the server (service-role) admin routes.
-- RLS is enabled with no policies, so anon/authenticated clients get no access;
-- the service-role key bypasses RLS for server writes/reads.
--
-- Idempotent: guarded with IF NOT EXISTS. Legacy columns are untouched.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- storage_reconciliation_runs
-- ---------------------------------------------------------------------
create table if not exists public.storage_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  triggered_by uuid references public.profiles(id) on delete set null,
  mode text not null default 'manual',
  objects_scanned integer not null default 0,
  candidates_found integer not null default 0,
  candidates_added integer not null default 0,
  scan_limited boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists idx_recon_runs_started on public.storage_reconciliation_runs(started_at desc);

-- ---------------------------------------------------------------------
-- storage_quarantine_candidates
-- ---------------------------------------------------------------------
create table if not exists public.storage_quarantine_candidates (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  object_path text not null,
  size_bytes bigint,
  last_modified_at timestamptz,
  detected_at timestamptz not null default now(),
  quarantine_status text not null default 'pending'
    check (quarantine_status in ('pending','ignored','deleted','restored')),
  reason text not null,
  scan_run_id uuid references public.storage_reconciliation_runs(id) on delete set null,
  deleted_at timestamptz,
  ignored_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- At most one ACTIVE (pending) candidate per bucket + object path.
create unique index if not exists uq_quarantine_pending_active
  on public.storage_quarantine_candidates(bucket, object_path)
  where quarantine_status = 'pending';

create index if not exists idx_quarantine_status on public.storage_quarantine_candidates(quarantine_status);
create index if not exists idx_quarantine_detected on public.storage_quarantine_candidates(detected_at desc);
create index if not exists idx_quarantine_scan_run on public.storage_quarantine_candidates(scan_run_id);

-- ---------------------------------------------------------------------
-- RLS: enabled, no policies. Only the service-role server client touches these.
-- ---------------------------------------------------------------------
alter table public.storage_reconciliation_runs enable row level security;
alter table public.storage_quarantine_candidates enable row level security;
