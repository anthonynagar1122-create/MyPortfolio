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
      className="flex flex-col gap-3 rounded-lg border border-[#E5E5E0] bg-white p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[#5C5C5C]">
          {item.type === "project" ? "Project" : "Idea"} · {item.category}
        </span>
        <StatusBadge status={item.status} type={item.type} />
      </div>
      <h3 className="text-lg font-semibold leading-snug text-[#1A1A1A]">
        <Link href={`/item/${item.slug}`}>{item.title}</Link>
      </h3>
      <p className="text-sm leading-relaxed text-[#5C5C5C]">{item.short_description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        {item.type === "project" ? (
          isHttpUrl(item.live_url) ? (
            <a
              href={item.live_url}
              target="_blank"
              rel="noopener noreferrer"
              data-focus-target="card-action"
              className="rounded-md bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white hover:text-white"
            >
              Open project
            </a>
          ) : (
            <span className="text-sm text-[#5C5C5C]">Not live yet</span>
          )
        ) : (
          <VoteButton itemId={item.id} initialCount={wantCount} signedIn={signedIn} />
        )}
        <span className="text-xs text-[#5C5C5C]">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
      </div>
    </article>
  );
}
