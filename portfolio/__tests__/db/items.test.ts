import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeDb } from "./fake-db";

let fake = createFakeDb({ idea_votes: ["item_id", "user_id"] });
vi.mock("../../lib/supabase", () => ({ getServerDb: () => fake.client }));

import { addVote } from "../../lib/db/votes";

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
