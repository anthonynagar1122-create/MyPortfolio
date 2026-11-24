import { describe, expect, it } from "vitest";
import { applyBudget, applyToggle, withServerCount, type VoteState } from "@/lib/vote-state";

const base: VoteState = { count: 3, voted: false, budget: null };

describe("vote state transitions", () => {
  it("toggle on adds one and keeps budget null", () => {
    expect(applyToggle(base)).toEqual({ count: 4, voted: true, budget: null });
  });
  it("toggle off removes one and clears budget", () => {
    expect(applyToggle({ count: 4, voted: true, budget: "free" })).toEqual(base);
  });
  it("toggle off never goes below zero", () => {
    expect(applyToggle({ count: 0, voted: true, budget: null }).count).toBe(0);
  });
  it("budget change keeps count and sets voted", () => {
    expect(applyBudget({ count: 4, voted: true, budget: "free" }, "over_50")).toEqual({
      count: 4,
      voted: true,
      budget: "over_50",
    });
  });
  it("does not mutate the confirmed state (so a failure can revert to it)", () => {
    const confirmed = Object.freeze({ ...base });
    applyToggle(confirmed);
    applyBudget(confirmed, "free");
    expect(confirmed).toEqual(base);
  });
  it("adopts the server count", () => {
    expect(withServerCount({ count: 4, voted: true, budget: null }, 9).count).toBe(9);
  });
});
