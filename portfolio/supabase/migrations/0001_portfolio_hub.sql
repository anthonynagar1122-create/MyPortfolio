-- Portfolio hub schema: items, comments, votes, suggestions, subscribers,
-- visit counters, rate limits, page views. RLS on everywhere; clients only
-- read. All writes go through server code using the service_role key
-- (which bypasses RLS).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables
create table public.items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('project','idea')),
  slug text unique not null,
  title text not null,
  short_description text not null,
  description text not null default '',
  status text not null,
  category text not null,
  tags text[] not null default '{}',
  cover_url text,
  live_url text,
  demo_url text,
  android_url text,
  ios_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  item_id uuid not null references public.items(id) on delete cascade,
  author_id text not null,
  author_name text not null,
  author_avatar text,
  body text not null check (char_length(body) between 1 and 1000),
  is_owner boolean not null default false,
  hidden boolean not null default false
);

create table public.idea_votes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  item_id uuid not null references public.items(id) on delete cascade,
  user_id text not null,
  budget_range text check (budget_range in ('free','under_10','10_50','over_50','not_sure')),
  unique (item_id, user_id)
);

create table public.idea_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text not null,
  audience text,
  budget_range text,
  contact_email text,
  submitter_name text,
  credit_ok boolean not null default false,
  status text not null default 'new' check (status in ('new','published','dismissed'))
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text unique not null,
  status text not null check (status in ('pending','confirmed','unsubscribed')),
  confirm_token text,
  consent_at timestamptz not null,
  source text
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  day date not null,
  visitor_hash text not null,
  last_seen timestamptz not null default now(),
  unique (day, visitor_hash)
);

-- rate_limits is keyed by `key` (no uuid id), per spec.
create table public.rate_limits (
  key text primary key,
  created_at timestamptz not null default now(),
  window_start timestamptz not null,
  count int not null default 0
);

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  item_id uuid not null references public.items(id) on delete cascade,
  day date not null,
  count int not null default 0,
  unique (item_id, day)
);

create index comments_item_id_idx on public.comments (item_id, created_at);
create index items_type_published_idx on public.items (type, published, sort_order);
create index visits_day_idx on public.visits (day);
create index visits_last_seen_idx on public.visits (last_seen);
create index idea_votes_item_id_idx on public.idea_votes (item_id);

-- keep items.updated_at current
create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger items_touch_updated_at
  before update on public.items
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------- RLS
alter table public.items            enable row level security;
alter table public.comments         enable row level security;
alter table public.idea_votes       enable row level security;
alter table public.idea_suggestions enable row level security;
alter table public.subscribers      enable row level security;
alter table public.visits           enable row level security;
alter table public.rate_limits      enable row level security;
alter table public.page_views       enable row level security;

create policy items_public_read on public.items
  for select to anon, authenticated using (published = true);

create policy comments_public_read on public.comments
  for select to anon, authenticated using (hidden = false);

-- No other policies: no direct client writes, and no client reads of the
-- remaining tables. service_role bypasses RLS.

-- Privileges: Supabase default privileges grant everything on new public
-- tables to anon/authenticated, so revoke explicitly, then grant read only.
revoke all on public.items, public.comments, public.idea_votes,
              public.idea_suggestions, public.subscribers, public.visits,
              public.rate_limits, public.page_views
  from anon, authenticated;
grant select on public.items, public.comments to anon, authenticated;

-- ---------------------------------------------------------- public_stats()
create function public.public_stats()
returns table (
  active_now bigint,
  visitors_today bigint,
  visitors_7d bigint,
  total_comments bigint,
  confirmed_subscribers bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    (select count(*) from visits where last_seen > now() - interval '5 minutes'),
    (select count(*) from visits where day = current_date),
    (select count(distinct visitor_hash) from visits where day >= current_date - 6),
    (select count(*) from comments where hidden = false),
    (select count(*) from subscribers where status = 'confirmed');
$$;

revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated, service_role;

-- ------------------------------------------------------- covers bucket
-- Only on Supabase (the storage schema does not exist on plain Postgres).
-- Public read; no insert/update/delete policies, so only the service_role
-- key (the owner's server code) can write.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
      values ('covers', 'covers', true)
      on conflict (id) do update set public = true;

    if not exists (select 1 from pg_policies
                   where schemaname = 'storage' and tablename = 'objects'
                     and policyname = 'covers_public_read') then
      create policy covers_public_read on storage.objects
        for select to anon, authenticated using (bucket_id = 'covers');
    end if;
  end if;
end $$;
