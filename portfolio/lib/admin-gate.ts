import { redirect } from "next/navigation";
import { requireOwner } from "./admin";

/**
 * Page-level owner check built on requireOwner(): signed out redirects to
 * sign-in, a signed-in non-owner is reported as "forbidden", the owner is "ok".
 * Anything unexpected is rethrown (fail closed).
 */
export async function gateOwner(): Promise<"ok" | "forbidden"> {
  try {
    await requireOwner();
    return "ok";
  } catch (err) {
    if (err instanceof Response) {
      if (err.status === 401) redirect("/sign-in");
      if (err.status === 403) return "forbidden";
    }
    throw err;
  }
}
