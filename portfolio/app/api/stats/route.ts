import { connection } from "next/server";
import { guard, ok } from "@/lib/api";
import { getPublicStats } from "@/lib/db/stats";

export async function GET() {
  return guard(async () => {
    await connection();
    return ok({ stats: await getPublicStats() });
  });
}
