const { verifyToken } = require("../utils/jwtUtils");
const { User } = require("../models");

const isProd = process.env.NODE_ENV === "production";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Find user - different syntax for Mongoose vs Sequelize
    let user;
    if (isProd) {
      user = await User.findById(decoded.id).select("-password");
    } else {
      user = await User.findByPk(decoded.id);
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { protect };
