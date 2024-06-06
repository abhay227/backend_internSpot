const bodyParser=require("body-parser")
const express=require("express")
const app=express();
const path=require("path")
const cors=require("cors");
const {connect}=require("./db")
const router=require("./Routes/index")
const instance = require("./razorpayInstance");  // Import the instance
require('dotenv').config()
const port =5000



app.use(cors())
app.use(bodyParser.json({limit:"50mb"}))
app.use(bodyParser.urlencoded({extended:true,limit:"50mb"}))
app.use(express.json())



app.get("/",(req,res)=>{
    res.send("Hello This is My backend")
})
app.use("/api",router)
app.get("/api/getkey",(req,res)=>
    res.status(200).json({key:process.env.RAZORPAY_API_KEY})
);
connect();
 app.use((req,res,next)=>{
    req.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Origin","*")
    next()
 })

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})

module.exports = { instance };