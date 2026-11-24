import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { StatusBadge } from "@/components/cards/StatusBadge";
import { CommentForm } from "@/components/detail/CommentForm";
import { WantButton } from "@/components/detail/WantButton";
import type { PublicComment } from "@/lib/comment-order";
import { listVisibleComments } from "@/lib/db/comments";
import { fixtureMode } from "@/lib/db/fixture";
import { getItemBySlug } from "@/lib/db/items";
import { getUserVote, wantCounts } from "@/lib/db/votes";
import { isHttpUrl } from "@/lib/safe-url";

type Params = Promise<{ slug: string }>;

// Static shell; everything that reads the slug, session or database streams in
// behind the boundary (same pattern as the home page).
export default function ItemPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-3xl bg-[#FAFAF7] px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/" className="text-sm font-medium text-[#2563EB] underline underline-offset-2">
        All ideas and projects
      </Link>
      <Suspense fallback={<p className="mt-6 text-sm text-[#5C5C5C]">Loading</p>}>
        <ItemContent params={params} />
      </Suspense>
    </main>
  );
}

async function ItemContent({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) notFound();

  const [rows, wants, session] = await Promise.all([
    listVisibleComments(item.id),
    wantCounts([item.id]),
    fixtureMode ? Promise.resolve(null) : auth(),
  ]);
  const userId = session?.userId ?? null;
  const myVote =
    userId && item.type === "idea" ? await getUserVote(item.id, userId) : { voted: false, budgetRange: null };
  const signedIn = Boolean(userId);
  const comments: PublicComment[] = rows.map((c) => ({
    id: c.id,
    created_at: c.created_at,
    author_name: c.author_name,
    author_avatar: c.author_avatar,
    body: c.body,
    is_owner: c.is_owner,
    mine: userId !== null && c.author_id === userId,
  }));

  const links = [
    { label: "Open project", url: item.live_url },
    { label: "Demo", url: item.demo_url },
    { label: "Android", url: item.android_url },
    { label: "iOS", url: item.ios_url },
  ].filter((l): l is { label: string; url: string } => isHttpUrl(l.url));

  return (
    <article data-testid="item-detail" className="mt-6 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-[#5C5C5C]">
            {item.type === "project" ? "Project" : "Idea"} · {item.category}
          </span>
          <StatusBadge status={item.status} type={item.type} />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] sm:text-4xl">{item.title}</h1>
        <p className="text-lg text-[#5C5C5C]">{item.short_description}</p>
        {item.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <li key={t} className="rounded border border-[#E5E5E0] px-2 py-0.5 text-xs text-[#5C5C5C]">
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      <p className="whitespace-pre-wrap leading-relaxed text-[#1A1A1A]">{item.description}</p>
      <div className="flex flex-wrap items-center gap-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white hover:text-white"
          >
            {l.label}
          </a>
        ))}
        {item.type === "idea" ? (
          <WantButton
            itemId={item.id}
            initialCount={wants.get(item.id) ?? 0}
            signedIn={signedIn}
            initialVoted={myVote.voted}
            initialBudget={myVote.budgetRange}
          />
        ) : null}
      </div>
      <CommentForm itemId={item.id} initial={comments} signedIn={signedIn} />
    </article>
  );
}
