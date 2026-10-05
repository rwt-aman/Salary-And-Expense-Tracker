const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { generateToken } = require("../utils/jwtUtils");
const { generateOtp, isOtpExpired, otpExpiryTime } = require("../utils/otpUtils");
const { sendOtpEmail } = require("../utils/emailUtils");

const isProd = process.env.NODE_ENV === "production";

// Helper: findOne user by email (works for both Mongoose & Sequelize)
const findUserByEmail = async (email) => {
  const cleanEmail = email ? String(email).trim().toLowerCase() : "";
  return isProd
    ? User.findOne({ email: cleanEmail })
    : User.findOne({ where: { email: cleanEmail } });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      if (existing.isVerified) {
        return res.status(409).json({ message: "Email already registered. Please log in." });
      }

      // User exists but has not completed OTP verification yet -> refresh OTP and resend!
      const otp = generateOtp();
      const otpExpiry = otpExpiryTime();
      const hashed = await bcrypt.hash(password, 12);

      if (isProd) {
        existing.name = cleanName;
        existing.password = hashed;
        existing.otp = otp;
        existing.otpExpiresAt = otpExpiry;
        await existing.save();
      } else {
        await existing.update({
          name: cleanName,
          password: hashed,
          otp,
          otpExpiresAt: otpExpiry,
        });
      }

      console.log(`[register/resend] Generated new OTP: "${otp}" for "${cleanEmail}"`);
      const emailResult = await sendOtpEmail(cleanEmail, otp);
      return res.status(200).json({
        message: emailResult.success
          ? "Verification code sent to your email!"
          : "Verification code generated! Check your email or use the code below.",
        emailSent: emailResult.success,
        otp: emailResult.success ? undefined : otp,
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpExpiry = otpExpiryTime();

    await User.create({ name: cleanName, email: cleanEmail, password: hashed, otp, otpExpiresAt: otpExpiry, isVerified: false });
    console.log(`[register/new] Generated OTP: "${otp}" for "${cleanEmail}"`);
    const emailResult = await sendOtpEmail(cleanEmail, otp);

    return res.status(201).json({
      message: emailResult.success
        ? "Registration successful! Check your email for the OTP."
        : "Registration successful! Check your email or use the code below.",
      emailSent: emailResult.success,
      otp: emailResult.success ? undefined : otp,
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: err.message || "Server error during registration" });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email ? String(email).trim().toLowerCase() : "";
    const cleanOtp = otp ? String(otp).trim() : "";

    const user = await findUserByEmail(cleanEmail);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

    console.log(`[verifyOtp] Validating: Email="${cleanEmail}" | DB_OTP="${user.otp}" | Submitted_OTP="${cleanOtp}"`);

    if (String(user.otp).trim() !== cleanOtp) {
      console.warn(`[verifyOtp] Mismatch: DB has "${user.otp}", but user submitted "${cleanOtp}"`);
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    if (isOtpExpired(user.otpExpiresAt)) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    // Update for both Mongoose and Sequelize
    if (isProd) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
    } else {
      await user.update({ isVerified: true, otp: null, otpExpiresAt: null });
    }

    console.log(`[verifyOtp] Successfully verified user "${cleanEmail}"`);
    return res.status(200).json("Email verified successfully! You can now log in.");
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Guaranteed demo account access: demo123@gmail.com / demo123
    if (email === "demo123@gmail.com" && password === "demo123") {
      let demoUser = await findUserByEmail("demo123@gmail.com");
      if (!demoUser) {
        const hashed = await bcrypt.hash("demo123", 12);
        demoUser = await User.create({
          name: "Demo User",
          email: "demo123@gmail.com",
          password: hashed,
          isVerified: true,
        });
      } else if (!demoUser.isVerified) {
        if (isProd) {
          demoUser.isVerified = true;
          await demoUser.save();
        } else {
          await demoUser.update({ isVerified: true });
        }
      }
      const userId = isProd ? demoUser._id.toString() : demoUser.id;
      const token = generateToken(userId);
      return res.status(200).json(token);
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email before logging in" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const userId = isProd ? user._id.toString() : user.id;
    const token = generateToken(userId);
    return res.status(200).json(token);
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { register, verifyOtp, login };
