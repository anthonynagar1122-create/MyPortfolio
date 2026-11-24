import { randomBytes } from "node:crypto";
import { fail, guard, limited, ok, readJson, requestVisitorHash } from "@/lib/api";
import { refreshPendingToken, upsertPending } from "@/lib/db/subscribers";
import { requireNonEmptyEnv } from "@/lib/env";
import { sendConfirmation } from "@/lib/email";
import { validateEmail } from "@/lib/validation";

// Same body for new, pending, confirmed and unsubscribed addresses so the
// response never reveals who is on the list.
const MESSAGE = "Thanks! If this address can be subscribed, a confirmation email is on its way.";

export async function POST(request: Request) {
  return guard(async () => {
    requireNonEmptyEnv("SITE_URL"); // fail fast on misconfiguration (sendConfirmation reads it too)
    const limit = await limited(`subscribe:${requestVisitorHash(request)}`, 5, 3600);
    if (limit) return limit;

    const json = await readJson(request);
    if (!json) return fail(400, "Invalid JSON body");
    const email = (typeof json.email === "string" ? json.email : "").trim().toLowerCase();
    if (!validateEmail(email)) return fail(400, "Enter a valid email", { fields: { email: "Enter a valid email" } });

    const token = randomBytes(32).toString("hex");
    const { state } = await upsertPending(email, token, "site");
    if (state === "new" || state === "already_pending") {
      try {
        // A pending address gets a fresh token (the old link is replaced) so it can retry.
        if (state === "already_pending") await refreshPendingToken(email, token);
        await sendConfirmation(email, token);
      } catch (err) {
        // Swallowed so a failure cannot distinguish the address state; retry by submitting again.
        console.error("Confirmation email failed:", err instanceof Error ? err.message : err);
      }
    }
    return ok({ message: MESSAGE });
  });
}
