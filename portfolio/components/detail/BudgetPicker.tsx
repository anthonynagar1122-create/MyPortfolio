"use client";

import { budgetOptions } from "@/lib/budget";
import type { BudgetRange } from "@/lib/db/types";

type Props = { value: BudgetRange | null; onPick: (b: BudgetRange) => void; disabled?: boolean };

export function BudgetPicker({ value, onPick, disabled }: Props) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-sm font-medium text-[#1A1A1A]">What would you pay?</legend>
      <div className="flex flex-wrap gap-2">
        {budgetOptions.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onPick(o.value)}
            className="rounded-md border border-[#E5E5E0] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] aria-pressed:border-[#2563EB] aria-pressed:bg-[#2563EB] aria-pressed:text-white disabled:opacity-60"
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
