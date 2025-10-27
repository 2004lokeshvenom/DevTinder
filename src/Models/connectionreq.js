const mongoose= require("mongoose");

const connectionrequest=new mongoose.Schema({
    fromUserId : {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },

    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },

    status:{
        type:String,
        required:true,
        enum:{
            values:["ignored","rejected","interested","accepted"],
            message:`{VALUE} is not valid status`
        }
    }

},
{ timestamps:true });

const connectionrequestmodel=new mongoose.model("connectionrequestmodel",connectionrequest);

module.exports=connectionrequestmodel;

