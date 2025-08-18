-- Create ping_latest table for bulletproof ping endpoint
-- This table will store the most recent status with a simple structure

create table if not exists public.ping_latest (
  id text primary key,
  payload jsonb,
  digest text,
  received_at timestamptz default now()
);

-- Update ping_events to match bulletproof schema
alter table public.ping_events 
  drop column if exists job_id,
  drop column if exists source,
  drop column if exists status,
  drop column if exists message,
  drop column if exists created_at;

-- Add new columns if they don't exist
alter table public.ping_events 
  add column if not exists digest text,
  add column if not exists received_at timestamptz default now();

-- Enable RLS on ping_latest
alter table public.ping_latest enable row level security;

-- Public read policy for ping_latest (anon can read)
create policy if not exists "public read ping_latest" on public.ping_latest
  for select using (true);

-- Update ping_events policy name for consistency
drop policy if exists "public read ping_events" on public.ping_events;
create policy if not exists "anon can read ping_events" on public.ping_events
  for select using (true);

-- Create index for efficient queries on ping_latest
create index if not exists idx_ping_latest_received_at 
  on public.ping_latest (received_at desc);

-- Create index for ping_events with new schema
drop index if exists idx_ping_events_job_time;
drop index if exists idx_ping_events_created_at;
create index if not exists idx_ping_events_received_at 
  on public.ping_events (received_at desc);

-- Seed default row to prevent empty responses
insert into public.ping_latest (id, payload, digest)
values ('latest', '{"status":"boot","message":"initialized"}', 'boot')
on conflict (id) do nothing;