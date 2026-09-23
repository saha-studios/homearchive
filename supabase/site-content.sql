create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 'site')
);

alter table public.site_content enable row level security;

create policy "Anyone can read site content"
  on public.site_content for select using (true);

create policy "Authenticated users can manage site content"
  on public.site_content for all to authenticated
  using (true) with check (true);
