import type { SupabaseClient } from "@supabase/supabase-js";
import type { RateLimitStore } from "../rate-limit";

/**
 * Rate-limit counter backed by the `rate_limits` table (one row per key).
 * A row from an older window is reset to 1. The read-then-upsert is not
 * atomic, so concurrent requests can under-count slightly; acceptable for
 * abuse throttling, not for billing.
 */
export function createRateLimitStore(db: SupabaseClient): RateLimitStore {
  return {
    async increment(key, windowStart) {
      const { data, error } = await db
        .from("rate_limits")
        .select("count, window_start")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      const row = data as { count: number; window_start: string } | null;
      const sameWindow = row !== null && new Date(row.window_start).getTime() === windowStart.getTime();
      const count = sameWindow ? row.count + 1 : 1;
      const { error: upErr } = await db
        .from("rate_limits")
        .upsert({ key, window_start: windowStart.toISOString(), count }, { onConflict: "key" });
      if (upErr) throw upErr;
      return count;
    },
  };
}
