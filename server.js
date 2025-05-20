const runMaintenance = require('./ai-maintain');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');

// Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json'); // यह JSON फाइल Firebase Console से डाउनलोड करो

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is live and working!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const PRODUCTS_PATH = './data/products.json';
const PENDING_SELLERS_PATH = './data/pending-sellers.json';

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Uploads setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// ----------------- Firebase Authentication Middleware -----------------

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

// ----------------- API ROUTES -----------------

// OTP system हटाओ क्योंकि Firebase Auth से login होगा
// इसलिए यह endpoint हटा सकते हो या disable कर सकते हो

// Seller Register (Firebase Auth से user authenticated होना जरूरी)
app.post('/api/register-seller', authenticateToken, (req, res) => {
  const { name, shopName, mobile } = req.body;

  if (!name || !shopName || !mobile) {
    return res.status(400).json({ message: 'सभी फ़ील्ड भरें।' });
  }

  // req.user.uid और req.user.phone_number आदि मिलेंगे Firebase से
  // अगर mobile req.body से match नहीं करता तो optionally reject कर सकते हो

  const newSeller = {
    uid: req.user.uid,
    name,
    shopName,
    mobile,
    status: 'pending'
  };

  let pendingSellers = [];
  if (fs.existsSync(PENDING_SELLERS_PATH)) {
    const data = fs.readFileSync(PENDING_SELLERS_PATH);
    pendingSellers = JSON.parse(data);
  }

  pendingSellers.push(newSeller);
  fs.writeFileSync(PENDING_SELLERS_PATH, JSON.stringify(pendingSellers, null, 2));

  res.json({ message: 'Seller पंजीकरण सफल! Approval pending है।' });
});
