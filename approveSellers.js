const fs = require('fs');
const path = require('path');

const PENDING_SELLERS_PATH = './data/pending-sellers.json';
const SELLERS_PATH = './data/sellers.json';

/**
 * Approve a pending seller using their mobile number
 * @param {string} mobile - Mobile number of the seller to approve
 */
const approveSeller = (mobile) => {
  console.log("Approving seller with mobile:", mobile);

  // Load pending sellers from file
  const pendingSellers = fs.existsSync(PENDING_SELLERS_PATH)
    ? JSON.parse(fs.readFileSync(PENDING_SELLERS_PATH, 'utf8'))
    : [];

  console.log("Pending sellers loaded:", pendingSellers);

  // Find the seller by mobile number
  const sellerIndex = pendingSellers.findIndex(s => s.mobile === mobile);
  console.log("Found seller index:", sellerIndex);

  if (sellerIndex === -1) {
    console.error("Seller not found in pending list");
    throw new Error('Seller not found in pending list');
  }

  // Load approved sellers
  const approvedSellers = fs.existsSync(SELLERS_PATH)
    ? JSON.parse(fs.readFileSync(SELLERS_PATH, 'utf8'))
    : [];

  const seller = pendingSellers[sellerIndex];
  console.log("Seller data to approve:", seller);

  // Optional: Set approvedAt timestamp
  seller.approvedAt = new Date().toISOString();

  // Move seller from pending to approved
  approvedSellers.push(seller);
  pendingSellers.splice(sellerIndex, 1);

  // Save the updated lists
  fs.writeFileSync(PENDING_SELLERS_PATH, JSON.stringify(pendingSellers, null, 2));
  fs.writeFileSync(SELLERS_PATH, JSON.stringify(approvedSellers, null, 2));

  console.log(`Seller with mobile ${mobile} has been approved and moved to approved list.`);
};

module.exports = approveSeller;
