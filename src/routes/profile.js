const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const User=require("../Models/userdb");
const bcrypt=require("bcrypt");
const Validator=require("validator");

profileRouter.get("/profile/view",userAuth,(req,res)=>{
    try{
        res.json({message:"view it below this",data:req.user});
    }catch(err){
        res.status(400).send("something went wrong while viewing profile"+err);
    }
})

profileRouter.patch("/profile/edit",userAuth,async (req,res)=>{
    try{
    const data=req.body;
    const allowed=["firstName","lastName","age","email","gender","photoUrl","about"];
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

profileRouter.patch("/profile/password",userAuth,async(req,res)=>{
    try{
        const {currentPassword,newPassword}=req.body;
        if(!currentPassword||!newPassword){
            throw new Error("enter both current and old password");
        }
        const validPassword=Validator.isStrongPassword(newPassword);
        if(!validPassword){
            throw new Error("enter strong password");
        }
        const isCurrentPassword=await bcrypt.compare(currentPassword,req.user.password);
        if(!isCurrentPassword){
            throw new Error("current password is wrong");
        }
        
        const hashedPassword=await bcrypt.hash(newPassword,10);
        const data={
            password:hashedPassword
        }
        const users=await User.findByIdAndUpdate(req.user._id,data,{
            new:true
        });
        res.send("password updated successfully");
    }
    catch(err){
        res.status(400).send("ERROR while password updation"+err);
    }
});

module.exports=profileRouter;