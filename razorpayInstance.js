// razorpayInstance.js
const Razorpay = require("razorpay");
require('dotenv').config();

if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
  console.error('Razorpay API Key and Secret are required');
  process.exit(1);
}

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

module.exports = instance;
