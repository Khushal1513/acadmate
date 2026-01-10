// config/firebase.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

let credential;

try {
  // Priority 1: Try loading from local serviceAccountKey.json in config folder
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  
  if (fs.existsSync(serviceAccountPath)) {
    console.log("📁 Loading Firebase credentials from config/serviceAccountKey.json...");
    const serviceAccount = require("./serviceAccountKey.json");
    credential = admin.credential.cert(serviceAccount);
    console.log("✅ Firebase initialized successfully from local file");
  } 
  // Priority 2: Try loading from BASE64 encoded environment variable (RECOMMENDED for production)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    console.log("🔐 Loading Firebase credentials from BASE64 environment variable...");
    
    const base64String = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(jsonString);
    
    credential = admin.credential.cert(serviceAccount);
    console.log("✅ Firebase initialized successfully from BASE64 environment variable");
  }
  // Priority 3: Try loading from regular JSON environment variable
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("🔐 Loading Firebase credentials from JSON environment variable...");
    
    let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    
    // Remove wrapping quotes if present
    if ((rawJson.startsWith('"') && rawJson.endsWith('"')) ||
        (rawJson.startsWith("'") && rawJson.endsWith("'"))) {
      rawJson = rawJson.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    rawJson = rawJson.replace(/\\n/g, '\n');
    
    const serviceAccount = JSON.parse(rawJson);
    credential = admin.credential.cert(serviceAccount);
    console.log("✅ Firebase initialized successfully from JSON environment variable");
  } 
  else {
    throw new Error(
      "❌ Firebase credentials not found!\n" +
      "For LOCAL development: Create config/serviceAccountKey.json\n" +
      "For PRODUCTION: Set FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended) or FIREBASE_SERVICE_ACCOUNT"
    );
  }
  
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
  process.exit(1);
}

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Updated default bucket to match your new Project ID: acadmate-78932
  const bucketName = process.env.FIREBASE_BUCKET || "acadmate-78932.firebasestorage.app";
  
  admin.initializeApp({
    credential: credential,
    storageBucket: bucketName,
  });
  console.log("🚀 Firebase Admin SDK initialized");
  console.log(`📦 Storage bucket: ${bucketName}`);
}

const db = admin.firestore();

db.settings({
  ignoreUndefinedProperties: true,
});

module.exports = { db, admin };