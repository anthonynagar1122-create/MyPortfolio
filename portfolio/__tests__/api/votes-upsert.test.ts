import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeDb } from "../db/fake-db";
import { jsonReq, ITEM_ID } from "./helpers";

let fake = createFakeDb({ idea_votes: ["item_id", "user_id"] });
const { auth, getPublishedItemById, increment } = vi.hoisted(() => ({
  auth: vi.fn(),
  getPublishedItemById: vi.fn(),
  increment: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db/items", () => ({ getPublishedItemById }));
vi.mock("@/lib/supabase", () => ({ getServerDb: () => fake.client }));
vi.mock("@/lib/db/rate-limit-store", () => ({ createRateLimitStore: () => ({ increment }) }));

import { POST, DELETE } from "../../app/api/votes/route";

const url = "http://localhost/api/votes";

beforeEach(() => {
  fake = createFakeDb({ idea_votes: ["item_id", "user_id"] });
  vi.resetAllMocks();
  auth.mockResolvedValue({ userId: "user_1" });
  getPublishedItemById.mockResolvedValue({ id: ITEM_ID, type: "idea" });
  increment.mockResolvedValue(1);
});

describe("POST /api/votes (real db layer, fake client)", () => {
  it("a second POST with a different budget updates the stored budget in one request", async () => {
    const first = await POST(jsonReq(url, "POST", { itemId: ITEM_ID, budgetRange: "free" }));
    expect(first.status).toBe(201);
    const second = await POST(jsonReq(url, "POST", { itemId: ITEM_ID, budgetRange: "over_50" }));
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ ok: true, created: false, wantCount: 1 });
    const rows = fake.tables.get("idea_votes")!;
    expect(rows).toHaveLength(1);
    expect(rows[0].budget_range).toBe("over_50");
  });

  it("DELETE removes the vote", async () => {
    await POST(jsonReq(url, "POST", { itemId: ITEM_ID }));
    const res = await DELETE(jsonReq(url, "DELETE", { itemId: ITEM_ID }));
    expect(await res.json()).toMatchObject({ ok: true, wantCount: 0 });
    expect(fake.tables.get("idea_votes")).toHaveLength(0);
  });
});
