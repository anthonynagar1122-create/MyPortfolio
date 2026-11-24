import { notFound } from "next/navigation";
import { ItemForm } from "@/components/admin/ItemForm";
import { gateOwner } from "@/lib/admin-gate";
import { getItemById } from "@/lib/db/items";
import { UUID_RE } from "@/lib/api";

export default async function AdminItem({ params }: { params: Promise<{ id: string }> }) {
  await gateOwner();
  const { id } = await params;
  let item = null;
  if (id !== "new") {
    if (!UUID_RE.test(id)) notFound();
    item = await getItemById(id);
    if (!item) notFound();
  }
  return (
    <section aria-labelledby="item-h" className="flex flex-col gap-4">
      <h1 id="item-h" className="text-2xl font-semibold text-[#1A1A1A]">
        {item ? "Edit item" : "New item"}
      </h1>
      <ItemForm item={item} />
    </section>
  );
}
