const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aapani-dukan.firebaseio.com" // अगर realtime DB use कर रहे हों
});

module.exports = admin;
