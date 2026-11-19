import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase";
import pino from "pino";

// Logger setup
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

// HTML entity escaping to prevent injection attacks
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
};
const HTML_ESCAPE_REGEX = /[&<>"']/g;

function escapeHtml(text: string): string {
  return text.replace(HTML_ESCAPE_REGEX, m => HTML_ESCAPE_MAP[m]);
}

// Enhanced input validation patterns
const VALIDATION_PATTERNS = {
  name: /^[a-zA-Z\s'-]{2,100}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  company: /^[a-zA-Z0-9\s&'-]{0,100}$/,
  message: /^[\s\S]{10,5000}$/,
};

// Email validation
function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email);
}

// Enhanced input validation
function validateInput(field: string, value: string): { valid: boolean; error?: string } {
  if (field === "name") {
    if (!value || value.length < 2) return { valid: false, error: "Name must be at least 2 characters" };
    if (!VALIDATION_PATTERNS.name.test(value)) return { valid: false, error: "Name contains invalid characters" };
  }
  if (field === "company" && value && !VALIDATION_PATTERNS.company.test(value)) {
    return { valid: false, error: "Company contains invalid characters" };
  }
  if (field === "message") {
    if (value.length < 10) return { valid: false, error: "Message must be at least 10 characters" };
    if (value.length > 5000) return { valid: false, error: "Message must be under 5000 characters" };
  }
  return { valid: true };
}

// Simple in-memory rate limiter (IP-based, 5 requests per minute)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 });
    return { allowed: true, remaining: 4, resetTime: now + 60000 };
  }

  if (record.count >= 5) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: 5 - record.count, resetTime: record.resetTime };
}

interface Submission {
  name: string;
  email: string;
  company?: string;
  product?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting (outside try for error logging)
  const clientIp = request.headers.get("x-forwarded-for") ||
                 request.headers.get("x-real-ip") ||
                 "unknown";

  try {

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      logger.warn({
        event: "contact_form_rate_limited",
        ip: clientIp,
        resetTime: new Date(rateLimit.resetTime).toISOString(),
      });

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    const { name, email, company, product, message } = body;

    // Enhanced validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate each field
    const nameValidation = validateInput("name", name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (company) {
      const companyValidation = validateInput("company", company);
      if (!companyValidation.valid) {
        return NextResponse.json(
          { error: companyValidation.error },
          { status: 400 }
        );
      }
    }

    const messageValidation = validateInput("message", message);
    if (!messageValidation.valid) {
      return NextResponse.json(
        { error: messageValidation.error },
        { status: 400 }
      );
    }

    logger.info({
      event: "contact_form_validation_passed",
      email,
      ip: clientIp,
    });

    // Save to Supabase (if configured)
    let submissionId = null;
    if (supabaseServer) {
      try {
        const { data, error: supabaseError } = await supabaseServer
          .from("contacts")
          .insert([
            {
              name,
              email,
              company: company || null,
              product: product || null,
              message,
            },
          ])
          .select();

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
        } else if (data?.[0]) {
          submissionId = data[0].id;
        }
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    }

    // Send email via Resend if API key is configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder_key_replace_with_real_key") {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send confirmation email to user
        await resend.emails.send({
          from: "noreply@routemaster.online",
          to: email,
          subject: "We received your message",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>Thank you, ${escapeHtml(name)}!</h2>
              <p>We received your message and will get back to you within 24 hours.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <blockquote style="background: #f5f5f5; padding: 10px; border-left: 4px solid #3563F6;">
                ${escapeHtml(message)}
              </blockquote>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p>Best regards,<br><strong>RouteMaster Team</strong></p>
            </div>
          `,
        });

        // Send notification email to team
        await resend.emails.send({
          from: "noreply@routemaster.online",
          to: "team@routemaster.online",
          subject: `New enquiry from ${escapeHtml(name)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h3>New Contact Form Submission</h3>
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
              ${product ? `<p><strong>Interest:</strong> ${escapeHtml(product)}</p>` : ""}
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p><strong>Message:</strong></p>
              <blockquote style="background: #f5f5f5; padding: 10px; border-left: 4px solid #3563F6;">
                ${escapeHtml(message)}
              </blockquote>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    }

    logger.info({
      event: "contact_form_submitted",
      submissionId,
      email,
      ip: clientIp,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message. We'll be in touch soon!",
        submissionId,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({
      event: "contact_form_error",
      error: error instanceof Error ? error.message : String(error),
      ip: clientIp,
    });

    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
