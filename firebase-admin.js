const admin = require('firebase-admin');

// .env से JSON स्ट्रिंग लेकर उसे JSON ऑब्जेक्ट में बदलना
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
