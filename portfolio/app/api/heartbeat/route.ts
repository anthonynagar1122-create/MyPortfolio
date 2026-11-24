import { connection } from "next/server";
import { guard, isLikelyBot, limited, ok, requestVisitorHash } from "@/lib/api";
import { recordVisit } from "@/lib/db/visits";
import { today } from "@/lib/visitor";

export async function POST(request: Request) {
  return guard(async () => {
    await connection();
    if (isLikelyBot(request.headers.get("user-agent") ?? "")) return ok();
    const hash = requestVisitorHash(request);
    const limit = await limited(`heartbeat:${hash}`, 20, 60);
    if (limit) return limit;
    await recordVisit(today(), hash);
    return ok();
  });
}
