"use client";

import Link from "next/link";
import { useState } from "react";

type Props = { itemId: string; initialCount: number; signedIn: boolean };

export function VoteButton({ itemId, initialCount, signedIn }: Props) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm font-medium text-[color:var(--muted)] opacity-60"
        >
          I want this ({count})
        </button>
        <Link
          href="/sign-in"
          data-focus-target="card-action"
          className="text-sm font-medium text-[color:var(--primary)] underline underline-offset-2"
        >
          Sign in to vote
        </Link>
      </div>
    );
  }

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/votes", {
        method: voted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const body = (await res.json().catch(() => ({}))) as { wantCount?: number; error?: string };
      if (!res.ok || typeof body.wantCount !== "number") {
        setError(body.error ?? "Could not save your vote");
        return;
      }
      setCount(body.wantCount);
      setVoted(!voted);
    } catch {
      setError("Could not save your vote");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={voted}
        data-focus-target="card-action"
        className="rounded-md bg-[color:var(--primary)] px-3 py-1.5 text-sm font-medium text-[color:var(--on-primary)] disabled:opacity-60 aria-pressed:bg-[color:var(--text)]"
      >
        I want this ({count})
      </button>
      {error ? (
        <p role="alert" className="text-xs text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
