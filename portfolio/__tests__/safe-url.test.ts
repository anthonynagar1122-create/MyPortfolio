import { describe, expect, it } from "vitest";
import { isHttpUrl } from "@/lib/safe-url";

describe("isHttpUrl", () => {
  it.each(["http://example.com", "https://example.com/a?b=1", "HTTPS://EXAMPLE.COM"])("accepts %s", (u) => {
    expect(isHttpUrl(u)).toBe(true);
  });
  it.each([
    "javascript:alert(1)",
    " javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:x",
    "file:///etc/passwd",
    "ftp://example.com",
    "//example.com",
    "/relative",
    "example.com",
    "",
    "https://",
  ])("rejects %j", (u) => {
    expect(isHttpUrl(u)).toBe(false);
  });
  it("rejects non-strings", () => {
    expect(isHttpUrl(null)).toBe(false);
    expect(isHttpUrl(undefined)).toBe(false);
    expect(isHttpUrl(42 as unknown as string)).toBe(false);
  });
});
