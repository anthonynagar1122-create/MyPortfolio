/**
 * Security header builders, kept out of next.config.ts so they can be unit
 * tested. No hard-coded production domain lives here: the site origin comes
 * from SITE_URL.
 */

type EnvLike = { SITE_URL?: string; NODE_ENV?: string };

const LOCAL_ORIGIN = "http://localhost:3000";

/**
 * Origins allowed for cross-origin API access, built from SITE_URL.
 * An empty SITE_URL throws in production; localhost is used only elsewhere.
 */
export function buildAllowedOrigins(env: EnvLike): string[] {
  const raw = env.SITE_URL?.trim();
  if (!raw) {
    if (env.NODE_ENV === "production") {
      throw new Error("Missing required environment variable: SITE_URL");
    }
    return [LOCAL_ORIGIN];
  }
  try {
    return [new URL(raw).origin];
  } catch {
    throw new Error("SITE_URL is not a valid URL");
  }
}

/**
 * Content-Security-Policy for a statically rendered (cache components) app.
 * Next emits its own inline bootstrap scripts, and a static header cannot
 * carry a per-request nonce, so script-src needs 'unsafe-inline' (see
 * node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md,
 * "Without Nonces"). A sha256 source would make browsers ignore
 * 'unsafe-inline' and block Next's own scripts, so none is added.
 */
export function buildContentSecurityPolicy(opts: { siteUrl?: string; isDev: boolean }): string {
  const clerk = "https://*.clerk.accounts.dev";
  const supabase = "https://*.supabase.co";
  const siteOrigins = opts.siteUrl
    ? buildAllowedOrigins({ SITE_URL: opts.siteUrl, NODE_ENV: "development" })
    : [];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      clerk,
      "https://challenges.cloudflare.com",
      ...(opts.isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://img.clerk.com", supabase],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      ...siteOrigins,
      clerk,
      "https://clerk-telemetry.com",
      supabase,
    ],
    "frame-src": ["https://challenges.cloudflare.com"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  return Object.entries(directives)
    .map(([name, sources]) => `${name} ${sources.join(" ")}`)
    .join("; ");
}
