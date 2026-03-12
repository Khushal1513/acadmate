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
      padding: 0; margin: 0;
    }
    .email-wrapper { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; min-height: 100vh; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center; position: relative; overflow: hidden; }
    .header-content { position: relative; z-index: 1; }
    .icon { font-size: 64px; margin-bottom: 20px; display: inline-block; }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 10px; }
    .content { padding: 50px 40px; background: #ffffff; }
    .greeting { font-size: 20px; color: #2d3748; font-weight: 600; margin-bottom: 20px; }
    .message { color: #4a5568; font-size: 16px; line-height: 1.8; margin: 15px 0; }
    .event-card { background: linear-gradient(135deg, #f8f9ff 0%, #e8eaf6 100%); border-left: 5px solid #667eea; padding: 30px; border-radius: 15px; margin: 30px 0; box-shadow: 0 4px 15px rgba(102,126,234,0.1); }
    .event-title { font-size: 26px; color: #1a202c; font-weight: 700; margin: 0 0 15px 0; }
    .event-date { color: #667eea; font-size: 18px; font-weight: 600; }
    .badge { display: inline-block; background: rgba(102,126,234,0.15); color: #667eea; padding: 8px 18px; border-radius: 25px; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-top: 15px; }
    .days-badge { display: inline-block; background: #ff6b6b; color: white; padding: 12px 24px; border-radius: 30px; font-size: 20px; font-weight: 700; margin: 20px 0; }
    .footer { background: linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%); padding: 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer-logo { font-size: 24px; font-weight: 700; color: #667eea; margin-bottom: 15px; }
    .footer p { color: #718096; font-size: 14px; margin: 8px 0; }
  `;

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  switch (type) {
    case 'added':
      return `
        <!DOCTYPE html><html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Added</title><style>${baseStyles}</style></head>
        <body><div class="email-wrapper"><div class="container">
          <div class="header"><div class="header-content">
            <div class="icon">✨</div>
            <h1>Event Successfully Added!</h1>
            <p>We've got you covered</p>
          </div></div>
          <div class="content">
            <div class="greeting">Hello ${userName || 'there'}! 👋</div>
            <p class="message">Your event has been added to <strong>AcadMate</strong>. We'll send you reminders to keep you on track!</p>
            <div class="event-card">
              <h2 class="event-title">${title}</h2>
              <div class="event-date">📅 ${formattedDate}</div>
              <span class="badge">${data.type || 'Event'}</span>
            </div>
            <p class="message" style="text-align:center;">
              ${data.reminderFrequency === 'daily'
                ? '📬 You will receive daily reminders until your event.'
                : '📬 You will receive weekly reminders. Within 7 days, reminders automatically become daily!'}
            </p>
          </div>
          <div class="footer"><div class="footer-logo">AcadMate</div><p>Your Personal Academic Companion</p></div>
        </div></div></body></html>
      `;

    case 'today':
      return `
        <!DOCTYPE html><html lang="en">
        <head><meta charset="UTF-8"><style>${baseStyles}</style></head>
        <body><div class="email-wrapper"><div class="container">
          <div class="header"><div class="header-content">
            <div class="icon">🔔</div>
            <h1>It's Today!</h1>
            <p>Your event is happening right now</p>
          </div></div>
          <div class="content">
            <div class="greeting">Hello ${userName || 'there'}! 👋</div>
            <p class="message">This is your final reminder — your event is <strong>TODAY</strong>!</p>
            <div class="event-card">
              <h2 class="event-title">${title}</h2>
              <div class="event-date">📅 ${formattedDate}</div>
              <span class="badge">${data.type || 'Event'}</span>
            </div>
            <p class="message" style="text-align:center;">Good luck! You've got this 💪</p>
          </div>
          <div class="footer"><div class="footer-logo">AcadMate</div><p>Your Personal Academic Companion</p></div>
        </div></div></body></html>
      `;

    case 'upcoming':
      return `
        <!DOCTYPE html><html lang="en">
        <head><meta charset="UTF-8"><style>${baseStyles}</style></head>
        <body><div class="email-wrapper"><div class="container">
          <div class="header"><div class="header-content">
            <div class="icon">⏰</div>
            <h1>Upcoming Event Reminder</h1>
            <p>Don't forget!</p>
          </div></div>
          <div class="content">
            <div class="greeting">Hello ${userName || 'there'}! 👋</div>
            <p class="message">Just a reminder that you have an upcoming event:</p>
            <div class="event-card">
              <h2 class="event-title">${title}</h2>
              <div class="event-date">📅 ${formattedDate}</div>
              <span class="badge">${data.type || 'Event'}</span>
            </div>
            <div style="text-align:center;">
              <span class="days-badge">${daysUntil} day${daysUntil !== 1 ? 's' : ''} to go!</span>
            </div>
            <p class="message" style="text-align:center;">Stay prepared and you'll do great! 🌟</p>
          </div>
          <div class="footer"><div class="footer-logo">AcadMate</div><p>Your Personal Academic Companion</p></div>
        </div></div></body></html>
      `;

    default:
      return `<p>${data.text || 'Reminder from AcadMate'}</p>`;
  }
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

    const userDocRef = db.collection("events").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(200).json({ events: [] });
    }

    const allEvents = userDoc.data().events || {};
    const reminders = [];
    const toDelete = [];

    for (const [eventId, eventData] of Object.entries(allEvents)) {
      if (eventData.date < todayStr) {
        toDelete.push(eventId);
        console.log(`🗑️ Marking past event for deletion: ${eventData.title}`);
      } else {
        reminders.push({ id: eventId, ...eventData });
      }
    }

    // Remove past events from the document
    if (toDelete.length > 0) {
      const updatedEvents = { ...allEvents };
      toDelete.forEach(id => delete updatedEvents[id]);
      await userDocRef.update({ events: updatedEvents });
      console.log(`✅ Deleted ${toDelete.length} past event(s)`);
    }

    res.status(200).json({ events: reminders });
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    res.status(500).json({ message: "Error fetching reminders", error: error.message });
  }
};

/* =========================
   ADD REMINDER
========================= */
const addReminder = async (req, res) => {
  console.log("➕ addReminder called");
  console.log("📦 Request body:", req.body);

  try {
    const { userId, email, title, date, type, userName, reminderFrequency } = req.body;

    // Validation
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    if (!email)  return res.status(400).json({ message: "Missing email" });
    if (!title)  return res.status(400).json({ message: "Missing title" });
    if (!date)   return res.status(400).json({ message: "Missing date" });

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date + "T00:00:00");

    if (eventDate < today) {
      return res.status(400).json({ message: "Event date must be today or in the future" });
    }

    console.log("✅ Validation passed, adding to Firestore...");

    // Generate unique event ID without creating a document
    const docId = db.collection("events").doc().id;

    const newEvent = {
      title,
      date,
      email,
      userName: userName || null,
      type: type || "Assignment",
      reminderFrequency: reminderFrequency || "weekly",
      createdAt: new Date().toISOString(),
      lastReminderSent: null,
    };

    // Store inside user's document (one doc per user)
    const userDocRef = db.collection("events").doc(userId);
    await userDocRef.set(
      { events: { [docId]: newEvent } },
      { merge: true }
    );

    console.log("✅ Event added to Firestore with ID:", docId);

    // Send confirmation email (non-blocking)
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

    res.status(200).json({ id: docId, userId, ...newEvent });
  } catch (error) {
    console.error("❌ Error adding reminder:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ message: "Failed to add reminder", error: error.message });
  }
};

/* =========================
   DELETE REMINDER
========================= */
const deleteReminder = async (req, res) => {
  console.log("🗑️ deleteReminder called");

  try {
    const { userId, eventId } = req.params;

    if (!userId || !eventId) {
      return res.status(400).json({ message: "Missing userId or eventId" });
    }

    const userDocRef = db.collection("events").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const allEvents = userDoc.data().events || {};

    if (!allEvents[eventId]) {
      return res.status(404).json({ message: "Event not found" });
    }

    delete allEvents[eventId];
    await userDocRef.update({ events: allEvents });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting reminder:", error);
    res.status(500).json({ message: "Failed to delete reminder", error: error.message });
  }
};

/* =========================
   SMART REMINDER LOGIC
========================= */
const shouldSendReminder = (event, today) => {
  const eventDate = new Date(event.date + "T00:00:00");
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  // Always remind within 7 days
  if (daysUntil <= 7) return true;

  // Daily frequency
  if (event.reminderFrequency === 'daily') return true;

  // Weekly frequency — send on Monday or if 7+ days since last reminder
  if (event.reminderFrequency === 'weekly') {
    if (!event.lastReminderSent) return true;
    const lastSent = new Date(event.lastReminderSent);
    const daysSinceLast = Math.floor((today - lastSent) / (1000 * 60 * 60 * 24));
    return daysSinceLast >= 7;
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
    let emailsSent = 0;
    let eventsDeleted = 0;

    for (const doc of snapshot.docs) {
      const userId = doc.id;
      const allEvents = doc.data().events || {};
      const updatedEvents = { ...allEvents };
      let docModified = false;

      for (const [eventId, event] of Object.entries(allEvents)) {
        // Delete past events
        if (event.date < todayStr) {
          delete updatedEvents[eventId];
          eventsDeleted++;
          docModified = true;
          console.log(`🗑️ Deleting past event: ${event.title}`);
          continue;
        }

        // Skip if already reminded today
        if (event.lastReminderSent === todayStr) continue;

        if (shouldSendReminder(event, today)) {
          const eventDate = new Date(event.date + "T00:00:00");
          const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
          const emailType = daysUntil === 0 ? 'today' : 'upcoming';

          const subject = daysUntil === 0
            ? `🔔 TODAY: ${event.title}`
            : `⏰ Reminder: ${event.title} — ${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`;

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

          updatedEvents[eventId] = { ...event, lastReminderSent: todayStr };
          emailsSent++;
          docModified = true;

          console.log(`📧 Sent reminder: "${event.title}" to ${event.email} (${daysUntil} days left)`);
        }
      }

      if (docModified) {
        await doc.ref.update({ events: updatedEvents });
      }
    }

    console.log(`✅ Done. Emails sent: ${emailsSent}, Events deleted: ${eventsDeleted}`);
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
      return res.status(400).json({ message: "Missing required fields" });
    }

    // FIX: coerce to number to avoid "0" === 0 being false
    const daysNum = Number(daysUntil) || 0;
    const emailType = daysNum === 0 ? 'today' : 'upcoming';

    const htmlContent = createEmailHTML(emailType, {
      title: eventTitle,
      date: eventDate,
      daysUntil: daysNum,
      userName: userName || 'there',
      type: type || 'event'
    });

    const subject = daysNum === 0
      ? `🔔 TODAY: ${eventTitle}`
      : `⏰ Reminder: ${eventTitle} — ${daysNum} day${daysNum !== 1 ? 's' : ''} left`;

    await sendEmail({ to: email, subject, html: htmlContent });

    res.json({ success: true, message: "Reminder email sent" });
  } catch (error) {
    console.error("❌ Error sending reminder email:", error);
    res.status(500).json({ message: "Failed to send reminder email", error: error.message });
  }
};

/* =========================
   MANUAL TRIGGER FOR REMINDERS
========================= */
const triggerDailyReminders = async (req, res) => {
  try {
    const result = await sendDailyReminders();
    res.status(200).json({ message: "Reminders executed successfully", ...result });
  } catch (error) {
    console.error("❌ Error triggering reminders:", error);
    res.status(500).json({ message: "Failed to execute reminders", error: error.message });
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