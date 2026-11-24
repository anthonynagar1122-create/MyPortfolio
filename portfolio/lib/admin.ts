import { requireEnv } from "./env";

/** True only when ownerId is configured (non-empty) and equals userId. Never grants access by default. */
export function isOwner(userId: string | null, ownerId: string): boolean {
  if (!userId || !ownerId) return false;
  return userId === ownerId;
}

/** Resolve the signed-in Clerk user and require them to be the site owner. Throws a Response (401/403). */
export async function requireOwner(): Promise<{ userId: string }> {
  const { auth } = await import("@clerk/nextjs/server");
  let userId: string | null = null;
  try {
    ({ userId } = await auth());
  } catch {
    // No Clerk context (unconfigured or middleware absent): fail closed as signed out.
    userId = null;
  }
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  let ownerId = "";
  try {
    ownerId = requireEnv("ADMIN_CLERK_USER_ID");
  } catch {
    ownerId = "";
  }
  if (!isOwner(userId, ownerId)) throw new Response("Forbidden", { status: 403 });
  return { userId };
}
