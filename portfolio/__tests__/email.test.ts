import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { confirmationEmail, escapeHtml, launchEmail, sendConfirmation, sendLaunch } from "../lib/email";
import { signUnsubscribe } from "../lib/unsubscribe-token";

describe("escapeHtml", () => {
  it("escapes the five HTML metacharacters", () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
  });
});

describe("templates", () => {
  it("confirmationEmail contains confirm and unsubscribe URLs, escaped", () => {
    const out = confirmationEmail({
      confirmUrl: "https://x.test/api/subscribe/confirm?token=a&b=1",
      unsubscribeUrl: "https://x.test/api/subscribe/unsubscribe?email=a%40b.c&sig=ff",
    });
    expect(out.html).toContain("https://x.test/api/subscribe/confirm?token=a&amp;b=1");
    expect(out.html).toContain("api/subscribe/unsubscribe?email=a%40b.c&amp;sig=ff");
    expect(out.text).toContain("token=a&b=1");
    expect(out.text).toContain("unsubscribe");
  });

  it("launchEmail escapes a script title in html", () => {
    const out = launchEmail({
      title: "<script>alert(1)</script>",
      url: "https://x.test/item/a",
      unsubscribeUrl: "https://x.test/u",
    });
    expect(out.html).not.toContain("<script>");
    expect(out.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(out.html).toContain("https://x.test/u");
  });

  it("escapes quote characters in URLs so attributes cannot break out", () => {
    const out = launchEmail({ title: "t", url: 'https://x.test/"onmouseover="x', unsubscribeUrl: "https://x.test/u" });
    expect(out.html).not.toContain('"onmouseover="');
  });
});

describe("senders", () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "Me <me@x.test>");
    vi.stubEnv("SITE_URL", "https://x.test/");
    vi.stubEnv("VISITOR_SALT_SECRET", "secret");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("sendConfirmation builds links from SITE_URL and the shared signer", async () => {
    await sendConfirmation("A@B.c", "tok123");
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("a@b.c");
    expect(arg.html).toContain("https://x.test/api/subscribe/confirm?token=tok123");
    expect(arg.html).toContain(signUnsubscribe("a@b.c", "secret"));
  });

  it.each(["RESEND_API_KEY", "EMAIL_FROM", "SITE_URL"])("throws when %s is empty, even outside production", async (name) => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv(name, "");
    await expect(sendConfirmation("a@b.c", "t")).rejects.toThrow(name);
    expect(send).not.toHaveBeenCalled();
  });

  it("sendLaunch sends one email per recipient with its own unsubscribe link", async () => {
    const res = await sendLaunch(["a@b.c", "d@e.f"], { title: "T", slug: "my-slug" });
    expect(res).toEqual({ sent: 2, failed: 0 });
    expect(send).toHaveBeenCalledTimes(2);
    const first = send.mock.calls[0][0];
    expect(first.html).toContain("https://x.test/item/my-slug");
    expect(first.html).toContain(signUnsubscribe("a@b.c", "secret"));
    expect(send.mock.calls[1][0].html).toContain(signUnsubscribe("d@e.f", "secret"));
  });

  it("sendLaunch counts successes and failures (error result and thrown)", async () => {
    send
      .mockResolvedValueOnce({ error: { message: "boom" } })
      .mockResolvedValueOnce({ error: null })
      .mockRejectedValueOnce(new Error("network"));
    expect(await sendLaunch(["a@b.c", "d@e.f", "g@h.i"], { title: "T", slug: "s" })).toEqual({ sent: 1, failed: 2 });
  });
});
