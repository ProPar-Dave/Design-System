-- Build status tracking table for Figma Make
-- Keep private with no public RLS policies

-- Enable UUID extension
create extension if not exists pgcrypto;

-- Create build_status table
create table if not exists build_status (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  stage text not null check (stage in ('start','done','error','unknown')),
  at timestamptz not null default now(),
  app text not null,
  site_url text,
  commit text,
  build_id text,
  version text,
  message text,
  job text,
  payload jsonb
);

-- Enable RLS but don't create public policies
-- Only Edge Functions using service role can access
alter table build_status enable row level security;

-- Create index for efficient latest status queries
create index if not exists idx_build_status_created_at on build_status (created_at desc);

-- Create index for querying by app and stage
create index if not exists idx_build_status_app_stage on build_status (app, stage, created_at desc);