export const COVER_BUCKET = "covers";
export const COVER_MAX_BYTES = 2 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function coverExtension(type: string): string {
  return TYPES[type] ?? "";
}

/** Server-side check of a declared cover file: type allowlist and 2 MB cap. */
export function validateCoverFile(file: { type: string; size: number }): { ok: true } | { ok: false; error: string } {
  if (!Object.hasOwn(TYPES, file.type)) return { ok: false, error: "Cover must be a JPEG, PNG or WebP image" };
  if (!Number.isFinite(file.size) || file.size <= 0) return { ok: false, error: "Cover file is empty" };
  if (file.size > COVER_MAX_BYTES) return { ok: false, error: "Cover must be 2 MB or smaller" };
  return { ok: true };
}

/** True only for a public URL inside our own covers bucket. */
export function isOwnCoverUrl(value: string, supabaseUrl: string | undefined): boolean {
  if (!supabaseUrl) return false;
  const prefix = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${COVER_BUCKET}/`;
  return value.startsWith(prefix) && !value.slice(prefix.length).includes("..");
}
