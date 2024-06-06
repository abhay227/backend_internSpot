const mongoose=require("mongoose")
 const resumeSchema=new mongoose.Schema({
    userId: String,
    fullName: String,
    qualification: String,
    experience: String,
    personalDetails: String,
    por:String,
    courses:String,
    skills:String,
    projects:String,
    photo: String,
 })
 module.exports=mongoose.model("Resume",resumeSchema);