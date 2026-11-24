import { expect, test } from "@playwright/test";
import { escapeHtml, validateContactSubmission } from "../../lib/contact-validation";
import {
  getClientIp,
  MAX_CONTACT_BODY_BYTES,
  readBoundedBody,
} from "../../lib/contact-request";

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

test.describe("Contact form validation and output encoding", () => {
  test("escapes HTML elements and attributes", () => {
    const input = '<img src=x onerror="alert(1)">';
    const output = escapeHtml(input);

    expect(output).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
  });

  test("escapes all HTML-sensitive characters", () => {
    expect(escapeHtml("&<>\\"'")).toBe("&amp;&lt;&gt;&quot;&#039;");
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

  test("extracts the first validated address from the trusted proxy chain", () => {
    expect(getClientIp(new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    }))).toBe("203.0.113.10");
  });

  test("rejects malformed client IP headers", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "not-an-ip" }))).toBeNull();
    expect(getClientIp(new Headers())).toBeNull();
  });

  test("streams a full 5,000-character four-byte Unicode message within the byte budget", async () => {
    const payload = JSON.stringify({ message: "𠜎".repeat(5000) });
    const bytes = new TextEncoder().encode(payload);
    expect(bytes.byteLength).toBeLessThanOrEqual(MAX_CONTACT_BODY_BYTES);

    const result = await readBoundedBody(streamOf([bytes]));
    expect(result.error).toBeUndefined();
    expect(result.text).toBe(payload);
  });

  test("rejects oversized streamed bodies even without a Content-Length header", async () => {
    const oversized = new Uint8Array(MAX_CONTACT_BODY_BYTES + 1);
    const result = await readBoundedBody(streamOf([
      oversized.slice(0, 12000),
      oversized.slice(12000),
    ]));

    expect(result.error).toBe("too_large");
  });

  test("rejects invalid UTF-8 request bodies", async () => {
    const result = await readBoundedBody(streamOf([new Uint8Array([0xff, 0xfe])]));
    expect(result.error).toBe("invalid_utf8");
  });
});
