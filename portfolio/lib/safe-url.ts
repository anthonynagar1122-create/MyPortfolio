/**
 * Render-time guard for links built from stored or user-supplied text.
 * Only absolute http(s) URLs with a host pass; everything else (javascript:,
 * data:, relative, protocol-relative, malformed) is rendered as plain text.
 */
export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed !== value) return false;
  try {
    const u = new URL(value);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname !== "" && u.username === "" && u.password === "";
  } catch {
    return false;
  }
}
