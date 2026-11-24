import { describe, it, expect, vi, beforeEach } from "vitest";
import { jsonReq, ITEM_ID } from "./helpers";

const { auth, currentUser, insertComment, listVisibleComments, deleteOwnComment, getPublishedItemById, increment } =
  vi.hoisted(() => ({
    auth: vi.fn(),
    currentUser: vi.fn(),
    insertComment: vi.fn(),
    listVisibleComments: vi.fn(),
    deleteOwnComment: vi.fn(),
    getPublishedItemById: vi.fn(),
    increment: vi.fn(),
  }));

vi.mock("@clerk/nextjs/server", () => ({ auth, currentUser }));
vi.mock("next/server", async (orig) => ({ ...(await orig<object>()), connection: vi.fn(async () => {}) }));
vi.mock("@/lib/db/comments", () => ({ insertComment, listVisibleComments, deleteOwnComment }));
vi.mock("@/lib/db/items", () => ({ getPublishedItemById }));
vi.mock("@/lib/supabase", () => ({ getServerDb: () => ({}) }));
vi.mock("@/lib/db/rate-limit-store", () => ({ createRateLimitStore: () => ({ increment }) }));

import { GET, POST } from "../../app/api/comments/route";
import { DELETE } from "../../app/api/comments/[id]/route";

const url = "http://localhost/api/comments";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("VISITOR_SALT_SECRET", "salt");
  vi.stubEnv("ADMIN_CLERK_USER_ID", "owner_1");
  auth.mockResolvedValue({ userId: "user_1" });
  currentUser.mockResolvedValue({ fullName: "Ada L", username: null, imageUrl: "http://img/a.png" });
  getPublishedItemById.mockResolvedValue({ id: ITEM_ID });
  increment.mockResolvedValue(1);
  insertComment.mockImplementation(async (i) => ({ id: "c1", ...i }));
});

describe("POST /api/comments", () => {
  it("stores the body unchanged (escaping is output-side) and returns 201", async () => {
    const body = "<img src=x onerror=alert(1)>";
    const res = await POST(jsonReq(url, "POST", { itemId: ITEM_ID, body }));
    expect(res.status).toBe(201);
    expect(insertComment).toHaveBeenCalledWith(
      expect.objectContaining({ body, authorId: "user_1", itemId: ITEM_ID, isOwner: false }),
    );
  });

  it("uses the Clerk id, never an id from the request body", async () => {
    await POST(jsonReq(url, "POST", { itemId: ITEM_ID, body: "hi", authorId: "evil", userId: "evil" }));
    expect(insertComment).toHaveBeenCalledWith(expect.objectContaining({ authorId: "user_1" }));
  });

  it("flags the owner", async () => {
    auth.mockResolvedValue({ userId: "owner_1" });
    await POST(jsonReq(url, "POST", { itemId: ITEM_ID, body: "hi" }));
    expect(insertComment).toHaveBeenCalledWith(expect.objectContaining({ isOwner: true }));
  });

  it("401 without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    const res = await POST(jsonReq(url, "POST", { itemId: ITEM_ID, body: "hi" }));
    expect(res.status).toBe(401);
    expect(insertComment).not.toHaveBeenCalled();
  });

  it("400 with fields.body for 1001 chars", async () => {
    const res = await POST(jsonReq(url, "POST", { itemId: ITEM_ID, body: "a".repeat(1001) }));
    expect(res.status).toBe(400);
    expect((await res.json()).fields.body).toBeTruthy();
  });

  it("400 on malformed JSON", async () => {
    const res = await POST(jsonReq(url, "POST", "{not json"));
    expect(res.status).toBe(400);
  });

  it("404 for unknown item", async () => {
    getPublishedItemById.mockResolvedValue(null);
    const res = await POST(jsonReq(url, "POST", { itemId: ITEM_ID, body: "hi" }));
    expect(res.status).toBe(404);
  });

  it("429 with Retry-After when rate limited", async () => {
    increment.mockResolvedValue(6);
    const res = await POST(jsonReq(url, "POST", { itemId: ITEM_ID, body: "hi" }));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(insertComment).not.toHaveBeenCalled();
  });
});

describe("GET /api/comments", () => {
  it("lists visible comments without leaking author ids and marks own", async () => {
    listVisibleComments.mockResolvedValue([
      { id: "c1", created_at: "t", item_id: ITEM_ID, author_id: "user_1", author_name: "A", author_avatar: null, body: "x", is_owner: false, hidden: false },
      { id: "c2", created_at: "t", item_id: ITEM_ID, author_id: "user_2", author_name: "B", author_avatar: null, body: "y", is_owner: false, hidden: false },
    ]);
    const res = await GET(jsonReq(`${url}?itemId=${ITEM_ID}`, "GET"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.comments.map((c: { mine: boolean }) => c.mine)).toEqual([true, false]);
    expect(JSON.stringify(json)).not.toContain("author_id");
  });

  it("400 for a bad itemId", async () => {
    const res = await GET(jsonReq(`${url}?itemId=nope`, "GET"));
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/comments/[id]", () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
  const cid = "22222222-2222-4222-8222-222222222222";

  it("401 without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await DELETE(jsonReq(url, "DELETE"), ctx(cid))).status).toBe(401);
  });

  it("deletes own comment using the Clerk id", async () => {
    deleteOwnComment.mockResolvedValue(true);
    const res = await DELETE(jsonReq(url, "DELETE"), ctx(cid));
    expect(res.status).toBe(200);
    expect(deleteOwnComment).toHaveBeenCalledWith(cid, "user_1");
  });

  it("404 when nothing was deleted (not found or not yours)", async () => {
    deleteOwnComment.mockResolvedValue(false);
    expect((await DELETE(jsonReq(url, "DELETE"), ctx(cid))).status).toBe(404);
  });
});
