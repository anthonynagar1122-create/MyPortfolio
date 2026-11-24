import { describe, it, expect, afterEach, vi } from "vitest";
import { requireNonEmptyEnv } from "../lib/env";

describe("requireNonEmptyEnv", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns the value when set", () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    expect(requireNonEmptyEnv("SITE_URL")).toBe("https://example.com");
  });

  it("throws when empty or missing, even outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("SITE_URL", "");
    expect(() => requireNonEmptyEnv("SITE_URL")).toThrow(/SITE_URL/);
    vi.stubEnv("VISITOR_SALT_SECRET", "");
    expect(() => requireNonEmptyEnv("VISITOR_SALT_SECRET")).toThrow(/VISITOR_SALT_SECRET/);
  });
});
