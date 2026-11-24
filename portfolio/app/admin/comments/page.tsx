import { deleteCommentAction, setCommentHiddenAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { gateOwner } from "@/lib/admin-gate";
import { listAllComments } from "@/lib/db/comments";
import { listAllItems } from "@/lib/db/items";

export default async function AdminComments() {
  await gateOwner();
  const [comments, items] = await Promise.all([listAllComments(), listAllItems()]);
  const titles = new Map(items.map((i) => [i.id, i.title]));
  return (
    <section aria-labelledby="comments-h" className="flex flex-col gap-4">
      <h1 id="comments-h" className="text-2xl font-semibold text-[#1A1A1A]">
        Comments
      </h1>
      {comments.length === 0 ? <p className="text-sm text-[#5C5C5C]">No comments yet.</p> : null}
      <ul className="flex flex-col gap-3">
        {comments.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-md border border-[#E5E5E0] bg-white p-4">
            <p className="text-xs text-[#5C5C5C]">
              {c.author_name} on {titles.get(c.item_id) ?? "deleted item"} · {c.hidden ? "hidden" : "visible"}
            </p>
            <p className="whitespace-pre-wrap text-sm text-[#1A1A1A]">{c.body}</p>
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
