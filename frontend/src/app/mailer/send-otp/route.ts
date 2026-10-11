import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

const getOtpEmailHtml = ({ name, otp }: { name: string; otp: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0c0e14;
      color: #e2e8f0;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #131722;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .logo-badge {
      background: #4f46e5;
      color: #ffffff;
      font-weight: bold;
      font-size: 18px;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      line-height: 36px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    h2 {
      font-size: 20px;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 8px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .otp-card {
      background: #1e1b4b;
      border: 1px solid #4338ca;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #818cf8;
      margin: 0;
    }
    .validity {
      font-size: 12px;
      color: #a5b4fc;
      margin-top: 8px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #1e293b;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-badge">PB</span>
      <span class="brand-name">ProjectBuddy</span>
    </div>
    <h2>Verify Your Email Address</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for signing up on ProjectBuddy! Please use the 6-digit verification code below to complete your account registration:</p>
    
    <div class="otp-card">
      <div class="otp-code">${otp}</div>
      <div class="validity">Valid for 10 minutes</div>
    </div>
    
    <p>If you did not request this verification code, please ignore this email or contact support.</p>
    
    <div class="footer">
      &copy; ${new Date().getFullYear()} ProjectBuddy Dev Network. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, otp, name = "Developer", secret } = body;

    const expectedSecret = process.env.INTERNAL_MAILER_SECRET || "pb_mailer_secure_bridge_2026";
    if (secret && secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!to || !otp) {
      return NextResponse.json({ success: false, error: "Missing required fields: to, otp" }, { status: 400 });
    }

    const emailUser = (process.env.EMAIL_USER || "pranjalshukla44455332@gmail.com").trim();
    const emailPass = (process.env.EMAIL_PASS || "aedfvhfikwogwjwe").trim().replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"ProjectBuddy" <${emailUser}>`,
      to,
      subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
      html: getOtpEmailHtml({ name, otp }),
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      deliveredTo: to,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Vercel Mailer error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to deliver email",
      },
      { status: 500 }
    );
  }
}
