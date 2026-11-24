import Link from "next/link";
import type { ItemRow } from "@/lib/db/types";
import { isHttpUrl } from "@/lib/safe-url";
import { StatusBadge } from "./StatusBadge";
import { VoteButton } from "./VoteButton";

type Props = {
  item: ItemRow;
  commentCount: number;
  wantCount: number;
  signedIn?: boolean;
};

export function ItemCard({ item, commentCount, wantCount, signedIn = false }: Props) {
  return (
    <article
      data-testid="item-card"
      className="flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
          {item.type === "project" ? "Project" : "Idea"} · {item.category}
        </span>
        <StatusBadge status={item.status} type={item.type} />
      </div>
      <h3 className="text-lg font-semibold leading-snug text-[color:var(--text)]">
        <Link href={`/item/${item.slug}`}>{item.title}</Link>
      </h3>
      <p className="text-sm leading-relaxed text-[color:var(--muted)]">{item.short_description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        {item.type === "project" ? (
          isHttpUrl(item.live_url) ? (
            <a
              href={item.live_url}
              target="_blank"
              rel="noopener noreferrer"
              data-focus-target="card-action"
              className="rounded-md bg-[color:var(--primary)] px-3 py-1.5 text-sm font-medium text-[color:var(--on-primary)] hover:text-[color:var(--on-primary)]"
            >
              Open project
            </a>
          ) : (
            <span className="text-sm text-[color:var(--muted)]">Not live yet</span>
          )
        ) : (
          <VoteButton itemId={item.id} initialCount={wantCount} signedIn={signedIn} />
        )}
        <span className="text-xs text-[color:var(--muted)]">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
      </div>
    </article>
  );
}
