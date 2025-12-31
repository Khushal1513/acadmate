const express = require("express");
const { getUserProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get logged-in user's profile
router.get("/", authMiddleware, getUserProfile);

module.exports = router;
