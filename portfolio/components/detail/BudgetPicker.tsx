"use client";

import { budgetOptions } from "@/lib/budget";
import type { BudgetRange } from "@/lib/db/types";

type Props = { value: BudgetRange | null; onPick: (b: BudgetRange) => void; disabled?: boolean };

export function BudgetPicker({ value, onPick, disabled }: Props) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-sm font-medium text-[color:var(--text)]">What would you pay?</legend>
      <div className="flex flex-wrap gap-2">
        {budgetOptions.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onPick(o.value)}
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-sm text-[color:var(--text)] aria-pressed:border-[color:var(--primary)] aria-pressed:bg-[color:var(--primary)] aria-pressed:text-[color:var(--on-primary)] disabled:opacity-60"
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
