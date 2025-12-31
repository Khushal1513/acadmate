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
const seniorRoutes = require("./routes/seniorRoutes");

const { sendEventReminders } = require("./controllers/reminderController");
const cookieParser = require("cookie-parser");
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔍 Debug middleware - logs all requests
app.use((req, res, next) => {
 
  next();
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reminder", reminderRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/seniors", seniorRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ⏰ Daily cron job
cron.schedule("0 8 * * *", () => {
  console.log("⏰ Running daily reminder job...");
  sendEventReminders().catch((err) =>
    console.error("Error sending reminders:", err)
  );
});

// 🛑 Global error handler (MUST be after routes)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// ❌ 404 handler (MUST be last)
app.use("*", (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  
});