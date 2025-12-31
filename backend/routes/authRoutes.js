// routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");
const { registerValidation, loginValidation } = require("../utils/validation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      usn: req.user.usn,
      branch: req.user.branch,
      section: req.user.section,
      email: req.user.email,
      phone: req.user.phone,
    },
  });
});

// ✅ Single logout route (no duplicate)
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
