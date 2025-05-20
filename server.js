const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const approveSeller = require('./approveSellers');

const app = express();
const PORT = process.env.PORT || 3000;

const PENDING_SELLERS_PATH = './data/pending-sellers.json';
const SELLERS_PATH = './data/sellers.json';
const PRODUCTS_PATH = './data/products.json';

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const authMiddleware = require('./authMiddleware');

app.post('/api/approve-seller', authMiddleware, (req, res) => {
  // only admin can access
});
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

// Health check
app.get("/", (req, res) => {
  res.send("Server is live and working!");
});

// Register Seller (no OTP)
app.post('/api/register-seller', (req, res) => {
  const { name, shopName, mobile } = req.body;

  if (!name || !shopName || !mobile) {
    return res.status(400).json({ message: 'सभी फ़ील्ड भरें।' });
  }

  const newSeller = { name, shopName, mobile, status: 'pending' };

  let pendingSellers = [];
  if (fs.existsSync(PENDING_SELLERS_PATH)) {
    const data = fs.readFileSync(PENDING_SELLERS_PATH);
    pendingSellers = JSON.parse(data);
  }

  const isAlreadyPending = pendingSellers.find(s => s.mobile === mobile);
  if (isAlreadyPending) {
    return res.status(400).json({ message: 'यह मोबाइल पहले से pending list में है।' });
  }

  pendingSellers.push(newSeller);
  fs.writeFileSync(PENDING_SELLERS_PATH, JSON.stringify(pendingSellers, null, 2));

  res.json({ message: 'Seller पंजीकरण सफल! Approval pending है।' });
});

// Approve seller (admin use only)
app.post('/api/approve-seller', (req, res) => {
  const { mobile } = req.body;

  try {
    approveSeller(mobile);
    res.json({ message: `Seller ${mobile} को Approve कर दिया गया है।` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// ... (existing code ऊपर वाला same रहेगा)

// Upload Product (only for approved sellers)
app.post('/api/upload-product', upload.single('image'), (req, res) => {
  const { sellerMobile, productName, price, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!sellerMobile || !productName || !price) {
    return res.status(400).json({ message: 'सभी आवश्यक फ़ील्ड भरें।' });
  }

  // Check if seller is approved
  let approvedSellers = [];
  if (fs.existsSync(SELLERS_PATH)) {
    const data = fs.readFileSync(SELLERS_PATH);
    approvedSellers = JSON.parse(data);
  }

  const sellerExists = approvedSellers.find(s => s.mobile === sellerMobile);
  if (!sellerExists) {
    return res.status(403).json({ message: 'Seller approved नहीं है।' });
  }

  // Load current products
  let products = [];
  if (fs.existsSync(PRODUCTS_PATH)) {
    const data = fs.readFileSync(PRODUCTS_PATH);
    products = JSON.parse(data);
  }

  // Add new product
  const newProduct = {
    sellerMobile,
    productName,
    price,
    description,
    image,
    uploadedAt: new Date().toISOString()
  };

  products.push(newProduct);
  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));

  res.json({ message: 'Product upload सफल रहा!', product: newProduct });
});
// सभी products दिखाने के लिए
app.get('/api/products', (req, res) => {
  if (fs.existsSync(PRODUCTS_PATH)) {
    const data = fs.readFileSync(PRODUCTS_PATH);
    const products = JSON.parse(data);
    res.json(products);
  } else {
    res.json([]);
  }
});
