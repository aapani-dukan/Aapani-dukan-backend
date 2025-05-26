const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// STEP 1: Redirect to Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// STEP 2: Callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign({
      uid: user.id,
      email: user.email,
      role: user.role || 'customer',
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const redirectUrl = `https://aapani-dukan-frontend-4444.vercel.app/customer-dashboard?token=${jwtToken}`;
    res.redirect(redirectUrl);
  }
);

module.exports = router;
