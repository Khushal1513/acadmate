// controllers/reminderController.js
//ifhgiofeh
const { db } = require("../config/firebase");
const { sendEmail } = require("../utils/sendEmail");

// 📅 Fetch all events for a specific user
exports.getUserReminders = async (req, res) => {
  console.log('📅 getUserReminders called');
  console.log('   userId from params:', req.params.userId);
  console.log('   authenticated user:', req.user);
  
  try {
    const { userId } = req.params;
    if (!userId) {
      console.log('❌ Missing userId parameter');
      return res.status(400).json({ message: "Missing userId" });
    }

    console.log('🔍 Querying Firestore for events with userId:', userId);
    const snapshot = await db
      .collection("events")
      .where("userId", "==", userId)
      .get();

    const reminders = [];
    snapshot.forEach((doc) => {
      reminders.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Found ${reminders.length} events for user ${userId}`);
    res.status(200).json({ events: reminders });
  } catch (error) {
    console.error('❌ Error fetching reminders:', error);
    res.status(500).json({ 
      message: "Error fetching reminders",
      error: error.message 
    });
  }
};

// ➕ Add a new event/reminder
exports.addReminder = async (req, res) => {
  console.log('➕ addReminder called');
  console.log('   Request body:', req.body);
  
  try {
    const { userId, email, title, date, type } = req.body;

    if (!userId || !email || !title || !date) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: "Missing required fields" });
    }

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

    console.log('✅ Event created:', eventData.id);

    // Send email (don't await to avoid blocking)
    sendEmail({
      to: email,
      subject: `New Event Added: ${title}`,
      text: `You added a new ${type || "event"} "${title}" scheduled for ${date}.`,
    }).catch(err => console.error('Email send failed:', err));

    res.status(200).json(eventData);
  } catch (error) {
    console.error('❌ Error adding reminder:', error);
    res.status(500).json({ 
      message: "Failed to add reminder", 
      error: error.message 
    });
  }
};

// 🗑️ Delete an event by ID
exports.deleteEvent = async (req, res) => {
  console.log('🗑️ deleteEvent called');
  console.log('   eventId:', req.params.eventId);
  
  try {
    const { eventId } = req.params;
    if (!eventId) {
      console.log('❌ Missing event ID');
      return res.status(400).json({ message: "Missing event ID" });
    }

    await db.collection("events").doc(eventId).delete();
    console.log('✅ Event deleted:', eventId);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({ 
      message: "Failed to delete event", 
      error: error.message 
    });
  }
};