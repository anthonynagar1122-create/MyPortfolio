import { connection } from "next/server";
import { guard } from "@/lib/api";
import { confirmByToken } from "@/lib/db/subscribers";
import { requireNonEmptyEnv } from "@/lib/env";

export async function GET(request: Request) {
  return guard(async () => {
    await connection();
    const site = requireNonEmptyEnv("SITE_URL").replace(/\/+$/, "");
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const confirmed = /^[0-9a-f]{64}$/.test(token) && (await confirmByToken(token));
    return Response.redirect(`${site}/?subscribed=${confirmed ? "confirmed" : "invalid"}`, 303);
  });
}
