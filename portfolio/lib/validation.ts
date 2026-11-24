import { categories, statuses } from "./config";

export type ItemType = "project" | "idea";

export type ItemInput = {
  type: ItemType;
  title: string;
  short_description: string;
  description: string;
  status: string;
  category: string;
  tags: string[];
  live_url?: string;
  demo_url?: string;
  android_url?: string;
  ios_url?: string;
};

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

export function isSafeUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.length > 0;
  } catch {
    return false;
  }
}

export function sanitizeText(value: string): string {
  return value
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateEmail(email: string): boolean {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function validateItemInput(
  input: unknown,
): { ok: true; value: ItemInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const type = o.type;
  if (type !== "project" && type !== "idea") errors.type = "Type must be project or idea";

  const title = sanitizeText(str(o.title));
  if (title.length < 1 || title.length > 100) errors.title = "Title must be 1-100 characters";

  const short_description = sanitizeText(str(o.short_description));
  if (short_description.length < 1 || short_description.length > 160)
    errors.short_description = "Short description must be 1-160 characters";

  const description = sanitizeText(str(o.description));
  if (description.length > 5000) errors.description = "Description must be at most 5000 characters";

  const status = str(o.status);
  if (type === "project" || type === "idea") {
    if (!statuses[type].includes(status)) errors.status = "Invalid status";
  }

  const category = str(o.category);
  if (!categories.includes(category)) errors.category = "Invalid category";

  let tags: string[] = [];
  if (o.tags === undefined) {
    tags = [];
  } else if (!Array.isArray(o.tags) || o.tags.some((t) => typeof t !== "string")) {
    errors.tags = "Tags must be a list of strings";
  } else {
    tags = (o.tags as string[]).map((t) => sanitizeText(t));
    if (tags.length > 5) errors.tags = "At most 5 tags";
    else if (tags.some((t) => t.length < 1 || t.length > 24))
      errors.tags = "Each tag must be 1-24 characters";
  }

  const urls: Partial<Record<"live_url" | "demo_url" | "android_url" | "ios_url", string>> = {};
  for (const key of ["live_url", "demo_url", "android_url", "ios_url"] as const) {
    const raw = o[key];
    const v = typeof raw === "string" ? raw.trim() : "";
    if (v === "") {
      if (key === "live_url" && type === "project") errors.live_url = "Live URL is required";
      continue;
    }
    if (!isSafeUrl(v)) errors[key] = "Must be a valid https:// URL";
    else urls[key] = v;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      type: type as ItemType,
      title,
      short_description,
      description,
      status,
      category,
      tags,
      ...urls,
    },
  };
}

export function validateComment(
  body: unknown,
): { ok: true; body: string } | { ok: false; error: string } {
  if (typeof body !== "string") return { ok: false, error: "Comment is required" };
  const clean = sanitizeText(body);
  if (clean.length < 1) return { ok: false, error: "Comment is required" };
  if (clean.length > 1000) return { ok: false, error: "Comment must be at most 1000 characters" };
  return { ok: true, body: clean };
}

export type SuggestionInput = { title: string; description: string; email?: string };

export function validateSuggestion(
  input: unknown,
): { ok: true; value: SuggestionInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const title = sanitizeText(str(o.title));
  if (title.length < 1 || title.length > 100) errors.title = "Title must be 1-100 characters";
  const description = sanitizeText(str(o.description));
  if (description.length > 1000) errors.description = "Description must be at most 1000 characters";
  const email = str(o.email).trim();
  if (email && !validateEmail(email)) errors.email = "Invalid email";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { title, description, ...(email ? { email } : {}) } };
}
