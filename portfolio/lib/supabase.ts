import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Legacy server-side client (null when env is missing); used by the contact route. Server only.
export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/** Service-role client for server code only. Throws if env is missing. */
export function getServerDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Types
export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  message: string;
  company?: string;
  product?: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
}
