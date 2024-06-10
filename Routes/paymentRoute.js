const express = require("express");
const router = express.Router();
const instance = require("../razorpayInstance");  // Import the instance
const Payment = require("../Model/Payment");
const User = require("../Model/User"); // Assuming you need to import User model
const crypto = require("crypto");
const timeCheck = require("../middleware/timecheck");
const PaymentResume = require("../Model/PaymentResume");
const nodemailer = require('nodemailer');


require('dotenv').config()

let otpStore = {};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function generateOTP(length = 6) {
  const characters = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += characters[Math.floor(Math.random() * characters.length)];
  }
  return otp;
}

function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });
}

// List of 10 offer IDs (replace these with your actual offer IDs)
const offerIds = ['offer_OL4QPKg5R15Uot', 'offer_OL4S0QugeCme3a', 'offer_OL4U7jxgbqzweg', 'offer_OL4VWVLRW4foFm', 'offer_OL4bSAkNIlm1zf', 'offer_OL4cjVA7g5AwQp','offer_OL4kgrIe48jqxm','offer_OL4m2i0thHeHwq','offer_OL4nBeeyy6XcC4','offer_OL4oQMaVVUuJ33'];

function getRandomOfferId(offerIds) {
    const randomIndex = Math.floor(Math.random() * offerIds.length);
    return offerIds[randomIndex];
}

router.post('/send-otp', (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // OTP valid for 10 minutes
  sendOTP(email, otp);

  res.json({ message: 'OTP sent' });
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).send({ message: 'OTP not found' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).send({ message: 'OTP expired' });
  }

  if (record.otp === otp) {
    delete otpStore[email];
    res.json({ success: true });
  } else {
    res.status(400).send({ message: 'Invalid OTP' });
  }
});

// payment for resume creation 

router.post("/checkout", async (req, res) => {
  const { amount} = req.body;
  const options = {
    amount: Number(amount * 100),
    currency: "INR",
  };
   try {
    const order = await instance.orders.create(options);
    res.status(200).json({
      success:true,
      order
    });
  } catch (error) {
    res.status(500).send(error);
  }
});


router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
  .update(razorpay_order_id + "|" + razorpay_payment_id, "utf-8")
  .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here
    await PaymentResume.create({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    console.log("it is authentic payment");
    res.status(200).json({
      success:true,
    })
  } else {
    res.status(400).json({
      success: false,
    });
  }
});



// for free plan
router.post("/freeplan", async (req, res) => {
  try {
    console.log("Request body user:", req.body.user);
    console.log("Request body plan:", req.body.plan);
    const plan = req.body.plan;
    const user = await User.findOne({ uid: req.body.user.uid });
    console.log("Found user:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin does not have to buy Subscription"
      });
    }
    user.subscription.plan = "Free";
    user.subscription.status = "active";

    console.log("User before saving:", user);

    await user.save();

    console.log("User after saving:", user);

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

// payment for subscription

router.post("/subscribe",timeCheck, async (req, res) => {
  try {
    console.log("Request body user:", req.body.user);
    console.log("Request body plan:", req.body.plan);
    const plan = req.body.plan;
    const user = await User.findOne({ uid: req.body.user.uid });
    console.log("Found user:", user);
    const randomOfferId = getRandomOfferId(offerIds);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin does not have to buy Subscription"
      });
    }
    var plan_id = process.env.PLAN_ID_BRONZE;
    if(plan === "bronze"){
      plan_id = process.env.PLAN_ID_BRONZE;
    }
    if(plan === "silver"){
      plan_id = process.env.PLAN_ID_SILVER;
    }
    if(plan === "gold"){
      plan_id = process.env.PLAN_ID_GOLD;
    }
    const subscription = await instance.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
      offer_id:randomOfferId
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    if(plan === 'bronze'){
      user.subscription.plan = 'bronze';
    }
    if(plan === 'silver'){
      user.subscription.plan = 'silver';
    }
    if(plan === 'gold'){
      user.subscription.plan = 'gold';
    }

    console.log("User before saving:", user);

    await user.save();

    console.log("User after saving:", user);

    res.status(201).json({
      success: true,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

// Payment Verification and Save reference in Database
router.post("/verification",timeCheck, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    console.log(req.body);

    // Find the user by subscription ID
    const user = await User.findOne({ "subscription.id": razorpay_subscription_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const subscription_id = user.subscription.id;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
      .digest("hex");

    const isAuthentic = generated_signature === razorpay_signature;
    if (!isAuthentic) {
      return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
    }

    // Save payment details in the database
    await Payment.create({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    user.subscription.status = "active";
    await user.save();

    res.redirect(
      `${process.env.FRONTEND_URL}manage-subscription`
    );
  } catch (error) {
    console.error("Error in payment verification:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

router.get("/verify-payment", async (req, res) => {
  const { reference } = req.query;

  try {
    const payment = await PaymentResume.findOne({ razorpay_payment_id: reference });

    if (payment) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


module.exports = router;
