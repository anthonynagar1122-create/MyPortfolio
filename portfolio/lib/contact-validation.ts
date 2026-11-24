export type ContactSubmission = {
  name: string;
  email: string;
  company?: string;
  product?: string;
  message: string;
};

export function escapeHtml(value: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return value.replace(/[&<>"']/g, (character) => map[character]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateContactSubmission(
  body: unknown,
): { value?: ContactSubmission; error?: string } {
  if (!isRecord(body)) return { error: "Invalid request body" };

  const { name, email, company, product, message } = body;
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return { error: "Name, email and message are required" };
  }
  if (company !== undefined && typeof company !== "string") return { error: "Company must be text" };
  if (product !== undefined && typeof product !== "string") return { error: "Product must be text" };

  const clean: ContactSubmission = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    ...(typeof company === "string" && company.trim() ? { company: company.trim() } : {}),
    ...(typeof product === "string" && product.trim() ? { product: product.trim() } : {}),
  };

  if (clean.name.length < 2 || clean.name.length > 100) {
    return { error: "Name must be 2–100 characters" };
  }
  if (!/^[\p{L}\p{M}\s'.-]+$/u.test(clean.name)) {
    return { error: "Name contains invalid characters" };
  }
  if (clean.email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
    return { error: "Invalid email address" };
  }
  if (clean.company && clean.company.length > 100) {
    return { error: "Company must be under 100 characters" };
  }
  if (clean.product && clean.product.length > 100) {
    return { error: "Product must be under 100 characters" };
  }
  if (clean.message.length < 10 || clean.message.length > 5000) {
    return { error: "Message must be 10–5000 characters" };
  }

  return { value: clean };
}
