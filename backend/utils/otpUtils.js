const crypto = require("crypto");

const generateOtp = () => {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isOtpExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
};

const otpExpiryTime = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10); // 10 minutes validity
  return d;
};

module.exports = { generateOtp, isOtpExpired, otpExpiryTime };
