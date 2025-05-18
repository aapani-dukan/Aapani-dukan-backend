const runMaintenance = require('./ai-maintain');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');

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

// Memory-based OTP store
const otpStore = {};

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

// ----------------- API ROUTES -----------------

// Send OTP (dummy version)
app.post('/api/send-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ message: 'Invalid mobile number' });
  }

  const otp = '123456'; // You can replace with real OTP logic
  otpStore[mobile] = otp;
  res.json({ message: `OTP भेजा गया है (डेमो में: ${otp})` });
});

// Seller Register with OTP verification
app.post('/api/register-seller', (req, res) => {
  const { name, shopName, mobile, otp } = req.body;

  if (!name || !shopName || !mobile || !otp) {
    return res.status(400).json({ message: 'सभी फ़ील्ड भरें।' });
  }

  if (otpStore[mobile] !== otp) {
    return res.status(400).json({ message: 'OTP गलत है।' });
  }

  const newSeller = { name, shopName, mobile, status: 'pending' };

  let pendingSellers = [];
  if (fs.existsSync(PENDING_SELLERS_PATH)) {
    const data = fs.readFileSync(PENDING_SELLERS_PATH);
    pendingSellers = JSON.parse(data);
  }

  pendingSellers.push(newSeller);
  fs.writeFileSync(PENDING_SELLERS_PATH, JSON.stringify(pendingSellers, null, 2));

  delete otpStore[mobile];

  res.json({ message: 'Seller पंजीकरण सफल! Approval pending है।' });
});
