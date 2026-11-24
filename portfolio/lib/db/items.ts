import { getServerDb } from "../supabase";
import { slugify } from "../validation";
import { wantCounts } from "./votes";
import { FIXTURE_ITEMS, fixtureMode } from "./fixture";
import type { ItemInput, ItemRow } from "./types";

export type ItemFilter = {
  type?: "project" | "idea";
  category?: string;
  status?: string;
  sort: "newest" | "most_wanted" | "most_commented";
};

export async function listPublishedItems(filter: ItemFilter): Promise<ItemRow[]> {
  if (fixtureMode) {
    if (fixtureMode === "empty") return [];
    return FIXTURE_ITEMS.filter(
      (i) =>
        (!filter.type || i.type === filter.type) &&
        (!filter.category || i.category === filter.category) &&
        (!filter.status || i.status === filter.status),
    );
  }
  const db = getServerDb();
  let q = db.from("items").select("*").eq("published", true);
  if (filter.type) q = q.eq("type", filter.type);
  if (filter.category) q = q.eq("category", filter.category);
  if (filter.status) q = q.eq("status", filter.status);
  const { data, error } = await q
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  const items = (data ?? []) as ItemRow[];

  if (filter.sort === "newest") {
    return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const ids = items.map((i) => i.id);
  let counts: Map<string, number>;
  if (filter.sort === "most_wanted") {
    counts = await wantCounts(ids);
  } else {
    counts = new Map();
    if (ids.length > 0) {
      const { data: rows, error: cErr } = await db
        .from("comments")
        .select("item_id")
        .in("item_id", ids)
        .eq("hidden", false);
      if (cErr) throw cErr;
      for (const r of (rows ?? []) as { item_id: string }[]) {
        counts.set(r.item_id, (counts.get(r.item_id) ?? 0) + 1);
      }
    }
  }
  return [...items].sort(
    (a, b) =>
      (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) ||
      b.created_at.localeCompare(a.created_at),
  );
}

export async function getItemBySlug(slug: string): Promise<ItemRow | null> {
  if (fixtureMode) {
    return fixtureMode === "empty" ? null : (FIXTURE_ITEMS.find((i) => i.slug === slug) ?? null);
  }
  const { data, error } = await getServerDb()
    .from("items")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as ItemRow | null) ?? null;
}

/** Admin: every item, published or not. */
export async function listAllItems(): Promise<ItemRow[]> {
  const { data, error } = await getServerDb()
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ItemRow[];
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "item";
  const db = getServerDb();
  const { data, error } = await db.from("items").select("slug").like("slug", `${base}%`);
  if (error) throw error;
  const taken = new Set(((data ?? []) as { slug: string }[]).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * Create (no id) or update (id). The slug is generated on create and kept on
 * update so public URLs stay stable. `extra.published` defaults to true on
 * create (the owner is the only writer) and is untouched on update unless given.
 */
export async function saveItem(
  input: ItemInput,
  id?: string,
  extra: { published?: boolean; cover_url?: string | null; sort_order?: number } = {},
): Promise<ItemRow> {
  const db = getServerDb();
  const fields = {
    type: input.type,
    title: input.title,
    short_description: input.short_description,
    description: input.description,
    status: input.status,
    category: input.category,
    tags: input.tags,
    live_url: input.live_url ?? null,
    demo_url: input.demo_url ?? null,
    android_url: input.android_url ?? null,
    ios_url: input.ios_url ?? null,
    ...(extra.published !== undefined ? { published: extra.published } : {}),
    ...(extra.cover_url !== undefined ? { cover_url: extra.cover_url } : {}),
    ...(extra.sort_order !== undefined ? { sort_order: extra.sort_order } : {}),
  };
  if (id) {
    const { data, error } = await db.from("items").update(fields).eq("id", id).select("*").single();
    if (error) throw error;
    return data as ItemRow;
  }
  const slug = await uniqueSlug(input.title);
  const { data, error } = await db
    .from("items")
    .insert({ published: false, ...fields, slug })
    .select("*")
    .single();
  if (error) throw error;
  return data as ItemRow;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await getServerDb().from("items").delete().eq("id", id);
  if (error) throw error;
}

/** Public lookup by id; null when missing or unpublished. */
export async function getPublishedItemById(id: string): Promise<ItemRow | null> {
  if (fixtureMode) {
    return fixtureMode === "empty" ? null : (FIXTURE_ITEMS.find((i) => i.id === id) ?? null);
  }
  const { data, error } = await getServerDb()
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as ItemRow | null) ?? null;
}
