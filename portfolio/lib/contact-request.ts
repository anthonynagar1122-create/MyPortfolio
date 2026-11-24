import { isIP } from "node:net";

export const MAX_CONTACT_BODY_BYTES = 24_000;

export type BoundedBodyResult =
  | { text: string; error?: never }
  | { error: "too_large" | "read_failed" | "invalid_utf8"; text?: never };

export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  const candidate = forwardedFor
    ? forwardedFor.split(",")[0]?.trim()
    : headers.get("x-real-ip")?.trim();

  return candidate && isIP(candidate) ? candidate : null;
}

/**
 * Reads a request stream incrementally and stops as soon as the byte budget
 * is exceeded. This also covers chunked requests without Content-Length.
 */
export async function readBoundedBody(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes = MAX_CONTACT_BODY_BYTES,
): Promise<BoundedBodyResult> {
  if (!stream) return { text: "" };

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { error: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { error: "read_failed" };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { error: "invalid_utf8" };
  }
}
