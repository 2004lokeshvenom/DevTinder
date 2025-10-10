const express=require("express");
const userRouter= express.Router();
const User=require("../Models/user");

userRouter.get("/user/connections",(res,req)=>{
    try{
        res.send("connections loaded successfully");
    }catch(err){
        res.status(400).send("ERROR while loading connections"+err);
    }
})

userRouter.get("/user/requests",(res,req)=>{
    try{
        res.send("requests loaded successfully");
    }catch(err){
        res.status(400).send("ERROR while loading requests"+err);
    }
})

userRouter.get("/user/feed",async (req,res)=>{
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
        catch(err){
            res.status(404).send("something went wrong"+err);
        }
})

module.exports=userRouter;