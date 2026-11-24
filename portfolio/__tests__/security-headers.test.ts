import { describe, expect, it } from "vitest";
import {
  buildAllowedOrigins,
  buildContentSecurityPolicy,
} from "../lib/security-headers";

describe("buildContentSecurityPolicy", () => {
  const csp = buildContentSecurityPolicy({ siteUrl: "https://example.com", isDev: false });

  it("allows Clerk and Supabase hosts", () => {
    expect(csp).toContain("https://*.clerk.accounts.dev");
    expect(csp).toContain("https://clerk-telemetry.com");
    expect(csp).toContain("https://img.clerk.com");
    expect(csp).toContain("https://*.supabase.co");
  });

  it("does not mention the old RouteMaster origins or the jsdelivr CDN", () => {
    expect(csp).not.toMatch(/routemaster/i);
    expect(csp).not.toContain("cdn.jsdelivr.net");
  });

  it("only allows eval in development", () => {
    expect(csp).not.toContain("unsafe-eval");
    expect(buildContentSecurityPolicy({ siteUrl: "", isDev: true })).toContain("'unsafe-eval'");
  });

  it("keeps framing and object sources locked down", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});

describe("buildAllowedOrigins", () => {
  it("is built from SITE_URL, normalised to an origin", () => {
    expect(buildAllowedOrigins({ SITE_URL: "https://example.com/path/", NODE_ENV: "production" })).toEqual([
      "https://example.com",
    ]);
  });

  it("throws on an empty SITE_URL in production, with no hard-coded fallback", () => {
    expect(() => buildAllowedOrigins({ SITE_URL: "", NODE_ENV: "production" })).toThrow(/SITE_URL/);
    expect(() => buildAllowedOrigins({ NODE_ENV: "production" })).toThrow(/SITE_URL/);
  });

  it("falls back to localhost only outside production", () => {
    expect(buildAllowedOrigins({ SITE_URL: "", NODE_ENV: "development" })).toEqual([
      "http://localhost:3000",
    ]);
  });

  it("rejects a malformed SITE_URL", () => {
    expect(() => buildAllowedOrigins({ SITE_URL: "not a url", NODE_ENV: "production" })).toThrow(/SITE_URL/);
  });
});
