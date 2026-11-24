import { getServerDb } from "../supabase";

/** Upsert on (day, visitor_hash); refreshes last_seen. `day` is YYYY-MM-DD. */
export async function recordVisit(day: string, visitorHash: string): Promise<void> {
  const { error } = await getServerDb()
    .from("visits")
    .upsert(
      { day, visitor_hash: visitorHash, last_seen: new Date().toISOString() },
      { onConflict: "day,visitor_hash" },
    );
  if (error) throw error;
}
