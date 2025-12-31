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
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Unified Authentication Middleware
 * - Supports existing JWT auth
 * - Fetches user from Firestore
 * - Normalizes req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    /* ================= Verify JWT ================= */
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    /* ================= Normalize User ID ================= */
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    /* ================= Fetch User From Firestore ================= */
    let userData = null;

    try {
      const userDoc = await db.collection("users").doc(userId).get();

      if (userDoc.exists) {
        userData = userDoc.data();

        // 🔒 Account active check (from previous middleware)
        if (userData.isActive === false) {
          return res.status(401).json({
            success: false,
            message: "Account deactivated",
          });
        }
      }
    } catch (firestoreError) {
      console.error("Firestore fetch error:", firestoreError);
    }

    /* ================= Attach req.user ================= */
    req.user = {
      uid: userId,
      id: userId,
      email: userData?.email || decoded.email || null,
      username: userData?.username || decoded.username || null,
      displayName:
        userData?.displayName ||
        userData?.username ||
        decoded.username ||
        "Anonymous",
      photoURL: userData?.photoURL || null,
      role: userData?.role || decoded.role || "user",
      isActive: userData?.isActive ?? true,
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = { verifyToken };
