import { describe, it, expect, vi, beforeEach } from "vitest";
import { jsonReq, ITEM_ID } from "./helpers";

const { auth, addVote, removeVote, getPublishedItemById, increment } = vi.hoisted(() => ({
  auth: vi.fn(),
  addVote: vi.fn(),
  removeVote: vi.fn(),
  getPublishedItemById: vi.fn(),
  increment: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db/votes", () => ({ addVote, removeVote }));
vi.mock("@/lib/db/items", () => ({ getPublishedItemById }));
vi.mock("@/lib/supabase", () => ({ getServerDb: () => ({}) }));
vi.mock("@/lib/db/rate-limit-store", () => ({ createRateLimitStore: () => ({ increment }) }));

import { POST, DELETE } from "../../app/api/votes/route";

const url = "http://localhost/api/votes";

beforeEach(() => {
  vi.resetAllMocks();
  auth.mockResolvedValue({ userId: "user_1" });
  getPublishedItemById.mockResolvedValue({ id: ITEM_ID, type: "idea" });
  increment.mockResolvedValue(1);
});

describe("POST /api/votes", () => {
  it("second vote by the same user is ok with created:false and status 200", async () => {
    addVote
      .mockResolvedValueOnce({ created: true, wantCount: 1 })
      .mockResolvedValueOnce({ created: false, wantCount: 1 });
    const first = await POST(jsonReq(url, "POST", { itemId: ITEM_ID }));
    const second = await POST(jsonReq(url, "POST", { itemId: ITEM_ID }));
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ ok: true, created: false, wantCount: 1 });
    expect(addVote).toHaveBeenCalledWith(ITEM_ID, "user_1", null);
  });

  it("401 without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await POST(jsonReq(url, "POST", { itemId: ITEM_ID }))).status).toBe(401);
    expect(addVote).not.toHaveBeenCalled();
  });

  it("400 for malformed JSON, bad id, or bad budget range", async () => {
    expect((await POST(jsonReq(url, "POST", "{oops"))).status).toBe(400);
    expect((await POST(jsonReq(url, "POST", { itemId: "x" }))).status).toBe(400);
    expect((await POST(jsonReq(url, "POST", { itemId: ITEM_ID, budgetRange: "lots" }))).status).toBe(400);
  });

  it("404 when the item is unknown or not an idea", async () => {
    getPublishedItemById.mockResolvedValue(null);
    expect((await POST(jsonReq(url, "POST", { itemId: ITEM_ID }))).status).toBe(404);
    getPublishedItemById.mockResolvedValue({ id: ITEM_ID, type: "project" });
    expect((await POST(jsonReq(url, "POST", { itemId: ITEM_ID }))).status).toBe(404);
  });

  it("429 when rate limited", async () => {
    increment.mockResolvedValue(31);
    const res = await POST(jsonReq(url, "POST", { itemId: ITEM_ID }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});

describe("DELETE /api/votes", () => {
  it("removes the signed-in user's vote", async () => {
    removeVote.mockResolvedValue(0);
    const res = await DELETE(jsonReq(url, "DELETE", { itemId: ITEM_ID, userId: "evil" }));
    expect(res.status).toBe(200);
    expect(removeVote).toHaveBeenCalledWith(ITEM_ID, "user_1");
    expect(await res.json()).toMatchObject({ ok: true, wantCount: 0 });
  });

  it("401 without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await DELETE(jsonReq(url, "DELETE", { itemId: ITEM_ID }))).status).toBe(401);
  });
});
