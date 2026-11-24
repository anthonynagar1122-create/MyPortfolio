import { createClient } from "@supabase/supabase-js";

// This client intentionally uses only the publishable key. Public contact
// submissions are constrained by Postgres RLS; never put a service key here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseServer = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export const supabaseClient = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

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
