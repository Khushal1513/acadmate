// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");

// ✅ REGISTER
exports.register = async (req, res) => {
  try {
    const { username, usn, email, password, phone, branch, section } = req.body;

    // Check if user already exists
    const existingUser = await db.collection("users").where("email", "==", email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userRef = await db.collection("users").add({
      username,
      usn,
      email,
      password: hashedPassword,
      phone,
      branch,
      section,
      subjects: [], // Initialize empty subjects array for attendance
      createdAt: new Date().toISOString(),
    });

    const newUser = await userRef.get();
    const userData = newUser.data();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        username: userData.username,
        usn: userData.usn,
        email: userData.email,
        phone: userData.phone,
        branch: userData.branch,
        section: userData.section,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const snapshot = await db.collection("users").where("email", "==", email).get();
    
    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: userDoc.id, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("✅ Login successful for user:", userDoc.id);
    console.log("✅ Cookie set with token");

    // Return user data
    res.status(200).json({
      message: "Login successful",
      user: {
        id: userDoc.id,
        username: userData.username,
        usn: userData.usn,
        email: userData.email,
        phone: userData.phone,
        branch: userData.branch,
        section: userData.section,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};