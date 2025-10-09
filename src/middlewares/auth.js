// middlewares/auth.js
const jwt=require("jsonwebtoken");
const User=require("../Models/user");

const userAuth = async(req,res,next)=>{
    try{const cookies=req.cookies;
    const {token}=cookies;
    if(!token){
        throw new Error("token is not valid");
    }
    const decoddedMessage=jwt.verify(token,"2004lokesh");
    const users=await User.findById(decoddedMessage._id);
    if(!users){
        throw new Error("user is not found somehow");
    }
    req.user=users;
    next();
    }
    catch(err){
        res.status(400).send("ERROR"+err);
    }
}

module.exports = {
    userAuth
};
