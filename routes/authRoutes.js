const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// STEP 1: Redirect to Google
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// STEP 2: Google redirects to this after login (MUST MATCH Google Console)
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign({
      uid: user.id,
      email: user.email,
      role: user.role || 'customer',
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    const redirectUrl =`https://aapani-dukan-frontend-4444.vercel.app/CustomerDashboard?token=${token}`;
    res.redirect(redirectUrl);
  }
);

module.exports = router;
