const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const User = require("../Model/User");
const moment = require("moment");

router.post("/", async (req, res) => {
  try {
    const { user } = req.body;
    const userid = user.uid;
    console.log(user);

    const userRecord = await User.findOne({ uid: userid }); // Use 'uid' to match the database schema
    console.log(userRecord); // Should log the user record if found
    console.log({ userid });

    if (!userRecord) {
      return res.status(404).send({ message: "User not found" });
    }

    const subscription = userRecord.subscription;

    if (!subscription || subscription.status !== "active") {
      return res.status(403).send({ message: "Subscription not active" });
    }
    console.log("this is your plan", subscription.plan);
    // Define application limits based on subscription plan
    const planLimits = {
      Free: 1,
      bronze: 3,
      silver: 5,
      gold: Infinity,
    };

    const allowedApplications = planLimits[subscription.plan];
    console.log("your allowed application ina month", allowedApplications);

    if (allowedApplications === undefined) {
      return res.status(400).send({ message: "Invalid subscription plan" });
    }

    // Get the current month
    const currentMonthStart = moment().startOf("month").toDate();
    const currentMonthEnd = moment().endOf("month").toDate();

  
    const applicationCount = await application.countDocuments({
      "user.uid": user.uid,
      createAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });
    console.log("application counts", applicationCount);
    if (applicationCount >= allowedApplications) {
      return res
        .status(403)
        .send({ message: "Application limit reached for this month" });
    }

    // Create and save the new application
    const applicationData = new application({
      coverLetter: req.body.coverLetter,
      user: req.body.user,
      company: req.body.company,
      category: req.body.category,
      body: req.body.body,
      ApplicationId: req.body.ApplicationId,
      createdAt: new Date(), // Ensure createdAt is set
    });

    // Conditionally add the resume field if it is present in the request body
    if (req.body.resume) {
      applicationData.resume = req.body.resume;
    }

    const savedApplication = await applicationData.save();
    res.send(savedApplication);
  } catch (error) {
    console.log(error, "not able to post the data");
    res.status(500).send({ message: "Internal server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const data = await application.find();
    res.json(data).status(200);
  } catch (error) {
    console.log(err);
    res.status(404).json({ error: "Internal server error " });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application.findById(id);
    if (!data) {
      res.status(404).json({ error: "Application is not found " });
    }
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Internal server error " });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  let status;

  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    res.status(400).json({ error: "Invalid action" });
    return;
  }

  try {
    const updateApplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!updateApplication) {
      res.status(404).json({ error: "Not able to update the application" });
      return;
    }

    res.status(200).json({ success: true, data: updateApplication });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
