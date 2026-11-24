import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase";
import pino from "pino";
import { escapeHtml, validateContactSubmission } from "@/lib/contact-validation";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const MAX_BODY_BYTES = 12_000;
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Unable to read request body" }, { status: 400 });
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const parsed = validateContactSubmission(body);
  if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (!supabaseServer) {
    logger.error({ event: "contact_storage_not_configured" });
    return NextResponse.json({ error: "Contact service is temporarily unavailable" }, { status: 503 });
  }

  const { value } = parsed;
  const { error } = await supabaseServer.from("contacts").insert({
    name: value.name,
    email: value.email,
    company: value.company || null,
    product: value.product || null,
    message: value.message,
  });

  if (error) {
    logger.error({ event: "contact_storage_failed", code: error.code });
    return NextResponse.json({ error: "Unable to save your message right now" }, { status: 503 });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "noreply@routemaster.online",
        to: value.email,
        subject: "We received your message",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h2>Thank you, ${escapeHtml(value.name)}!</h2><p>We received your message and will get back to you.</p><blockquote>${escapeHtml(value.message)}</blockquote><p>RouteMaster Team</p></div>`,
      });
      await resend.emails.send({
        from: "noreply@routemaster.online",
        to: "team@routemaster.online",
        subject: `New enquiry from ${escapeHtml(value.name)}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h3>New contact submission</h3><p><b>Name:</b> ${escapeHtml(value.name)}</p><p><b>Email:</b> ${escapeHtml(value.email)}</p><p><b>Company:</b> ${escapeHtml(value.company || "—")}</p><p><b>Interest:</b> ${escapeHtml(value.product || "—")}</p><blockquote>${escapeHtml(value.message)}</blockquote></div>`,
      });
    } catch {
      logger.warn({ event: "contact_email_delivery_failed" });
    }
  }

  logger.info({ event: "contact_form_submitted" });
  return NextResponse.json(
    { success: true, message: "Thank you. Your message has been received." },
    { status: 201 },
  );
}
