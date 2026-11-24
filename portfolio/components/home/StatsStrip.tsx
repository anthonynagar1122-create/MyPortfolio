import type { PublicStats } from "@/lib/db/types";

export function StatsStrip({ stats }: { stats: PublicStats }) {
  const cells: { id: string; label: string; value: number }[] = [
    { id: "stat-active", label: "Active now", value: stats.activeNow },
    { id: "stat-today", label: "Visitors today", value: stats.visitorsToday },
    { id: "stat-week", label: "Visitors, 7 days", value: stats.visitorsWeek },
    { id: "stat-comments", label: "Comments", value: stats.totalComments },
  ];
  return (
    <div id="stats">
    <dl className="grid grid-cols-2 gap-4 border-y border-[color:var(--border)] py-4 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.id} data-testid={c.id}>
          <dt className="text-xs text-[color:var(--muted)]">{c.label}</dt>
          <dd className="text-xl font-semibold text-[color:var(--text)]">{c.value.toLocaleString("en-US")}</dd>
        </div>
      ))}
    </dl>
    </div>
  );
}
