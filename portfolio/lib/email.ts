import { Resend } from "resend";
import { requireNonEmptyEnv } from "./env";
import { signUnsubscribe } from "./unsubscribe-token";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape every interpolated value that lands in an HTML email. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

export type EmailContent = { subject: string; html: string; text: string };

function layout(bodyHtml: string, unsubscribeUrl: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1A1A1A;line-height:1.5">${bodyHtml}<hr style="border:none;border-top:1px solid #E5E5E0;margin:24px 0"><p style="font-size:12px;color:#5C5C5C"><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p></body></html>`;
}

export function confirmationEmail(input: { confirmUrl: string; unsubscribeUrl: string }): EmailContent {
  const confirm = escapeHtml(input.confirmUrl);
  return {
    subject: "Confirm your subscription",
    html: layout(
      `<p>Please confirm your subscription.</p><p><a href="${confirm}">Confirm subscription</a></p><p>If you did not ask for this, ignore this email.</p>`,
      input.unsubscribeUrl,
    ),
    text: `Please confirm your subscription:\n\n${input.confirmUrl}\n\nIf you did not ask for this, ignore this email.\n\nUnsubscribe: ${input.unsubscribeUrl}`,
  };
}

export function launchEmail(input: { title: string; url: string; unsubscribeUrl: string }): EmailContent {
  const title = escapeHtml(input.title);
  return {
    subject: `New: ${input.title.replace(/[\r\n]+/g, " ")}`,
    html: layout(
      `<p>A new project just launched: <strong>${title}</strong></p><p><a href="${escapeHtml(input.url)}">Take a look</a></p>`,
      input.unsubscribeUrl,
    ),
    text: `A new project just launched: ${input.title}\n\n${input.url}\n\nUnsubscribe: ${input.unsubscribeUrl}`,
  };
}

function config() {
  return {
    resend: new Resend(requireNonEmptyEnv("RESEND_API_KEY")),
    from: requireNonEmptyEnv("EMAIL_FROM"),
    site: requireNonEmptyEnv("SITE_URL").replace(/\/+$/, ""),
    secret: requireNonEmptyEnv("VISITOR_SALT_SECRET"),
  };
}

// Same signer and URL shape the unsubscribe route verifies.
function unsubscribeUrlFor(site: string, secret: string, email: string): string {
  return `${site}/api/subscribe/unsubscribe?email=${encodeURIComponent(email)}&sig=${signUnsubscribe(email, secret)}`;
}

export async function sendConfirmation(to: string, token: string): Promise<void> {
  const { resend, from, site, secret } = config();
  const email = to.trim().toLowerCase();
  const content = confirmationEmail({
    confirmUrl: `${site}/api/subscribe/confirm?token=${encodeURIComponent(token)}`,
    unsubscribeUrl: unsubscribeUrlFor(site, secret, email),
  });
  const { error } = await resend.emails.send({ from, to: email, ...content });
  if (error) throw new Error(`Email send failed: ${error.message}`);
}

/** One email per recipient so each carries its own signed unsubscribe link. */
export async function sendLaunch(to: string[], item: { title: string; slug: string }): Promise<{ sent: number; failed: number }> {
  const { resend, from, site, secret } = config();
  let sent = 0;
  let failed = 0;
  for (const raw of to) {
    const email = raw.trim().toLowerCase();
    const content = launchEmail({
      title: item.title,
      url: `${site}/item/${encodeURIComponent(item.slug)}`,
      unsubscribeUrl: unsubscribeUrlFor(site, secret, email),
    });
    try {
      const { error } = await resend.emails.send({ from, to: email, ...content });
      if (error) failed += 1;
      else sent += 1;
    } catch {
      // one failure must not stop the rest; it is reported in `failed`
      failed += 1;
    }
  }
  return { sent, failed };
}
