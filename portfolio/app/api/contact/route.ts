import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase";
import pino from "pino";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const MAX_BODY_BYTES = 12_000;
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
};
const HTML_ESCAPE_REGEX = /[&<>"']/g;
const escapeHtml = (value: string) => value.replace(HTML_ESCAPE_REGEX, (m) => HTML_ESCAPE_MAP[m]);

type Submission = {
  name: string;
  email: string;
  company?: string;
  product?: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validate(body: unknown): { value?: Submission; error?: string } {
  if (!isRecord(body)) return { error: "Invalid request body" };
  const { name, email, company, product, message } = body;
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return { error: "Name, email and message are required" };
  }
  const clean = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    company: typeof company === "string" ? company.trim() : undefined,
    product: typeof product === "string" ? product.trim() : undefined,
  };
  if (clean.name.length < 2 || clean.name.length > 100) return { error: "Name must be 2–100 characters" };
  if (!/^[\p{L}\p{M}\s'.-]+$/u.test(clean.name)) return { error: "Name contains invalid characters" };
  if (clean.email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return { error: "Invalid email address" };
  if (clean.company && clean.company.length > 100) return { error: "Company must be under 100 characters" };
  if (clean.product && clean.product.length > 100) return { error: "Product must be under 100 characters" };
  if (clean.message.length < 10 || clean.message.length > 5000) return { error: "Message must be 10–5000 characters" };
  return { value: clean };
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request is too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed or oversized JSON" }, { status: 400 });
  }

  const parsed = validate(body);
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
