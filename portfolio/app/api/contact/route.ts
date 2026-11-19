import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Send email via Resend
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "contact@routemaster.online",
    //   to: email,
    //   subject: "We received your message",
    //   html: `<p>Hi ${name},</p><p>Thank you for reaching out. We'll get back to you soon.</p>`,
    // });

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
