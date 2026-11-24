"use client";

import Link from "next/link";
import { useState } from "react";
import type { BudgetRange } from "@/lib/db/types";
import { applyBudget, applyToggle, withServerCount, type VoteState } from "@/lib/vote-state";
import { BudgetPicker } from "./BudgetPicker";

type Props = {
  itemId: string;
  initialCount: number;
  signedIn: boolean;
  initialVoted?: boolean;
  initialBudget?: BudgetRange | null;
};

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

/** "I want this" for ideas. The budget picker appears only while the viewer has voted. */
export function WantButton({ itemId, initialCount, signedIn, initialVoted = false, initialBudget = null }: Props) {
  // `confirmed` is the last state the server acknowledged; `shown` may be ahead
  // of it while a request is in flight and snaps back to it if the request fails.
  const start: VoteState = { count: initialCount, voted: signedIn && initialVoted, budget: initialBudget };
  const [confirmed, setConfirmed] = useState<VoteState>(start);
  const [shown, setShown] = useState<VoteState>(start);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { count, voted, budget } = shown;

  async function run(optimistic: VoteState, request: () => Promise<number>) {
    setBusy(true);
    setError(null);
    setShown(optimistic);
    try {
      const settled = withServerCount(optimistic, await request());
      setConfirmed(settled);
      setShown(settled);
    } catch (e) {
      setShown(confirmed);
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
          className="rounded-md border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--muted)] opacity-60"
        >
          I want this ({count})
        </button>
        <Link href="/sign-in" className="text-sm font-medium text-[color:var(--primary)] underline underline-offset-2">
          Sign in to vote
        </Link>
      </div>
    );
  }

  const toggle = () =>
    run(applyToggle(confirmed), () => call(confirmed.voted ? "DELETE" : "POST", itemId));

  // One upserting request: changing the budget never removes the vote first.
  const pick = (b: BudgetRange) => run(applyBudget(confirmed, b), () => call("POST", itemId, b));

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={voted}
        className="self-start rounded-md bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--on-primary)] disabled:opacity-60 aria-pressed:bg-[color:var(--text)]"
      >
        I want this ({count})
      </button>
      {voted ? <BudgetPicker value={budget} onPick={pick} disabled={busy} /> : null}
      {error ? (
        <p role="alert" className="text-sm text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
