const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const attendanceRoutes = require("./routes/attendance");

const { sendEventReminders } = require("./controllers/reminderController");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- RATE LIMITERS ----------------

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

// Auth limiter (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Try later.",
});

// OTP limiter
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests. Please wait.",
});

// ---------------- ROUTES ----------------

app.use("/api", apiLimiter);

// 🔥 IMPORTANT: OTP routes FIRST
app.post("/api/auth/send-otp", otpLimiter);
app.post("/api/auth/verify-otp", otpLimiter);

// Auth routes (login, register)
app.use("/api/auth", authLimiter, authRoutes);

// Other routes
app.use("/api/profile", profileRoutes);
app.use("/api/reminder", reminderRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Cron
cron.schedule("0 8 * * *", () => {
  sendEventReminders().catch(console.error);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Server error" });
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
