const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("broadcasts")
      .orderBy("timestamp", "asc")
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(messages);
  } catch (err) {
    console.error("Error fetching senior broadcasts:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { text, email } = req.body;

    if (!text || !email) {
      return res.status(400).json({ error: "Missing text or email" });
    }

    const bannedWords = ["none", "nothing"];
    if (bannedWords.some((w) => text.toLowerCase().includes(w))) {
      return res.status(403).json({ error: "Inappropriate language detected" });
    }

    const docRef = await db.collection("broadcasts").add({
      text,
      email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      id: docRef.id,
      message: "Broadcast message sent successfully",
    });
  } catch (err) {
    console.error("Error sending senior broadcast:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
