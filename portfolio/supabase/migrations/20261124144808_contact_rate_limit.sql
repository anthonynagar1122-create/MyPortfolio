create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;

create table if not exists private.contact_rate_limits (
  ip inet primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default pg_catalog.now()
);

alter table private.contact_rate_limits enable row level security;
revoke all on table private.contact_rate_limits from public, anon, authenticated, service_role;

create or replace function public.consume_contact_rate_limit(
  p_ip inet,
  p_max_requests integer default 5,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_ip is null or p_max_requests < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into private.contact_rate_limits as current_limit (
    ip, window_started_at, request_count, updated_at
  )
  values (p_ip, pg_catalog.now(), 1, pg_catalog.now())
  on conflict (ip) do update
  set
    window_started_at = case
      when current_limit.window_started_at <= pg_catalog.now() - pg_catalog.make_interval(secs => p_window_seconds)
        then pg_catalog.now()
      else current_limit.window_started_at
    end,
    request_count = case
      when current_limit.window_started_at <= pg_catalog.now() - pg_catalog.make_interval(secs => p_window_seconds)
        then 1
      else current_limit.request_count + 1
    end,
    updated_at = pg_catalog.now()
  returning request_count into v_count;

  if pg_catalog.random() < 0.01 then
    delete from private.contact_rate_limits
    where updated_at < pg_catalog.now() - interval '1 day';
  end if;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_contact_rate_limit(inet, integer, integer) from public, anon, authenticated, service_role;
grant execute on function public.consume_contact_rate_limit(inet, integer, integer) to service_role;
