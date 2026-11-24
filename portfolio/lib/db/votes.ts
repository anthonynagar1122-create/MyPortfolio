import { getServerDb } from "../supabase";

async function countFor(itemId: string): Promise<number> {
  const db = getServerDb();
  const { count, error } = await db
    .from("idea_votes")
    .select("id", { count: "exact", head: true })
    .eq("item_id", itemId);
  if (error) throw error;
  return count ?? 0;
}

/** Insert ... on conflict (item_id, user_id) do nothing. `created` is false on a repeat. */
export async function addVote(
  itemId: string,
  userId: string,
  budgetRange: string | null,
): Promise<{ created: boolean; wantCount: number }> {
  const db = getServerDb();
  const { data, error } = await db
    .from("idea_votes")
    .upsert(
      { item_id: itemId, user_id: userId, budget_range: budgetRange },
      { onConflict: "item_id,user_id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw error;
  return { created: (data?.length ?? 0) > 0, wantCount: await countFor(itemId) };
}

/** Removes the user's vote and returns the new want count. */
export async function removeVote(itemId: string, userId: string): Promise<number> {
  const db = getServerDb();
  const { error } = await db.from("idea_votes").delete().eq("item_id", itemId).eq("user_id", userId);
  if (error) throw error;
  return countFor(itemId);
}

export async function wantCounts(itemIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (itemIds.length === 0) return counts;
  const db = getServerDb();
  const { data, error } = await db.from("idea_votes").select("item_id").in("item_id", itemIds);
  if (error) throw error;
  for (const r of (data ?? []) as { item_id: string }[]) {
    counts.set(r.item_id, (counts.get(r.item_id) ?? 0) + 1);
  }
  return counts;
}
