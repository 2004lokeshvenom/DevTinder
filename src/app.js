const express = require("express");                 //importing express server
const app = express();                              //express server
const connectDB=require("./config/database");       //connecting data base to our mongodb account
const User=require("./Models/user");                //mongodb scheama
const {validateuser}=require("./utils/validate");   //validation function
const bcrypt =require("bcrypt");                    //password encryption
const validator = require("validator");             //validate library
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const {userAuth}=require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

//login auth
app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    try{
        if(!email || !validator.isEmail(email) || !password){
            throw new Error("invalid credintials");
        }
        const user=await User.findOne({email:email});
        if(!user){
            throw new Error("invalid credintials");
        }
        const passwordcheck=await bcrypt.compare(password,user.password);
        if(!passwordcheck){
            throw new Error("invalid credintials");
        }
        else{
            const token=jwt.sign({_id:user._id},"2004lokesh",{expiresIn:"1d"});
            res.cookie("token",token);
        }
        res.send("login successfull");
    }
    catch(err){
        res.status(400).send("something went wrong"+err);
    }
})

//signup db pushing
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

//modifying existing db
app.patch("/update",userAuth,async (req,res)=>{
    const userId=req.user._id;
    const data=req.user;
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
        res.status(500).send("something went wrong in updating"+err);
    }
});

//getting existing user full info with id
app.get("/user", userAuth, async(req,res)=>{
    try{
        const users=req.user;
        res.send("user found successfully"+ users);
    }
    catch(error){
        res.status(404).send("something went wrong"+error);
    }
})

//getting everyone data
app.get("/feed", userAuth,async(req,res)=>{
    try{
    const users=await User.find();
    if(users.length==0){
        console.log("users not found try adding some users");
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