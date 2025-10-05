const express = require("express");
const app = express();
const connectDB=require("./config/database");
const User=require("./Models/user");
const { ReturnDocument } = require("mongodb");
const Validator=require("validator");
const {validateuser}=require("./utils/validate");
const bcrypt =require("bcrypt");

app.use(express.json());

app.post("/signup",async (req,res)=>{
    try{
        validateuser(req);
        const {firstName,lastName,email,password,age,gender}=req.body;
        const hashPassword=await bcrypt.hash(password,10);
        const users=new User({
            firstName,
            lastName,
            email,
            password:hashPassword,
            age,
            gender
        });
        const saveuser=await users.save();
        console.log(req.body);
        res.send("userdata saved successfully");
    }
    catch(err){
        res.send("error occured while saving data " + err);
    }
});

app.patch("/update",async (req,res)=>{
    const userId=req.body.userId;
    const data=req.body;
    try{
    //password is not allowed to change here in patch as of now
    const ALLOWED=["firstName","lastName","age","gender","userId"];
    const isallowed=Object.keys(data).every((k)=>ALLOWED.includes(k));
    if(!isallowed){
        throw new Error("update is not allowed");
    }
    if(data?.skills.length>10){
        throw new Error("skills data is very long");
    }
    
    const updatedUser=await User.findByIdAndUpdate(userId,data,
        {
            ReturnDocument:"after",
            runValidators:true
        }
    );
    if (!updatedUser) {
        throw new Error("User not found");
    }
    console.log("yesssssssssss");
    res.send("succesfully updated");
    }
    catch(err){
        console.log(err);
        res.status(500).send("something went wrong"+err);
    }
});

app.get("/user",async(req,res)=>{
    const userEmail=req.body.email;
    try{
    const users=await User.findOne({email:userEmail});
    if(!users){
        console.log("user not found try again");
        res.status(404).send("user not found try again after signing up");
    }
    else{
        console.log("user found successfully");
        res.send("user found successfully"+ users);
    }
    }
    catch(error){
        res.status(404).send("something went wrong"+error);
    }
})
app.get("/feed",async(req,res)=>{
    try{
    const users=await User.find();
    if(users.length==0){
        console.log("users not found try again");
        res.status(404).send("users not found");
    }
    else{
        console.log("users found successfully");
        res.send("users found successfully"+ users);
    }
    }
    catch(error){
        res.status(404).send("something went wrong");
    }
})


connectDB().then(()=>{
    console.log("connection established successfully with database");
    app.listen(7676,()=>{
        console.log("server is succesfully on port 7676");
    });
})
.catch(()=>{
    console.log("something wrong in connecting database");
});