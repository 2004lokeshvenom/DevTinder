// middlewares/auth.js
const jwt=require("jsonwebtoken");
const User=require("../Models/userdb");

const userAuth = async(req,res,next)=>{
    try{const cookies=req.cookies;
    const {token}=cookies;
    if(!token){
        throw new Error("token is not valid");
    }
    const decodedMessage=jwt.verify(token,process.env.JWT_SECRET || "2004lokesh");
    const users=await User.findById(decodedMessage._id);
    if(!users){
        throw new Error("user is not found somehow");
    }
    req.user=users;
    next();
    }
    catch(err){
        res.status(400).send("ERROR"+err);
    }
};

module.exports = {
    userAuth
};
