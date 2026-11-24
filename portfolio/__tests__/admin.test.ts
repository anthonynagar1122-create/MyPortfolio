import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({ auth: () => authMock() }));

import { isOwner, requireOwner } from "../lib/admin";
import { requireEnv } from "../lib/env";

describe("isOwner", () => {
  it("rejects a null user", () => expect(isOwner(null, "user_owner")).toBe(false));
  it("rejects a different user", () => expect(isOwner("user_other", "user_owner")).toBe(false));
  it("accepts the owner", () => expect(isOwner("user_owner", "user_owner")).toBe(true));
  it("never grants access when ownerId is empty", () => {
    expect(isOwner("", "")).toBe(false);
    expect(isOwner("user_x", "")).toBe(false);
    expect(isOwner(null, "")).toBe(false);
  });
});

describe("requireOwner", () => {
  beforeEach(() => {
    authMock.mockReset();
    vi.unstubAllEnvs();
  });

  it("throws 401 when signed out", async () => {
    vi.stubEnv("ADMIN_CLERK_USER_ID", "user_owner");
    authMock.mockResolvedValue({ userId: null });
    await expect(requireOwner()).rejects.toMatchObject({ status: 401 });
  });

  it("throws 403 for a non-owner", async () => {
    vi.stubEnv("ADMIN_CLERK_USER_ID", "user_owner");
    authMock.mockResolvedValue({ userId: "user_other" });
    await expect(requireOwner()).rejects.toMatchObject({ status: 403 });
  });

  it("throws 403 when the owner id is unset", async () => {
    vi.stubEnv("ADMIN_CLERK_USER_ID", "");
    authMock.mockResolvedValue({ userId: "user_other" });
    await expect(requireOwner()).rejects.toMatchObject({ status: 403 });
  });

  it("treats an auth() failure (no Clerk context) as signed out, 401", async () => {
    vi.stubEnv("ADMIN_CLERK_USER_ID", "user_owner");
    authMock.mockRejectedValue(new Error("clerkMiddleware not detected"));
    await expect(requireOwner()).rejects.toMatchObject({ status: 401 });
  });

  it("returns the userId for the owner", async () => {
    vi.stubEnv("ADMIN_CLERK_USER_ID", "user_owner");
    authMock.mockResolvedValue({ userId: "user_owner" });
    await expect(requireOwner()).resolves.toEqual({ userId: "user_owner" });
  });
});

describe("requireEnv", () => {
  beforeEach(() => vi.unstubAllEnvs());

  it("returns a set value", () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    expect(requireEnv("SITE_URL")).toBe("https://example.test");
  });

  it("throws in production when missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_URL", "");
    expect(() => requireEnv("SITE_URL")).toThrow(/SITE_URL/);
  });
});
