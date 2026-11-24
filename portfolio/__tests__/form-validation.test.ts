import { describe, expect, it } from "vitest";
import { checkSubscribeForm, checkSuggestForm } from "@/lib/form-validation";

describe("checkSuggestForm", () => {
  it("requires title and description", () => {
    const e = checkSuggestForm({ title: "", description: "", contactEmail: "" });
    expect(e.title).toBeTruthy();
    expect(e.description).toBeTruthy();
  });
  it("accepts a title and description", () => {
    expect(checkSuggestForm({ title: "A", description: "B", contactEmail: "" })).toEqual({});
  });
  it("treats whitespace-only description as missing", () => {
    expect(checkSuggestForm({ title: "A", description: "   ", contactEmail: "" }).description).toBeTruthy();
  });
  it("rejects over-long fields and bad email", () => {
    const e = checkSuggestForm({
      title: "x".repeat(101),
      description: "y".repeat(1001),
      contactEmail: "nope",
    });
    expect(e.title).toBeTruthy();
    expect(e.description).toBeTruthy();
    expect(e.contact_email).toBeTruthy();
  });
});

describe("checkSubscribeForm", () => {
  it("requires consent and a valid email", () => {
    const e = checkSubscribeForm({ email: "bad", consent: false });
    expect(e.email).toBeTruthy();
    expect(e.consent).toBeTruthy();
  });
  it("passes with email and consent", () => {
    expect(checkSubscribeForm({ email: "a@b.co", consent: true })).toEqual({});
  });
});
