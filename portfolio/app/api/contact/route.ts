import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Form submission storage (in-memory for now, can be replaced with database)
interface Submission {
  id: string;
  name: string;
  email: string;
  company?: string;
  product?: string;
  message: string;
  createdAt: string;
}

const submissions: Submission[] = [];

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

    // Create submission record
    const submission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      company: company || undefined,
      product: product || undefined,
      message,
      createdAt: new Date().toISOString(),
    };

    submissions.push(submission);

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
              <h2>Thank you, ${name}!</h2>
              <p>We received your message and will get back to you within 24 hours.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <blockquote style="background: #f5f5f5; padding: 10px; border-left: 4px solid #3563F6;">
                ${message}
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
          subject: `New enquiry from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h3>New Contact Form Submission</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
              ${product ? `<p><strong>Interest:</strong> ${product}</p>` : ""}
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p><strong>Message:</strong></p>
              <blockquote style="background: #f5f5f5; padding: 10px; border-left: 4px solid #3563F6;">
                ${message}
              </blockquote>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p><small>Submission ID: ${submission.id}</small></p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the form submission if email fails
        // User gets success response, but email wasn't sent
      }
    }

    // Log to console (development)
    console.log("New submission:", submission);

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message. We'll be in touch soon!",
        submissionId: submission.id,
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

// GET endpoint to retrieve submissions (for admin dashboard)
export async function GET(request: NextRequest) {
  // TODO: Add authentication check
  // For now, return submissions
  return NextResponse.json({
    submissions,
    count: submissions.length,
  });
}
