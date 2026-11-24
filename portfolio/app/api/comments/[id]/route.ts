import { auth } from "@clerk/nextjs/server";
import { fail, guard, limited, ok, UUID_RE } from "@/lib/api";
import { deleteOwnComment } from "@/lib/db/comments";

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return guard(async () => {
    const { userId } = await auth();
    if (!userId) return fail(401, "Sign in required");
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return fail(404, "Comment not found");
    const limit = await limited(`comments-delete:${userId}`, 30, 60);
    if (limit) return limit;
    // Missing and not-yours are indistinguishable on purpose (no existence leak).
    const deleted = await deleteOwnComment(id, userId);
    return deleted ? ok() : fail(404, "Comment not found");
  });
}
