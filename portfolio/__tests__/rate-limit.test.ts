import { describe, it, expect } from "vitest";
import { checkRateLimit, type RateLimitStore } from "../lib/rate-limit";

function memoryStore(): RateLimitStore {
  const m = new Map<string, number>();
  return {
    async increment(key, windowStart) {
      const k = `${key}|${windowStart.toISOString()}`;
      const n = (m.get(k) ?? 0) + 1;
      m.set(k, n);
      return n;
    },
  };
}

describe("checkRateLimit", () => {
  const now = new Date("2026-01-01T00:00:10Z");
  it("allows up to the limit then blocks", async () => {
    const db = memoryStore();
    for (let i = 0; i < 5; i++) {
      expect((await checkRateLimit(db, "k", 5, 60, now)).allowed).toBe(true);
    }
    const r = await checkRateLimit(db, "k", 5, 60, now);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(r.retryAfterSeconds).toBeLessThanOrEqual(60);
  });
  it("allows again after the window passes", async () => {
    const db = memoryStore();
    for (let i = 0; i < 6; i++) await checkRateLimit(db, "k", 5, 60, now);
    const later = new Date(now.getTime() + 61_000);
    expect((await checkRateLimit(db, "k", 5, 60, later)).allowed).toBe(true);
  });
  it("keys are independent", async () => {
    const db = memoryStore();
    for (let i = 0; i < 6; i++) await checkRateLimit(db, "a", 5, 60, now);
    expect((await checkRateLimit(db, "b", 5, 60, now)).allowed).toBe(true);
  });
});
