// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    req.user = {
      id: userDoc.id,
      username: userData.username,
      usn: userData.usn,
      branch: userData.branch,
      section: userData.section,
      email: userData.email,
      phone: userData.phone,
    };

    // ✅ CRITICAL: Call next() to continue to the route handler
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ 
      message: "Invalid or expired token",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};