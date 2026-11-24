import Link from "next/link";
import { gateOwner } from "@/lib/admin-gate";
import { countConfirmed } from "@/lib/db/subscribers";
import { getPublicStats } from "@/lib/db/stats";

export default async function AdminDashboard() {
  await gateOwner();
  const [stats, subscribers] = await Promise.all([getPublicStats(), countConfirmed()]);
  const tiles: [string, number][] = [
    ["Active now", stats.activeNow],
    ["Visitors today", stats.visitorsToday],
    ["Visitors (7 days)", stats.visitorsWeek],
    ["Comments", stats.totalComments],
    ["Confirmed subscribers", subscribers],
  ];
  return (
    <section aria-labelledby="dash-h" className="flex flex-col gap-6">
      <h1 id="dash-h" className="text-2xl font-semibold text-[#1A1A1A]">
        Admin dashboard
      </h1>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map(([label, n]) => (
          <div key={label} className="rounded-md border border-[#E5E5E0] bg-white p-4">
            <dt className="text-xs text-[#5C5C5C]">{label}</dt>
            <dd className="text-2xl font-semibold text-[#1A1A1A]">{n}</dd>
          </div>
        ))}
      </dl>
      <p>
        <a href="/admin/subscribers/export" className="text-sm font-medium text-[#2563EB] underline underline-offset-2">
          Download subscribers (CSV)
        </a>
      </p>
      <p>
        <Link href="/admin/items/new" className="text-sm font-medium text-[#2563EB] underline underline-offset-2">
          New item
        </Link>
      </p>
    </section>
  );
}
