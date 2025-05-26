require("dotenv").config();
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ============ Google OAuth Routes ============

// Initiate Google OAuth login
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

// Handle Google OAuth callback
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const user = req.user;

  // Create JWT token
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const origin = req.get("origin") || "";

  // Decide frontend URL based on origin
  let redirectBaseUrl;
  if (origin.includes("netlify")) {
    redirectBaseUrl = process.env.FRONTEND_URL_NETLIFY;
  } else {
    redirectBaseUrl = process.env.FRONTEND_URL_VERCEL;
  }

  const redirectUrl = `${redirectBaseUrl}/customer-dashboard?token=${token}`;
  res.redirect(redirectUrl);
});

// ============ Direct Token Callback Route ============
router.get("/callback", (req, res) => {
  const jwtToken = req.query.token;

  if (!jwtToken) {
    return res.status(400).send("Token missing");
  }

  const origin = req.get("origin") || "";

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
