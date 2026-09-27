const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  // Always log OTP to console for debugging and testing
  console.log(`\n========================================`);
  console.log(`📧  OTP Email Notification`);
  console.log(`   To:  ${email}`);
  console.log(`   OTP: ${otp}`);
  console.log(`========================================\n`);

  // Only send real email if email credentials are configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your_email@gmail.com") {
    console.log("ℹ️  EMAIL_USER not configured. Skipping SMTP dispatch.");
    return { success: false, reason: "NOT_CONFIGURED" };
  }

  try {
    const isGmail =
      !process.env.EMAIL_HOST ||
      process.env.EMAIL_HOST.toLowerCase().includes("gmail");

    const cleanPass = process.env.EMAIL_PASS
      ? process.env.EMAIL_PASS.trim().replace(/\s+/g, "")
      : "";

    const cleanUser = process.env.EMAIL_USER.trim();

    const transportConfig = isGmail
      ? {
          service: "gmail",
          auth: {
            user: cleanUser,
            pass: cleanPass,
          },
        }
      : {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: Number(process.env.EMAIL_PORT) === 465,
          auth: {
            user: cleanUser,
            pass: cleanPass,
          },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    const info = await transporter.sendMail({
      from: `"PaySplit" <${cleanUser}>`,
      to: email,
      subject: "PaySplit – Your Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #0f172a; border-radius: 12px; color: #f8fafc;">
          <h2 style="color: #6366f1; margin-bottom: 8px;">PaySplit</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Your one-time verification code:</p>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 24px; text-align: center; font-size: 36px; font-family: monospace; letter-spacing: 12px; color: #f8fafc; font-weight: 700;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    console.log("✅ OTP Email dispatched successfully! MessageId:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send OTP email via Nodemailer:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOtpEmail };
