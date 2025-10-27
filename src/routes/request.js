const express=require("express");
const requestRouter= express.Router();
const {userAuth}=require("../middlewares/auth");
const User=require("../Models/userdb");

const connectionrequestmodel=require("../Models/connectionreq");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async(req,res)=>{
    try{
        const fromUserId=req.user._id;
        const toUserId=req.params.toUserId;
        const status=req.params.status;

        if(fromUserId==toUserId){
            throw new Error("you cant send request to your own id");
        }
        const isToUserIdValid=await User.findById(toUserId);
        if(!isToUserIdValid){
            throw new Error("to user id is not valid");
        }
        const allowedStatus=["interested","ignored"];
        if(!allowedStatus.includes(status)){
            throw new Error("given status is not allowed");
        }

        const isConnectionExists=await connectionrequestmodel.findOne({
            $or:[
                {fromUserId,toUserId},
                {fromUserId:toUserId,toUserId:fromUserId},
            ]
        }).populate("fromUserId","lastName").populate("toUserId","lastName");
        if(isConnectionExists){
            throw new Error("request already exists");
        }

        const request=new connectionrequestmodel({
            fromUserId,
            toUserId,
            status
        })

        const data=await request.save();

        res.json({
            message:"connection request send succcessfully",
            data,
        })
    }catch(err){
        res.status(400).send("ERROR while sending interest"+err);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const { status, requestId } = req.params;
        const allowedStatuses = ["accepted", "rejected"];

        if (!allowedStatuses.includes(status)) {
            throw new Error("Status is not allowed");
        }

        const request = await connectionrequestmodel.findById(requestId).populate("fromUserId","lastName").populate("toUserId","lastName");
        if (!request) throw new Error("Request ID not found");

        if(request.status!="interested") throw new Error("requested id has not interested button");

        if (request.toUserId.toString() !== req.user._id.toString()) {
            throw new Error("Log in with appropriate user ID to review this request");
        }

        request.status = status;
        const savedRequest = await request.save();

        res.json({
            message: `Request ${status} successfully`,
            data: savedRequest,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports=requestRouter;
