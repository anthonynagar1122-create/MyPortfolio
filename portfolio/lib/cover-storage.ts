import { randomUUID } from "node:crypto";
import { COVER_BUCKET, coverExtension } from "./cover-rules";
import { getServerDb } from "./supabase";

/** Creates a one-time signed upload URL for a fresh random object name. Caller must have validated the file. */
export async function createSignedCoverUpload(type: string): Promise<{ signedUrl: string; publicUrl: string }> {
  const db = getServerDb();
  const path = `${randomUUID()}.${coverExtension(type)}`;
  const { data, error } = await db.storage.from(COVER_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Could not create upload URL: ${error?.message ?? "unknown"}`);
  const { data: pub } = db.storage.from(COVER_BUCKET).getPublicUrl(path);
  return { signedUrl: data.signedUrl, publicUrl: pub.publicUrl };
}
