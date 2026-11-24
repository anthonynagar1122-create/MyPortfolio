import { getServerDb } from "../supabase";
import type { SubscriberRow } from "./types";

export type UpsertPendingResult = {
  state: "new" | "already_pending" | "already_confirmed" | "unsubscribed";
};

/**
 * Registers a pending subscriber. An existing pending row is left as is (the
 * caller may call refreshPendingToken and resend the confirmation);
 * confirmed and unsubscribed rows are never changed here, so an unsubscribed
 * address cannot be re-subscribed without an explicit new flow.
 */
export async function upsertPending(
  email: string,
  token: string,
  source: string,
): Promise<UpsertPendingResult> {
  const db = getServerDb();
  const { data: existing, error } = await db
    .from("subscribers")
    .select("status")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  if (existing) {
    const s = (existing as Pick<SubscriberRow, "status">).status;
    if (s === "confirmed") return { state: "already_confirmed" };
    if (s === "unsubscribed") return { state: "unsubscribed" };
    return { state: "already_pending" };
  }
  const { error: insErr } = await db.from("subscribers").upsert(
    {
      email,
      status: "pending",
      confirm_token: token,
      consent_at: new Date().toISOString(),
      source,
    },
    { onConflict: "email", ignoreDuplicates: true },
  );
  if (insErr) throw insErr;
  return { state: "new" };
}

/** Stores a new confirm token on a pending row only. Returns whether a row was updated. */
export async function refreshPendingToken(email: string, token: string): Promise<boolean> {
  const { data, error } = await getServerDb()
    .from("subscribers")
    .update({ confirm_token: token })
    .eq("email", email)
    .eq("status", "pending")
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function confirmByToken(token: string): Promise<boolean> {
  const { data, error } = await getServerDb()
    .from("subscribers")
    .update({ status: "confirmed", confirm_token: null })
    .eq("confirm_token", token)
    .eq("status", "pending")
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/** Keeps the row (status `unsubscribed`) so the address is not silently re-added. */
export async function unsubscribe(email: string): Promise<void> {
  const { error } = await getServerDb()
    .from("subscribers")
    .update({ status: "unsubscribed", confirm_token: null })
    .eq("email", email);
  if (error) throw error;
}

export async function countConfirmed(): Promise<number> {
  const { count, error } = await getServerDb()
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "confirmed");
  if (error) throw error;
  return count ?? 0;
}

/** Emails of confirmed subscribers only (the only people a launch email may go to). */
export async function listConfirmedEmails(): Promise<string[]> {
  const { data, error } = await getServerDb()
    .from("subscribers")
    .select("email")
    .eq("status", "confirmed")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as { email: string }[]).map((r) => r.email);
}

/** Admin export: every subscriber with its status. */
export async function listSubscribers(): Promise<Pick<SubscriberRow, "email" | "status" | "created_at" | "source">[]> {
  const { data, error } = await getServerDb()
    .from("subscribers")
    .select("email,status,created_at,source")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Pick<SubscriberRow, "email" | "status" | "created_at" | "source">[];
}
