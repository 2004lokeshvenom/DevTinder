const express=require("express");
const userRouter= express.Router();
const User=require("../Models/userdb");
const { userAuth } = require("../middlewares/auth");
const connectionrequestmodel = require("../Models/connectionreq");

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const users = await connectionrequestmodel.find({
      $or: [
        { fromUserId: req.user._id, status: "accepted" },
        { toUserId: req.user._id, status: "accepted" }
      ]
    }).populate("fromUserId","lastName").populate("toUserId","lastName");

    if (users.length === 0) {
      return res.status(404).json({ message: "No connections found" });
    }
    console.log(req.user);
    console.log(users);
    const data=users.map(row=>{
      if(req.user._id.toString()==row.fromUserId._id.toString()){
        return row.toUserId
      }
      else return row.fromUserId
    })

    res.json({
      message: "Connections fetched successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: "Error while loading connections", error: err.message });
  }
});

userRouter.get("/user/requests",userAuth,async(req,res)=>{
    try{
        const users=await connectionrequestmodel.find({
            toUserId:req.user._id,
            status:"interested"
        }).populate("fromUserId","lastName").populate("toUserId","lastName");

        if(users.length==0)throw new Error("requests not there");

        res.json({
            message:"requests are there",
            data:users
        })
    }catch(err){
        res.status(400).send("ERROR while loading requests"+err);
    }
})

userRouter.get("/user/feed",userAuth,async(req,res)=>{
  try{
    let limit= req.query.limit
    limit=limit>50?50:limit;
    const page=req.query.page;
    const skip=(page-1)*limit;

    const loggedInUser=req.user;
    const notRequired=await connectionrequestmodel.find({
      $or:[
        {fromUserId:loggedInUser._id},
        {toUserId:loggedInUser._id},
      ]
    }).select("fromUserId toUserId")

    const idStrings=new Set();
    idStrings.add(loggedInUser._id.toString())
    notRequired.forEach((a)=>{
      idStrings.add(a.fromUserId.toString()),
      idStrings.add(a.toUserId.toString())
    })

    const data=await User.find({
        _id :{$nin:Array.from(idStrings)}
    }).select("firstName lastName age gender")
      .skip(skip)
      .limit(limit)

    if(!data || data.length===0){
      throw new Error("no feed found or use appropriate limit and page")
    }
    res.json({message:"data feed successfully",
      data:data
    })
  }
  catch(err){
    res.status(404).send("something went wrong"+err);
  }
})

module.exports=userRouter;