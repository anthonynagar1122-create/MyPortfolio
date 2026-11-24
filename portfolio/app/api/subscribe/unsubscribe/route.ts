import { connection } from "next/server";
import { guard } from "@/lib/api";
import { unsubscribe } from "@/lib/db/subscribers";
import { requireNonEmptyEnv } from "@/lib/env";
import { verifyUnsubscribe } from "@/lib/unsubscribe-token";

export async function GET(request: Request) {
  return guard(async () => {
    await connection();
    const site = requireNonEmptyEnv("SITE_URL").replace(/\/+$/, "");
    const params = new URL(request.url).searchParams;
    const email = (params.get("email") ?? "").trim().toLowerCase();
    const sig = params.get("sig") ?? "";
    const valid = email !== "" && verifyUnsubscribe(email, sig, requireNonEmptyEnv("VISITOR_SALT_SECRET"));
    if (valid) await unsubscribe(email);
    return Response.redirect(`${site}/?unsubscribed=${valid ? "done" : "invalid"}`, 303);
  });
}
