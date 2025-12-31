// controllers/reminderController.js
//ifhgiofeh
const { db } = require("../config/firebase");
const { sendEmail } = require("../utils/sendEmail");

// ➕ Add a new event/reminder
exports.addReminder = async (req, res) => {
  try {
    const { userId, email, title, date, type } = req.body;

    if (!userId || !email || !title || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Add to Firestore
    const docRef = await db.collection("events").add({
      userId,
      email,
      title,
      date,
      type: type || "event",
      createdAt: new Date().toISOString(),
    });

    const newEvent = await docRef.get();
    const eventData = { id: newEvent.id, ...newEvent.data() };

    // 📨 Send email immediately on event creation
    await sendEmail({
      to: email,
      subject: `New Event Added: ${title}`,
      text: `You added a new ${type || "event"} "${title}" scheduled for ${date}.`,
    });

    res.status(200).json(eventData);
  } catch (error) {
    console.error("❌ Error adding reminder:", error);
    res.status(500).json({ message: "Failed to add reminder", error: error.message });
  }
};

// 🗑️ Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: "Missing event ID" });

    await db.collection("events").doc(eventId).delete();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

// 📅 Fetch all events for a specific user
exports.getUserReminders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const snapshot = await db.collection("events").where("userId", "==", userId).get();
    const reminders = [];
    snapshot.forEach((doc) => reminders.push({ id: doc.id, ...doc.data() }));

    res.status(200).json({ events: reminders });
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    res.status(500).json({ message: "Error fetching reminders" });
  }
};
