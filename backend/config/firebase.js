const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

let credential;

try {
  // Priority 1: Local file (Development)
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  
  if (fs.existsSync(serviceAccountPath)) {
    console.log("📁 Loading Firebase credentials from config/serviceAccountKey.json...");
    // Using fs.readFileSync + JSON.parse is safer than require() for dynamic checks
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    credential = admin.credential.cert(serviceAccount);
    console.log("✅ Firebase initialized successfully from local file");
  } 
  // Priority 2: BASE64 (Recommended for Render/Production)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    console.log("🔐 Loading Firebase credentials from BASE64 environment variable...");
    const base64String = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
    credential = admin.credential.cert(JSON.parse(jsonString));
    console.log("✅ Firebase initialized successfully from BASE64");
  }
  // Priority 3: Raw JSON String
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("🔐 Loading Firebase credentials from JSON environment variable...");
    let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (rawJson.startsWith('"') || rawJson.startsWith("'")) rawJson = rawJson.slice(1, -1);
    const serviceAccount = JSON.parse(rawJson.replace(/\\n/g, '\n'));
    credential = admin.credential.cert(serviceAccount);
    console.log("✅ Firebase initialized successfully from JSON string");
  } 
  else {
    throw new Error("❌ Firebase credentials not found! Ensure FIREBASE_SERVICE_ACCOUNT_BASE64 is set.");
  }
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
  
  if (error instanceof SyntaxError) {
    console.error("🔍 JSON Parsing Error! Your environment variable is malformed.");
    console.error("💡 Use BASE64 instead: node -e \"console.log(require('fs').readFileSync('./config/serviceAccountKey.json').toString('base64'))\"");
  }
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Using the project ID from your provided JSON: acadmate-78932
  const defaultBucket = "acadmate-78932.firebasestorage.app";
  const bucketName = process.env.FIREBASE_BUCKET || defaultBucket;

  admin.initializeApp({
    credential: credential,
    storageBucket: bucketName,
  });
  console.log("🚀 Firebase Admin SDK initialized");
  console.log(`📦 Storage bucket: ${bucketName}`);
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db, admin };