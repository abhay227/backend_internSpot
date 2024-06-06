const mongoose=require("mongoose")
const Resume = require("./Resume")
 const applicationShcema=new mongoose.Schema({
    company:String,
    category:String,
    coverLetter:String,
    createAt:{
        type:Date,
        default:Date.now,
    },
    Application:Object,
    user:Object,
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume"
    }
 })
 module.exports=mongoose.model("Application",applicationShcema)