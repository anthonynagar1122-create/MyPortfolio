import { getServerDb } from "../supabase";
import type { CommentRow } from "./types";

export async function listVisibleComments(itemId: string): Promise<CommentRow[]> {
  const { data, error } = await getServerDb()
    .from("comments")
    .select("*")
    .eq("item_id", itemId)
    .eq("hidden", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CommentRow[];
}

export async function insertComment(input: {
  itemId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  body: string;
  isOwner: boolean;
}): Promise<CommentRow> {
  const { data, error } = await getServerDb()
    .from("comments")
    .insert({
      item_id: input.itemId,
      author_id: input.authorId,
      author_name: input.authorName,
      author_avatar: input.authorAvatar,
      body: input.body,
      is_owner: input.isOwner,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as CommentRow;
}

export async function setCommentHidden(id: string, hidden: boolean): Promise<void> {
  const { error } = await getServerDb().from("comments").update({ hidden }).eq("id", id);
  if (error) throw error;
}

/** Deletes the comment only if authored by `authorId`. Returns whether a row was deleted. */
export async function deleteOwnComment(id: string, authorId: string): Promise<boolean> {
  const { data, error } = await getServerDb()
    .from("comments")
    .delete()
    .eq("id", id)
    .eq("author_id", authorId)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
