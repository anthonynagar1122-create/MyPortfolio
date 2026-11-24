import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createRateLimitStore } from "../../lib/db/rate-limit-store";

type Row = { key: string; window_start: string; count: number };

function fakeClient() {
  const rows = new Map<string, Row>();
  const client = {
    from(table: string) {
      if (table !== "rate_limits") throw new Error("unexpected table " + table);
      return {
        select: () => ({
          eq: (_c: string, key: string) => ({
            maybeSingle: async () => ({ data: rows.get(key) ?? null, error: null }),
          }),
        }),
        upsert: async (row: Row) => {
          rows.set(row.key, row);
          return { error: null };
        },
      };
    },
  };
  return { client: client as unknown as SupabaseClient, rows };
}

describe("createRateLimitStore", () => {
  it("counts within a window and resets in a new window", async () => {
    const { client, rows } = fakeClient();
    const store = createRateLimitStore(client);
    const w1 = new Date("2026-01-01T00:00:00Z");
    const w2 = new Date("2026-01-01T00:01:00Z");
    expect(await store.increment("k", w1)).toBe(1);
    expect(await store.increment("k", w1)).toBe(2);
    expect(await store.increment("other", w1)).toBe(1);
    expect(await store.increment("k", w2)).toBe(1);
    expect(rows.get("k")?.window_start).toBe(w2.toISOString());
  });

  it("throws when the database errors", async () => {
    const client = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error("boom") }) }) }),
      }),
    } as unknown as SupabaseClient;
    await expect(createRateLimitStore(client).increment("k", new Date())).rejects.toThrow("boom");
  });
});
