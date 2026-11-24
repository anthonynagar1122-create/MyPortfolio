import Link from "next/link";
import { deleteItemAction } from "@/app/admin/actions";
import { LaunchForm } from "@/components/admin/LaunchForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { requireOwner } from "@/lib/admin";
import { listAllItems } from "@/lib/db/items";

export default async function AdminItems() {
  // Enforced here too, not only in the layout: a non-owner throws before any data read.
  await requireOwner();
  const items = await listAllItems();
  return (
    <section aria-labelledby="items-h" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 id="items-h" className="text-2xl font-semibold text-[#1A1A1A]">
          Items
        </h1>
        <Link href="/admin/items/new" className="text-sm font-medium text-[#2563EB] underline underline-offset-2">
          New item
        </Link>
      </div>
      {items.length === 0 ? <p className="text-sm text-[#5C5C5C]">No items yet.</p> : null}
      <ul className="flex flex-col gap-3">
        {items.map((i) => (
          <li key={i.id} className="flex flex-col gap-2 rounded-md border border-[#E5E5E0] bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/items/${i.id}`} className="font-medium text-[#1A1A1A] underline underline-offset-2">
                {i.title}
              </Link>
              <span className="text-xs text-[#5C5C5C]">
                {i.type} · {i.status} · {i.published ? "published" : "draft"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {i.published ? <LaunchForm id={i.id} /> : null}
              <form action={deleteItemAction}>
                <input type="hidden" name="id" value={i.id} />
                <SubmitButton>Delete</SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
