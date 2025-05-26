require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const router = express.Router();

// Start Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // JWT Token Generate
    const token = jwt.sign(
      {
        email: req.user.email,
        name: req.user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Redirect to /auth/callback with token
    res.redirect(`/auth/callback?token=${token}`);
  }
);

// Final callback handler — decide frontend URL and redirect
router.get("/auth/callback", (req, res) => {
  const jwtToken = req.query.token;

  if (!jwtToken) {
    return res.status(400).send("Token missing");
  }

  const origin = req.get("origin") || "";

  // Decide frontend URL
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
