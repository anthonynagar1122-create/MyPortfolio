import { connection } from "next/server";
import { requireOwner } from "@/lib/admin";
import { guard } from "@/lib/api";
import { toCsv } from "@/lib/csv";
import { listSubscribers } from "@/lib/db/subscribers";

export async function GET() {
  await connection();
  try {
    await requireOwner();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  return guard(async () => {
    const rows = await listSubscribers();
    const csv = toCsv([
      ["email", "status", "subscribed_at", "source"],
      ...rows.map((r) => [r.email, r.status, r.created_at, r.source ?? ""]),
    ]);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="subscribers.csv"',
        "Cache-Control": "no-store",
      },
    });
  });
}
