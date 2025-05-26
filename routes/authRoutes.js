require("dotenv").config();
const express = require("express");
const router = express.Router();

router.get("/auth/callback", (req, res) => {
  const jwtToken = req.query.token;

  if (!jwtToken) {
    return res.status(400).send("Token missing");
  }

  const origin = req.get("origin") || "";

  // Decide frontend URL based on origin header
  let redirectBaseUrl;
  if (origin.includes("netlify")) {
    redirectBaseUrl = process.env.FRONTEND_URL_NETLIFY;
  } else {
    redirectBaseUrl = process.env.FRONTEND_URL_VERCEL;
  }

  const redirectUrl = `${redirectBaseUrl}/customer-dashboard?token=${jwtToken}`;
  res.redirect(redirectUrl);
});

module.exports = router;
