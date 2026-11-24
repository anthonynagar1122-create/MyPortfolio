import type { BudgetRange } from "./db/types";

export type VoteState = { count: number; voted: boolean; budget: BudgetRange | null };

/** Optimistic result of pressing "I want this": add or remove the viewer's vote. */
export function applyToggle(s: VoteState): VoteState {
  return s.voted
    ? { count: Math.max(0, s.count - 1), voted: false, budget: null }
    : { count: s.count + 1, voted: true, budget: s.budget };
}

/** Optimistic result of choosing a budget (one upserting request, never remove-then-add). */
export function applyBudget(s: VoteState, budget: BudgetRange): VoteState {
  return { ...s, voted: true, budget };
}

/** Adopt the server's authoritative count while keeping the rest of the optimistic state. */
export function withServerCount(s: VoteState, count: number): VoteState {
  return { ...s, count };
}
