// firebase-admin.js
const admin = require("firebase-admin");
const atob = require("atob");

const firebaseConfigBase64 = process.env.FIREBASE_CONFIG_BASE64;
const firebaseConfigString = Buffer.from(firebaseConfigBase64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(firebaseConfigString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
