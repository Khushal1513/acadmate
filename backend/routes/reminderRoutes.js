// routes/reminderRoutes.js
const express = require("express");
const {
  addReminder,
  getUserReminders,
  deleteEvent,
} = require("../controllers/reminderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// create reminder (takes userId from body)
router.post("/add", authMiddleware, addReminder);

// get reminders for a specific user
router.get("/user/:userId", authMiddleware, getUserReminders);

// delete by id
router.delete("/:eventId", authMiddleware, deleteEvent);

module.exports = router;
