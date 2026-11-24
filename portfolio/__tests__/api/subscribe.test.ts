import { describe, it, expect, vi, beforeEach } from "vitest";
import { jsonReq } from "./helpers";
import { signUnsubscribe } from "../../lib/unsubscribe-token";

const { upsertPending, confirmByToken, unsubscribe, sendConfirmationEmail, increment } = vi.hoisted(() => ({
  upsertPending: vi.fn(),
  confirmByToken: vi.fn(),
  unsubscribe: vi.fn(),
  sendConfirmationEmail: vi.fn(),
  increment: vi.fn(),
}));

vi.mock("next/server", async (orig) => ({ ...(await orig<object>()), connection: vi.fn(async () => {}) }));
vi.mock("@/lib/db/subscribers", () => ({ upsertPending, confirmByToken, unsubscribe }));
vi.mock("@/lib/subscribe-email", () => ({ sendConfirmationEmail }));
vi.mock("@/lib/supabase", () => ({ getServerDb: () => ({}) }));
vi.mock("@/lib/db/rate-limit-store", () => ({ createRateLimitStore: () => ({ increment }) }));

import { POST } from "../../app/api/subscribe/route";
import { GET as confirm } from "../../app/api/subscribe/confirm/route";
import { GET as unsub } from "../../app/api/subscribe/unsubscribe/route";

const url = "http://localhost/api/subscribe";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("VISITOR_SALT_SECRET", "salt");
  vi.stubEnv("SITE_URL", "https://site.example/");
  increment.mockResolvedValue(1);
  sendConfirmationEmail.mockResolvedValue(undefined);
});

async function post(email: string, state: string) {
  upsertPending.mockResolvedValue({ state });
  const res = await POST(jsonReq(url, "POST", { email }));
  return { status: res.status, body: await res.json() };
}

describe("POST /api/subscribe", () => {
  it("returns an identical response for new, pending, confirmed and unsubscribed emails", async () => {
    const results = [
      await post("new@x.co", "new"),
      await post("pend@x.co", "already_pending"),
      await post("conf@x.co", "already_confirmed"),
      await post("gone@x.co", "unsubscribed"),
    ];
    for (const r of results) expect(r).toEqual(results[0]);
    expect(results[0].status).toBe(200);
    expect(results[0].body.ok).toBe(true);
  });

  it("only sends mail for new addresses, with a link built from SITE_URL", async () => {
    await post("pend@x.co", "already_pending");
    await post("gone@x.co", "unsubscribed");
    expect(sendConfirmationEmail).not.toHaveBeenCalled();
    await post("New@X.co", "new");
    expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
    const [to, link] = sendConfirmationEmail.mock.calls[0];
    expect(to).toBe("new@x.co");
    expect(link).toMatch(/^https:\/\/site\.example\/api\/subscribe\/confirm\?token=[0-9a-f]{64}$/);
    expect(upsertPending).toHaveBeenLastCalledWith("new@x.co", link.split("token=")[1], expect.any(String));
  });

  it("still returns the same response if sending mail fails", async () => {
    const ok = await post("a@x.co", "already_confirmed");
    sendConfirmationEmail.mockRejectedValue(new Error("smtp down"));
    const failed = await post("b@x.co", "new");
    expect(failed).toEqual(ok);
  });

  it("400 for invalid email and malformed JSON", async () => {
    expect((await POST(jsonReq(url, "POST", { email: "nope" }))).status).toBe(400);
    expect((await POST(jsonReq(url, "POST", "{bad"))).status).toBe(400);
    expect(upsertPending).not.toHaveBeenCalled();
  });

  it("429 when rate limited", async () => {
    increment.mockResolvedValue(6);
    const res = await POST(jsonReq(url, "POST", { email: "a@x.co" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("throws rather than using an empty SITE_URL or salt", async () => {
    vi.stubEnv("SITE_URL", "");
    upsertPending.mockResolvedValue({ state: "new" });
    const res = await POST(jsonReq(url, "POST", { email: "a@x.co" }));
    expect(res.status).toBe(500);
    expect(upsertPending).not.toHaveBeenCalled();
  });
});

describe("GET /api/subscribe/confirm", () => {
  it("redirects with confirmed for a valid token", async () => {
    confirmByToken.mockResolvedValue(true);
    const res = await confirm(jsonReq("http://localhost/api/subscribe/confirm?token=" + "a".repeat(64), "GET"));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://site.example/?subscribed=confirmed");
  });
  it("redirects with invalid for an unknown or missing token", async () => {
    confirmByToken.mockResolvedValue(false);
    const res = await confirm(jsonReq("http://localhost/api/subscribe/confirm?token=" + "b".repeat(64), "GET"));
    expect(res.headers.get("location")).toBe("https://site.example/?subscribed=invalid");
    const none = await confirm(jsonReq("http://localhost/api/subscribe/confirm", "GET"));
    expect(none.headers.get("location")).toBe("https://site.example/?subscribed=invalid");
    const malformed = await confirm(jsonReq("http://localhost/api/subscribe/confirm?token=zzz", "GET"));
    expect(malformed.headers.get("location")).toBe("https://site.example/?subscribed=invalid");
    expect(confirmByToken).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/subscribe/unsubscribe", () => {
  const base = "http://localhost/api/subscribe/unsubscribe";
  it("unsubscribes with a valid signature", async () => {
    const sig = signUnsubscribe("a@x.co", "salt");
    const res = await unsub(jsonReq(`${base}?email=a%40x.co&sig=${sig}`, "GET"));
    expect(res.status).toBe(303);
    expect(unsubscribe).toHaveBeenCalledWith("a@x.co");
  });
  it("rejects a bad signature without touching the database", async () => {
    const res = await unsub(jsonReq(`${base}?email=a%40x.co&sig=deadbeef`, "GET"));
    expect(res.headers.get("location")).toBe("https://site.example/?unsubscribed=invalid");
    expect(unsubscribe).not.toHaveBeenCalled();
  });
});
