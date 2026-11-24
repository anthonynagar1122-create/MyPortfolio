# Supabase schema

`migrations/0001_portfolio_hub.sql` creates the hub tables, RLS policies,
`public_stats()` and the public `covers` storage bucket.

## Apply

- Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`
- Or paste the file into the Supabase dashboard SQL editor and run it.

## Test

```bash
psql -v ON_ERROR_STOP=1 "$DATABASE_URL" -f supabase/tests/schema.sql
```

The script runs in a transaction, rolls back, and raises an exception on any
failure. Prints `schema test passed` on success.

## Access model

Clients (anon/authenticated) can only read published `items`, non-hidden
`comments`, and call `public_stats()`. All writes happen server-side with the
`service_role` key, which bypasses RLS. Never expose that key to the browser.
The `covers` bucket is public-read; uploads need the service_role key.
