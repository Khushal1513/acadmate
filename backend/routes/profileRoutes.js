const express = require("express");
const { getUserProfile } = require("../controllers/profileController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ✅ Get logged-in user's profile
router.get("/", authMiddleware, getUserProfile);
router.get("/:id", verifyToken, getUserProfile);

module.exports = router;