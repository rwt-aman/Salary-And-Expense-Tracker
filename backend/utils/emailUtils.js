const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  // Always log OTP to console for local testing
  console.log(`\n========================================`);
  console.log(`📧  OTP Email (not actually sent - check email config)`);
  console.log(`   To:  ${email}`);
  console.log(`   OTP: ${otp}`);
  console.log(`========================================\n`);

  // Only send real email if email credentials are configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return; // Skip sending if not configured
  }

  // Production: send via SMTP (configure in .env)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"PaySplit" <${process.env.EMAIL_USER}>`,
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
};

module.exports = { sendOtpEmail };
