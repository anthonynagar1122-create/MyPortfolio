
export function jsonReq(url: string, method: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0", "x-forwarded-for": "203.0.113.9", ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

export const ITEM_ID = "11111111-1111-4111-8111-111111111111";
