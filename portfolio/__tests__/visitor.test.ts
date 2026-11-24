import { describe, it, expect } from "vitest";
import { visitorHash, isLikelyBot, today } from "../lib/visitor";
import { site } from "../lib/config";

describe("visitorHash", () => {
  it("is stable for the same inputs", () => {
    expect(visitorHash("1.2.3.4", "UA", "2026-01-01", "s")).toBe(
      visitorHash("1.2.3.4", "UA", "2026-01-01", "s"),
    );
  });
  it("changes when the day changes", () => {
    expect(visitorHash("1.2.3.4", "UA", "2026-01-01", "s")).not.toBe(
      visitorHash("1.2.3.4", "UA", "2026-01-02", "s"),
    );
  });
  it("does not contain the IP", () => {
    expect(visitorHash("203.0.113.77", "UA", "2026-01-01", "s")).not.toContain("203.0.113.77");
  });
  it("is 64 hex chars", () => {
    expect(visitorHash("a", "b", "c", "d")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("isLikelyBot", () => {
  it("flags Googlebot", () => expect(isLikelyBot("Googlebot/2.1")).toBe(true));
  it("passes Chrome", () =>
    expect(
      isLikelyBot(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      ),
    ).toBe(false));
  it("flags empty", () => expect(isLikelyBot("")).toBe(true));
});

describe("today", () => {
  it("returns YYYY-MM-DD", () => expect(today("UTC")).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  it("defaults to site.timezone", () => expect(today()).toBe(today(site.timezone)));
  it("respects the timezone", () => {
    const d = new Date("2026-01-01T23:30:00Z");
    expect(today("UTC", d)).toBe("2026-01-01");
    expect(today("Asia/Tokyo", d)).toBe("2026-01-02");
  });
});
