export type EnvName =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  | "CLERK_SECRET_KEY"
  | "RESEND_API_KEY"
  | "ADMIN_CLERK_USER_ID"
  | "VISITOR_SALT_SECRET"
  | "EMAIL_FROM"
  | "SITE_URL";

/**
 * Read a required env var. Throws a clear error in production if it is
 * missing; outside production returns "" so dev/test/build can proceed.
 * Server-only values must never be read from client components.
 */
export function requireEnv(name: EnvName): string {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return "";
}

/**
 * Like requireEnv, but an empty value ALWAYS throws, in every environment.
 * Use for secrets and URLs where "" would silently weaken behaviour (the
 * visitor-hash salt, links in emails).
 */
export function requireNonEmptyEnv(name: EnvName): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
