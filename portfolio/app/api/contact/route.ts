import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { escapeHtml, validateContactSubmission } from "@/lib/contact-validation";
import { getClientIp, MAX_CONTACT_BODY_BYTES, readBoundedBody } from "@/lib/contact-request";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const declaredLengthHeader = request.headers.get("content-length");
  if (declaredLengthHeader !== null) {
    const declaredLength = Number(declaredLengthHeader);
    if (!Number.isSafeInteger(declaredLength) || declaredLength < 0) {
      return NextResponse.json({ error: "Invalid Content-Length" }, { status: 400 });
    }
    if (declaredLength > MAX_CONTACT_BODY_BYTES) {
      return NextResponse.json({ error: "Request is too large" }, { status: 413 });
    }
  }

  if (!supabaseAdmin) {
    logger.error({ event: "contact_storage_not_configured" });
    return NextResponse.json({ error: "Contact service is temporarily unavailable" }, { status: 503 });
  }

  const clientIp = getClientIp(request.headers);
  if (!clientIp) {
    logger.warn({ event: "contact_client_ip_unavailable" });
    return NextResponse.json({ error: "Contact service is temporarily unavailable" }, { status: 503 });
  }

  // This RPC is granted only to service_role and performs an atomic,
  // database-backed fixed-window counter shared across server instances.
  const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc(
    "consume_contact_rate_limit",
    {
      p_ip: clientIp,
      p_max_requests: RATE_LIMIT_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    },
  );

  if (rateLimitError) {
    logger.error({ event: "contact_rate_limit_failed", code: rateLimitError.code });
    return NextResponse.json({ error: "Contact service is temporarily unavailable" }, { status: 503 });
  }
  if (allowed !== true) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS) } },
    );
  }

  const bodyResult = await readBoundedBody(request.body);
  if (bodyResult.error === "too_large") {
    return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  }
  if (bodyResult.error === "invalid_utf8") {
    return NextResponse.json({ error: "Request body must be valid UTF-8" }, { status: 400 });
  }
  if (bodyResult.error) {
    return NextResponse.json({ error: "Unable to read request body" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyResult.text ?? "");
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const parsed = validateContactSubmission(body);
  if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { value } = parsed;
  const { error } = await supabaseAdmin.from("contacts").insert({
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
        to: "hello@routemaster.online",
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
