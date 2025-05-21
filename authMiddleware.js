// authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Secret key should match the one used while generating JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;

    // Optional role check
    if (decodedToken.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }

    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
