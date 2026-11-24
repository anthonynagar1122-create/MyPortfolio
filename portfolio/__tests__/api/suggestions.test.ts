import { describe, it, expect, vi, beforeEach } from "vitest";
import { jsonReq } from "./helpers";

const { insertSuggestion, increment } = vi.hoisted(() => ({ insertSuggestion: vi.fn(), increment: vi.fn() }));

vi.mock("@/lib/db/suggestions", () => ({ insertSuggestion }));
vi.mock("@/lib/supabase", () => ({ getServerDb: () => ({}) }));
vi.mock("@/lib/db/rate-limit-store", () => ({ createRateLimitStore: () => ({ increment }) }));

import { POST } from "../../app/api/suggestions/route";

const url = "http://localhost/api/suggestions";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("VISITOR_SALT_SECRET", "salt");
  increment.mockResolvedValue(1);
});

describe("POST /api/suggestions", () => {
  it("400 for an invalid contact_email", async () => {
    const res = await POST(jsonReq(url, "POST", { title: "Idea", description: "d", contact_email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect((await res.json()).fields.email).toBeTruthy();
    expect(insertSuggestion).not.toHaveBeenCalled();
  });

  it("201 and stores a valid suggestion", async () => {
    const res = await POST(
      jsonReq(url, "POST", { title: "Idea", description: "d", contact_email: "a@b.co", budget_range: "free", credit_ok: true }),
    );
    expect(res.status).toBe(201);
    expect(insertSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Idea", contactEmail: "a@b.co", budgetRange: "free", creditOk: true }),
    );
  });

  it("400 for missing title and malformed JSON", async () => {
    expect((await POST(jsonReq(url, "POST", { description: "d" }))).status).toBe(400);
    expect((await POST(jsonReq(url, "POST", "{bad"))).status).toBe(400);
  });

  it("429 when rate limited", async () => {
    increment.mockResolvedValue(4);
    const res = await POST(jsonReq(url, "POST", { title: "Idea" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});
