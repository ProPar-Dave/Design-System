-- Snapshots of state we care about (tokens, catalog, registry)
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('tokens','catalog','registry','app_state')),
  label text,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Last known good build pointer (single row per kind)
create table if not exists published_state (
  kind text primary key check (kind in ('tokens','catalog','registry','app_state')),
  snapshot_id uuid references snapshots(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Lightweight audit/QA log
create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,                        -- e.g. 'smoke', 'a11y'
  status text not null check (status in ('pass','fail')),
  summary jsonb not null,                     -- array of {name, ok, note}
  app_version text,
  created_at timestamptz not null default now()
);

-- Create indexes for better performance
create index if not exists idx_snapshots_kind_created on snapshots(kind, created_at desc);
create index if not exists idx_audits_scope_created on audits(scope, created_at desc);
create index if not exists idx_audits_status_created on audits(status, created_at desc);

-- Create RLS policies (optional - can be enabled later)
-- alter table snapshots enable row level security;
-- alter table published_state enable row level security;
-- alter table audits enable row level security;

-- Example policies (uncomment when ready to enable RLS):
-- create policy "Allow read access to snapshots" on snapshots for select using (true);
-- create policy "Allow read access to published_state" on published_state for select using (true);
-- create policy "Allow read access to audits" on audits for select using (true);

-- Comment with instructions
comment on table snapshots is 'Stores versioned snapshots of application state (tokens, catalog, registry) for rollback capabilities';
comment on table published_state is 'Tracks the currently published/stable snapshot for each state kind';
comment on table audits is 'Logs QA test results and system health checks with pass/fail status';