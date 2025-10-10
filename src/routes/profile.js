const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const User=require("../Models/user");

profileRouter.get("/profile/view",userAuth,(req,res)=>{
    try{
        res.send("view it below this"+req.user);
    }catch(err){
        res.status(400).send("something went wrong while viewing profile"+err);
    }
})

profileRouter.patch("/profile/edit",userAuth,async (req,res)=>{
    try{
    const data=req.body;
    const allowed=["firstName","lastName","age","email","gender"];
    const isallowed=Object.keys(data).every((k)=>allowed.includes(k));
    if(!isallowed){
        throw new Error("specified change is not allowed");
    }
    await User.findByIdAndUpdate(req.user._id,data,
        {
            runValidators:true,
            new:true
        }
    );
    res.send("edited successfully");
    }catch(err){
        res.status(400).send("ERROR while editing profile"+err);
    }
});

profileRouter.patch("/profile/password",(req,res)=>{
    try{
        res.send("password updated successfully");
    }catch(err){
        res.status(400).send("ERROR while password updation"+err);
    }
});

module.exports=profileRouter;