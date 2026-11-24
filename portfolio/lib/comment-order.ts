export type PublicComment = {
  id: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  body: string;
  is_owner: boolean;
  mine: boolean;
};

/** Newest first; returns a new array. */
export function newestFirst<T extends { created_at: string }>(comments: readonly T[]): T[] {
  return [...comments].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
