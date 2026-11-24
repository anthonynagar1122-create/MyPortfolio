import { Resend } from "resend";
import { requireNonEmptyEnv } from "./env";

/** Sends the double-opt-in confirmation email. Throws on misconfiguration or send failure. */
export async function sendConfirmationEmail(to: string, confirmLink: string): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("Missing required environment variable: EMAIL_FROM");
  const resend = new Resend(requireNonEmptyEnv("RESEND_API_KEY"));
  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Confirm your subscription",
    text: `Please confirm your subscription by opening this link:\n\n${confirmLink}\n\nIf you did not ask for this, ignore this email.`,
  });
  if (error) throw new Error(`Email send failed: ${error.message}`);
}
