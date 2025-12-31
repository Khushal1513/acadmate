const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  sendOTP,
  verifyOTPCode,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
} = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
} = require("../utils/validation");

const router = express.Router();

// ---------------- RATE LIMITERS ----------------

// OTP send limiter (STRICT - prevent spam)
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // send OTP max 5 times per 15 minutes
  message: "Too many OTP requests. Please wait before retrying.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// OTP verify limiter (LENIENT - users need multiple attempts)
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // allow up to 30 verification attempts per 15 minutes
  message: "Too many OTP verification attempts. Please wait a moment and try again.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all attempts
});

// ---------------- ROUTES ----------------

router.post("/send-otp", sendOtpLimiter, sendOTP);
router.post("/verify-otp", verifyOtpLimiter, verifyOTPCode);

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Forgot Password Routes
router.post("/forgot-password/send-otp", sendOtpLimiter, sendForgotPasswordOTP);
router.post("/forgot-password/verify-otp", verifyOtpLimiter, verifyForgotPasswordOTP);
router.post("/forgot-password/reset", resetPassword);

module.exports = router;
