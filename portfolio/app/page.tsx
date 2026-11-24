import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ItemCard } from "@/components/cards/ItemCard";
import { EmptyState } from "@/components/home/EmptyState";
import { FilterBar } from "@/components/home/FilterBar";
import { StatsStrip } from "@/components/home/StatsStrip";
import { categories, site, statuses } from "@/lib/config";
import { commentCounts } from "@/lib/db/comments";
import { fixtureMode } from "@/lib/db/fixture";
import { listPublishedItems, type ItemFilter } from "@/lib/db/items";
import { getPublicStats } from "@/lib/db/stats";
import { wantCounts } from "@/lib/db/votes";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SORTS: ItemFilter["sort"][] = ["newest", "most_wanted", "most_commented"];
const allStatuses = [...statuses.project, ...statuses.idea.filter((s) => !statuses.project.includes(s))];

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

// Static shell renders instantly; everything that depends on the URL, the
// session or live stats streams in behind this boundary (cacheComponents).
export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-6xl bg-[color:var(--bg)] px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--text)] sm:text-5xl">{site.name}</h1>
        <p className="mt-3 text-lg text-[color:var(--muted)]">{site.tagline}</p>
      </header>
      <Suspense fallback={<p className="text-sm text-[color:var(--muted)]">Loading</p>}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function HomeContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const sp = await searchParams;

  const typeRaw = first(sp.type);
  const categoryRaw = first(sp.category);
  const statusRaw = first(sp.status);
  const sortRaw = first(sp.sort);
  const type = typeRaw === "project" || typeRaw === "idea" ? typeRaw : undefined;
  const category = categories.includes(categoryRaw) ? categoryRaw : undefined;
  const status = allStatuses.includes(statusRaw) ? statusRaw : undefined;
  const sort = (SORTS as string[]).includes(sortRaw) ? (sortRaw as ItemFilter["sort"]) : "newest";

  const [items, stats, session] = await Promise.all([
    listPublishedItems({ type, category, status, sort }),
    getPublicStats(),
    fixtureMode ? Promise.resolve(null) : auth(),
  ]);
  const ids = items.map((i) => i.id);
  const [wants, comments] = await Promise.all([wantCounts(ids), commentCounts(ids)]);
  const signedIn = Boolean(session?.userId);
  const filtered = Boolean(type || category || status);

  return (
    <div className="flex flex-col gap-6">
      <StatsStrip stats={stats} />
      <FilterBar
        values={{ type: type ?? "", category: category ?? "", status: status ?? "", sort }}
        categories={categories}
        statuses={allStatuses}
      />
      {items.length === 0 ? (
        <EmptyState filtered={filtered} />
      ) : (
        <div
          data-testid="card-grid"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              commentCount={comments.get(item.id) ?? 0}
              wantCount={wants.get(item.id) ?? 0}
              signedIn={signedIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
