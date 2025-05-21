// routes/authRoutes.js
const express = require("express");
const admin = require("../firebase-admin");
const router = express.Router();

router.post("/login", async (req, res) => {
  const idToken = req.body.token;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    res.json({ success: true, uid, email });
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

module.exports = router;
