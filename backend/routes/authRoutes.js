const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  sendOTP,
  verifyOTPCode,
} = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
} = require("../utils/validation");

const router = express.Router();

// ---------------- RATE LIMITERS ----------------

// OTP send limiter (STRICT)
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // send OTP max 5 times
  message: "Too many OTP requests. Please wait before retrying.",
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify limiter (LENIENT)
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // allow multiple verification attempts
  message: "Too many OTP verification attempts.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------- ROUTES ----------------

router.post("/send-otp", sendOtpLimiter, sendOTP);
router.post("/verify-otp", verifyOtpLimiter, verifyOTPCode);

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

module.exports = router;
