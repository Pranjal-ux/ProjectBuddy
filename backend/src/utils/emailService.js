import nodemailer from "nodemailer";

/**
 * Generates the clean HTML email template for OTP
 */
const getOtpEmailHtml = ({ name, otp }) => `
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

/**
 * Sends a 6-digit OTP email to verify email address.
 * Resilient, fast, and will NEVER hang the request or keep user spinning.
 */
export const sendOtpEmail = async ({ to, otp, name = "Developer" }) => {
  const isDummy = process.env.USE_DUMMY_SMTP === "true";
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // 1. DUMMY SMTP MODE: Safe, isolated testing for ANY email address (No Google account or domain needed)
  if (isDummy) {
    let dummyPreviewUrl = null;

    // If custom dummy SMTP credentials are provided (e.g. Mailtrap, Mailpit, MailHog)
    if (process.env.SMTP_HOST && emailUser && emailPass) {
      try {
        const smtpHost = process.env.SMTP_HOST.trim();
        const smtpPort = parseInt(process.env.SMTP_PORT || "2525", 10);
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: emailUser, pass: emailPass },
        });
        await transporter.sendMail({
          from: `"ProjectBuddy Test" <${process.env.EMAIL_FROM || "test@projectbuddy.dev"}>`,
          to,
          subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
          html: getOtpEmailHtml({ name, otp }),
        });
        console.log(`✅ [Custom Dummy SMTP] Email accepted by ${smtpHost} for ${to}`);
      } catch (customSmtpErr) {
        console.warn(`⚠️ [Custom Dummy SMTP] Error:`, customSmtpErr.message);
      }
    } else {
      // Automatic built-in Ethereal dummy SMTP server (creates instant web inbox preview)
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await transporter.sendMail({
          from: `"ProjectBuddy Test" <no-reply@projectbuddy.dev>`,
          to,
          subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
          html: getOtpEmailHtml({ name, otp }),
        });
        dummyPreviewUrl = nodemailer.getTestMessageUrl(info);
      } catch (etherealErr) {
        // Fallback silently to console display
      }
    }

    console.log(`\n==========================================================`);
    console.log(`🧪 [Dummy SMTP Active - No Google Account Required]`);
    console.log(`👉 Sent code for: ${to} (${name})`);
    console.log(`🔑 Verification OTP: >>> ${otp} <<<`);
    if (dummyPreviewUrl) {
      console.log(`🌐 Open in Dummy Web Inbox: ${dummyPreviewUrl}`);
    }
    console.log(`⏱️  Valid for: 10 minutes`);
    console.log(`==========================================================\n`);

    return {
      sent: true,
      mode: "dummy_smtp",
      previewUrl: dummyPreviewUrl,
      otpPreview: otp,
    };
  }

  let lastError = null;

  // 2. REAL GMAIL / SMTP: Prioritize Gmail SMTP when credentials are provided
  if (emailUser && emailPass) {
    try {
      const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: emailUser, pass: emailPass },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: `"ProjectBuddy" <${emailUser}>`,
        to,
        subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
        html: getOtpEmailHtml({ name, otp }),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Gmail SMTP] Real OTP email delivered to ${to}. MessageId: ${info.messageId}`);

      return {
        sent: true,
        mode: "smtp",
        messageId: info.messageId,
      };
    } catch (smtpErr) {
      console.warn("⚠️ [Gmail SMTP] Could not deliver email:", smtpErr.message);
      lastError = smtpErr.message;
    }
  }

  // 3. RESEND API: If RESEND_API_KEY is configured, send via HTTPS REST API
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "ProjectBuddy <onboarding@resend.dev>";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
          html: getOtpEmailHtml({ name, otp }),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        console.log(`✅ [Resend API] OTP email delivered to ${to}. Email ID: ${resData.id}`);
        return {
          sent: true,
          mode: "resend",
          messageId: resData.id,
        };
      } else {
        lastError = resData.message || "Resend free tier only allows sending to the account owner";
        console.warn(`\n==========================================================`);
        console.warn(`⚠️ [Resend API Delivery Notice for ${to}]`);
        console.warn(`Status: ${resData.statusCode || "Error"} - ${resData.name || "API Warning"}`);
        console.warn(`Message: ${lastError}`);
        if (resData.statusCode === 403 || resData.name === "validation_error") {
          console.warn(`📌 Resend sandbox (onboarding@resend.dev) restricts delivery to unverified external emails.`);
          console.warn(`📌 For testing with this email, the 6-digit OTP code is: >>> ${otp} <<<`);
          console.warn(`📌 To send real emails to ANY address: verify a custom domain at https://resend.com/domains OR configure Gmail SMTP in backend/.env.`);
        }
        console.warn(`==========================================================\n`);
      }
    } catch (resendErr) {
      lastError = resendErr.message;
      console.warn("⚠️ [Resend API] Request error:", resendErr.message);
    }
  }

  // 4. Default fallback: when real email delivery is blocked (sandbox restriction or no SMTP)
  console.log(`\n==========================================================`);
  console.log(`🔑 Verification OTP for ${to}: >>> ${otp} <<<`);
  console.log(`==========================================================\n`);

  return {
    sent: false,
    mode: "fallback",
    error: lastError || "Email delivery restricted in test mode",
    otpPreview: otp,
  };
};
