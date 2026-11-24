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

/** Returns a new list without the comment with the given id. */
export function removeComment<T extends { id: string }>(comments: readonly T[], id: string): T[] {
  return comments.filter((c) => c.id !== id);
}

/** A delete control is offered only for the signed-in viewer's own comments. */
export function canDelete(c: { mine: boolean }, signedIn: boolean): boolean {
  return signedIn && c.mine;
}
