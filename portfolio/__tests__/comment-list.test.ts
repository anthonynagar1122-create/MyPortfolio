import { describe, expect, it } from "vitest";
import { newestFirst, type PublicComment } from "@/lib/comment-order";

const c = (id: string, created_at: string): PublicComment => ({
  id,
  created_at,
  author_name: "A",
  author_avatar: null,
  body: id,
  is_owner: false,
  mine: false,
});

describe("newestFirst", () => {
  it("orders newest first without mutating the input", () => {
    const input = [c("a", "2026-01-01T00:00:00Z"), c("c", "2026-01-03T00:00:00Z"), c("b", "2026-01-02T00:00:00Z")];
    const copy = [...input];
    expect(newestFirst(input).map((x) => x.id)).toEqual(["c", "b", "a"]);
    expect(input).toEqual(copy);
  });
});
