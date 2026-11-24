"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/admin";
import { UUID_RE } from "@/lib/api";
import { parseItemForm, type ActionState } from "@/lib/admin-form";
import { isOwnCoverUrl, validateCoverFile } from "@/lib/cover-rules";
import { createSignedCoverUpload } from "@/lib/cover-storage";
import { deleteCommentById, setCommentHidden } from "@/lib/db/comments";
import { deleteItem, getItemById, saveItem } from "@/lib/db/items";
import { listConfirmedEmails } from "@/lib/db/subscribers";
import { getSuggestion, setSuggestionStatus } from "@/lib/db/suggestions";
import { sendLaunch } from "@/lib/email";
import { validateItemInput } from "@/lib/validation";

// Every action calls requireOwner() as its first statement. It throws a
// 401/403 Response, so nothing below runs for a non-owner.

function str(f: FormData, k: string): string {
  const v = f.get(k);
  return typeof v === "string" ? v : "";
}

const BAD_ID = "Invalid id";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

export async function saveItemAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireOwner();
  const { input, published, coverUrl } = parseItemForm(formData);
  const result = validateItemInput(input);
  const errors: Record<string, string> = result.ok ? {} : { ...result.errors };
  if (coverUrl && !isOwnCoverUrl(coverUrl, process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    errors.cover_url = "Cover must be uploaded through the form";
  }
  if (!result.ok || Object.keys(errors).length > 0) {
    return { ok: false, message: "Fix the highlighted fields", errors };
  }
  const id = str(formData, "id") || undefined;
  if (id !== undefined && !UUID_RE.test(id)) return { ok: false, message: BAD_ID, errors: { id: BAD_ID } };
  const saved = await saveItem(result.value, id, {
    published,
    ...(coverUrl ? { cover_url: coverUrl } : {}),
  });
  refresh();
  revalidatePath(`/item/${saved.slug}`);
  return { ok: true, message: published ? "Saved and published" : "Saved as draft", id: saved.id };
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  await requireOwner();
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) return;
  await deleteItem(id);
  refresh();
}

export async function setCommentHiddenAction(formData: FormData): Promise<void> {
  await requireOwner();
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) return;
  await setCommentHidden(id, str(formData, "hidden") === "true");
  refresh();
  revalidatePath("/item/[slug]", "page");
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  await requireOwner();
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) return;
  await deleteCommentById(id);
  refresh();
  revalidatePath("/item/[slug]", "page");
}

/** Turns a suggestion into an idea item (draft unless "published" is ticked) and marks the suggestion published. */
export async function publishSuggestionAction(formData: FormData): Promise<ActionState> {
  await requireOwner();
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) return { ok: false, message: BAD_ID, errors: { id: BAD_ID } };
  const suggestion = await getSuggestion(id);
  if (!suggestion) return { ok: false, message: "Suggestion not found" };
  if (suggestion.status !== "new") return { ok: false, message: "Suggestion was already handled" };

  // contact_email is deliberately never copied into the item.
  const result = validateItemInput({
    type: "idea",
    title: suggestion.title,
    short_description: suggestion.description.replace(/\s+/g, " ").slice(0, 160),
    description: suggestion.description,
    status: "Idea",
    category: "Other",
    tags: [],
  });
  if (!result.ok) return { ok: false, message: "Suggestion cannot be published as is", errors: result.errors };

  const published = formData.get("published") === "on";
  const item = await saveItem(result.value, undefined, { published });
  await setSuggestionStatus(suggestion.id, "published");
  refresh();
  return { ok: true, message: published ? "Published as idea" : "Created as draft idea", id: item.id };
}

export async function dismissSuggestionAction(formData: FormData): Promise<void> {
  await requireOwner();
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) return;
  await setSuggestionStatus(id, "dismissed");
  refresh();
}

/** Emails confirmed subscribers about a published item and reports sent and failed counts. */
export async function sendLaunchAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireOwner();
  const id = str(formData, "id");
  if (!UUID_RE.test(id)) return { ok: false, message: BAD_ID, errors: { id: BAD_ID } };
  const item = await getItemById(id);
  if (!item) return { ok: false, message: "Item not found" };
  if (!item.published) return { ok: false, message: "Publish the item before sending a launch email" };
  const emails = await listConfirmedEmails();
  if (emails.length === 0) return { ok: true, sent: 0, failed: 0, message: "No confirmed subscribers: 0 sent, 0 failed" };
  const { sent, failed } = await sendLaunch(emails, { title: item.title, slug: item.slug });
  return { ok: failed === 0, sent, failed, message: `${sent} sent, ${failed} failed` };
}

export type CoverUploadResult =
  | { ok: true; signedUrl: string; publicUrl: string }
  | { ok: false; error: string };

/** Validates the declared file server-side, then issues a signed upload URL to the covers bucket. */
export async function createCoverUploadAction(file: { type: string; size: number }): Promise<CoverUploadResult> {
  await requireOwner();
  const v = validateCoverFile({ type: String(file?.type ?? ""), size: Number(file?.size) });
  if (!v.ok) return v;
  try {
    const { signedUrl, publicUrl } = await createSignedCoverUpload(file.type);
    return { ok: true, signedUrl, publicUrl };
  } catch {
    return { ok: false, error: "Could not start the upload" };
  }
}
