import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase";

// HTML entity escaping to prevent injection attacks
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

interface Submission {
  name: string;
  email: string;
  company?: string;
  product?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, product, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

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

    console.log("New submission:", { name, email, company, product });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message. We'll be in touch soon!",
        submissionId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
