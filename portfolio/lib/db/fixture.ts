import type { ItemRow, PublicStats } from "./types";

/**
 * E2E fixture switch. Read ONCE at module load. "1" serves a small static
 * data set, "empty" serves nothing. Refuses to start in production so test
 * data can never replace the real database.
 */
export type FixtureMode = "seeded" | "empty" | null;

export function readFixtureMode(env: Record<string, string | undefined>): FixtureMode {
  const raw = env.E2E_FIXTURE;
  if (!raw) return null;
  if (env.NODE_ENV === "production") {
    throw new Error("E2E_FIXTURE must not be set when NODE_ENV is production");
  }
  if (raw === "empty") return "empty";
  if (raw === "1") return "seeded";
  throw new Error(`Unknown E2E_FIXTURE value: ${raw} (expected "1" or "empty")`);
}

export const fixtureMode: FixtureMode = readFixtureMode(process.env);

const base = {
  cover_url: null,
  demo_url: null,
  android_url: null,
  ios_url: null,
  published: true,
  sort_order: 0,
  updated_at: "2026-01-01T00:00:00Z",
};

export const FIXTURE_ITEMS: ItemRow[] = [
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000001",
    created_at: "2026-01-02T00:00:00Z",
    type: "project",
    slug: "fixture-project",
    title: "Fixture project",
    short_description: "A shipped project used by the end-to-end tests.",
    description: "A shipped project used by the end-to-end tests.",
    status: "Live",
    category: "Web",
    tags: ["test"],
    live_url: "https://example.com/fixture-project",
  },
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000002",
    created_at: "2026-01-01T00:00:00Z",
    type: "idea",
    slug: "fixture-idea",
    title: "Fixture idea",
    short_description: "An idea used by the end-to-end tests.",
    description: "An idea used by the end-to-end tests.",
    status: "Idea",
    category: "Web",
    tags: ["test"],
    live_url: null,
  },
];

export const FIXTURE_STATS: PublicStats = {
  activeNow: 0,
  visitorsToday: 0,
  visitorsWeek: 0,
  totalComments: 0,
};
