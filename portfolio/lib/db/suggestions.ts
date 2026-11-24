import { getServerDb } from "../supabase";
import type { SuggestionRow, SuggestionStatus } from "./types";

export async function insertSuggestion(input: {
  title: string;
  description: string;
  audience?: string | null;
  budgetRange?: string | null;
  contactEmail?: string | null;
  submitterName?: string | null;
  creditOk?: boolean;
}): Promise<void> {
  const { error } = await getServerDb().from("idea_suggestions").insert({
    title: input.title,
    description: input.description,
    audience: input.audience ?? null,
    budget_range: input.budgetRange ?? null,
    contact_email: input.contactEmail ?? null,
    submitter_name: input.submitterName ?? null,
    credit_ok: input.creditOk ?? false,
  });
  if (error) throw error;
}

export async function listSuggestions(status?: string): Promise<SuggestionRow[]> {
  let q = getServerDb().from("idea_suggestions").select("*");
  if (status) q = q.eq("status", status);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SuggestionRow[];
}

export async function setSuggestionStatus(id: string, status: SuggestionStatus): Promise<void> {
  const { error } = await getServerDb().from("idea_suggestions").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function getSuggestion(id: string): Promise<SuggestionRow | null> {
  const { data, error } = await getServerDb().from("idea_suggestions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as SuggestionRow | null) ?? null;
}
