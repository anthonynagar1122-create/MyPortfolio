"use client";

import Link from "next/link";
import { useState } from "react";
import { newestFirst, removeComment, type PublicComment } from "@/lib/comment-order";
import { CommentList } from "./CommentList";

type Props = { itemId: string; initial: PublicComment[]; signedIn: boolean };

/** Comment thread plus the post form. Signed-out visitors get a sign-in prompt. */
export function CommentForm({ itemId, initial, signedIn }: Props) {
  const [comments, setComments] = useState(() => newestFirst(initial));
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  async function remove(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setDeleteError({ id, message: json.error ?? "Could not delete your comment" });
        return;
      }
      setComments((list) => removeComment(list, id));
    } catch {
      setDeleteError({ id, message: "Could not delete your comment" });
    } finally {
      setDeletingId(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, body }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not post your comment");
        return;
      }
      const list = await fetch(`/api/comments?itemId=${encodeURIComponent(itemId)}`);
      const data = (await list.json().catch(() => ({}))) as { comments?: PublicComment[] };
      if (Array.isArray(data.comments)) setComments(newestFirst(data.comments));
      setBody("");
    } catch {
      setError("Could not post your comment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
      <h2 id="comments-heading" className="text-xl font-semibold text-[color:var(--text)]">
        Comments ({comments.length})
      </h2>
      {signedIn ? (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <label htmlFor="comment-body" className="text-sm font-medium text-[color:var(--text)]">
            Add a comment
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            rows={3}
            required
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-2 text-sm"
          />
          {error ? (
            <p role="alert" className="text-sm text-[color:var(--danger)]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy || body.trim().length === 0}
            className="self-start rounded-md bg-[color:var(--primary)] px-3 py-1.5 text-sm font-medium text-[color:var(--on-primary)] disabled:opacity-60"
          >
            {busy ? "Posting" : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-[color:var(--muted)]">
          <Link href="/sign-in" className="font-medium text-[color:var(--primary)] underline underline-offset-2">
            Sign in to comment
          </Link>
        </p>
      )}
      <CommentList
        comments={comments}
        signedIn={signedIn}
        onDelete={remove}
        deletingId={deletingId}
        deleteError={deleteError}
      />
    </section>
  );
}
