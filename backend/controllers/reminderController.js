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
      margin-top: 15px;
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
                
                <p class="message">Great news! Your event has been successfully added to <strong>EventBuddy</strong>. We'll send you reminders to keep you on track!</p>
                
                <div class="event-card">
                  <h2 class="event-title">${title}</h2>
                  <div class="event-date">
                    <span>📅</span>
                    <span>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <span class="badge">${data.type || 'Event'}</span>
                </div>

                <p class="message" style="text-align: center;">
                  ${data.reminderFrequency === 'daily' 
                    ? '📬 You will receive daily reminders until your event.'
                    : '📬 You will receive weekly reminders. When your event is within 7 days, reminders will automatically become daily!'}
                </p>
              </div>
              <div class="footer">
                <div class="footer-logo">EventBuddy</div>
                <p>Your Personal Event Management System</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    case 'today':
    case 'upcoming':
      // Similar structure for other cases...
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="header-content">
                  <h1>Event Reminder</h1>
                </div>
              </div>
              <div class="content">
                <p class="message">${title} - ${date}</p>
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
   ADD REMINDER - FIXED VERSION
========================= */
const addReminder = async (req, res) => {
  console.log("➕ addReminder called");
  console.log("📦 Request body:", req.body);

  try {
    const { userId, email, title, date, type, userName, reminderFrequency } = req.body;

    // Validation
    if (!userId) {
      console.error("❌ Missing userId");
      return res.status(400).json({ message: "Missing userId" });
    }
    if (!email) {
      console.error("❌ Missing email");
      return res.status(400).json({ message: "Missing email" });
    }
    if (!title) {
      console.error("❌ Missing title");
      return res.status(400).json({ message: "Missing title" });
    }
    if (!date) {
      console.error("❌ Missing date");
      return res.status(400).json({ message: "Missing date" });
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date + "T00:00:00");
    
    if (eventDate < today) {
      console.error("❌ Event date is in the past");
      return res.status(400).json({ 
        message: "Event date must be today or in the future" 
      });
    }

    console.log("✅ Validation passed, adding to Firestore...");

    // Add to Firestore
    const docRef = await db.collection("events").add({
      userId,
      email,
      userName: userName || null,
      title,
      date,
      type: type || "Assignment",
      reminderFrequency: reminderFrequency || "weekly",
      createdAt: new Date().toISOString(),
      lastReminderSent: null,
    });

    console.log("✅ Event added to Firestore with ID:", docRef.id);

    const newDoc = await docRef.get();
    const eventData = { id: newDoc.id, ...newDoc.data() };

    // Send confirmation email (async, don't wait)
    const htmlContent = createEmailHTML('added', {
      title,
      date,
      type: type || 'Assignment',
      userName: userName || 'there',
      reminderFrequency: reminderFrequency || 'weekly'
    });

    sendEmail({
      to: email,
      subject: `✨ Event Added: ${title}`,
      html: htmlContent,
    }).then(() => {
      console.log("✅ Confirmation email sent");
    }).catch((err) => {
      console.error("⚠️ Email error (non-critical):", err.message);
    });

    console.log("✅ Returning success response");
    res.status(200).json(eventData);
  } catch (error) {
    console.error("❌ Error adding reminder:", error);
    console.error("❌ Error stack:", error.stack);
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
   SMART REMINDER LOGIC
========================= */
const shouldSendReminder = (event, today, todayStr) => {
  const eventDate = new Date(event.date + "T00:00:00");
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntil <= 7) {
    return true;
  }
  
  if (event.reminderFrequency === 'daily') {
    return true;
  }
  
  if (event.reminderFrequency === 'weekly') {
    const dayOfWeek = today.getDay();
    return dayOfWeek === 1 || !event.lastReminderSent || 
           (new Date(event.lastReminderSent).getTime() + (7 * 24 * 60 * 60 * 1000)) <= today.getTime();
  }
  
  return false;
};

/* =========================
   DAILY REMINDER CRON JOB
========================= */
const sendDailyReminders = async () => {
  console.log("⏰ Running reminder check...");

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

      if (event.date < todayStr) {
        batch.delete(doc.ref);
        eventsDeleted++;
        console.log(`🗑️ Deleting past event: ${event.title}`);
        continue;
      }

      if (event.date >= todayStr) {
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        if (shouldSendReminder(event, today, todayStr)) {
          if (event.lastReminderSent === todayStr) {
            continue;
          }
          
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
          
          console.log(`📧 Sent reminder for: ${event.title} to ${event.email} (${daysUntil} days until)`);
        }
      }
    }

    if (emailsSent > 0 || eventsDeleted > 0) {
      await batch.commit();
    }

    console.log(`✅ Reminder check complete. Emails sent: ${emailsSent}, Events deleted: ${eventsDeleted}`);
    return { emailsSent, eventsDeleted };
  } catch (error) {
    console.error("❌ Error in reminder check:", error);
    throw error;
  }
};

/* =========================
   SEND REMINDER EMAIL (Manual)
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
   MANUAL TRIGGER FOR REMINDERS
========================= */
const triggerDailyReminders = async (req, res) => {
  try {
    const result = await sendDailyReminders();
    res.status(200).json({
      message: "Reminders executed successfully",
      ...result,
    });
  } catch (error) {
    console.error("❌ Error triggering reminders:", error);
    res.status(500).json({
      message: "Failed to execute reminders",
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