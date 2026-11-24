import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeDb } from "./fake-db";

let fake = createFakeDb({ idea_votes: ["item_id", "user_id"] });
vi.mock("../../lib/supabase", () => ({ getServerDb: () => fake.client }));

import { addVote, getUserVote } from "../../lib/db/votes";

describe("addVote", () => {
  beforeEach(() => {
    fake = createFakeDb({ idea_votes: ["item_id", "user_id"] });
  });

  it("creates once, then reports created:false for the same user", async () => {
    const first = await addVote("item-1", "user-1", "free");
    expect(first).toEqual({ created: true, wantCount: 1 });
    const second = await addVote("item-1", "user-1", "free");
    expect(second).toEqual({ created: false, wantCount: 1 });
    const other = await addVote("item-1", "user-2", null);
    expect(other).toEqual({ created: true, wantCount: 2 });
  });
});

describe("addVote budget upsert", () => {
  beforeEach(() => {
    fake = createFakeDb({ idea_votes: ["item_id", "user_id"] });
  });

  it("updates budget_range on conflict without creating a second row", async () => {
    await addVote("item-1", "user-1", "free");
    const again = await addVote("item-1", "user-1", "over_50");
    expect(again).toEqual({ created: false, wantCount: 1 });
    expect(await getUserVote("item-1", "user-1")).toEqual({ voted: true, budgetRange: "over_50" });
  });
});

describe("getUserVote", () => {
  beforeEach(() => {
    fake = createFakeDb({ idea_votes: ["item_id", "user_id"] });
  });

  it("returns voted:false when the user has no vote", async () => {
    expect(await getUserVote("item-1", "user-1")).toEqual({ voted: false, budgetRange: null });
  });

  it("returns the stored budget, or null budget when voted without one", async () => {
    await addVote("item-1", "user-1", "10_50");
    await addVote("item-1", "user-2", null);
    expect(await getUserVote("item-1", "user-1")).toEqual({ voted: true, budgetRange: "10_50" });
    expect(await getUserVote("item-1", "user-2")).toEqual({ voted: true, budgetRange: null });
    expect(await getUserVote("item-2", "user-1")).toEqual({ voted: false, budgetRange: null });
  });
});
