-- Secure status bridge tables for Figma Make ping system
-- Latest status keyed by job id (e.g. 'latest' or a run id)
create table if not exists public.ping_status (
  id text primary key,
  source text,
  status text,
  message text,
  payload jsonb,
  updated_at timestamptz default now()
);

-- Append-only event history
create table if not exists public.ping_events (
  id uuid primary key default gen_random_uuid(),
  job_id text not null default 'latest',
  source text,
  status text,
  message text,
  payload jsonb,
  created_at timestamptz default now()
);

-- Enable RLS on both tables
alter table public.ping_status enable row level security;
alter table public.ping_events enable row level security;

-- Public read policies (can be removed later if GET should always require token)
create policy if not exists "public read ping_status" on public.ping_status
  for select using (true);
create policy if not exists "public read ping_events" on public.ping_events
  for select using (true);

-- Create indexes for efficient queries
create index if not exists idx_ping_events_job_time 
  on public.ping_events (job_id, created_at desc);

create index if not exists idx_ping_events_created_at 
  on public.ping_events (created_at desc);

create index if not exists idx_ping_status_updated_at 
  on public.ping_status (updated_at desc);