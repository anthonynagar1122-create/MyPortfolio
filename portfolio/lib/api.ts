import { getServerDb } from "./supabase";
import { createRateLimitStore } from "./db/rate-limit-store";
import { checkRateLimit } from "./rate-limit";
import { requireNonEmptyEnv } from "./env";
import { isLikelyBot, today, visitorHash } from "./visitor";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ok(body: Record<string, unknown> = {}, status = 200): Response {
  return Response.json({ ok: true, ...body }, { status });
}

export function fail(
  status: number,
  error: string,
  extra: { fields?: Record<string, string>; headers?: Record<string, string> } = {},
): Response {
  const body: Record<string, unknown> = { ok: false, error };
  if (extra.fields) body.fields = extra.fields;
  return Response.json(body, { status, headers: extra.headers });
}

/** Parses a JSON object body. Returns null for malformed JSON or a non-object. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const v: unknown = await request.json();
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "").trim() || "unknown";
}

/** Daily salted hash of ip+user-agent. Throws if VISITOR_SALT_SECRET is empty. */
export function requestVisitorHash(request: Request): string {
  return visitorHash(
    clientIp(request),
    request.headers.get("user-agent") ?? "",
    today(),
    requireNonEmptyEnv("VISITOR_SALT_SECRET"),
  );
}

export { isLikelyBot };

/** Returns a 429 Response when over the limit, otherwise null. */
export async function limited(key: string, limit: number, windowSeconds: number): Promise<Response | null> {
  const r = await checkRateLimit(createRateLimitStore(getServerDb()), key, limit, windowSeconds);
  if (r.allowed) return null;
  return fail(429, "Too many requests. Please try again later.", {
    headers: { "Retry-After": String(r.retryAfterSeconds) },
  });
}

/** Wraps a handler: unexpected errors become a JSON 500 without leaking details. */
export async function guard(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    console.error("API error:", err instanceof Error ? err.message : err);
    return fail(500, "Something went wrong");
  }
}
