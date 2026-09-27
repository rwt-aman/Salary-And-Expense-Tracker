const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { generateToken } = require("../utils/jwtUtils");
const { generateOtp, isOtpExpired, otpExpiryTime } = require("../utils/otpUtils");
const { sendOtpEmail } = require("../utils/emailUtils");

const isProd = process.env.NODE_ENV === "production";

// Helper: findOne user by email (works for both Mongoose & Sequelize)
const findUserByEmail = async (email) => {
  return isProd
    ? User.findOne({ email })
    : User.findOne({ where: { email } });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpExpiry = otpExpiryTime();

    await User.create({ name, email, password: hashed, otp, otpExpiresAt: otpExpiry, isVerified: false });
    await sendOtpEmail(email, otp);

    return res.status(201).json("Registration successful! Check your email for the OTP.");
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP code" });
    if (isOtpExpired(user.otpExpiresAt)) return res.status(400).json({ message: "OTP has expired. Please register again." });

    // Update for both Mongoose and Sequelize
    if (isProd) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
    } else {
      await user.update({ isVerified: true, otp: null, otpExpiresAt: null });
    }

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
