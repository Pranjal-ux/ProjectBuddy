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

  // 1. FAST PATH: If dummy/test mode is explicitly enabled, return immediately without any external network delay
  if (isDummy) {
    console.log(`\n==========================================================`);
    console.log(`🧪 [ProjectBuddy Test/Demo Mode Active]`);
    console.log(`👉 Sent code for: ${to} (${name})`);
    console.log(`🔑 Verification OTP: >>> ${otp} <<<`);
    console.log(`⏱️  Valid for: 10 minutes`);
    console.log(`==========================================================\n`);

    return {
      sent: false,
      mode: "demo",
      otpPreview: otp,
    };
  }

  // 2. RESEND API: If RESEND_API_KEY is configured, send via HTTPS REST API (never blocked by cloud port filters)
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
        console.warn("⚠️ [Resend API] Error response:", resData);
      }
    } catch (resendErr) {
      console.warn("⚠️ [Resend API] Request error:", resendErr.message);
    }
  }

  // 3. NODEMAILER SMTP (Gmail or custom SMTP) with strict 3.5s timeout to prevent hanging the request
  if (emailUser && emailPass) {
    try {
      const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: emailUser, pass: emailPass },
        connectionTimeout: 3000,
        greetingTimeout: 3000,
        socketTimeout: 3500,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: `"ProjectBuddy" <${process.env.EMAIL_FROM || emailUser || "no-reply@projectbuddy.dev"}>`,
        to,
        subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
        html: getOtpEmailHtml({ name, otp }),
      };

      const sendPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP connection timed out after 3.5s")), 3500)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);
      console.log(`✅ [SMTP] Real OTP email sent to ${to}. MessageId: ${info.messageId}`);

      return {
        sent: true,
        mode: "smtp",
        messageId: info.messageId,
      };
    } catch (smtpErr) {
      console.warn("⚠️ [SMTP] Could not deliver email:", smtpErr.message);
      console.log(`🔑 Fallback OTP for ${to}: >>> ${otp} <<<`);
      return {
        sent: false,
        mode: "smtp_timeout_fallback",
        error: smtpErr.message,
        otpPreview: otp,
      };
    }
  }

  // 4. Default immediate fallback if no credentials are configured
  console.log(`\n==========================================================`);
  console.log(`🧪 [ProjectBuddy Fallback Mode - No Real SMTP Configured]`);
  console.log(`👉 Recipient: ${to} (${name})`);
  console.log(`🔑 Verification OTP: >>> ${otp} <<<`);
  console.log(`==========================================================\n`);

  return {
    sent: false,
    mode: "fallback",
    otpPreview: otp,
  };
};
