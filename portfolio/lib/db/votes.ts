import { getServerDb } from "../supabase";
import { fixtureMode } from "./fixture";
import type { BudgetRange } from "./types";

async function countFor(itemId: string): Promise<number> {
  const db = getServerDb();
  const { count, error } = await db
    .from("idea_votes")
    .select("id", { count: "exact", head: true })
    .eq("item_id", itemId);
  if (error) throw error;
  return count ?? 0;
}

/** The viewer's own vote on an item: whether a row exists and its budget (or null). */
export async function getUserVote(
  itemId: string,
  userId: string,
): Promise<{ voted: boolean; budgetRange: BudgetRange | null }> {
  const db = getServerDb();
  const { data, error } = await db
    .from("idea_votes")
    .select("budget_range")
    .eq("item_id", itemId)
    .eq("user_id", userId);
  if (error) throw error;
  const row = (data ?? [])[0] as { budget_range: BudgetRange | null } | undefined;
  return row ? { voted: true, budgetRange: row.budget_range ?? null } : { voted: false, budgetRange: null };
}

/**
 * Upsert on (item_id, user_id): a repeat vote updates budget_range in place
 * (one request, never a delete-then-insert). `created` is false on a repeat.
 */
export async function addVote(
  itemId: string,
  userId: string,
  budgetRange: string | null,
): Promise<{ created: boolean; wantCount: number }> {
  const db = getServerDb();
  const existing = await getUserVote(itemId, userId);
  const { error } = await db
    .from("idea_votes")
    .upsert(
      { item_id: itemId, user_id: userId, budget_range: budgetRange },
      { onConflict: "item_id,user_id" },
    );
  if (error) throw error;
  return { created: !existing.voted, wantCount: await countFor(itemId) };
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
  if (itemIds.length === 0 || fixtureMode) return counts;
  const db = getServerDb();
  const { data, error } = await db.from("idea_votes").select("item_id").in("item_id", itemIds);
  if (error) throw error;
  for (const r of (data ?? []) as { item_id: string }[]) {
    counts.set(r.item_id, (counts.get(r.item_id) ?? 0) + 1);
  }
  return counts;
}
