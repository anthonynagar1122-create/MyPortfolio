import { describe, expect, it } from "vitest";
import { COVER_MAX_BYTES, coverExtension, isOwnCoverUrl, validateCoverFile } from "../lib/cover-rules";

describe("validateCoverFile", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (type) => {
    expect(validateCoverFile({ type, size: 1000 })).toEqual({ ok: true });
  });
  it.each(["image/gif", "image/svg+xml", "application/pdf", "text/html", ""])("rejects type %j", (type) => {
    expect(validateCoverFile({ type, size: 1000 }).ok).toBe(false);
  });
  it("accepts exactly 2 MB and rejects one byte more", () => {
    expect(COVER_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(validateCoverFile({ type: "image/png", size: COVER_MAX_BYTES }).ok).toBe(true);
    expect(validateCoverFile({ type: "image/png", size: COVER_MAX_BYTES + 1 }).ok).toBe(false);
  });
  it("rejects empty, negative or non-numeric sizes", () => {
    expect(validateCoverFile({ type: "image/png", size: 0 }).ok).toBe(false);
    expect(validateCoverFile({ type: "image/png", size: -5 }).ok).toBe(false);
    expect(validateCoverFile({ type: "image/png", size: Number.NaN }).ok).toBe(false);
  });
  it("maps mime to extension", () => {
    expect(coverExtension("image/jpeg")).toBe("jpg");
    expect(coverExtension("image/png")).toBe("png");
    expect(coverExtension("image/webp")).toBe("webp");
  });
});

describe("isOwnCoverUrl", () => {
  it("only accepts URLs under the configured covers bucket", () => {
    const base = "https://proj.supabase.co";
    expect(isOwnCoverUrl(`${base}/storage/v1/object/public/covers/a.png`, base)).toBe(true);
    expect(isOwnCoverUrl("https://evil.example/storage/v1/object/public/covers/a.png", base)).toBe(false);
    expect(isOwnCoverUrl(`${base}/storage/v1/object/public/other/a.png`, base)).toBe(false);
    expect(isOwnCoverUrl("javascript:alert(1)", base)).toBe(false);
    expect(isOwnCoverUrl("anything", "")).toBe(false);
  });
});
