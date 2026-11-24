import { describe, it, expect } from "vitest";
import {
  slugify,
  isSafeUrl,
  sanitizeText,
  validateItemInput,
  validateComment,
  validateSuggestion,
  validateEmail,
} from "../lib/validation";

const baseProject = {
  type: "project",
  title: "My Project",
  short_description: "Short",
  description: "Long",
  status: "Live",
  category: "Web",
  tags: ["a"],
  live_url: "https://example.com",
};

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello, World! 2026")).toBe("hello-world-2026");
  });
  it("trims hyphens and caps at 60 chars", () => {
    const s = slugify("--" + "a".repeat(80) + "--");
    expect(s.length).toBeLessThanOrEqual(60);
    expect(s.startsWith("-") || s.endsWith("-")).toBe(false);
  });
});

describe("isSafeUrl", () => {
  it("rejects javascript:", () => expect(isSafeUrl("javascript:alert(1)")).toBe(false));
  it("rejects http", () => expect(isSafeUrl("http://example.com")).toBe(false));
  it("accepts https", () => expect(isSafeUrl("https://example.com")).toBe(true));
});

describe("sanitizeText", () => {
  it("trims and strips control chars", () => {
    expect(sanitizeText("  hi\u0000there  ")).toBe("hithere");
  });
  it("collapses 3+ newlines to 2", () => {
    expect(sanitizeText("a\n\n\n\nb")).toBe("a\n\nb");
  });
});

describe("validateItemInput", () => {
  it("accepts a valid project", () => {
    expect(validateItemInput(baseProject).ok).toBe(true);
  });
  it("requires live_url for projects", () => {
    const { live_url: _omit, ...rest } = baseProject;
    void _omit;
    const r = validateItemInput(rest);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.live_url).toBeTruthy();
  });
  it("rejects whitespace-only title", () => {
    const r = validateItemInput({ ...baseProject, title: "   " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.title).toBeTruthy();
  });
  it("rejects 101-char title without truncating", () => {
    const r = validateItemInput({ ...baseProject, title: "a".repeat(101) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.title).toBeTruthy();
  });
});

describe("validateComment", () => {
  it("keeps raw text (escape on output)", () => {
    const r = validateComment("<script>x</script>");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body).toContain("<script>x</script>");
  });
});

describe("validateSuggestion / validateEmail", () => {
  it("validates email", () => {
    expect(validateEmail("a@b.co")).toBe(true);
    expect(validateEmail("nope")).toBe(false);
  });
  it("rejects empty suggestion", () => {
    expect(validateSuggestion({ title: "" }).ok).toBe(false);
  });
  it("requires a description (empty and whitespace-only rejected)", () => {
    for (const description of ["", "   \n  "]) {
      const r = validateSuggestion({ title: "Idea", description });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.description).toBeTruthy();
    }
    expect(validateSuggestion({ title: "Idea", description: "x".repeat(1001) }).ok).toBe(false);
    expect(validateSuggestion({ title: "Idea", description: " Real text " }).ok).toBe(true);
  });
  it("reports a bad email under contact_email", () => {
    const r = validateSuggestion({ title: "Idea", description: "d", email: "nope" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.contact_email).toBeTruthy();
      expect(r.errors.email).toBeUndefined();
    }
  });
});
