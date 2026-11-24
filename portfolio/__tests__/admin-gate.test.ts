import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireOwner, redirect } = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));
vi.mock("../lib/admin", () => ({ requireOwner: () => requireOwner() }));
vi.mock("next/navigation", () => ({ redirect }));

import { gateOwner } from "../lib/admin-gate";

beforeEach(() => vi.clearAllMocks());

describe("gateOwner", () => {
  it("redirects signed-out visitors to sign-in", async () => {
    requireOwner.mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    await expect(gateOwner()).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });
  it("reports a signed-in non-owner as forbidden", async () => {
    requireOwner.mockRejectedValue(new Response("Forbidden", { status: 403 }));
    await expect(gateOwner()).resolves.toBe("forbidden");
  });
  it("lets the owner through", async () => {
    requireOwner.mockResolvedValue({ userId: "o" });
    await expect(gateOwner()).resolves.toBe("ok");
  });
  it("fails closed on unexpected errors", async () => {
    requireOwner.mockRejectedValue(new Error("boom"));
    await expect(gateOwner()).rejects.toThrow("boom");
  });
});
