const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();

/* ================================
   MARK ATTENDANCE
================================ */
router.post("/mark", async (req, res) => {
  try {
    const {
      userId,
      subject,
      date,
      status,
      attendance = "regular"
    } = req.body;

    if (!userId || !subject || !date || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const docRef = db.collection("attendance").doc();

    await docRef.set({
      userId,
      subject,
      date,
      attendance,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   DELETE SINGLE RECORD
================================ */
router.delete("/record/:docId", async (req, res) => {
  try {
    await db.collection("attendance").doc(req.params.docId).delete();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   DELETE SUBJECT RECORDS
================================ */
router.delete("/subject/:userId/:subject", async (req, res) => {
  try {
    const { userId, subject } = req.params;

    const snap = await db
      .collection("attendance")
      .where("userId", "==", userId)
      .where("subject", "==", subject)
      .get();

    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.json({ message: "Subject cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   GET USER ATTENDANCE  (⚠️ LAST)
================================ */
router.get("/:userId", async (req, res) => {
  try {
    const snap = await db
      .collection("attendance")
      .where("userId", "==", req.params.userId)
      .get();

    res.json(
      snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
