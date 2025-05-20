// firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json'); // इसे Firebase से डाउनलोड करें

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
