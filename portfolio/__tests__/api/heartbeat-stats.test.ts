import { describe, it, expect, vi, beforeEach } from "vitest";
import { jsonReq } from "./helpers";

const { recordVisit, getPublicStats, increment } = vi.hoisted(() => ({
  recordVisit: vi.fn(),
  getPublicStats: vi.fn(),
  increment: vi.fn(),
}));

vi.mock("next/server", async (orig) => ({ ...(await orig<object>()), connection: vi.fn(async () => {}) }));
vi.mock("@/lib/db/visits", () => ({ recordVisit }));
vi.mock("@/lib/db/stats", () => ({ getPublicStats }));
vi.mock("@/lib/supabase", () => ({ getServerDb: () => ({}) }));
vi.mock("@/lib/db/rate-limit-store", () => ({ createRateLimitStore: () => ({ increment }) }));

import { POST } from "../../app/api/heartbeat/route";
import { GET } from "../../app/api/stats/route";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("VISITOR_SALT_SECRET", "salt");
  increment.mockResolvedValue(1);
});

describe("POST /api/heartbeat", () => {
  it("records a hashed visit, never the raw IP", async () => {
    const res = await POST(jsonReq("http://localhost/api/heartbeat", "POST"));
    expect(res.status).toBe(200);
    const [day, hash] = recordVisit.mock.calls[0];
    expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(recordVisit.mock.calls)).not.toContain("203.0.113.9");
  });
  it("skips bots", async () => {
    const res = await POST(jsonReq("http://localhost/api/heartbeat", "POST", undefined, { "user-agent": "Googlebot/2.1" }));
    expect(res.status).toBe(200);
    expect(recordVisit).not.toHaveBeenCalled();
  });
  it("429 when rate limited", async () => {
    increment.mockResolvedValue(999);
    expect((await POST(jsonReq("http://localhost/api/heartbeat", "POST"))).status).toBe(429);
  });
});

describe("GET /api/stats", () => {
  it("returns public stats", async () => {
    getPublicStats.mockResolvedValue({ activeNow: 1, visitorsToday: 2, visitorsWeek: 3, totalComments: 4 });
    const res = await GET();
    expect(await res.json()).toEqual({ ok: true, stats: { activeNow: 1, visitorsToday: 2, visitorsWeek: 3, totalComments: 4 } });
  });
});
