import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Service-role client for server code only. Throws if env is missing. */
export function getServerDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
