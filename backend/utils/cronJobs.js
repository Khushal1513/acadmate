// utils/cronJobs.js
const cron = require('node-cron');
const { sendDailyReminders } = require('../controllers/reminderController');

/**
 * Schedule daily reminders to run every day at 8:00 AM
 * Cron pattern: '0 8 * * *'
 * - minute: 0
 * - hour: 8
 * - day of month: *
 * - month: *
 * - day of week: *
 */
const scheduleDailyReminders = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('🔔 Starting scheduled daily reminders...');
    try {
      await sendDailyReminders();
      console.log('✅ Scheduled daily reminders completed');
    } catch (error) {
      console.error('❌ Error in scheduled daily reminders:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Change to your timezone
  });

  console.log('⏰ Daily reminder cron job scheduled for 8:00 AM IST');
};

// For testing: Run every minute (comment out in production)
const scheduleTestReminders = () => {
  cron.schedule('*/1 * * * *', async () => {
    console.log('🧪 Test: Running daily reminders...');
    try {
      await sendDailyReminders();
      console.log('✅ Test reminders completed');
    } catch (error) {
      console.error('❌ Error in test reminders:', error);
    }
  });

  console.log('🧪 Test mode: Reminders will run every minute');
};

module.exports = {
  scheduleDailyReminders,
  scheduleTestReminders,
};