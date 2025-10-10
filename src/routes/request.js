const express=require("express");
const requestRouter= express.Router();

requestRouter.post("/request/send/interested/:userID",(res,req)=>{
    try{
        res.send("interest send successfully");
    }catch(err){
        res.status(400).send("ERROR while sending interest"+err);
    }
});

requestRouter.post("/request/send/ignore/:userID",(res,req)=>{
    try{
        res.send("ignore send successfully");
    }catch(err){
        res.status(400).send("ERROR while sending ignore"+err);
    }
});

requestRouter.post("/request/review/accepted/:requestID",(res,req)=>{
    try{
        res.send("accepted send successfully");
    }catch(err){
        res.status(400).send("ERROR while sending accepted"+err);
    }
});

requestRouter.post("/request/review/rejected/:requestID",(res,req)=>{
    try{
        res.send("rejected send successfully");
    }catch(err){
        res.status(400).send("ERROR while sending rejected"+err);
    }
});

module.exports=requestRouter;
