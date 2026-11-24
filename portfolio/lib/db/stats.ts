import { getServerDb } from "../supabase";
import { FIXTURE_STATS, fixtureMode } from "./fixture";
import type { PublicStats } from "./types";

type StatsRow = {
  active_now: number | string;
  visitors_today: number | string;
  visitors_7d: number | string;
  total_comments: number | string;
};

export async function getPublicStats(): Promise<PublicStats> {
  if (fixtureMode) return FIXTURE_STATS;
  const { data, error } = await getServerDb().rpc("public_stats");
  if (error) throw error;
  // set-returning function: supabase-js gives an array of rows (bigint may arrive as string)
  const row = (Array.isArray(data) ? data[0] : data) as StatsRow | undefined;
  return {
    activeNow: Number(row?.active_now ?? 0),
    visitorsToday: Number(row?.visitors_today ?? 0),
    visitorsWeek: Number(row?.visitors_7d ?? 0),
    totalComments: Number(row?.total_comments ?? 0),
  };
}
