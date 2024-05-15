const express =require("express")
const router= express.Router();
const ApplicationRoute=require("./ApplicationRoute")
const intern=require("./InternshipRoute")
const job=require("./JobRoute")
const admin=require("./admin")

router.get("/",(req,res)=>{
    res.send("the is backend")
})
router.use('/application',ApplicationRoute);
router.use('/internship',intern);
router.use('/job',job);
router.use('/admin',admin);

module.exports=router;