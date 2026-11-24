export interface RateLimitStore {
  /** Upsert the counter row for (key, windowStart) and return the new count. */
  increment(key: string, windowStart: Date): Promise<number>;
}

export async function checkRateLimit(
  db: RateLimitStore,
  key: string,
  limit: number,
  windowSeconds: number,
  now: Date = new Date(),
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const windowMs = windowSeconds * 1000;
  const startMs = Math.floor(now.getTime() / windowMs) * windowMs;
  const count = await db.increment(key, new Date(startMs));
  const retryAfterSeconds = Math.min(
    windowSeconds,
    Math.max(1, Math.ceil((startMs + windowMs - now.getTime()) / 1000)),
  );
  return { allowed: count <= limit, retryAfterSeconds };
}
