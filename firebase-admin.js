const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json'); // ध्यान दें: json file सही है

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
