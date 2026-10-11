import nodemailer from "nodemailer";

let etherealTransporter = null;

/**
 * Initializes or reuses a dummy test SMTP account (Ethereal Email).
 * Safe, zero-cost, and does NOT use or touch any real personal email account.
 */
const getEtherealTransporter = async () => {
  try {
    if (!etherealTransporter) {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    return etherealTransporter;
  } catch (err) {
    console.warn("⚠️ [Email] Could not create Ethereal test account:", err.message);
    return null;
  }
};

/**
 * Gets the active transporter.
 */
const getTransporter = async () => {
  const useDummy = process.env.USE_DUMMY_SMTP === "true";
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

  if (!useDummy && emailUser && emailPass) {
    if (smtpHost) {
      return {
        transporter: nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: emailUser, pass: emailPass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          tls: {
            rejectUnauthorized: false,
          },
        }),
        isDummy: false,
      };
    }

    // Default to Gmail SMTP direct connection (port 465 SSL is much more reliable on cloud servers than service:"gmail")
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
        },
      }),
      isDummy: false,
    };
  }

  const transporter = await getEtherealTransporter();
  return { transporter, isDummy: true };
};

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
 * Resilient against network errors and cloud hosting port blocks.
 */
export const sendOtpEmail = async ({ to, otp, name = "Developer" }) => {
  const htmlContent = getOtpEmailHtml({ name, otp });

  // 1. Try Resend HTTP REST API if RESEND_API_KEY is defined (100% reliable on cloud hosts like Render & Vercel)
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "ProjectBuddy <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
          html: htmlContent,
        }),
      });

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

  // 2. Try Nodemailer SMTP
  try {
    const { transporter, isDummy } = await getTransporter();

    if (transporter) {
      const mailOptions = {
        from: `"ProjectBuddy" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@projectbuddy.dev"}>`,
        to,
        subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);

      if (isDummy) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`\n==========================================================`);
        console.log(`🧪 [ProjectBuddy Dummy/Ethereal SMTP]`);
        console.log(`👉 Sent to dummy test inbox for: ${to} (${name})`);
        if (previewUrl) {
          console.log(`🔗 Click to view the full rendered email in browser:`);
          console.log(`   ${previewUrl}`);
        }
        console.log(`🔑 Verification OTP: >>> ${otp} <<<`);
        console.log(`⏱️  Valid for: 10 minutes`);
        console.log(`==========================================================\n`);

        return {
          sent: false,
          mode: "dummy_ethereal",
          previewUrl,
          otpPreview: otp,
        };
      }

      console.log(`✅ [Nodemailer SMTP] Real OTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return {
        sent: true,
        mode: "smtp",
        messageId: info.messageId,
      };
    }
  } catch (error) {
    console.error("❌ [Email] Error sending OTP email via SMTP:", error.message);
    console.log(`🔑 Fallback OTP for ${to}: >>> ${otp} <<<`);
    return {
      sent: false,
      mode: "error_fallback",
      error: error.message,
      otpPreview: otp,
    };
  }

  // 3. Fallback when no transport configured or failed
  console.log(`\n==========================================================`);
  console.log(`🧪 [ProjectBuddy Fallback Mode - No Real SMTP Configured]`);
  console.log(`👉 Recipient: ${to} (${name})`);
  console.log(`🔑 Verification OTP: >>> ${otp} <<<`);
  console.log(`💡 Set EMAIL_USER & EMAIL_PASS (or RESEND_API_KEY) in backend .env to send real emails.`);
  console.log(`==========================================================\n`);

  return {
    sent: false,
    mode: "fallback",
    otpPreview: otp,
  };
};
