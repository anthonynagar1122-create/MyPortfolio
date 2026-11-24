"use client";

import Link from "next/link";
import { useState } from "react";
import type { BudgetRange } from "@/lib/db/types";
import { BudgetPicker } from "./BudgetPicker";

type Props = { itemId: string; initialCount: number; signedIn: boolean };

async function call(method: "POST" | "DELETE", itemId: string, budgetRange?: BudgetRange) {
  const res = await fetch("/api/votes", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(budgetRange ? { itemId, budgetRange } : { itemId }),
  });
  const body = (await res.json().catch(() => ({}))) as { wantCount?: number; error?: string };
  if (!res.ok || typeof body.wantCount !== "number") {
    throw new Error(body.error ?? "Could not save your vote");
  }
  return body.wantCount;
}

/** "I want this" for ideas. The budget picker appears only after a successful vote. */
export function WantButton({ itemId, initialCount, signedIn }: Props) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [budget, setBudget] = useState<BudgetRange | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your vote");
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled
          className="rounded-md border border-[#E5E5E0] px-4 py-2 text-sm font-medium text-[#5C5C5C] opacity-60"
        >
          I want this ({count})
        </button>
        <Link href="/sign-in" className="text-sm font-medium text-[#2563EB] underline underline-offset-2">
          Sign in to vote
        </Link>
      </div>
    );
  }

  const toggle = () =>
    run(async () => {
      if (voted) {
        setCount(await call("DELETE", itemId));
        setVoted(false);
        setBudget(null);
      } else {
        setCount(await call("POST", itemId));
        setVoted(true);
      }
    });

  // The votes API ignores repeat votes, so a budget is saved by replacing the
  // vote: remove it, then add it again with the chosen range.
  const pick = (b: BudgetRange) =>
    run(async () => {
      await call("DELETE", itemId);
      setCount(await call("POST", itemId, b));
      setBudget(b);
    });

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={voted}
        className="self-start rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 aria-pressed:bg-[#1A1A1A]"
      >
        I want this ({count})
      </button>
      {voted ? <BudgetPicker value={budget} onPick={pick} disabled={busy} /> : null}
      {error ? (
        <p role="alert" className="text-sm text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
