const express = require("express");
const router = express.Router();
const admin = require("../firebase-admin");

router.post("/verify-token", async (req, res) => {
  const idToken = req.body.token;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // आप यहाँ पर यूज़र को डेटाबेस में सेव कर सकते हैं
    res.status(200).json({ message: "Token verified", uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
});

module.exports = router;
