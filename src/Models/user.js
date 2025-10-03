const mongoose=require("mongoose");
const NewSchema=mongoose.Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    age:{
        type:Number
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    gender:{
        type:String
    }
});
const User=mongoose.model("User",NewSchema);

module.exports=User;