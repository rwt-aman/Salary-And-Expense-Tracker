// Force Google DNS to resolve MongoDB Atlas SRV records
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".netlify.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to allow connection
    },
    credentials: true,
  })
);
app.use(express.json());

// ─── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "🚀 PaySplit API is running",
    env: process.env.NODE_ENV || "development",
    version: "2.0.0",
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/budget", require("./routes/budget"));
app.use("/api/transactions", require("./routes/transaction"));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ─── DB Connect + Start ───────────────────────────────────────────────────────
const startServer = async () => {
  if (process.env.NODE_ENV === "production") {
    // MongoDB (production)
    const mongoose = require("mongoose");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } else {
    // MySQL (development)
    const { connectMySQL } = require("./config/db");
    await connectMySQL();
  }

  app.listen(PORT, () => {
    console.log(`🚀 PaySplit backend running on http://localhost:${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
