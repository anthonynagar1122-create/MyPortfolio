import { expect, test } from "@playwright/test";
import { escapeHtml, validateContactSubmission } from "../../lib/contact-validation";

test.describe("Contact form validation and output encoding", () => {
  test("escapes HTML elements and attributes", () => {
    const input = '<img src=x onerror="alert(1)">';
    const output = escapeHtml(input);

    expect(output).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
  });

  test("escapes all HTML-sensitive characters", () => {
    expect(escapeHtml("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#039;");
  });

  test("preserves ordinary text", () => {
    expect(escapeHtml("A normal contact message")).toBe("A normal contact message");
  });

  test("accepts valid input and normalizes email", () => {
    const result = validateContactSubmission({
      name: "Gaurav Nagar",
      email: "  GAURAV@example.com ",
      company: "RouteMaster",
      product: "routemaster",
      message: "I would like to discuss the product.",
    });

    expect(result.error).toBeUndefined();
    expect(result.value?.email).toBe("gaurav@example.com");
    expect(result.value?.name).toBe("Gaurav Nagar");
  });

  test("rejects invalid email addresses", () => {
    const result = validateContactSubmission({
      name: "Gaurav",
      email: "not-an-email",
      message: "A message with enough characters.",
    });

    expect(result.value).toBeUndefined();
    expect(result.error).toBe("Invalid email address");
  });

  test("rejects non-string optional fields", () => {
    const result = validateContactSubmission({
      name: "Gaurav",
      email: "gaurav@example.com",
      company: { name: "invalid" },
      message: "A message with enough characters.",
    });

    expect(result.value).toBeUndefined();
    expect(result.error).toBe("Company must be text");
  });

  test("rejects short and oversized messages", () => {
    const short = validateContactSubmission({
      name: "Gaurav",
      email: "gaurav@example.com",
      message: "short",
    });
    const long = validateContactSubmission({
      name: "Gaurav",
      email: "gaurav@example.com",
      message: "x".repeat(5001),
    });

    expect(short.value).toBeUndefined();
    expect(long.value).toBeUndefined();
  });

  test("rejects malformed top-level request shapes", () => {
    expect(validateContactSubmission(null).value).toBeUndefined();
    expect(validateContactSubmission([]).value).toBeUndefined();
    expect(validateContactSubmission("not an object").value).toBeUndefined();
  });
});
