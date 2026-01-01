// controllers/reminderController.js
const { db } = require("../config/firebase");
const { sendEmail } = require("../utils/sendEmail");

/* =========================
   HELPER: Create Beautiful Email HTML
========================= */
const createEmailHTML = (type, data) => {
  const { title, date, daysUntil, userName } = data;
  
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      margin: 0;
    }
    .email-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 3s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    .header-content { position: relative; z-index: 1; }
    .icon { 
      font-size: 64px;
      margin-bottom: 20px;
      display: inline-block;
      animation: bounce 2s ease-in-out infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .header h1 { 
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
      letter-spacing: -0.5px;
    }
    .header p {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      margin-top: 10px;
    }
    .content { 
      padding: 50px 40px;
      background: #ffffff;
    }
    .greeting { 
      font-size: 20px;
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .message { 
      color: #4a5568;
      font-size: 16px;
      line-height: 1.8;
      margin: 15px 0;
    }
    .event-card { 
      background: linear-gradient(135deg, #f8f9ff 0%, #e8eaf6 100%);
      border-left: 5px solid #667eea;
      padding: 30px;
      border-radius: 15px;
      margin: 30px 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
      transition: transform 0.3s ease;
    }
    .event-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
    }
    .event-title { 
      font-size: 26px;
      color: #1a202c;
      font-weight: 700;
      margin: 0 0 15px 0;
      line-height: 1.3;
    }
    .event-date { 
      color: #667eea;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .countdown-container {
      margin: 40px 0;
      text-align: center;
    }
    .countdown { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      position: relative;
      overflow: hidden;
    }
    .countdown::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%);
    }
    .countdown-content { position: relative; z-index: 1; }
    .countdown-number { 
      font-size: 72px;
      font-weight: 800;
      margin: 15px 0;
      text-shadow: 0 4px 10px rgba(0,0,0,0.2);
      line-height: 1;
    }
    .countdown-text { 
      font-size: 20px;
      font-weight: 500;
      opacity: 0.95;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .badge-container {
      margin-top: 15px;
    }
    .badge { 
      display: inline-block;
      background: rgba(102, 126, 234, 0.15);
      color: #667eea;
      padding: 8px 18px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }
    .footer { 
      background: linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
      padding: 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-logo {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 15px;
    }
    .footer p { 
      color: #718096;
      font-size: 14px;
      margin: 8px 0;
      line-height: 1.6;
    }
    .footer-links {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .footer-link {
      color: #667eea;
      text-decoration: none;
      margin: 0 10px;
      font-size: 13px;
    }
    .urgent { 
      background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
      border-left-color: #fc8181;
      animation: urgentPulse 2s ease-in-out infinite;
    }
    @keyframes urgentPulse {
      0%, 100% { box-shadow: 0 4px 15px rgba(252, 129, 129, 0.1); }
      50% { box-shadow: 0 6px 25px rgba(252, 129, 129, 0.3); }
    }
    .urgent .event-date { color: #fc8181; }
    .urgent .badge { 
      background: rgba(252, 129, 129, 0.15);
      color: #fc8181;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 30px 0;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fef5e7 0%, #fcf3cf 100%);
      border-left: 4px solid #f39c12;
      padding: 20px;
      border-radius: 10px;
      margin: 25px 0;
    }
    .emoji-large {
      font-size: 48px;
      margin: 20px 0;
    }
  `;

  let html = '';

  switch(type) {
    case 'added':
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Added Successfully</title>
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="header-content">
                  <div class="icon">✨</div>
                  <h1>Event Successfully Added!</h1>
                  <p>We've got you covered</p>
                </div>
              </div>
              <div class="content">
                <div class="greeting">Hello ${userName || 'there'}! 👋</div>
                
                <p class="message">Great news! Your event has been successfully added to <strong>EventBuddy</strong>. We'll make sure you never miss it with our daily reminder system.</p>
                
                <div class="event-card">
                  <h2 class="event-title">${title}</h2>
                  <div class="event-date">
                    <span>📅</span>
                    <span>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div class="badge-container">
                    <span class="badge">${data.type || 'Event'}</span>
                  </div>
                </div>

                <div class="highlight-box">
                  <p class="message" style="margin: 0;"><strong>📬 Daily Reminders Activated</strong><br>
                  You'll receive personalized reminders every day leading up to your event. Stay organized effortlessly!</p>
                </div>

                <div class="divider"></div>

                <p class="message" style="text-align: center; color: #2d3748; font-size: 18px;">
                  <strong>Your success is our priority! 🎯</strong>
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">EventBuddy</div>
                <p>Your Personal Event Management System</p>
                <p style="font-size: 12px; color: #a0aec0; margin-top: 15px;">
                  You're receiving this because you added an event in EventBuddy.<br>
                  Keep track of your important dates with ease!
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    case 'today':
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Today's Event</title>
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="header-content">
                  <div class="icon">🔔</div>
                  <h1>Today's The Day!</h1>
                  <p>Your event is happening now</p>
                </div>
              </div>
              <div class="content">
                <div class="greeting">Hello ${userName || 'there'}! 👋</div>
                
                <div class="emoji-large" style="text-align: center;">🎯</div>
                
                <p class="message" style="text-align: center; font-size: 18px; color: #2d3748;">
                  <strong>This is it! Your event is scheduled for TODAY!</strong>
                </p>
                
                <div class="event-card urgent">
                  <h2 class="event-title">${title}</h2>
                  <div class="event-date">
                    <span>📅</span>
                    <span>TODAY - ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div class="badge-container">
                    <span class="badge">🔥 Happening Today</span>
                  </div>
                </div>

                <div class="highlight-box">
                  <p class="message" style="margin: 0; text-align: center;">
                    <strong>Final Checklist:</strong><br>
                    ✓ Double-check your preparations<br>
                    ✓ Review any materials you need<br>
                    ✓ Stay confident and focused
                  </p>
                </div>

                <div class="divider"></div>

                <p class="message" style="text-align: center; font-size: 20px; color: #2d3748;">
                  <strong>You've got this! 💪</strong><br>
                  <span style="font-size: 16px; color: #4a5568;">Go out there and crush it! 🌟</span>
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">EventBuddy</div>
                <p>Wishing you all the best today!</p>
                <p style="font-size: 12px; color: #a0aec0; margin-top: 15px;">
                  Good luck with your event! 🍀
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    case 'upcoming':
      const isUrgent = daysUntil <= 3;
      const motivationalMessage = daysUntil === 1 
        ? "Tomorrow's the big day! Final preparations time! 🎯" 
        : daysUntil <= 3
          ? "Your event is just around the corner. Time to get ready! 📝"
          : "Keep this on your radar. You have plenty of time to prepare! 📌";
      
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Reminder</title>
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="header-content">
                  <div class="icon">⏰</div>
                  <h1>Upcoming Event Reminder</h1>
                  <p>Stay on track with your schedule</p>
                </div>
              </div>
              <div class="content">
                <div class="greeting">Hello ${userName || 'there'}! 👋</div>
                
                <p class="message">This is your friendly reminder about an upcoming event. Make sure you're prepared and ready!</p>
                
                <div class="event-card ${isUrgent ? 'urgent' : ''}">
                  <h2 class="event-title">${title}</h2>
                  <div class="event-date">
                    <span>📅</span>
                    <span>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div class="badge-container">
                    <span class="badge">${data.type || 'Event'}</span>
                  </div>
                </div>

                <div class="countdown-container">
                  <div class="countdown">
                    <div class="countdown-content">
                      <div class="countdown-number">${daysUntil}</div>
                      <div class="countdown-text">Day${daysUntil > 1 ? 's' : ''} Remaining</div>
                    </div>
                  </div>
                </div>

                <div class="highlight-box">
                  <p class="message" style="margin: 0; text-align: center;">
                    <strong>${motivationalMessage}</strong>
                  </p>
                </div>

                <div class="divider"></div>

                <p class="message" style="text-align: center; color: #4a5568;">
                  We'll continue to remind you daily until your event. Stay focused and prepared! 🎯
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">EventBuddy</div>
                <p>Your Personal Event Management System</p>
                <p style="font-size: 12px; color: #a0aec0; margin-top: 15px;">
                  Daily reminders will continue until your event date.<br>
                  You've got ${daysUntil} day${daysUntil > 1 ? 's' : ''} to prepare!
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    default:
      html = `<p>${data.text || 'Reminder from EventBuddy'}</p>`;
  }

  return html;
};

/* =========================
   GET USER REMINDERS
========================= */
const getUserReminders = async (req, res) => {
  console.log("📅 getUserReminders called");

  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const snapshot = await db
      .collection("events")
      .where("userId", "==", userId)
      .get();

    const reminders = [];
    const batch = db.batch();
    let hasDeletes = false;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (data.date < todayStr) {
        batch.delete(doc.ref);
        hasDeletes = true;
        console.log(`🗑️ Marking past event for deletion: ${data.title}`);
      } else {
        reminders.push({
          id: doc.id,
          ...data,
        });
      }
    }

    if (hasDeletes) {
      await batch.commit();
      console.log("✅ Past events deleted");
    }

    res.status(200).json({ events: reminders });
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    res.status(500).json({
      message: "Error fetching reminders",
      error: error.message,
    });
  }
};

/* =========================
   ADD REMINDER
========================= */
const addReminder = async (req, res) => {
  console.log("➕ addReminder called");

  try {
    const { userId, email, title, date, type, userName } = req.body;

    if (!userId || !email || !title || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date + "T00:00:00");
    
    if (eventDate < today) {
      return res.status(400).json({ 
        message: "Event date must be today or in the future" 
      });
    }

    const docRef = await db.collection("events").add({
      userId,
      email,
      userName: userName || null,
      title,
      date,
      type: type || "event",
      createdAt: new Date().toISOString(),
      lastReminderSent: null,
    });

    const newDoc = await docRef.get();
    const eventData = { id: newDoc.id, ...newDoc.data() };

    // Send beautiful confirmation email
    const htmlContent = createEmailHTML('added', {
      title,
      date,
      type: type || 'event',
      userName: userName || 'there'
    });

    sendEmail({
      to: email,
      subject: `✨ Event Added: ${title}`,
      html: htmlContent,
    }).catch((err) => console.error("Email error:", err));

    res.status(200).json(eventData);
  } catch (error) {
    console.error("❌ Error adding reminder:", error);
    res.status(500).json({
      message: "Failed to add reminder",
      error: error.message,
    });
  }
};

/* =========================
   DELETE REMINDER
========================= */
const deleteReminder = async (req, res) => {
  console.log("🗑️ deleteReminder called");

  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ message: "Missing eventId" });
    }

    await db.collection("events").doc(eventId).delete();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting reminder:", error);
    res.status(500).json({
      message: "Failed to delete reminder",
      error: error.message,
    });
  }
};

/* =========================
   SEND REMINDER EMAIL
========================= */
const sendReminderEmail = async (req, res) => {
  try {
    const { email, eventTitle, eventDate, daysUntil, userName, type } = req.body;

    if (!email || !eventTitle || !eventDate) {
      return res.status(400).json({ message: "Missing email fields" });
    }

    const emailType = daysUntil === 0 ? 'today' : 'upcoming';
    const htmlContent = createEmailHTML(emailType, {
      title: eventTitle,
      date: eventDate,
      daysUntil: daysUntil || 0,
      userName: userName || 'there',
      type: type || 'event'
    });

    const subject = daysUntil === 0 
      ? `🔔 TODAY: ${eventTitle}`
      : `⏰ Reminder: ${eventTitle} - ${daysUntil} day${daysUntil > 1 ? 's' : ''} left`;

    await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });

    res.json({ success: true, message: "Reminder email sent" });
  } catch (error) {
    console.error("❌ Error sending reminder email:", error);
    res.status(500).json({
      message: "Failed to send reminder email",
      error: error.message,
    });
  }
};

/* =========================
   DAILY REMINDER CRON JOB
========================= */
const sendDailyReminders = async () => {
  console.log("⏰ Running daily reminder check...");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const snapshot = await db.collection("events").get();
    const batch = db.batch();
    let emailsSent = 0;
    let eventsDeleted = 0;

    for (const doc of snapshot.docs) {
      const event = doc.data();
      const eventDate = new Date(event.date + "T00:00:00");

      // Delete past events
      if (event.date < todayStr) {
        batch.delete(doc.ref);
        eventsDeleted++;
        console.log(`🗑️ Deleting past event: ${event.title}`);
        continue;
      }

      // Send reminder for upcoming events
      if (event.date >= todayStr) {
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        if (!event.lastReminderSent || event.lastReminderSent !== todayStr) {
          const emailType = daysUntil === 0 ? 'today' : 'upcoming';
          const subject = daysUntil === 0 
            ? `🔔 TODAY: ${event.title}`
            : `⏰ Reminder: ${event.title} - ${daysUntil} day${daysUntil > 1 ? 's' : ''} left`;

          const htmlContent = createEmailHTML(emailType, {
            title: event.title,
            date: event.date,
            daysUntil,
            userName: event.userName || 'there',
            type: event.type || 'event'
          });

          await sendEmail({
            to: event.email,
            subject,
            html: htmlContent,
          }).catch(err => console.error(`Email failed for ${event.email}:`, err));

          batch.update(doc.ref, { lastReminderSent: todayStr });
          emailsSent++;
          console.log(`📧 Sent reminder for: ${event.title} to ${event.email}`);
        }
      }
    }

    if (emailsSent > 0 || eventsDeleted > 0) {
      await batch.commit();
    }

    console.log(`✅ Daily reminders complete. Emails sent: ${emailsSent}, Events deleted: ${eventsDeleted}`);
    return { emailsSent, eventsDeleted };
  } catch (error) {
    console.error("❌ Error in daily reminders:", error);
    throw error;
  }
};

/* =========================
   MANUAL TRIGGER FOR DAILY REMINDERS
========================= */
const triggerDailyReminders = async (req, res) => {
  try {
    const result = await sendDailyReminders();
    res.status(200).json({
      message: "Daily reminders executed successfully",
      ...result,
    });
  } catch (error) {
    console.error("❌ Error triggering daily reminders:", error);
    res.status(500).json({
      message: "Failed to execute daily reminders",
      error: error.message,
    });
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  getUserReminders,
  addReminder,
  deleteReminder,
  sendReminderEmail,
  sendDailyReminders,
  triggerDailyReminders,
};