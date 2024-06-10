const express = require("express");
const router = express.Router();
const instance = require("../razorpayInstance"); // Import the instance

// List of 10 offer IDs (replace these with your actual offer IDs)
const offerIds = ['offer_OKzg5Xvnjc1oMI', 'offer_OKziGffVV9u2Sh', 'offer_OKzjZHDu5IKEdq', 'offer_OKzkcfuxSfQW1c', 'offer_OKzlptUAzoEKde', 'offer_OL4DIvzf30OdPB','offer_OL4FCm7UA5crwg','offer_OL4Gc6I3xJwKR6','offer_OL4IY9ARCiO6tD','offer_OL4JwjwIkHbczg'];

function getRandomOfferId(offerIds) {
    const randomIndex = Math.floor(Math.random() * offerIds.length);
    return offerIds[randomIndex];
}

router.post('/create-order', async (req, res) => {
    const { amount} = req.body;
    const randomOfferId = getRandomOfferId(offerIds);
  const options = {
    amount: Number(amount * 100),
    currency: "INR",
    offer_id:randomOfferId
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



module.exports = router;
