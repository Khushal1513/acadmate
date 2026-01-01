// routes/reminderRoutes.js
const express = require('express');
const router = express.Router();

const {
  getUserReminders,
  addReminder,
  deleteReminder,
  sendReminderEmail,
  triggerDailyReminders,
} = require('../controllers/reminderController');

// Get all reminders for a user
router.get('/user/:userId', getUserReminders);

// Add a new reminder
router.post('/add', addReminder);

// Delete a reminder
router.delete('/:eventId', deleteReminder);

// Send a manual reminder email
router.post('/send', sendReminderEmail);

// Manually trigger daily reminders (for testing)
router.post('/trigger-daily', triggerDailyReminders);

module.exports = router;