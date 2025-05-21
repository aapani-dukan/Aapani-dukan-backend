// firebase-admin.js
const admin = require("firebase-admin");

try {
  const firebaseConfigBase64 = process.env.FIREBASE_CONFIG_BASE64;
  if (!firebaseConfigBase64) {
    throw new Error("FIREBASE_CONFIG_BASE64 environment variable is missing.");
  }

  const firebaseConfigString = Buffer.from(firebaseConfigBase64, 'base64').toString('utf-8');
  const serviceAccount = JSON.parse(firebaseConfigString);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase admin initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase admin:", error.message);
  process.exit(1); // रोक दो अगर Firebase initialize नहीं हुआ तो
}

module.exports = admin;
