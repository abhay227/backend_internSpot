const express =require("express")
const router= express.Router();
const ApplicationRoute=require("./ApplicationRoute")
const intern=require("./InternshipRoute")
const job=require("./JobRoute")
const admin=require("./admin")
const payment = require("./paymentRoute")
const user = require("./userRoute")

router.get("/",(req,res)=>{
    res.send("the is backend")
})
router.use('/application',ApplicationRoute);
router.use('/internship',intern);
router.use('/job',job);
router.use('/admin',admin);
router.use('/payment',payment);
router.use('/users',user);

module.exports=router;