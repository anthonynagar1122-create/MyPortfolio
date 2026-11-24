import { createHmac, timingSafeEqual } from "node:crypto";

/** HMAC-SHA256 hex over the email, so unsubscribe links cannot be forged for other addresses. */
export function signUnsubscribe(email: string, secret: string): string {
  return createHmac("sha256", secret).update(`unsubscribe|${email}`).digest("hex");
}

export function verifyUnsubscribe(email: string, sig: string, secret: string): boolean {
  const expected = Buffer.from(signUnsubscribe(email, secret), "hex");
  if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
  return timingSafeEqual(expected, Buffer.from(sig, "hex"));
}
