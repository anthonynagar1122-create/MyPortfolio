import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeDb } from "./fake-db";

let fake = createFakeDb({ subscribers: ["email"] });
vi.mock("../../lib/supabase", () => ({ getServerDb: () => fake.client }));

import { refreshPendingToken, upsertPending } from "../../lib/db/subscribers";

const rows = () => fake.tables.get("subscribers") ?? [];

describe("refreshPendingToken", () => {
  beforeEach(() => {
    fake = createFakeDb({ subscribers: ["email"] });
  });

  it("replaces the token of a pending row", async () => {
    await upsertPending("a@x.co", "old", "site");
    expect(await refreshPendingToken("a@x.co", "new")).toBe(true);
    expect(rows()[0].confirm_token).toBe("new");
    expect(rows()[0].status).toBe("pending");
  });

  it("does not touch confirmed or unsubscribed rows, or missing ones", async () => {
    await upsertPending("c@x.co", "t1", "site");
    await upsertPending("u@x.co", "t2", "site");
    rows().find((r) => r.email === "c@x.co")!.status = "confirmed";
    rows().find((r) => r.email === "u@x.co")!.status = "unsubscribed";
    expect(await refreshPendingToken("c@x.co", "n")).toBe(false);
    expect(await refreshPendingToken("u@x.co", "n")).toBe(false);
    expect(await refreshPendingToken("none@x.co", "n")).toBe(false);
    expect(rows().find((r) => r.email === "c@x.co")!.confirm_token).toBe("t1");
    expect(rows().find((r) => r.email === "u@x.co")!.confirm_token).toBe("t2");
  });
});
