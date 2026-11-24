-- Schema test for 0001_portfolio_hub.sql. Raises an exception on any failure.
-- Run: psql -v ON_ERROR_STOP=1 "$DATABASE_URL" -f supabase/tests/schema.sql
-- Runs in a transaction and rolls back, so it leaves no data behind.
begin;

do $$
declare
  t text;
  v_item uuid;
  v_hidden uuid;
  v_stats record;
  n int;
begin
  -- 1. every table exists with RLS enabled
  foreach t in array array['items','comments','idea_votes','idea_suggestions',
                           'subscribers','visits','rate_limits','page_views'] loop
    if not exists (select 1 from pg_class c join pg_namespace s on s.oid = c.relnamespace
                   where s.nspname = 'public' and c.relname = t and c.relkind = 'r') then
      raise exception 'missing table %', t;
    end if;
    if not (select relrowsecurity from pg_class
            where oid = ('public.' || t)::regclass) then
      raise exception 'RLS not enabled on %', t;
    end if;
  end loop;

  -- 2. insert one published item, a draft item, comments and a vote
  insert into items (type, slug, title, short_description, status, category, published)
    values ('project', 'test-item', 'Test', 'short', 'live', 'web', true)
    returning id into v_item;
  insert into items (type, slug, title, short_description, status, category, published)
    values ('idea', 'test-draft', 'Draft', 'short', 'open', 'web', false);
  insert into comments (item_id, author_id, author_name, body)
    values (v_item, 'u1', 'User One', 'hello');
  insert into comments (item_id, author_id, author_name, body, hidden)
    values (v_item, 'u2', 'User Two', 'spam', true);
  insert into idea_votes (item_id, user_id, budget_range)
    values (v_item, 'u1', 'free');

  if (select count(*) from items where slug = 'test-item') <> 1 then
    raise exception 'published item missing';
  end if;
  if (select count(*) from comments where item_id = v_item) <> 2 then
    raise exception 'comments missing';
  end if;
  if (select count(*) from idea_votes where item_id = v_item) <> 1 then
    raise exception 'vote missing';
  end if;

  -- 3. unique constraints
  begin
    insert into idea_votes (item_id, user_id) values (v_item, 'u1');
    raise exception 'duplicate vote was accepted';
  exception when unique_violation then null;
  end;
  begin
    insert into comments (item_id, author_id, author_name, body)
      values (v_item, 'u1', 'x', '');
    raise exception 'empty comment was accepted';
  exception when check_violation then null;
  end;

  -- 4. public_stats() returns one row with the expected counts
  insert into visits (day, visitor_hash, last_seen) values
    (current_date, 'a', now()),
    (current_date, 'b', now() - interval '2 minutes'),
    (current_date - 3, 'c', now() - interval '3 days'),
    (current_date - 30, 'd', now() - interval '30 days');
  insert into subscribers (email, status, consent_at) values
    ('a@example.com', 'confirmed', now()),
    ('b@example.com', 'pending', now());

  select count(*) into n from public_stats();
  if n <> 1 then raise exception 'public_stats() returned % rows', n; end if;
  select * into v_stats from public_stats();
  if v_stats.active_now <> 2 then raise exception 'active_now = %', v_stats.active_now; end if;
  if v_stats.visitors_today <> 2 then raise exception 'visitors_today = %', v_stats.visitors_today; end if;
  if v_stats.visitors_7d <> 3 then raise exception 'visitors_7d = %', v_stats.visitors_7d; end if;
  if v_stats.total_comments <> 1 then raise exception 'total_comments = % (hidden must be excluded)', v_stats.total_comments; end if;
  if v_stats.confirmed_subscribers <> 1 then raise exception 'confirmed_subscribers = %', v_stats.confirmed_subscribers; end if;

  -- 5. grants / RLS visibility for anon
  if not has_function_privilege('anon', 'public.public_stats()', 'execute') then
    raise exception 'anon cannot execute public_stats()';
  end if;
  if has_table_privilege('anon', 'public.items', 'insert')
     or has_table_privilege('anon', 'public.comments', 'insert')
     or has_table_privilege('authenticated', 'public.items', 'insert') then
    raise exception 'client roles must not have write privileges';
  end if;

  set local role anon;
  select count(*) into n from items;
  if n <> 1 then reset role; raise exception 'anon sees % items, expected 1 published', n; end if;
  select count(*) into n from comments;
  if n <> 1 then reset role; raise exception 'anon sees % comments, expected 1 non-hidden', n; end if;
  begin
    select count(*) into n from subscribers;
    reset role;
    raise exception 'anon could read subscribers';
  exception when insufficient_privilege then reset role;
  end;
  reset role;

  -- 6. covers bucket (only where Supabase storage exists)
  if to_regclass('storage.buckets') is not null then
    if not exists (select 1 from storage.buckets where id = 'covers' and public) then
      raise exception 'covers bucket missing or not public';
    end if;
  end if;
end $$;

rollback;
select 'schema test passed' as result;
