import { auth } from "@clerk/nextjs/server";
import { fail, guard, limited, ok, readJson, UUID_RE } from "@/lib/api";
import { getPublishedItemById } from "@/lib/db/items";
import { addVote, removeVote } from "@/lib/db/votes";

const BUDGETS = ["free", "under_10", "10_50", "over_50", "not_sure"];

async function prepare(request: Request) {
  const { userId } = await auth();
  if (!userId) return { error: fail(401, "Sign in to vote") };
  const limit = await limited(`votes:${userId}`, 30, 60);
  if (limit) return { error: limit };
  const json = await readJson(request);
  if (!json) return { error: fail(400, "Invalid JSON body") };
  const itemId = typeof json.itemId === "string" ? json.itemId : "";
  if (!UUID_RE.test(itemId)) return { error: fail(400, "Invalid itemId", { fields: { itemId: "Invalid item" } }) };
  const item = await getPublishedItemById(itemId);
  if (!item || item.type !== "idea") return { error: fail(404, "Idea not found") };
  return { userId, itemId, json };
}

export async function POST(request: Request) {
  return guard(async () => {
    const p = await prepare(request);
    if (p.error) return p.error;
    const raw = p.json.budgetRange;
    if (raw !== undefined && raw !== null && (typeof raw !== "string" || !BUDGETS.includes(raw))) {
      return fail(400, "Invalid budget range", { fields: { budgetRange: "Invalid budget range" } });
    }
    const result = await addVote(p.itemId, p.userId, (raw as string | null | undefined) ?? null);
    return ok({ created: result.created, wantCount: result.wantCount }, result.created ? 201 : 200);
  });
}

export async function DELETE(request: Request) {
  return guard(async () => {
    const p = await prepare(request);
    if (p.error) return p.error;
    return ok({ wantCount: await removeVote(p.itemId, p.userId) });
  });
}
