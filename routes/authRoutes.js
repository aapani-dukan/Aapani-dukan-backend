require("dotenv").config();
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ================== Google OAuth Start ==================

// Step 1: Initiate Google OAuth login
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
}));

// Step 2: Handle callback from Google after user grants access
router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    // Step 3: Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Step 4: Decide frontend redirect URL based on origin
    const origin = req.get("origin") || "";
    const redirectBaseUrl = origin.includes("netlify")
      ? process.env.FRONTEND_URL_NETLIFY
      : process.env.FRONTEND_URL_VERCEL;

    const redirectUrl = `${redirectBaseUrl}/customer-dashboard?token=${token}`;
    res.redirect(redirectUrl);
  }
);

// ================== Optional: Direct Token Redirect ==================

// If you're directly hitting this endpoint with ?token=...
router.get("/callback", (req, res) => {
  const jwtToken = req.query.token;

  if (!jwtToken) {
    return res.status(400).send("Token missing");
  }

  const origin = req.get("origin") || "";
  const redirectBaseUrl = origin.includes("netlify")
    ? process.env.FRONTEND_URL_NETLIFY
    : process.env.FRONTEND_URL_VERCEL;

  const redirectUrl = `${redirectBaseUrl}/customer-dashboard?token=${jwtToken}`;
  res.redirect(redirectUrl);
});

module.exports = router;
