import type { PublicStats } from "@/lib/db/types";

export function StatsStrip({ stats }: { stats: PublicStats }) {
  const cells: { id: string; label: string; value: number }[] = [
    { id: "stat-active", label: "Active now", value: stats.activeNow },
    { id: "stat-today", label: "Visitors today", value: stats.visitorsToday },
    { id: "stat-week", label: "Visitors, 7 days", value: stats.visitorsWeek },
    { id: "stat-comments", label: "Comments", value: stats.totalComments },
  ];
  return (
    <dl className="grid grid-cols-2 gap-4 border-y border-[#E5E5E0] py-4 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.id} data-testid={c.id}>
          <dt className="text-xs text-[#5C5C5C]">{c.label}</dt>
          <dd className="text-xl font-semibold text-[#1A1A1A]">{c.value.toLocaleString("en-US")}</dd>
        </div>
      ))}
    </dl>
  );
}
