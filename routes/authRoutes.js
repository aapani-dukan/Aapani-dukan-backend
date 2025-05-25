const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { googleLogin } = require('../controllers/authController');

// Optional POST route
router.post('/google-login', googleLogin);

// STEP 1: Redirect to Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// STEP 2: Callback from Google
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign({
      uid: user.id,
      email: user.email,
      role: user.role || 'customer',
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // ✅ Redirect to Frontend (not backend) with token
    const redirectUrl = `https://aapani-dukan.vercel.app/CustomerDashboard?token=${token}`;
    res.redirect(redirectUrl);
  }
);

module.exports = router;
