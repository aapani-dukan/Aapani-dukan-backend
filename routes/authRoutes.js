// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const admin = require('../firebase-admin');
const { verifyToken } = require('../authMiddleware');

// User login route (client se idToken aayega)
router.post('/login', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'ID Token is required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    res.status(200).json({ message: 'Login successful', uid });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(401).json({ error: 'Invalid ID Token' });
  }
});

// Protected route example (only accessible after login)
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Welcome to your profile', uid: req.user.uid });
});

module.exports = router;
