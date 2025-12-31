// backend/controllers/profileController.js
const { db } = require("../config/firebase");

const getUserProfile = async (req, res) => {
  try {
    // ✅ user already verified by authMiddleware
    const userId = req.user.id;

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = userDoc.data();

    res.json({
      user: {
        id: userDoc.id,
        username: data.username,
        usn: data.usn,
        branch: data.branch,
        section: data.section,
        email: data.email,
        phone: data.phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

module.exports = { getUserProfile };
