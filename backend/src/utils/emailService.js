import nodemailer from "nodemailer";

let etherealTransporter = null;

/**
 * Initializes or reuses a dummy test SMTP account (Ethereal Email).
 * Safe, zero-cost, and does NOT use or touch any real personal email account.
 */
const getEtherealTransporter = async () => {
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
};

/**
 * Gets the active transporter.
 * Defaults to the safe Dummy SMTP server (Ethereal).
 */
const getTransporter = async () => {
  const useDummy =
    process.env.USE_DUMMY_SMTP === "true" ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS;

  if (useDummy) {
    const transporter = await getEtherealTransporter();
    return { transporter, isDummy: true };
  }

  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);

  if (emailUser && emailPass) {
    if (smtpHost) {
      return {
        transporter: nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: emailUser, pass: emailPass },
        }),
        isDummy: false,
      };
    }

    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPass },
      }),
      isDummy: false,
    };
  }

  const transporter = await getEtherealTransporter();
  return { transporter, isDummy: true };
};

/**
 * Sends a 6-digit OTP email to verify email address
 */
export const sendOtpEmail = async ({ to, otp, name = "Developer" }) => {
  const { transporter, isDummy } = await getTransporter();

  const mailOptions = {
    from: `"ProjectBuddy" <${process.env.EMAIL_FROM || "no-reply@projectbuddy.dev"}>`,
    to,
    subject: `🔐 Verify your ProjectBuddy Account - OTP: ${otp}`,
    html: `
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
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (isDummy) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n==========================================================`);
      console.log(`🧪 [ProjectBuddy Dummy SMTP Server (Ethereal)]`);
      console.log(`👉 Sent to dummy inbox for: ${to} (${name})`);
      console.log(`🔗 Click to view the full rendered email in browser:`);
      console.log(`   ${previewUrl}`);
      console.log(`🔑 Verification OTP: >>> ${otp} <<<`);
      console.log(`⏱️  Valid for: 10 minutes`);
      console.log(`==========================================================\n`);

      return {
        sent: true,
        mode: "dummy_ethereal",
        previewUrl,
      };
    }

    console.log(`✅ [Email] Real OTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return {
      sent: true,
      mode: "smtp",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ [Email] Error sending OTP email:", error);
    return {
      sent: false,
      mode: "error_fallback",
      error: error.message,
    };
  }
};
