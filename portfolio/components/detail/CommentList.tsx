import { canDelete, newestFirst, type PublicComment } from "@/lib/comment-order";

type Props = {
  comments: PublicComment[];
  signedIn?: boolean;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
  deleteError?: { id: string; message: string } | null;
};

export function CommentList({ comments, signedIn = false, onDelete, deletingId = null, deleteError = null }: Props) {
  if (comments.length === 0) {
    return <p className="text-sm text-[#5C5C5C]">No comments yet.</p>;
  }
  // Bodies are React text children only: React escapes them. Never render
  // stored text as HTML or as a link.
  return (
    <ul data-testid="comment-list" className="flex flex-col gap-4">
      {newestFirst(comments).map((c) => (
        <li key={c.id} className="rounded-lg border border-[#E5E5E0] bg-white p-4">
          <div className="mb-1 flex items-center gap-2 text-sm">
            <span className="font-medium text-[#1A1A1A]">{c.author_name}</span>
            {c.is_owner ? (
              <span className="rounded border border-[#E5E5E0] px-1.5 text-xs text-[#5C5C5C]">Owner</span>
            ) : null}
            <time dateTime={c.created_at} className="text-xs text-[#5C5C5C]">
              {c.created_at.slice(0, 10)}
            </time>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#1A1A1A]">{c.body}</p>
          {onDelete && canDelete(c, signedIn) ? (
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                disabled={deletingId === c.id}
                className="text-xs font-medium text-[#B91C1C] underline underline-offset-2 disabled:opacity-60"
              >
                {deletingId === c.id ? "Deleting" : "Delete"}
              </button>
              {deleteError?.id === c.id ? (
                <p role="alert" className="text-xs text-[#B91C1C]">
                  {deleteError.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
