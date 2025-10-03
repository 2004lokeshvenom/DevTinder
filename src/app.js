const express = require("express");
const app = express();
const connectDB=require("./config/database");
const User=require("./Models/user");

app.post("/signup",async (req,res)=>{
    const person={
        firstName:"Ekambareswarun",
        lastName:"Surisetti",
        email:"swarunsurisetti@gmail.com",
        password:"swarun1979",
        age:"47",
        gender:"Male"
    }
    const users=new User(person);
    try{
        await users.save();
        res.send("userdata saved successfully");
    }
    catch(err){
        res.send("error occured while saving data " + err.message);
    }
});



connectDB().then(()=>{
    console.log("connection established successfully with database");
    app.listen(7676,()=>{
        console.log("server is succesfully on port 7676");
    });
});
connectDB().catch(()=>{
    console.log("something wrong in connecting database");
});