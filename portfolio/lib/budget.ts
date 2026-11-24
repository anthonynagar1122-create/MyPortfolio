import type { BudgetRange } from "./db/types";

export const budgetOptions: { value: BudgetRange; label: string }[] = [
  { value: "free", label: "Free only" },
  { value: "under_10", label: "Under $10" },
  { value: "10_50", label: "$10 to $50" },
  { value: "over_50", label: "Over $50" },
  { value: "not_sure", label: "Not sure" },
];
