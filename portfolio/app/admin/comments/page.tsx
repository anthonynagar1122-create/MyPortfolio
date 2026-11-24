import { deleteCommentAction, setCommentHiddenAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { requireOwner } from "@/lib/admin";
import { listAllComments } from "@/lib/db/comments";
import { listAllItems } from "@/lib/db/items";

export default async function AdminComments() {
  // Enforced here too, not only in the layout: a non-owner throws before any data read.
  await requireOwner();
  const [comments, items] = await Promise.all([listAllComments(), listAllItems()]);
  const titles = new Map(items.map((i) => [i.id, i.title]));
  return (
    <section aria-labelledby="comments-h" className="flex flex-col gap-4">
      <h1 id="comments-h" className="text-2xl font-semibold text-[color:var(--text)]">
        Comments
      </h1>
      {comments.length === 0 ? <p className="text-sm text-[color:var(--muted)]">No comments yet.</p> : null}
      <ul className="flex flex-col gap-3">
        {comments.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="text-xs text-[color:var(--muted)]">
              {c.author_name} on {titles.get(c.item_id) ?? "deleted item"} · {c.hidden ? "hidden" : "visible"}
            </p>
            <p className="whitespace-pre-wrap text-sm text-[color:var(--text)]">{c.body}</p>
            <div className="flex gap-2">
              <form action={setCommentHiddenAction}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="hidden" value={c.hidden ? "false" : "true"} />
                <SubmitButton>{c.hidden ? "Unhide" : "Hide"}</SubmitButton>
              </form>
              <form action={deleteCommentAction}>
                <input type="hidden" name="id" value={c.id} />
                <SubmitButton>Delete</SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
