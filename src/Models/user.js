const mongoose=require("mongoose");
const Validator=require("validator");
const NewSchema=mongoose.Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String,
    },
    age:{
        type:Number
    },
    gender:{
        type:String
    }
});
const User=mongoose.model("User",NewSchema);

module.exports=User;