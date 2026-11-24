import { describe, expect, it } from "vitest";
import { parseItemForm } from "../lib/admin-form";
import { validateItemInput } from "../lib/validation";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}
const base = { type: "project", title: "T", short_description: "s", status: "Live", category: "Web", live_url: "https://e.com" };

describe("parseItemForm", () => {
  it("published is an explicit boolean: false when unticked, true when ticked", () => {
    expect(parseItemForm(fd(base)).published).toBe(false);
    expect(parseItemForm(fd({ ...base, published: "on" })).published).toBe(true);
  });
  it("splits tags on commas and trims blanks", () => {
    expect(parseItemForm(fd({ ...base, tags: " a, b ,, c " })).input.tags).toEqual(["a", "b", "c"]);
  });
  it("produces input that validateItemInput accepts", () => {
    expect(validateItemInput(parseItemForm(fd(base)).input).ok).toBe(true);
  });
  it("a javascript: live URL is caught by validateItemInput", () => {
    const r = validateItemInput(parseItemForm(fd({ ...base, live_url: "javascript:alert(1)" })).input);
    expect(r.ok).toBe(false);
  });
});
