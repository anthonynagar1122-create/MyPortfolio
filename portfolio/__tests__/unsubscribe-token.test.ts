import { describe, it, expect } from "vitest";
import { signUnsubscribe, verifyUnsubscribe } from "../lib/unsubscribe-token";

describe("unsubscribe token", () => {
  it("verifies a signature for the same email and secret", () => {
    const sig = signUnsubscribe("a@b.co", "s3cret");
    expect(verifyUnsubscribe("a@b.co", sig, "s3cret")).toBe(true);
  });
  it("rejects other emails, secrets, and malformed signatures", () => {
    const sig = signUnsubscribe("a@b.co", "s3cret");
    expect(verifyUnsubscribe("x@b.co", sig, "s3cret")).toBe(false);
    expect(verifyUnsubscribe("a@b.co", sig, "other")).toBe(false);
    expect(verifyUnsubscribe("a@b.co", "zz", "s3cret")).toBe(false);
    expect(verifyUnsubscribe("a@b.co", "", "s3cret")).toBe(false);
  });
});
