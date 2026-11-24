import { auth, currentUser } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { fail, guard, limited, ok, readJson, UUID_RE } from "@/lib/api";
import { insertComment, listVisibleComments } from "@/lib/db/comments";
import { getPublishedItemById } from "@/lib/db/items";
import { isOwner } from "@/lib/admin";
import { validateComment } from "@/lib/validation";

// Stateful route: reads the session and request, so it is dynamic. With
// cacheComponents enabled the `dynamic` segment option no longer exists.

export async function GET(request: Request) {
  return guard(async () => {
    await connection();
    const itemId = new URL(request.url).searchParams.get("itemId") ?? "";
    if (!UUID_RE.test(itemId)) return fail(400, "Invalid itemId");
    const { userId } = await auth();
    const rows = await listVisibleComments(itemId);
    return ok({
      comments: rows.map((c) => ({
        id: c.id,
        created_at: c.created_at,
        author_name: c.author_name,
        author_avatar: c.author_avatar,
        body: c.body,
        is_owner: c.is_owner,
        mine: userId !== null && c.author_id === userId,
      })),
    });
  });
}

export async function POST(request: Request) {
  return guard(async () => {
    const { userId } = await auth();
    if (!userId) return fail(401, "Sign in to comment");
    const limit = await limited(`comments:${userId}`, 5, 60);
    if (limit) return limit;

    const json = await readJson(request);
    if (!json) return fail(400, "Invalid JSON body");
    const itemId = typeof json.itemId === "string" ? json.itemId : "";
    if (!UUID_RE.test(itemId)) return fail(400, "Invalid itemId", { fields: { itemId: "Invalid item" } });
    const comment = validateComment(json.body);
    if (!comment.ok) return fail(400, comment.error, { fields: { body: comment.error } });

    if (!(await getPublishedItemById(itemId))) return fail(404, "Item not found");

    const user = await currentUser();
    const authorName = user?.fullName || user?.username || "Visitor";
    const row = await insertComment({
      itemId,
      authorId: userId,
      authorName,
      authorAvatar: user?.imageUrl ?? null,
      body: comment.body,
      isOwner: isOwner(userId, process.env.ADMIN_CLERK_USER_ID ?? ""),
    });
    return ok({ comment: { id: row.id } }, 201);
  });
}
